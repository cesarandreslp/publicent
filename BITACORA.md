# BITÁCORA OPERATIVA — PublicEnt / OSS Government One

> **Regla:** este archivo se actualiza **cada vez que se hace un cambio** (código, datos, config,
> infraestructura) **o se establece un plan de acción**. Cada entrada deja rastro de qué, por qué,
> dónde y en qué estado quedó. Flujo estándar tras cada cambio: **actualizar bitácora → commit → push**.
>
> Distinta de `CLAUDE.md` (plan/diseño del producto). Aquí va el registro cronológico de operación y QA.
>
> Formato por entrada: fecha · tipo (`CAMBIO` | `PLAN` | `HALLAZGO` | `DECISIÓN`) · descripción ·
> archivos/rutas · estado (`PENDIENTE` | `EN CURSO` | `HECHO` | `DESPLEGADO`).

## 🌐 Entorno de producción (es sobre el que trabajamos)
- **URL producción (plataforma SaaS):** https://ossgovernmentone.lat/ — landing + `/superadmin-login`.
- **Portal del tenant (Personería de Buga):** https://personeria-buga.ossgovernmentone.lat/
- **Hosting:** Vercel · **rama de producción:** `main` → cada push/merge a `main` **despliega automáticamente**.
- **Regla de oro:** todo cambio debe terminar **reflejado en producción**. Flujo:
  `local (desarrollar+verificar) → commit → push → merge a main → Vercel deploya → verificar en la URL real`.
- **Bases de datos:** Neon. El `.env` local apunta a una BD de tenant **dev** distinta de la de prod;
  la **meta-DB SÍ es la de producción**. Config sensible (env vars, llaves) vive en **Vercel**, no en el repo.

---

## 2026-06-27

### HALLAZGO — 🔴 Login de Superadmin roto en producción
- **Qué:** el middleware exigía `sa_token` en todas las rutas `/api/superadmin/*`, incluido el endpoint
  de login `POST /api/superadmin/auth` que es quien emite el token → círculo vicioso, panel de plataforma
  inaccesible. Verificado en producción (`opaqueredirect`).
- **Dónde:** `src/middleware.ts:42`.
- **Estado:** corregido (ver CAMBIO siguiente).

### CAMBIO — Fix del gate de auth del Superadmin
- **Qué:** se excluye `/api/superadmin/auth` del gate de `sa_token` (junto a `/superadmin-login`)
  mediante `SA_PUBLIC_PATHS`. Validado en local: `POST /api/superadmin/auth → 200` y carga `/superadmin`.
- **Dónde:** `src/middleware.ts`.
- **Rama/commit:** `6f653ce` (merge a `main` en `fbf1759`).
- **Estado:** ✅ **DESPLEGADO y VERIFICADO en producción** — `POST /api/superadmin/auth` responde
  `401 {"error":"Credenciales inválidas"}` (antes `307` redirect). El panel de plataforma ya es accesible.

### HALLAZGO — 🟠 Captcha PQRSD desactivado en producción
- **Qué:** sitekey de Cloudflare Turnstile dummy `1x00000000000000000000AA` hardcodeada → captcha anti-bot
  inservible en prod (riesgo de radicación masiva por bots).
- **Dónde:** `src/app/atencion-ciudadano/pqrsd/page.tsx:595`.
- **DECISIÓN (2026-06-27):** el usuario no tiene cuenta Cloudflare. Se **reemplaza Turnstile por ALTCHA**
  (captcha proof-of-work open-source, self-hosted, **sin cuenta ni llaves de terceros**; solo un secreto
  HMAC propio `ALTCHA_HMAC_KEY`).
- **INCIDENTE (build roto, corregido):** el primer intento usó `altcha-lib` + `.npmrc legacy-peer-deps=true`.
  Eso hizo que npm dejara de instalar **peer-dependencies** y **eliminara 17 paquetes** (entre ellos
  `@tiptap/extension-drag-handle`, peer de `@tiptap/extension-drag-handle-react`) → el build de Vercel falló
  (`Module not found`). Producción NO se afectó (Vercel descarta builds en error). Lección: **no** usar
  `legacy-peer-deps` global en este repo.
- **SOLUCIÓN final (sin dependencias problemáticas):**
  - Se quitó `.npmrc` y `altcha-lib`; lockfile regenerado con `npm install` normal (peers recuperados).
  - Solo se mantiene el widget cliente `altcha` (sin conflictos de peer).
  - Verificación server propia en `src/lib/altcha.ts` con `node:crypto` (createChallenge + verifySolution,
    protocolo ALTCHA SHA-256, sin deps externas).
  - Endpoint `src/app/api/altcha/challenge/route.ts` y `api/pqrsd/route.ts` usan `@/lib/altcha`.
  - `pqrsd/page.tsx`: widget `<altcha-widget challengeurl="/api/altcha/challenge">` (carga dinámica en cliente).
  - `ALTCHA_HMAC_KEY` en Vercel (Production) + `.env` local.
- **Verificado local:** `tsc --noEmit` limpio, round-trip crypto (verify true / claves y number malos → false),
  endpoint 200, página renderiza el widget, `@tiptap/extension-drag-handle` reinstalado.
- **AJUSTE 1 (middleware):** `/api/altcha/*` se eximió de la resolución de tenant en `src/middleware.ts`
  (no necesita tenant; evita 503 por consulta a meta-DB bajo carga).
- **AJUSTE 2 (widget descartado):** el widget `altcha` resultó frágil en Next/Vercel (pedía el desafío en
  la carga, durante la ráfaga de prefetch → 503/HTML; además bundling del worker). Se **eliminó el widget**
  y se construyó un componente propio `src/components/shared/altcha-captcha.tsx`: obtiene el desafío con
  reintentos y resuelve el PoW con `crypto.subtle` en el navegador. Verificación server intacta (`src/lib/altcha.ts`).
- **VERIFICADO EN PRODUCCIÓN (2026-06-27):** clic en "No soy un robot" → **"Verificación completada ✓"**
  (resolvió el PoW). Confirmado con clic automatizado → **descarta de raíz** que sea detección de bot:
  ALTCHA es proof-of-work, no conductual.
- **Estado:** ✅ **DESPLEGADO y VERIFICADO en prod.** Pendientes menores: configurar llave real de Turnstile
  ya **no aplica** (se reemplazó); `@marsidev/react-turnstile` y el paquete `altcha` (widget) quedan huérfanos
  (remover en limpieza). Considerar mover el PoW a un Web Worker si se quiere subir `maxnumber`.

### HALLAZGO — 🟠 Ráfagas de 503 en prefetch RSC
- **Qué:** prefetch RSC (`?_rsc=`) devuelve 503 en ráfaga; navegaciones completas 200. Probable
  agotamiento de conexiones Neon / concurrencia serverless.
- **Plan:** revisar pooling Prisma/Neon, cache/revalidate de páginas, `prefetch={false}` en links no críticos.
- **CAMBIO aplicado (mitigación):** `src/lib/tenant.ts` — pool por tenant ahora baja `max` en producción
  (`TENANT_DB_POOL_MAX`, default 2 en prod), con `idleTimeoutMillis`/`connectionTimeoutMillis`.
- **Estado:** MITIGADO en código · PENDIENTE (recomendado) usar el connection string POOLED de Neon
  (`-pooler`) en el `databaseUrl` de cada tenant.

### DECISIÓN — Reclasificación de pendientes tras investigarlos (2026-06-27)
- **B04 (rol "Funcionario PQRS"):** ningún código lo crea (`grep` en src/prisma vacío) → es **dato legacy**
  en la BD del tenant, no bug de código. Acción: limpieza de datos (renombrar a enum o desactivar);
  no se toca la BD de prod desde aquí. **Estado: PENDIENTE (data/ops).**
- **B06 (subdominios wildcard):** causa real = `TENANT_SLUG` seteado en prod → `getTenantByDomainEdge`
  resuelve cualquier host al mismo tenant (modo single-tenant). No es bug de código; al haber un 2º tenant
  hay que **quitar `TENANT_SLUG`** en Vercel para que aplique el aislamiento por dominio. **Estado: PENDIENTE (config).**
- **B09 (Auditoría/Observatorio en sidebar):** **FALSO POSITIVO.** `admin-sidebar.tsx:529` ya filtra por
  módulo activo; no aparecen si están inactivos. El redirect por URL directa es comportamiento correcto. **Cerrado.**

### HALLAZGO — 🟡 Otros (ver informe)
- Rol legacy "Funcionario PQRS" con nombre fuera del enum; directorio de funcionarios vacío;
  404 recurrente `/api/configuracion?clave=whatsapp`; subdominios wildcard laxos; formato de radicado
  inconsistente en consulta; entradas de sidebar que redirigen.
- **Detalle completo:** `docs/qa/prueba-funcional-2026-06-27.md` (backlog priorizado).
- **Estado:** PENDIENTE de priorización.

### HALLAZGO — 🔴 Token de GitHub (PAT) expuesto en el remoto de git
- **Qué:** la URL de `origin` tiene un PAT en texto plano.
- **Plan:** revocar/rotar el token en GitHub y reconfigurar el remoto sin credenciales embebidas
  (usar credential manager o SSH).
- **Estado:** PENDIENTE (acción del usuario).

### CAMBIO — Entorno de pruebas QA (solo local / BD dev)
- **Qué:** se levantó la app local (`npm run dev`, este PC), se sembraron usuarios QA (`editor.qa@oss.local`,
  `consulta.qa@oss.local`), superadmin por ENV, reset de pass del admin, y 1 FAQ de prueba. Se editó `.env`
  local (secretos dev, no versionado).
- **Dónde:** BD **dev** del `.env` (NO producción). Meta-DB del `.env` SÍ es prod → no se escribió en ella.
- **Estado:** HECHO (datos de prueba; limpiar si se desea).

### CAMBIO — Skill de prueba funcional
- **Qué:** se creó `.claude/skills/prueba-funcional/` (auditoría funcional browser-driven con diagramas de flujo).
- **Estado:** HECHO.

### CAMBIO — Fixes menores de UX/ruido (B07, B08)
- **B07:** `src/app/api/configuracion/route.ts` — clave inexistente devuelve **200 `{valor:null}`** en vez de 404
  (elimina el ruido de 404 en cada carga). Verificado: endpoint responde 200.
- **B08:** `consulta-client.tsx` — el ejemplo de radicado ahora refleja el formato real
  `TIPO-AAAAMMDD-######` (ej. `PET-20260627-123456`), antes mostraba `PQR-12345678`. Verificado en la página.
- **Nota:** el regex de `e2e/helpers.ts` `parseRadicado` (`/PGB-\d{4}-\d{5}/`) tampoco coincide con el
  formato real → corregir en una pasada de tests (PENDIENTE).
- **Estado:** HECHO (código, verificado local).

### DESPLIEGUE — Merge a `main` → producción (fbf1759)
- **Qué se desplegó:** B01 (superadmin login), B02 (Turnstile fail-safe), B03 (pool tuning),
  B07 (config 200), B08 (formato radicado) + bitácora + informe QA.
- **Verificado en producción (URL real):**
  - B01: `POST /api/superadmin/auth → 401` (antes 307 redirect). ✅
  - B07: `/api/configuracion?clave=whatsapp → 200` (antes 404). ✅
  - B08: la consulta muestra `PET-20260627-123456` / `TIPO-AAAAMMDD`. ✅
- **Estado:** DESPLEGADO. Las llaves de Turnstile reales siguen PENDIENTES en Vercel (hasta entonces el
  captcha cae al dummy, sin romper el formulario).

### CAMBIO — Credenciales de Superadmin reseteadas en Vercel + login verificado (prod)
- **Qué:** `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` (producción) existían pero su valor se había perdido.
  Se sobrescribieron vía Vercel CLI con valores nuevos y se hizo redeploy para aplicarlos.
- **Verificado en producción:** `POST /api/superadmin/auth` → `200 {ok:true, admin.id:"env-superadmin"}`.
  El panel `/superadmin` ya es usable en `https://ossgovernmentone.lat/superadmin-login`.
- **Credencial:** entregada al usuario por chat (NO se versiona). Recomendado cambiarla tras el primer ingreso.
- **Estado:** ✅ DESPLEGADO y VERIFICADO.

### PLAN — Próximos pasos

**⏸️ Dos opciones inmediatas pendientes de elegir/realizar (PENDIENTE):**
- **A) Commit de limpieza:** remover `@marsidev/react-turnstile` y el paquete `altcha` (widget), ya sin uso.
- **B) Seguir con el backlog:** rotar el PAT de GitHub · cargar el directorio de funcionarios · usar el
  connection-string **pooled** de Neon (B03 completo).

**Resto del backlog:**
1. ✅ ~~Desplegar fix del superadmin~~ — HECHO y verificado en prod.
2. ✅ ~~Credencial de superadmin usable~~ — HECHO (reset en Vercel + verificado).
3. ✅ ~~Turnstile~~ — RESUELTO: reemplazado por captcha propio ALTCHA (ver B02). Ya no requiere llaves de Cloudflare.
4. 🟠 Usar connection string POOLED de Neon en el `databaseUrl` del tenant (B03 completo).
5. 🔴 Rotar el PAT de GitHub expuesto en el remoto.
6. 🟡 Cargar contenido faltante (directorio de funcionarios) y depurar rol legacy "Funcionario PQRS".
7. 🟡 Quitar `TENANT_SLUG` en Vercel cuando se opere multi-tenant (B06).
8. 🧹 Cambiar la contraseña temporal del superadmin tras el primer ingreso.
9. 🧹 Limpiar datos QA sembrados en la BD dev (usuarios `*.qa@oss.local`, FAQ "QA…").

---

## 2026-06-29

### INVENTARIO — Auditoría funcional completa del repositorio

**Artefactos contados directamente del código:**
- **208 rutas API** (`src/app/api/**/route.ts`) — backend completo.
- **110 páginas** (`src/app/**/page.tsx`) — portal público + panel admin + panel superadmin.
- **29 módulos** en catálogo canónico (`src/lib/modules.ts`) con `MODULO_IDS`.
- **10 specs E2E** Playwright (`e2e/`) + **12 archivos de test unitario** Vitest (`src/__tests__/`).
- **9 páginas de Superadmin** (`superadmin-login`, dashboard, tenants, aprovisionar, detalle tenant, nuevo, admins, auditoría, informes).
- **Estado:** HECHO (inventario estático; verificación funcional browser pendiente — ver PLAN más abajo).

---

#### Arquitectura transversal (sostiene todos los módulos)

| Capa | Archivos clave | Estado |
|---|---|---|
| Multi-tenant por dominio | `src/middleware.ts`, `src/lib/tenant-edge.ts` | ✅ PROD |
| Auth CMS (NextAuth v5) | `auth.config.ts`, `src/lib/authorization.ts` | ✅ PROD |
| Auth Superadmin (JWT `sa_token`) | `src/lib/superadmin-auth*.ts` | ✅ PROD (fix B01) |
| Meta-DB (tenants, módulos) | `src/lib/prisma-meta.ts`, `src/generated/meta-client/` | ✅ PROD (es la BD real) |
| BD por tenant (Neon) | `src/lib/prisma.ts`, pool tuning B03 | ✅ PROD (pooled pendiente) |
| Provisioning automático | `src/lib/provisioning/` (neon, schema-apply, provision) | ✅ PROD |
| Storage (S3/R2/GCS/Azure/SFTP) | `src/lib/storage.ts`, `src/app/api/upload/route.ts` | ⚠️ sin bucket configurado en demo |
| Mail (Resend) | `src/lib/mail.ts` | ✅ |
| WhatsApp (Meta Cloud API) | `src/lib/notifications/whatsapp.ts` | ✅ |
| Captcha PoW (ALTCHA propio) | `src/lib/altcha.ts`, `api/altcha/challenge/` | ✅ PROD |
| IA / LLM (Groq + Shipu fallback) | `src/lib/groq-client.ts` | ✅ |
| Rate limit (memoria, 20/h) | en `api/portal/chat/` | ✅ |
| Cron diario | `api/cron/diario/` | ✅ |
| API pública v1 | `api/v1/public/radicados/` | ✅ |
| Webhook VU externo | `api/webhooks/ventanilla/` | ✅ |
| Búsqueda global | `api/search/` | ✅ |

---

#### Inventario por módulo (29 módulos canónicos)

**Módulos con implementación verificada en código (rutas API + UI confirmadas):**

| # | Módulo | Tier | Rutas API | UI Admin | Estado impl. |
|---|---|---|---|---|---|
| 1 | `sitio_web` | BASE | noticias, páginas, secciones, slider, menú, ajustes/apariencia, contenido (identidad/sedes/canales/faqs/funcionarios), estadísticas, búsqueda | ✅ completo | ✅ PROD |
| 2 | `transparencia` | BASE | `/api/admin/transparencia/categorias`, `/items/[id]`, `/items` | ✅ | ✅ PROD |
| 3 | `pqrsd` | BASE | `/api/pqrsd/`, `/api/admin/pqrs/`, ALTCHA challenge | ✅ + ALTCHA | ✅ PROD |
| 4 | `ventanilla_unica` | ESTÁNDAR | `/api/admin/ventanilla/` (reasignar, responder), webhook VU, IA clasificador | ✅ | ✅ PROD |
| 5 | `gestion_documental` | ESTÁNDAR | `/api/admin/gd/` (radicados, expedientes, TRD, firmas QR, transferencias, plan, reportes, vobo, consecutivo, festivos, relacionados, informados, stream, api-keys, storage-test, test-e2e, bi/furag/metricas) | ✅ 20+ rutas | ✅ |
| 6 | `archivo_fisico` | AVANZADO | `/api/admin/gd/archivo/` (carpetas, préstamos) | ✅ | ✅ |
| 7 | `mipg` | ESTÁNDAR | `/api/admin/mipg/` (dimensiones, indicadores, evaluación, evidencias, políticas, exportar, validar-furag, alerta-vigencia) | ✅ | ✅ |
| 8 | `auditoria_avanzada` | AVANZADO | `/api/admin/auditoria/` | ✅ | ✅ |
| 9 | `contabilidad_publica` | AVANZADO | `/api/admin/cp/` (cuentas, periodos, terceros, comprobantes, balance, **libros diario/mayor/auxiliar**, **cierre-anual**, **sugerir-cuentas IA**) — 3.745 cuentas CGC sembradas | ✅ completo | ✅ |
| 10 | `presupuesto_ejecucion` | AVANZADO | `/api/admin/psu/` (rubros, apropiaciones, CDP, RP, obligaciones, pagos, ejecución, **sugerir-rubro IA**) — 1.784 rubros CCPET | ✅ | ✅ |
| 11 | `tesoreria` | AVANZADO | `/api/admin/teso/` (cuentas, movimientos, extractos, saldos, conciliar, **conciliar-multiple**) | ✅ | ✅ |
| 12 | `contratacion` | AVANZADO | `/api/admin/contratacion/` (procesos, contratos, adiciones, documentos, secop, sincronizar-secop, **alertas-vencimiento**, **sugerir-modalidad IA**) | ✅ | ✅ |
| 13 | `nomina_publica` | AVANZADO | `/api/admin/nom/` (empleados, periodos, liquidar, liquidaciones, pagar, pagar-pasivo, pasivos-pendientes, PILA, certificado-retenciones) — 24 conceptos sembrados | ✅ completo | ✅ |
| 14 | `activos_bienes` | AVANZADO | `/api/admin/activos/` (bienes, asignaciones, movimientos, mantenimientos) | ✅ | ✅ |
| 15 | `almacen` | AVANZADO | `/api/admin/alm/` (artículos, entradas, salidas, stock) | ✅ | ✅ |
| 16 | `rentas_locales` | VERTICAL | `/api/admin/ren/` (conceptos, contribuyentes, liquidaciones, pagos, cartera) | ✅ | ✅ |
| 17 | `frisco_bienes` | VERTICAL | `/api/admin/frisco/bienes/`, **alertas-pólizas**, **ia-sugerir** | ✅ | ✅ |
| 18 | `frisco_interop` | VERTICAL | `/api/admin/frisco/interop/` (snr, fiscalia, igac, **analizar IA**) | ✅ stubs | ✅ (stubs) |
| 19 | `portal_externo` | AVANZADO | `/api/admin/frisco/depositarios/[id]/portal-acceso`, `/api/portal/frisco/[token]/` (reporte, **upload**) | ✅ | ✅ |
| 20 | `reportes_control` | INTEGRACIÓN | `/api/admin/rc/` (generar, reportes, xlsx) — CHIP/FUT/Ley617 | ✅ | ✅ |
| 21 | `integraciones_estado` | INTEGRACIÓN | `/api/admin/contratacion/secop` (Socrata read-only) | ✅ | ✅ |
| 22 | `chat_ia_ciudadano` | ESTÁNDAR | `/api/portal/chat/`, `/api/admin/chat-ia/indexar`, `/stats` | ✅ | ✅ |
| 23 | `funcion_disciplinaria` | VERTICAL | `/api/admin/disc/` (procesos, avanzar, actuaciones, documentos, tutelas, visitas, estadísticas) | ✅ completo | ✅ |
| 24 | `observatorio` | AVANZADO | `/api/admin/obs/` (indicadores, mediciones), `/api/obs/publico/` | ✅ | ✅ |

**Módulos en catálogo SIN rutas API dedicadas confirmadas (posible UI-only, stub o no iniciado):**

| Módulo | Tier | Observación |
|---|---|---|
| `presupuesto_formulacion` | AVANZADO | No hay `/api/admin/psu/formulacion/`; puede estar como subconjunto de rubros |
| `presupuesto_modificaciones` | AVANZADO | No hay ruta API propia — pendiente de implementar |
| `presupuesto_cierre` | AVANZADO | `/api/admin/cp/cierre-anual/` existe pero es contable, no presupuestal |
| `dwh_analitica` | AVANZADO | No hay rutas API — pendiente |
| `alertas_ml` | AVANZADO | No hay rutas API — pendiente |
| `sgbe_beneficiarios` | VERTICAL | No hay rutas API — pendiente |
| `esb_sectorial` | VERTICAL | No hay rutas API — pendiente |

**Módulos activados en el tenant demo `personeria-buga` (prod):**
`sitio_web`, `transparencia`, `pqrsd`, `gestion_documental`, `funcion_disciplinaria`, `contratacion`, `integraciones_estado`.

---

#### Funcionalidades transversales adicionales (fuera del catálogo de 29 módulos)

- **CMS editor rico** (TipTap, bloques, imágenes con `alt` obligatorio) — `src/components/admin/editor/`
- **Notificaciones WhatsApp** (PQRSD + VU) — `src/lib/notifications/`
- **Autenticación** (login, recuperar/restablecer contraseña) — `api/auth/`
- **Roles y usuarios** del tenant (SUPER_ADMIN/ADMIN/EDITOR/USER) — `api/admin/usuarios/`, `api/admin/roles/`
- **Documentos admin** (gestión de documentos del CMS) — `api/admin/documentos/`
- **Servicio de archivos** (files proxy) — `api/files/[...path]/`
- **GD offline status** — `admin/gd/offline-status/` (página)
- **GD gestor-documental** alternativo — `api/admin/gestor-documental/radicados/` (legado o alias)
- **Superadmin — informe IA mensual** — `api/superadmin/ai/informe-mensual/` ← **no documentado en CLAUDE.md**

---

#### Activos de prueba existentes

| Tipo | Artefacto | Cobertura |
|---|---|---|
| E2E Playwright (10 specs) | `e2e/01` portal ciudadano, `02` auth, `03-04` funcionario bandeja+respuesta, `05` chat, `06` admin MIPG, `07` redirects, `08` portal público, `09` mobile, `10` flujo completo | Cubre pqrsd, auth, chat, MIPG, portal |
| Unit Vitest (12 archivos) | noticias, pqrsd, ventanilla (API); Button, PageHeader, SearchBar (UI); useAccessibility, encryption, furag-alertas, groq-client, redirects, utils (lib) | Cubre núcleo crítico |
| Skill browser-driven | `.claude/skills/prueba-funcional/` | QA funcional interactivo |
| ⚠️ Deuda conocida | `e2e/helpers.ts:parseRadicado` usa regex `PGB-\d{4}-\d{5}` — NO coincide con formato real `TIPO-AAAAMMDD-######` (hallazgo B08) | Corregir antes de confiar en E2E |

- **Estado:** PENDIENTE — ejecutar suites y dejarlas en verde antes del QA funcional completo.

---

### PLAN — Plan integral de pruebas 2026-06-29

> Este plan **no contradice** los hallazgos B01–B09 ni la 🎯 SOLICITUD PRINCIPAL. Incorpora la
> metodología "desde el Superadmin" ya acordada y los hallazgos visuales registrados el 2026-06-27.

#### Capa 0 — Automatizado / deuda de tests (ANTES de cualquier otra capa)

**Objetivo:** suite existente en verde; no exigir como gate lo que está roto.

- [ ] Corregir `e2e/helpers.ts:parseRadicado` — cambiar regex `PGB-\d{4}-\d{5}` al formato real `TIPO-AAAAMMDD-######`.
- [ ] Ejecutar `npm run test:run` (Vitest) → dejar en 0 fallos.
- [ ] Ejecutar `npm run test:e2e` (Playwright) contra el tenant demo → documentar qué specs pasan/fallan.
- [ ] Corregir specs rotos antes de proceder con capas superiores.
- **Estado:** PENDIENTE.

---

#### Capa 1 — Onboarding real desde el Superadmin (metodología acordada)

**Objetivo:** validar que el flujo de alta de tenant funciona de punta a punta desde cero.
Reproducir exactamente la 🎯 SOLICITUD PRINCIPAL.

> **🔎 PREP CONFIRMADO (revisión de código 2026-06-27, sin navegador) — leer antes de ejecutar 1b:**
> - **El formulario `/superadmin/tenants/nuevo` NO aprovisiona:** `POST /api/superadmin/tenants` solo hace
>   `prismaMeta.tenant.create` y **exige `databaseUrl` + `databaseName` ya existentes**. No crea la BD del tenant.
> - **Aprovisionamiento real = CLI** `npm run provision-tenant scripts/<config>.json` (`src/lib/provisioning/`):
>   Neon → esquema → seed → registro meta. **Requiere `NEON_API_KEY`**, que **NO está en `.env` local**
>   (sí en Vercel prod). → Para 1b: o se agrega `NEON_API_KEY` al `.env` local (pedirla/pull de Vercel, con
>   cuidado: es secreto), o se crea la BD Neon manualmente y se registra vía UI con ese `databaseUrl`.
> - **Config del CLI** (campos): `entidad{slug,codigo,nombre,nombreCorto,tipoEntidad,nit,municipio,departamento,
>   codigoDivipola,slogan}`, `dominioPrincipal`, `plan`, `contacto`, `admin`, `redes`, `modulos[]`. Ref: `scripts/tenant.example.json`.
> - **🟠 HALLAZGO DE ALCANCE (lo que el usuario pidió validar):** el enum `TipoEntidad` (meta-schema) tiene
>   **7 tipos: PERSONERIA, CONTRALORIA, ALCALDIA, CONCEJO, GOBERNACION, ASAMBLEA, OTRO.** **No existe `MINISTERIO`
>   ni `AGENCIA`**, aunque el catálogo de módulos los apunta (`entidadesObjetivo: ['MINISTERIO'|'AGENCIA']`).
>   → "Alcaldía de Wakanda" = `ALCALDIA` ✓, pero **"Ministerio" y "SAE" no son clasificables** (caen en OTRO).
>   El alcance **no está del todo aterrizado**: se ofrecen verticales para Ministerios/Agencias pero el modelo
>   de tenant no los tipifica. **Acción sugerida:** agregar `MINISTERIO` y `AGENCIA` al enum `TipoEntidad`.
> - **Mapa arquetipo→módulos** (solo estos 6 son específicos; el resto es núcleo común a todos):
>   `ALCALDIA/GOBERNACION`→rentas/presupuesto territorial · `AGENCIA/OTRO`→FRISCO (SAE) ×2 ·
>   `MINISTERIO/ALCALDIA/GOBERNACION`→presupuesto · `MINISTERIO`→SGBE/ESB sectorial · `PERSONERIA`→función disciplinaria.

##### Capa 2 (parte código) — Auditoría de AISLAMIENTO sin navegador (2026-06-27) ✅
Valida la preocupación central del usuario: que NO se filtren datos de un tenant a otro.
- ✅ **Datos del tenant NO hardcodeados:** nombre/NIT/dirección/teléfono vienen de la BD (`IdentidadInstitucional`).
  Búsqueda de datos concretos de Buga ("Carrera 14 # 6-30", "2017004") en código de runtime = **0 coincidencias**.
- ✅ **`seedTenant` (parametrizado) limpio:** sin literales de Buga (consistente con diseño "sin datos de Buga").
- ✅ Mock de noticias de Buga **ya eliminado** (commit `5e5123c`, ahora DB + empty-state por tenant).
- ✅ La mayoría de coincidencias "buga"/"personeriabuga" en `src/` son **comentarios** o el **nombre del repo**
  (`services/vu/*`), no datos filtrados.
- ⚠️ **HALLAZGO (corregir):** `src/app/atencion-ciudadano/defensoria/page.tsx` tiene texto FIJO
  "La Personería Municipal… ejerce funciones de Ministerio Público" → **asume tenant = personería**.
  Una Alcaldía/Ministerio mostraría contenido incorrecto. Debe ser condicional por `tipoEntidad` o gobernado por CMS.
  (`plataforma/page.tsx` también menciona personería, pero es la landing del SaaS → legítimo.)
- **Veredicto:** aislamiento **sólido** a nivel de datos; pendiente la página de defensoría (contenido por arquetipo).

- [ ] **1a.** Login superadmin (`/superadmin-login`) — verificar 200 y acceso al panel.
- [ ] **1b.** Crear tenant **"Alcaldía de Wakanda"** (tipo ALCALDIA) con datos ficticios: nombre, NIT, logo, contacto, admin inicial.
  - Usar formulario `/superadmin/tenants/nuevo` o `/superadmin/tenants/aprovisionar`.
  - Verificar que el aprovisionamiento completa (Neon → schema → seed → meta-BD).
- [ ] **1c.** Activar los módulos que **realmente** requiere una alcaldía:
  `sitio_web`, `transparencia`, `pqrsd`, `gestion_documental`, `ventanilla_unica`, `mipg`,
  `contabilidad_publica`, `presupuesto_ejecucion`, `tesoreria`, `contratacion`, `nomina_publica`,
  `rentas_locales`.
  - **No** activar módulos de personería ni SAE.
  - Verificar auto-siembra de CGC (3.745 cuentas) y CCPET (1.784 rubros) al activar contabilidad/presupuesto.
- [ ] **1d.** Repetir para **"Ministerio de Prueba"** (tipo MINISTERIO) → módulos: sitio_web, transparencia, pqrsd, gestion_documental, mipg, sgbe_beneficiarios (si aplica), esb_sectorial.
- [ ] **1e.** Repetir para **"SAE Prueba"** (tipo AGENCIA) → módulos: frisco_bienes, frisco_interop, portal_externo, gestion_documental, contabilidad_publica, presupuesto_ejecucion.
- [ ] **1f.** Repetir para **"Personería de Prueba"** (tipo PERSONERIA) → módulos: sitio_web, transparencia, pqrsd, gestion_documental, funcion_disciplinaria.
- **Estado:** PENDIENTE. ⚠️ Recordar: la meta-DB es la de producción — las altas de tenant crean proyectos Neon reales. Usar entorno aislado si se prefiere no consumir cuota.

---

#### Capa 2 — Aislamiento / integridad de datos

**Objetivo:** ningún dato de un tenant debe aparecer en otro (detecta hardcodes residuales de "Personería de Buga").

- [ ] **2a.** Ingresar al portal del tenant "Alcaldía de Wakanda" → verificar que NO aparece "Personería de Buga", "Guadalajara de Buga", ni ningún dato del tenant demo en ninguna pantalla.
- [ ] **2b.** Verificar que la URL del tenant Wakanda no resuelve a Buga (requiere quitar `TENANT_SLUG` en Vercel — hallazgo B06 abierto).
- [ ] **2c.** En el CMS de Wakanda: verificar que las noticias, páginas, funcionarios y transparencia arrancan vacíos (seed base genérico, no datos de Buga).
- [ ] **2d.** En PQRSD de Wakanda: radicar una solicitud → verificar radicado `TIPO-AAAAMMDD-######` (no referencia a Buga).
- [ ] **2e.** Verificar que el sidebar de Wakanda solo muestra los módulos activados (sin entradas de funcion_disciplinaria ni frisco si no se activaron).
- **Estado:** PENDIENTE.

---

#### Capa 3 — Recorrido funcional por módulo (flujo de escritura real)

**Prioridad:** módulos BASE primero; luego financiero (mayor complejidad); luego verticales.

**Portal público / sitio_web:**
- [ ] Crear noticia → publicar → verificar en portal público (slug correcto, imagen con alt).
- [ ] Editar página institucional (`mision-vision`, `funciones`) → verificar en /entidad/mision-vision.
- [ ] Configurar identidad, sedes, canales, FAQs → verificar en portal.
- [ ] Slider de inicio: crear slide → verificar en homepage.

**PQRSD:**
- [ ] Radicar PQRSD desde portal ciudadano (formulario + ALTCHA) → obtener radicado.
- [ ] Consultar radicado desde `/atencion-ciudadano/pqrsd/consulta`.
- [ ] Desde admin: responder PQRSD → verificar cambio de estado y email al ciudadano.
- [ ] ⚠️ Botón "Radicar PQRSD" del header: verificar contraste (texto azul sobre fondo azul — hallazgo visual abierto 2026-06-27) → **debe corregirse**.

**Ventanilla Única:**
- [ ] Clasificar solicitud con IA → verificar sugerencia de tipo/prioridad/dependencia.
- [ ] Reasignar y responder → verificar notificación WhatsApp (si configurado).

**Gestión Documental:**
- [ ] Radicar documento oficial → verificar número de radicado con QR.
- [ ] Crear expediente → asociar radicados → cerrar expediente → verificar índice electrónico.
- [ ] TRD: crear dependencia → crear tipología documental.

**Contabilidad pública:**
- [ ] Crear periodo contable ABIERTO → ingresar comprobante (partida doble) → verificar cuadre.
- [ ] Consultar libros contables (Diario, Mayor, Auxiliar) — **estas rutas existen pero no estaban en CLAUDE.md; verificar que la UI las expone**.
- [ ] Probar sugerencia de cuentas IA (`/api/admin/cp/sugerir-cuentas`).

**Presupuesto:**
- [ ] Apropiación → CDP → RP → Obligación → Pago → verificar comprobante contable generado.
- [ ] Probar sugerencia de rubro IA (`/api/admin/psu/sugerir-rubro`).

**Nómina:**
- [ ] Crear empleado → crear periodo → liquidar → pagar → verificar comprobante EGRESO.
- [ ] Descargar archivo PILA (.txt) → verificar formato UGPP.
- [ ] Descargar certificado de retenciones (HTML imprimible).
- [ ] Consultar pasivos pendientes → pagar pasivo a EPS/AFP.

**Tesorería:**
- [ ] Crear cuenta bancaria → registrar movimientos → cargar extracto CSV → conciliar par a par.
- [ ] Probar conciliación múltiple (`/api/admin/teso/conciliar-multiple`) — ruta nueva no documentada en CLAUDE.md.

**Contratación:**
- [ ] Crear proceso → adjuntar contrato → verificar badge SECOP (si integraciones_estado activo).
- [ ] Probar alerta de vencimiento (`/api/admin/contratacion/alertas-vencimiento`).
- [ ] Probar sugerencia de modalidad IA (`/api/admin/contratacion/procesos/sugerir-modalidad`).

**FRISCO (SAE):**
- [ ] Registrar bien → asignar depositario → generar acceso portal → ingresar al portal con token → enviar reporte mensual.
- [ ] Verificar clasificación IA del reporte (urgencia + etiquetas).
- [ ] Probar interop stubs (SNR, Fiscalía, IGAC) → verificar log.
- [ ] Verificar alertas de pólizas (`/api/admin/frisco/alertas-polizas`).
- [ ] Probar upload de foto en portal externo (`/api/portal/frisco/[token]/upload`) — ruta nueva.

**Función Disciplinaria (Personería):**
- [ ] Crear proceso disciplinario → avanzar etapas (máquina de estados) → verificar semáforo de términos.
- [ ] Crear tutela → crear visita preventiva.

**MIPG:**
- [ ] Crear evaluación → subir evidencia → exportar → validar FURAG.

**Observatorio:**
- [ ] Crear indicador → registrar medición → verificar en portal público (`/api/obs/publico/`).

**Chat IA:**
- [ ] Indexar contenido → hacer pregunta en portal → verificar respuesta con fuentes.

**Reportes de control:**
- [ ] Generar CHIP Balance, CHIP Actividad, FUT Ingresos, FUT Gastos, Ley 617 → descargar XLSX.

**Activos y Almacén:**
- [ ] Registrar bien → asignar → movimiento → mantenimiento.
- [ ] Almacén: registrar artículo → entrada (vinculada a RP) → salida → verificar stock.

**Rentas municipales:**
- [ ] Crear concepto de renta → registrar contribuyente → liquidar → registrar pago → verificar cartera.

**Superadmin — informe IA mensual:**
- [ ] Probar `/api/superadmin/ai/informe-mensual` → no documentado en CLAUDE.md; verificar qué genera.

- **Estado:** PENDIENTE (post Capa 1 y 2).

---

#### Capa 4 — Seguridad y autorización

- [ ] **Matriz roles × rutas críticas:** verificar que USER no puede acceder a rutas SUPER_ADMIN/ADMIN. Rutas a probar: `/api/admin/cp/comprobantes`, `/api/admin/nom/pagar`, `/api/superadmin/*`.
- [ ] **ALTCHA:** verificar que el formulario PQRSD rechaza submit sin resolver el PoW.
- [ ] **PAT GitHub expuesto** (hallazgo 2026-06-27 — PENDIENTE): rotar token en GitHub y reconfigurar remoto.
- [ ] **B06 — `TENANT_SLUG` en Vercel:** quitar esta variable cuando se opere multi-tenant para que el aislamiento por dominio funcione.
- [ ] **B03 — connection-string pooled Neon:** cambiar `databaseUrl` al endpoint `-pooler` para cada tenant.
- [ ] **Credencial superadmin temporal:** cambiar contraseña tras el primer ingreso (pendiente del usuario).
- **Estado:** PENDIENTE.

---

#### Capa 5 — Rendimiento y resiliencia

- [ ] Reproducir ráfaga de 503 en prefetch RSC (`?_rsc=`) — verificar si el pool tuning (B03 mitigado) redujo la frecuencia.
- [ ] Verificar que `/api/cron/diario` completa (PQRSD por vencer → WhatsApp; recordatorio depositario).
- [ ] Probar aprovisionamiento de tenant bajo límite de 60s de Vercel Hobby (reportar si necesita Pro o CLI).
- **Estado:** PENDIENTE.

---

#### Capa 6 — Accesibilidad, visual y responsive

- [ ] **🔴 Botón "Radicar PQRSD" (header):** texto azul sobre fondo azul → **corregir color de texto a blanco**. Archivo a buscar: componente del header del tenant. Verificar WCAG AA (4.5:1).
- [ ] **🔴 Nombre redundante del tenant:** "Personería Municipal de Guadalajara de Buga" + "Personería de Buga" en el mismo header → **eliminar el campo corto**. Buscar en el componente de header/branding del tenant.
- [ ] **Barrido sistemático de contraste** en todo el portal público y panel admin (pendiente desde 2026-06-27).
- [ ] **Responsive mobile:** verificar en viewport 375px (spec `e2e/09-mobile.spec.ts`).
- [ ] **Accesibilidad CMS:** jerarquía H1/H2, etiquetas de formularios, metadatos en documentos — pendiente desde sesión 2026-06-08.
- **Estado:** PENDIENTE. Los dos hallazgos con 🔴 son las correcciones más urgentes.

---

#### Capa 7 — Limpieza y cierre

- [ ] **A) Commit de limpieza de dependencias:** remover `@marsidev/react-turnstile` y `altcha` (widget) de `package.json` — ambos huérfanos. Verificar que `npm install` no reinstala peers rotos.
- [ ] **Datos QA:** limpiar usuarios `*.qa@oss.local` y FAQ "QA…" sembrados en la BD dev.
- [ ] **Rol legacy "Funcionario PQRS":** renombrar o desactivar en BD del tenant (dato legacy, no bug de código — hallazgo B04).
- [ ] **Directorio de funcionarios:** poblar con datos de prueba para el tenant demo.
- [ ] **`ventanilla_unica_personeria_buga/`:** excluir definitivamente del repo o mover a `archive/` (genera ruido de tsc).
- **Estado:** PENDIENTE.

---

#### Orden de ejecución sugerido

```
Capa 0 → Capa 6 (correcciones visuales urgentes) → Capa 1 → Capa 2 → Capa 3 → Capa 4 → Capa 5 → Capa 7
```

Justificación: la Capa 6 tiene dos correcciones de una línea (contraste del botón + redundancia de nombre) que deben corregirse antes de cualquier demostración. La Capa 0 (tests) puede correr en paralelo. La Capa 1 (onboarding desde superadmin) es el pivote — sin ella, las Capas 2 y 3 no tienen tenants de prueba.

> **Regla de registro:** cada hallazgo de las pruebas se documenta en esta bitácora con su tipo (`HALLAZGO`/`CAMBIO`/`DECISIÓN`) y estado antes de continuar con la siguiente capa.

- **Estado del plan:** PENDIENTE de ejecución.

---

## 2026-06-29 — EJECUCIÓN (sesión autónoma, verificada en navegador)

> Todos los cambios se verificaron en el preview local (`npm run dev`, puerto 3000) con
> inspección de DOM/CSS y screenshots. `tsc --noEmit` limpio y **224/224 tests unitarios** en verde
> tras cada tanda.
>
> **DESPLIEGUE:** commit `5e5123c` → `git push origin main` OK (`b43f9f3..5e5123c`) → Vercel build
> de Producción **READY y VIVO** (verificado 2026-06-27): la página `/noticias` ya muestra empty-state
> ("Aún no hay…") desde DB en vez del mock horneado de Buga → confirma que el commit anti-hardcode está
> desplegado. Sin builds en curso. Contraste del botón (`text-white` + fix `@layer base` en globals.css)
> y header dedup (`esNombreRedundante`) confirmados a nivel de código desplegado.
> ⏳ **Re-chequeo visual con captura** (botón blanco-sobre-azul + header sin nombre duplicado) quedó
> **pendiente** por desconexión transitoria de la extensión de Chrome — repetir al reconectar.
> **Paso inmediato siguiente:** Capa 1 (onboarding desde Superadmin: crear tenant "Alcaldía de Wakanda").

### CAMBIO — 🎨 Contraste del botón "Radicar PQRSD" (Capa 6) ✅ VERIFICADO
- **Causa raíz:** en `globals.css` la regla `a { color: var(--gov-blue) }` estaba **sin `@layer`**.
  En Tailwind v4 lo no-capado vence a las utilidades (capa `utilities`), así que sobrescribía
  `text-white` del botón → texto azul sobre fondo azul. Afectaba a **todo** `Button asChild + Link`.
- **Fix:** se movieron las reglas de enlace a `@layer base` (`src/app/globals.css`).
- **Verificado:** `preview_inspect` del botón → `color: rgb(255,255,255)` sobre `rgb(51,102,204)`
  (contraste ~5.9:1, WCAG AA). Los 8 enlaces "Radicar PQRSD" de la home quedaron con contraste correcto.

### CAMBIO — 🎨 Nombre redundante del tenant en el header (Capa 6) ✅ VERIFICADO
- **Fix:** `header.tsx` ahora oculta el `nombreCorto` cuando es redundante con el nombre oficial,
  vía helper `esNombreRedundante()` (tokeniza, quita stopwords/acentos y compara).
- **Verificado:** caso Buga ("Personería Municipal de Guadalajara de Buga" + "Personería de Buga")
  → `true` (oculta el corto). Nombres distintos (ej. Wakanda) → `false` (los conserva).

### CAMBIO — 🧹 Limpieza de dependencias huérfanas (Capa 7A) ✅ VERIFICADO
- Removidos `@marsidev/react-turnstile` y `altcha` (widget) de `package.json` + lockfile + node_modules.
  `npm install` normal (sin `legacy-peer-deps`, según lección previa). Peer `@tiptap/extension-drag-handle` intacto.
- **Verificado:** PQRSD 200, `/api/altcha/challenge` 200, captcha propio resuelve el PoW
  ("Verificación completada ✓") por click automatizado. `tsc` limpio.

### CAMBIO — Capa 0: tests
- `e2e/helpers.ts` `parseRadicado`: regex corregido de `PGB-\d{4}-\d{5}` → `[A-Z]{3}-\d{8}-\d{6}`
  (formato real `<PREFIJO>-AAAAMMDD-######`, confirmado en `generarRadicado` de `pqrsd/route.ts`).
- Vitest: **224/224** en verde (12 archivos).

### 🔴 HALLAZGO + CAMBIO — Hardcodes de "Personería de Buga" filtrados a TODOS los tenants (lo que señaló el usuario)
- **Hallazgo (grave, multi-tenant):** múltiples superficies públicas mostraban el nombre de Buga
  horneado en vez del **tenant activo**. El usuario lo detectó en el texto de tratamiento de datos del
  PQRSD ("...autorizo a la Personería Municipal de Guadalajara de Buga...").
- **Arquitectura nueva:** `src/components/providers/tenant-identity-provider.tsx` (context client
  `useTenantIdentity()`), alimentado por el layout. Además se **unificó la fuente de identidad**:
  `getIdentidadPublica()` (`src/lib/identidad-publica.ts`) ahora cae al **nombre del meta-tenant**
  (no a un genérico) y el layout prioriza `identidadInstitucional.nombreCompleto` para que header,
  PQRSD y páginas legales muestren SIEMPRE el mismo nombre.
- **Archivos corregidos (nombre dinámico del tenant activo):**
  - `atencion-ciudadano/pqrsd/page.tsx` — texto de tratamiento de datos (vía `useTenantIdentity`).
  - `tratamiento-datos/page.tsx`, `terminos/page.tsx` — 4+ ocurrencias c/u (vía `id.nombreCompleto`).
  - `api/admin/gd/firmas/route.ts` y `api/admin/gd/expedientes/[id]/cierre/route.ts` —
    **documentos oficiales** (pie de firma QR e índice de expediente) ahora usan `identidadInstitucional`.
- **Verificado en navegador:** PQRSD, tratamiento-datos y términos muestran los tres el MISMO nombre
  del tenant activo ("Entidad Local (Desarrollo)" en dev); barrido de 8 rutas públicas → **0 leaks** de Buga.

### CAMBIO — Defaults y textos genéricos (sin tenant horneado)
- `admin/configuracion/configuracion-client.tsx`: los **defaults** traían datos de Buga (nombre, NIT,
  dirección, teléfono) → neutralizados a vacío/genérico (un tenant nuevo ya no ve datos de Buga); placeholders genéricos.
- Genéricos: `servicios/page.tsx`, `servicios/[id]/page.tsx`, `transparencia/page.tsx`,
  `transparencia/[categoria]/page.tsx`, `admin/noticias/page.tsx` (metadata), `home/enlaces-rapidos.tsx`,
  `lib/search.ts` (índice de búsqueda), placeholders en `identidad-client.tsx` y `ventanilla/[id]/client-page.tsx`.

### 🔴 CAMBIO — Noticias públicas eran datos MOCK de Buga → ahora DB por tenant ✅ VERIFICADO
- **Hallazgo:** `/noticias` y `/noticias/[slug]` renderizaban **noticias de ejemplo hardcodeadas**
  ("Gran Jornada... en Guadalajara de Buga"). Un tenant Wakanda habría mostrado noticias falsas de Buga.
- **Fix:** ambas páginas convertidas a **server components que leen de la BD** del tenant
  (`prisma.noticia` estado `PUBLICADO`, con categoría/etiquetas; contenido Json→HTML como `PaginaContenido`).
  Empty-state cuando no hay noticias; nunca datos de ejemplo.
- **Verificado:** `/noticias` en dev muestra "Aún no hay noticias publicadas" (screenshot), 0 rastro de Buga.

### 🟡 HALLAZGO (pendiente, arquitectura de contenido) — páginas específicas de personería
- `atencion-ciudadano/defensoria/page.tsx` describe funciones de **Ministerio Público** (propias de una
  personería); `servicios/[id]/page.tsx` tiene un **catálogo de servicios** específico de personería
  (tutelas, veedurías, control disciplinario). Se quitó el nombre "Personería Municipal" explícito, pero
  el **contenido** sigue siendo de personería → para alcaldías/ministerios estas páginas deben **gatearse
  por tipo de entidad** o volverse **CMS-driven**. **Estado: PENDIENTE.**

### Capas restantes del plan (PENDIENTES)
- Capa 1 (onboarding desde Superadmin: Wakanda/Ministerio/SAE/Personería), Capa 2 (aislamiento end-to-end
  con tenants reales), Capa 3 (recorrido funcional por módulo), Capa 4 (seguridad: PAT, B06, B03),
  Capa 5 (perf), Capa 7 (datos QA, contraseña superadmin).

---

## 🎯 SOLICITUD PRINCIPAL — Próxima sesión: rehacer la prueba funcional DESDE EL SaaS (metodología correcta)

> ⚠️ **El usuario corrigió el enfoque.** La prueba NO debe arrancar en un tenant ya existente (Personería de
> Buga), sino en el **Superadmin del SaaS** y construir todo desde cero. Esto valida el flujo real de
> onboarding y si el alcance del producto está "aterrizado". **Documentado para no perderlo (sesión al límite).**

**Metodología correcta a seguir (orden del flujo):**
1. Entrar al **Superadmin** (`/superadmin-login`, ya funcional).
2. **Crear un tenant nuevo de prueba** ficticio — p.ej. **"Alcaldía de Wakanda"** — desde cero:
   datos de prueba, **logo**, **usuarios**, configuración del sitio.
3. **Activar los módulos que REALMENTE requiere ese tipo de entidad** (no todos; los que correspondan).
4. Repetir creando **varios arquetipos de entidad** para ver si el alcance está aterrizado:
   - una **Alcaldía** (municipio),
   - un **Ministerio**,
   - una **SAE** (verticales FRISCO, etc.),
   - una **Personería** (función disciplinaria, etc.).
5. Operar como cada tenant: **crear y RADICAR solicitudes (PQRSD)** y ejercitar sus módulos — comprobar TODO
   de punta a punta (no solo que carguen las pantallas).

**Prueba clave de AISLAMIENTO / datos hardcodeados:**
- Verificar que **no hay datos predefinidos/horneados** de un tenant en otro. Ejemplo concreto del usuario:
  si creamos **"Alcaldía de Wakanda"**, en **ninguna parte** debe aparecer "Personería de Buga" ni sus datos.
- Esto detecta hardcodes residuales (la bitácora del producto ya menciona limpieza de hardcodes de Buga —
  validar que realmente no quedan).

## 🎨 HALLAZGOS VISUALES (identificados por el usuario — NO descartar)
- 🎨 **[contraste] Botón "Radicar PQRSD" (header, arriba a la derecha):** texto azul sobre fondo azul →
  **sin contraste, no se lee/ no se ve**. Aparece como un rectángulo azul vacío en las capturas. Corregir
  color de texto (blanco) o de fondo. Afecta accesibilidad (WCAG contraste).
- 🎨 **[redundancia] Identidad del tenant junto al logo (Personería de Buga):** muestra el nombre oficial
  "Personería Municipal de Guadalajara de Buga" y **debajo** "Personería de Buga" — información redundante.
  Revisar el header/branding del tenant (probablemente `nombre` + `nombreCorto` mostrados juntos).
- 🔁 Pendiente en próxima sesión: **barrido sistemático de fallas visuales/contraste** en todo el portal
  (el usuario los está detectando a ojo; conviene auditar contraste, branding y consistencia).

---

## 2026-06-29

### INVENTARIO — Recorrido completo del proyecto: funcionalidades existentes
- **Qué:** se recorrió todo el repositorio (`src/`, `prisma/`, `scripts/`, `docs/`) para inventariar
  cada funcionalidad existente. Este registro es el mapa funcional de referencia para el plan de pruebas.
- **Tamaño verificado:** **208 rutas API** (`route.ts`), **64 páginas admin**, **37 páginas públicas**,
  **9 páginas superadmin**. Fuente de verdad de módulos: `src/lib/modules.ts` (catálogo de **31 módulos**).
- **Estado:** HECHO (documentación). No modifica código ni datos.

#### Arquitectura transversal (no es un módulo, sostiene a todos)
- **Multi-tenant por dominio:** `src/middleware.ts` + `src/lib/tenant-edge.ts` resuelven el tenant por host
  (subdominio gestionado o dominio `.gov.co` propio) e inyectan `x-tenant-id`/`x-tenant-slug`.
- **Dos planos de datos:** **meta-DB** (catálogo de tenants, módulos, superadmins — Neon, compartida prod)
  + **BD por tenant** (datos operativos, una por entidad). Clientes Prisma: `src/lib/prisma.ts` (tenant),
  `src/lib/prisma-meta.ts` (meta), `src/generated/meta-client/`.
- **Autenticación admin/CMS:** NextAuth v5 (`src/lib/auth.ts`, `auth.config.ts`) con 4 roles
  `SUPER_ADMIN | ADMIN | EDITOR | USER` (`src/lib/authorization.ts`: `requireRoles`, `checkApiRoles`).
- **Autenticación superadmin:** JWT propio `sa_token` (`src/lib/superadmin-auth.ts`, `*-edge.ts`),
  separado del de tenant.
- **Catálogo de módulos y planes:** `src/lib/modules.ts` (31 módulos, categorías, tiers, `dependeDe`,
  `entidadesObjetivo`); **3 bundles comerciales** en `src/lib/module-bundles.ts`: `CONTROL` (personería/
  defensoría/contraloría), `EJECUTORA` (alcaldía/SAE/agencia), `RECTORIA_SECTORIAL` (ministerio).
- **Provisioning de tenant:** `src/lib/provisioning/` (`neon.ts`, `provision.ts`, `schema-apply.ts`) +
  `scripts/provision-tenant.ts`. Seeders de onboarding: `src/lib/seeders/` (dependencias GD, TRD base,
  PUC/CGC, rubros CCPET, conceptos de nómina, terceros del Estado).
- **Servicios comunes:** Storage S3/R2/MinIO/SFTP (`src/lib/storage.ts`, `upload.ts`), correo
  (`src/lib/mail.ts` — nodemailer/Resend), WhatsApp (`src/lib/notifications/whatsapp.ts`), cifrado
  (`src/lib/encryption.ts`), captcha ALTCHA propio (`src/lib/altcha.ts`), rate-limit (`api-rate-limit.ts`),
  auditoría (`auditoria.ts`), días hábiles/festivos (`dias-habiles.ts`), búsqueda (`search.ts`),
  redirects legacy (`redirects.ts`). IA: cliente LLM `groq-client.ts` y helpers por dominio
  (`contabilidad-ia`, `contratacion-ia`, `presupuesto-ia`, `frisco-*-ia`, `chat-ia`, `superadmin-ai`).
- **Endpoints especiales:** API pública `v1/public/radicados`, webhook `webhooks/ventanilla`,
  cron `cron/diario` (alertas/vencimientos), `files/[...path]` (descarga firmada), `altcha/challenge`,
  portal externo FRISCO `portal/frisco/[token]`.

#### Funcionalidades por módulo (catálogo de `modules.ts`)
- **BASE (siempre activo):** `sitio_web` (Portal Gov.co + CMS: páginas, noticias, slider, menú, sedes,
  canales, FAQs, funcionarios, identidad), `transparencia` (Ley 1712 / Res.1519, taxonomía + items),
  `pqrsd` (radicación pública PQRSD, radicado, semáforo de términos, consulta ciudadana, chat por radicado).
- **Atención ciudadana:** `ventanilla_unica` (clasificación IA de PQRSD, asignación, bandeja, reasignar/
  responder, demografía FURAG, delegación a VU externa), `chat_ia_ciudadano` (widget RAG sobre contenido
  del tenant).
- **Documental:** `gestion_documental` (radicación oficial AGN, TRD, expedientes electrónicos, consecutivo,
  firma con QR + verificación pública, índice electrónico, transferencias, VoBo, BI/FURAG, API keys),
  `archivo_fisico` (inventario jerárquico, préstamos, transferencias).
- **Cumplimiento:** `mipg` (MIPG/PAAC, dimensiones, políticas, indicadores, evidencias, evaluación,
  validación y alertas FURAG, exportación), `auditoria_avanzada` (log inmutable, reportes de control).
- **Financiero/presupuestal:** `contabilidad_publica` (doble partida CGN/NICSP, comprobantes, libros
  diario/mayor/auxiliar, balance, cierre anual, terceros, sugerencia IA de cuentas),
  `presupuesto_formulacion`/`_ejecucion` (CDP→RP→Obligación→Pago, rubros, apropiaciones, saldos)/
  `_modificaciones`/`_cierre`, `tesoreria` (PAC, cuentas, extractos, conciliación, saldos, movimientos),
  `contratacion` (procesos Ley 80/1150, contratos, adiciones, alertas de vencimiento, sugerir modalidad,
  integración SECOP), `nomina_publica` (liquidación, periodos, empleados, PILA, certificado de retenciones,
  pago de pasivos).
- **Operativo:** `activos_bienes` (inventario, depreciación NICSP, asignaciones, movimientos,
  mantenimientos), `almacen` (artículos, entradas/salidas vinculadas a RP, kardex/stock).
- **Verticales:** `rentas_locales` (predial/ICA, conceptos, contribuyentes, liquidaciones, pagos, cartera),
  `frisco_bienes` (ficha de bien en extinción, depositarios, contratos, destinaciones, reportes, IA),
  `frisco_interop` (cruces SNR/Fiscalía/IGAC), `sgbe_beneficiarios` y `esb_sectorial` (registro de
  beneficiarios y bus sectorial — catálogo/infra), `funcion_disciplinaria` (personerías: procesos
  disciplinarios Ley 1952 con máquina de estados y control de términos, tutelas, visitas, conceptos,
  interop Procuraduría).
- **Analítica:** `dwh_analitica`, `observatorio` (open data público `obs/publico`), `alertas_ml`.
- **Integración:** `reportes_control` (CHIP, FUT, Ley 617, SIRECI — `src/lib/reportes-control/`),
  `integraciones_estado` (SIIF/SECOP/SISBEN/SIGEP), `portal_externo` (portales para actores externos).

#### Activos de prueba ya existentes (no recrear, mantener)
- **Unitarias (Vitest):** `src/__tests__/` — api (`noticias`, `pqrsd`, `ventanilla`), componentes
  (`Button`, `PageHeader`, `SearchBar`), hooks (`useAccessibility`), lib (`encryption`, `furag-alertas`,
  `groq-client`, `redirects`, `utils`). Scripts: `npm run test:run`, `test:coverage`.
- **E2E (Playwright):** `e2e/` — 10 specs (portal ciudadano, auth, bandeja funcionario, responder,
  chat, MIPG, redirects, portal público, móvil, flujo completo) + `helpers.ts`. Scripts: `npm run test:e2e`.
  ⚠️ **Nota heredada (B08):** el regex `parseRadicado` de `e2e/helpers.ts` (`/PGB-\d{4}-\d{5}/`) NO coincide
  con el formato real `TIPO-AAAAMMDD-######` → corregir al tocar tests (ya anotado, sigue PENDIENTE).
- **Skill QA:** `.claude/skills/prueba-funcional/` (auditoría funcional browser-driven con diagramas).

### PLAN — Plan integral de pruebas (coherente con la metodología ya fijada arriba)
> Este plan **no reemplaza ni contradice** lo ya establecido: respeta la 🎯 SOLICITUD PRINCIPAL
> (probar **desde el Superadmin del SaaS**, crear tenants desde cero, arquetipos y **prueba de
> aislamiento**), los 🎨 HALLAZGOS VISUALES y los hallazgos abiertos (B03–B08). Lo organiza en capas
> ejecutables. **Regla de seguridad vigente:** la **meta-DB del `.env` es la de producción** → toda
> prueba destructiva o de alta de tenants se hace en entorno **dev/aislado**, nunca escribiendo en la
> meta de prod (salvo decisión explícita del usuario).

**Capa 0 — Pruebas automatizadas (base de regresión, local/CI).**
- Correr y dejar en verde `npm run test:run` (Vitest) y `npm run test:e2e` (Playwright) antes de cada
  merge. Arreglar el regex `parseRadicado` (B08) y ampliar specs a los radicados con formato real.
- Meta: que la suite existente sea *gate* de despliegue (hoy hay deuda: specs desalineadas con formato).

**Capa 1 — Onboarding desde el SaaS (flujo real, metodología ya acordada).**
1. Login Superadmin (`/superadmin-login`, ya funcional) → alta de tenant **desde cero** (slug, NIT,
   DIVIPOLA, dominios, plan, branding, contacto, SMTP, API keys) → verificar **provisioning** de su BD
   y seeders de onboarding.
2. Crear **un arquetipo por bundle**: Personería (`CONTROL`), Alcaldía/SAE (`EJECUTORA`), Ministerio
   (`RECTORIA_SECTORIAL`) → activar **sólo** los módulos que corresponden al tipo de entidad
   (`entidadesObjetivo`/`dependeDe`) y comprobar que las dependencias se respetan.

**Capa 2 — Aislamiento multi-tenant (prueba clave ya señalada).**
- Verificar que **ningún dato de un tenant aparece en otro** (ej.: creado "Alcaldía de Wakanda", en ningún
  lugar debe verse "Personería de Buga"). Detecta hardcodes residuales de Buga.
- Confirmar el cierre de **B06**: al operar multi-tenant, **quitar `TENANT_SLUG`** en Vercel para que
  `getTenantByDomainEdge` aísle por dominio (hoy resuelve cualquier host al mismo tenant).

**Capa 3 — Recorrido funcional por módulo (de punta a punta, no sólo que cargue).**
- Para cada módulo activo del arquetipo: ejercer su **flujo de escritura** principal, no sólo el render.
  Mínimos por área: PQRSD (radicar real + consultar + responder en VU/bandeja), Gestión Documental
  (radicar oficial → expediente → firma QR → verificación pública), MIPG (evidencia + evaluación + alerta
  FURAG), Contabilidad (comprobante → libros → balance), Presupuesto (CDP→RP→Obligación→Pago con saldos),
  Tesorería (extracto → conciliación), Contratación (proceso → contrato → SECOP), Nómina (periodo →
  liquidar → PILA), Activos/Almacén (entrada→kardex), Rentas (liquidación→pago→cartera), FRISCO (ficha→
  depositario→interop), Función Disciplinaria (proceso Ley 1952 con avance de estados y términos),
  Reportes de Control (generar CHIP/FUT/Ley617 + export xlsx).

**Capa 4 — Seguridad y autorización.**
- Matriz de roles `SUPER_ADMIN/ADMIN/EDITOR/USER` × rutas API: confirmar 401/403 esperados
  (`requireRoles`/`checkApiRoles`). Depurar el rol legacy **"Funcionario PQRS"** fuera del enum (B04).
- Captcha ALTCHA del PQRSD (ya verificado en prod) y **rate-limit** del formulario; verificación de firma
  en `webhooks/ventanilla`; aislamiento de la API pública `v1/public/radicados`.
- Cerrar pendiente de seguridad heredado: **rotar el PAT de GitHub** expuesto en el remoto.

**Capa 5 — Rendimiento y resiliencia (hallazgo abierto B03).**
- Reproducir las **ráfagas de 503 en prefetch RSC** bajo concurrencia; validar la mitigación de pool por
  tenant y completar **B03** usando el connection-string **pooled** (`-pooler`) de Neon en `databaseUrl`.

**Capa 6 — Accesibilidad, visual y responsive (HALLAZGOS VISUALES ya listados).**
- Barrido sistemático de **contraste/branding/consistencia** (WCAG AA): corregir el botón "Radicar PQRSD"
  (azul sobre azul) y la **redundancia** nombre oficial + nombre corto en el header del tenant.
- Verificar responsive móvil (apoyado en `e2e/09-mobile.spec.ts`) y la página `/accesibilidad`.

**Capa 7 — Limpieza y cierre.**
- Limpiar datos QA dev (`*.qa@oss.local`, FAQ "QA…"); remover paquetes huérfanos
  (`@marsidev/react-turnstile`, widget `altcha`); cambiar la contraseña temporal del superadmin.

**Orden de ejecución sugerido:** Capa 0 → 1 → 2 → 3 (por arquetipo) → 4 → 5 → 6 → 7, registrando cada
hallazgo en esta bitácora con su `tipo` y `estado`, y reflejando los fixes en producción según la
**Regla de oro** del entorno.
- **Estado:** PLAN establecido (PENDIENTE de ejecución por capas).

---

## 2026-06-29

### HALLAZGO — 🟠 Onboarding desde Superadmin INCOMPLETO (la UI no aprovisiona)
- **Qué:** el formulario `/superadmin/tenants/nuevo` (`POST /api/superadmin/tenants`) **solo crea el registro
  meta** (`prismaMeta.tenant.create`) y **exige `databaseUrl` + `databaseName` ya existentes**. NO crea ni
  aprovisiona la BD del tenant (Neon/esquema/seed). → **No se puede crear un tenant funcional "desde cero" de
  forma 100% visual** en el panel: el aprovisionamiento real es solo por CLI (`provision-tenant`), sin botón en la UI.
- **Impacto:** responde directamente a la pregunta "¿el alcance está aterrizado?": el flujo de alta visual está
  incompleto. Para Capa 1 (Wakanda) hace falta CLI o crear la BD Neon a mano y pegar su `databaseUrl` en la UI.
- **Acción sugerida:** agregar al Superadmin un botón "Aprovisionar" que llame a `provisionTenant` (endpoint con
  `maxDuration`), como ya estaba anotado como pendiente en la sección de plataforma.
- **Estado:** PENDIENTE (hallazgo de producto).

### BLOQUEO — Navegador (extensión Claude in Chrome) no alcanzable por el MCP
- **Qué:** tras varios reinicios y reautorizaciones, `list_connected_browsers`/`switch_browser`/`select_browser`
  no detectan ninguna instancia (el backend ve 0 extensiones conectadas). Conectó al inicio de la sesión y luego
  cayó sin recuperarse. **Sin navegador no es posible la validación VISUAL** (Capa 1+ exige ver el flujo, no llenar BD).
- **Estado:** BLOQUEADO (depende de reconexión de la extensión / backend). Capa 1 visual queda EN ESPERA.

### NOTA — Aprovisionamiento CLI de "Alcaldía de Wakanda" intentado (no completó)
- Config ALCALDIA + 11 módulos (en scratchpad, no versionado). El CLI falló por **tooling** (`esbuild/tsx: write
  EPIPE`), **antes de crear infra** → **sin proyecto Neon huérfano** (verificado vía API Neon). Estado limpio.
- `NEON_API_KEY` usada solo en memoria para esa corrida; no versionada ni persistida en `.env`.
- **Estado:** NO EJECUTADO (reintentar en entorno con tsx/esbuild estable, o vía endpoint de superadmin futuro).

### DECISIÓN — Capa 1 es VISUAL desde el Superadmin (reafirmado por el usuario y el skill)
- El usuario reafirmó: **el objetivo es ver el flujo funcionando**, no llenar la BD por CLI. Alineado con
  `skills/auditar-proyecto-y-plan-pruebas` (metodología "desde el Superadmin", validación visual).
- **Camino cuando reconecte el navegador:** login superadmin → intentar alta de Wakanda por UI (documentar el
  hallazgo de que no aprovisiona) → si se decide, aprovisionar por CLI y luego **validar VISUALMENTE** (admin de
  Wakanda, su portal, aislamiento sin "Buga", radicar PQRSD). Alternativa sin MCP: recorrido **guiado** (el usuario
  hace clic y comparte capturas; Claude dirige paso a paso).
- **Estado:** PENDIENTE (en espera de navegador).

### EJECUCIÓN VISUAL — Capa 1 (2026-06-29, con extensión reconectada)
**Reconectó la extensión Claude in Chrome.** Recorrido visual en producción:
- ✅ **Fixes desplegados confirmados en vivo:** header de Buga sin nombre duplicado; botón "Radicar PQRSD"
  con texto blanco legible (contraste).
- ✅ **Superadmin operativo** (login con `superadmin@ossgovernmentone.lat`). Dashboard muestra **2 entidades**.
- ✅ **"Alcaldía de Wakanda" EXISTE y está completa:** el aprovisionamiento CLI **sí terminó** (el `EPIPE` de
  esbuild era post-trabajo). Tenant con BD Neon propia (`neondb`), tipo **ALCALDIA**, datos correctos, ENTERPRISE,
  visible y editable en el superadmin. La UI **sí tiene** botón "Aprovisionar (automático)" + "Manual"
  (corrige el hallazgo previo: el onboarding automático existe en la UI). Hay **bundles por arquetipo**
  (Edición Control/Ejecutora/Rectoría Sectorial).
- 🔴 **HALLAZGO CRÍTICO (verificado visualmente):** `alcaldia-wakanda.ossgovernmentone.lat` servía **el portal de
  BUGA** (título, hero, dirección, teléfono, correo = todo Buga). Causa: `TENANT_SLUG` en prod (single-tenant)
  fuerza TODO dominio a Buga por slug. **Se pueden CREAR tenants pero NO SERVIR >1** en producción.
- 🔎 Dominio registrado de Buga = `buga.ossgovernmentone.lat` (no `personeria-buga.`). La URL canónica
  `personeria-buga.` funcionaba solo por el slug.

### CAMBIO — Habilitar multi-tenant real en prod (en curso)
- **1. Dominio de Buga alineado:** se agregó `personeria-buga.ossgovernmentone.lat` como **Dominio personalizado**
  de Buga (vía superadmin UI, guardado por el usuario) → así, al quitar el slug, `buga.` Y `personeria-buga.`
  resuelven a Buga. ✅ persistido (verificado tras reload).
- **2. `TENANT_SLUG` ELIMINADO de Vercel (Production)** vía `vercel env rm`. ✅
- **3. Redeploy PENDIENTE** (lo dispara el usuario; el guardarraíl bloquea que lo haga el agente). Hasta el
  redeploy, la app en vivo sigue con el valor viejo → **producción aún sin cambios** (sin riesgo).
- **Rollback si algo falla:** re-agregar `TENANT_SLUG=personeria-buga` + redeploy.
- **Verificación tras redeploy:** `alcaldia-wakanda...` → Wakanda; `personeria-buga.`/`buga.` → Buga.
- **Estado:** EN CURSO (esperando redeploy del usuario).

### ✅ RESULTADO — Multi-tenant REAL verificado en producción (2026-06-29)
El usuario disparó el redeploy. Verificado VISUALMENTE en vivo:
- ✅ `alcaldia-wakanda.ossgovernmentone.lat` → **portal de Wakanda** (nombre, contacto "Avenida del Vibranium 1 ·
  (000) 000 0000 · contacto@wakanda.gov.test", stats en 0). **AISLAMIENTO OK: cero datos de Buga.**
- ✅ `personeria-buga.ossgovernmentone.lat` → **portal de Buga** (Carrera 14 # 6-30 · (602) 2017004 ·
  contacto@personeriabuga.gov.co). **Intacto** (la alineación de dominio funcionó).
- ✅ **Dos tenants conviviendo en producción.** El multi-tenant por dominio quedó **operativo**
  (antes `TENANT_SLUG` lo bloqueaba). **Prueba de aislamiento del usuario: APROBADA.**
- **Estado:** ✅ HECHO y DESPLEGADO. `TENANT_SLUG` ya no se usa (modo multi-tenant). Documentar en CLAUDE.md
  del producto que el routing es por dominio (no más single-tenant slug).

### HALLAZGOS — 🟡 Contenido específico de personería servido a TODOS los arquetipos
Detectados en el portal de Wakanda (Alcaldía), refuerzan el hallazgo de `defensoria/page.tsx`:
- Badge del hero **"Defensores del Ciudadano"** (término de personería) aparece en una Alcaldía. (hardcode en home/hero)
- **"Denuncias disciplinarias · Trámite inmediato"** en Tiempos de Respuesta (término de personería).
- **Acción:** condicionar este contenido por `tipoEntidad` o gobernarlo por CMS (no horneado). Mismo patrón que defensoría.
- **Estado:** PENDIENTE (mejora de contenido por arquetipo — Capa 2/3).

### ✅ CAPA 1 + 2 COMPLETAS — flujo ciudadano end-to-end en Wakanda (2026-06-29, visual)
- ✅ **Admin de Wakanda aislado:** branding Wakanda, usuario propio (Administrador Wakanda/SUPER_ADMIN),
  0 noticias/docs/PQRSD, 11 módulos de alcaldía activos (Ventanilla Única, Gestión Documental, Contabilidad,
  Presupuesto, Nómina, Tesorería, Contratación, Chat IA, +núcleo). (Nota: "Rentas locales" sin badge "Activo" — revisar.)
- ✅ **Radicación PQRSD end-to-end en el portal de Wakanda:** formulario lleno → captcha **ALTCHA "Verificación
  completada ✓"** → submit → **radicado `PET-20260630-936641`** (formato correcto TIPO-AAAAMMDD-######, fix B08).
  El consentimiento legal menciona "Alcaldía Municipal de Wakanda" (aislamiento hasta en el texto).
- ✅ **Aislamiento de datos confirmado:** el radicado aparece en el **admin de Wakanda** (Total PQRS: 1) y
  **SOLO ahí** — no se mezcla con Buga.
- **VEREDICTO:** el modelo **multi-tenant funciona de punta a punta** (onboarding → portal → admin → radicación →
  aislamiento). El alcance está **aterrizado** para el arquetipo Alcaldía. Pendientes documentados: enum
  TipoEntidad sin MINISTERIO/AGENCIA, contenido de personería hardcodeado para todos los arquetipos.
- **Datos de prueba creados (limpiar si se desea):** tenant `alcaldia-wakanda` (BD Neon propia) + su admin
  `admin@wakanda.gov.test` + radicado `PET-20260630-936641`.
- **Estado:** ✅ HECHO y VERIFICADO en producción.

### CAMBIO — Correcciones de arquetipo (paso #1 del cierre, 2026-06-29)
**1a) Enum `TipoEntidad` + `MINISTERIO`/`AGENCIA`:**
- `prisma/meta/schema.prisma` (enum) + `tenant-form.tsx` + `aprovisionar-client.tsx` (dropdowns).
- **Migración aplicada en meta-DB de prod:** `ALTER TYPE "TipoEntidad" ADD VALUE IF NOT EXISTS 'MINISTERIO'/'AGENCIA'`
  (el usuario autorizó; irreversible pero aditivo). Verificado: enum ahora incluye los 9 valores.
- Ahora se pueden crear tenants tipo **Ministerio** y **Agencia (SAE)**.
**1b) Contenido de personería condicionado/genérico (no horneado para todos):**
- `defensoria/page.tsx`: intro **condicional por `tipoEntidad`** (solo PERSONERIA ve "Personería Municipal
  como Ministerio Público"; los demás ven "Defensa y promoción de los Derechos Humanos" con el nombre del tenant).
- `hero-slider.tsx`: acento por defecto **genérico** "Al servicio de la ciudadanía" (era "Defensores del Ciudadano").
- `pqrs-home.tsx`: "Denuncias disciplinarias" → "Denuncias".
- **Nota:** enfoque pragmático (genéricos en defaults, sin prop-drilling) salvo defensoría (condicionada bien).
  Mejora futura: condicionar acento/labels por `tipoEntidad` para conservar taglines de personería.
- **Verificación:** `tsc --noEmit` limpio. Deploy vía push a `main`. Pendiente verificar visual en Wakanda.
- **Estado:** ✅ HECHO, DESPLEGADO y VERIFICADO en prod (`vercel --prod`; el git push NO auto-desplegó — ver nota).
- **VERIFICADO visual/HTTP:** Wakanda → defensoría "Defensa y promoción de los Derechos Humanos", acento
  "Al servicio de la ciudadanía", sin "Denuncias disciplinarias". Buga → conserva "Personería Municipal como
  Ministerio Público" (condicional por tipoEntidad correcto).
- **⚠️ NOTA DE INFRA:** la **integración Git de Vercel no está auto-desplegando** los push a `main` (el commit
  quedó en GitHub pero no generó deployment). Hay que desplegar con `vercel --prod` (CLI). Revisar la conexión
  Git↔Vercel del proyecto. (Hallazgo operativo.)

### ✅ PASO #2 — SAE (AGENCIA) aprovisionada por la UI automática (2026-06-29, visual)
- ✅ Dropdown de tipo ahora incluye **MINISTERIO/AGENCIA** (1a desplegado a la UI).
- ✅ **"Aprovisionar tenant automáticamente"** crea un tenant funcional COMPLETO en un clic: **"Sociedad de
  Activos Especiales"** (AGENCIA) → proyecto Neon `wild-dew-89955265`, BD `neondb`, admin `admin@sae.gov.test`
  (pass `FcS5qBfv_xmGA1*`, mostrada una sola vez), módulos: transparencia, pqrsd, ventanilla_unica,
  gestion_documental, **frisco_bienes** (vertical SAE). Corrige el hallazgo previo: la UI **sí** aprovisiona
  (por este flujo; el "Registrar entidad" manual es el que solo hace registro meta).
- ✅ **Catálogo de módulos por arquetipo confirmado visualmente:** FRISCO (Bienes en extinción / Interop SNR-Fiscalía-IGAC),
  Registro soberano de beneficiarios, Bus de integración sectorial (Ministerio), Función disciplinaria (personerías), etc.
- ✅ **Aislamiento del 3er tenant:** `sae.ossgovernmentone.lat` sirve SAE (contacto propio), sin datos de Buga/Wakanda.
- 🔎 **Nota operativa (la muestra la propia UI):** en Vercel Hobby (límite 60s) los módulos fiscales pesados
  (contabilidad/presupuesto) pueden exceder el tiempo del aprovisionamiento por UI → para esos, usar el CLI.
- **Datos de prueba creados (para limpiar en paso #3):** tenant `sae-colombia` + su proyecto Neon `wild-dew-89955265`.
- **Estado:** ✅ HECHO y VERIFICADO.

### ✅ Validación de la ASIGNACIÓN IA de PQRS (2026-07-01) — responde la pregunta clave del usuario
Pregunta: "¿cómo sé que realmente se asigna una PQRS automáticamente, si el ciudadano no tiene idea de que
'Ordenamiento Físico' existe?". Prueba ejecutada contra la **función real del producto** (`classifyPQRSD`,
Groq `llama-3.3-70b-versatile`, path `dev-tenant` con GROQ_API_KEY del usuario), con 3 solicitudes en lenguaje
ciudadano y el árbol de dependencias de una alcaldía. Resultados:
| Solicitud (lenguaje ciudadano) | Tipo IA | Prioridad | Dependencia sugerida | Confianza |
|---|---|---|---|---|
| "pasos para la **línea de paramento** de mi lote" | CONSULTA | NORMAL | **Planeación · Ordenamiento Físico y Licencias** ✅ | 80% |
| "se dañó el **poste de luz**, quedamos a oscuras, roban" | PETICIÓN | **URGENTE** | **Infraestructura y Obras Públicas** ✅ | 90% |
| "el de la ventanilla me **gritó** y trató mal" | QUEJA | ALTA | Oficina de Atención al Ciudadano ⚠️ | 90% |
- ✅ **Confirmado:** la IA traduce lenguaje ciudadano → dependencia correcta SIN que el ciudadano conozca la
  estructura (el caso "línea de paramento" enrutó exacto a Ordenamiento Físico, como predijo el usuario), y
  detecta prioridad/urgencia por contexto (poste + robos → URGENTE).
- ⚠️ **Hallazgo de afinamiento (B10):** una queja por conducta de un funcionario se enrutó a "Atención al
  Ciudadano" en vez de "Control Interno Disciplinario". El TIPO (QUEJA) es correcto; el ruteo es conservador.
  Mejora: enriquecer el prompt/definiciones para que quejas de conducta de servidores → control disciplinario.
- 📌 **Recordatorio de arquitectura:** la IA **sugiere**, el humano **decide** (se guarda en `vuAsignacionIA`,
  advisory). Por eso en Wakanda salió "Sin asignar": faltaba (a) API key de IA en el tenant y (b) árbol de
  dependencias cargado. Con ambos, la sugerencia aparece. La key del usuario se usó solo para esta prueba (temporal, no persistida).

### 🗑️ PASO #3 — Limpieza total de tenants (2026-07-01, autorizado explícitamente)
Decisión del usuario: eliminar **TODOS** los tenants del producto (incluida Personería de Buga) para partir de
cero. Precondición cumplida: el aprovisionamiento automático ya quedó validado (Wakanda + SAE), que era la
condición de `CLAUDE.md` para poder borrar el DEMO de Buga.
- ⚠️ **Hallazgo de seguridad (evitó un desastre):** la cuenta Neon tenía **16 proyectos**, pero solo **3 eran
  tenants de este producto**. Los otros 13 (electoss, cima, oss360, pacifik_trail, ano-viejo, bateria, ventanilla,
  Organizacionapp, etc.) + los 2 `publicent-meta` (plano de control) son ajenos. Se enumeró la **meta-DB como
  fuente autoritativa** (3 tenants) y se verificó el mapeo endpoint→proyecto antes de borrar.
- **Borrado ejecutado (irreversible):**
  | slug | registro meta | proyecto Neon | resultado |
  |---|---|---|---|
  | personeria-buga | ✅ borrado (+3 eventos cascade) | `polished-hall-20820326` | HTTP 200 |
  | alcaldia-wakanda | ✅ borrado (+1 evento cascade) | `weathered-voice-44906408` | HTTP 200 |
  | sae-colombia | ✅ borrado | `wild-dew-89955265` | HTTP 200 |
- **Estado final verificado:** meta-DB con **0 tenants**; Neon con **13 proyectos** (ninguno de los 3 borrados,
  ambos `publicent-meta` intactos, los 13 ajenos intactos). Producción sin tenants (esperado, se recreará).
- **Gotcha:** el cliente Prisma meta local estaba desactualizado (no conocía el enum `AGENCIA` ya migrado en la
  BD) → `prisma generate --schema prisma/meta/schema.prisma` para poder operar. Scripts QA temporales borrados.

### ✅ PASO #4 — Cierre de la prueba funcional (2026-07-01)
Se cumplió la orden original de la sesión ("crear/usar un skill de prueba funcional completa, visual, desde el
superadmin, validando aislamiento multi-tenant y arquetipos") + los 4 pasos "en el orden":
1. **#1 Arquetipos:** enum `MINISTERIO`/`AGENCIA` + contenido condicionado por `tipoEntidad` (defensoría,
   taglines) sin hardcodes de personería. Desplegado.
2. **#2 Otro arquetipo:** SAE (AGENCIA) aprovisionada por la UI automática con vertical FRISCO; aislamiento de
   3 tenants validado visualmente en producción.
3. **Extra:** validada la **asignación IA de PQRS** con la función real (línea de paramento → Ordenamiento Físico).
4. **#3 Limpieza:** borrado total controlado (arriba).
- **Entregables:** esta `BITACORA.md` + skill `.claude/skills/prueba-funcional/` + informe `docs/qa/`.
- **Backlog abierto:** B10 (ruteo IA de quejas de conducta → control disciplinario); rotar PAT de GitHub;
  auto-deploy Git↔Vercel; almacenamiento en nube para uploads del CMS (decisión pendiente R2/S3).

### 🏛️ NUEVA FASE — Alcaldía de Armenia desde cero (visual) + prueba de TODAS las funcionalidades
Plan acordado: crear un tenant **ejecutor** (Alcaldía) vía Superadmin **de forma visual**, con árbol organizacional
real (**3 secretarías × 3 dependencias c/u**), y recorrer **todas** las funcionalidades por tipo de entidad.

**Acceso Superadmin recreado (2026-07-01):** había 0 superadmins en meta → se sembró uno.
- `admin@ossgovernmentone.lat` / `OssSuper#2026-Admin!` (bcryptjs, en meta-DB prod). Login: `/superadmin-login`.

**✅ Alcaldía aprovisionada por la UI automática (2026-07-01, visual):**
- Entidad **Alcaldía Municipal de Armenia** (ALCALDIA), DIVIPOLA 63001-001, NIT 890.000.464-3, Armenia/Quindío.
- Dominio `alcaldia-armenia.ossgovernmentone.lat` · BD `neondb` · **proyecto Neon `wandering-waterfall-11701212`**.
- Admin `admin@armenia.gov.test` / **`_hB2yDpe2rsNA1*`** (mostrada 1 vez; cambiar al primer ingreso).
- **24 módulos** (Alcaldía ejecutora): transparencia, pqrsd, ventanilla_unica, gestion_documental, archivo_fisico,
  mipg, auditoria_avanzada, contabilidad_publica, presupuesto_formulacion/ejecucion/modificaciones/cierre, tesoreria,
  contratacion, nomina_publica, activos_bienes, almacen, rentas_locales, dwh_analitica, observatorio, alertas_ml,
  reportes_control, integraciones_estado, chat_ia_ciudadano. **Excluidos** (no aplican a Alcaldía): FRISCO×2,
  Registro soberano de beneficiarios, Bus de integración sectorial, Portal actores externos, Función disciplinaria.
- El aprovisionamiento por UI tardó ~28s con los módulos fiscales pesados (no excedió el límite).
- ✅ **Portal verificado (HTTP 200 + navegador):** sirve "Alcaldía Municipal de Armenia", contacto propio
  ((606) 741 7100 · contacto@armenia.gov.co), nav gov.co completa, tagline "Al servicio de la ciudadanía",
  **widget Chat IA ciudadano activo**. Aislamiento total (0 datos de otros tenants — de hecho ya no hay otros).
- ⚠️ **Hallazgo menor (B11):** el subtítulo del hero por defecto ("...garantizamos el acceso a la justicia") tiene
  sabor de personería; para Alcaldía conviene copy propio. Contenido editable desde el CMS.
- ⚠️ **Hallazgo (B12):** `https://ossgovernmentone.lat/` (apex) devolvió **404** tras borrar todos los tenants —
  revisar si el landing de plataforma depende de algún tenant o del apex sin match. (El superadmin sí funciona.)
- **Estado:** EN CURSO → siguiente: login admin del tenant, crear árbol 3×3, recorrer módulos.
