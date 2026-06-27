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
- **Plan:** usar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + configurar llaves reales (site+secret) en Vercel.
- **CAMBIO aplicado:** `page.tsx:595` ahora usa `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` (el dummy solo
  como fallback en desarrollo). ⚠️ Antes de desplegar: setear `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y
  `TURNSTILE_SECRET_KEY` reales en Vercel, o el captcha quedará vacío en prod.
- **Estado:** CÓDIGO HECHO · PENDIENTE configurar llaves en Vercel (tú).

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

### PLAN — Próximos pasos
1. Desplegar fix del superadmin a producción (merge `fix/superadmin-login-middleware` → `main`).
2. Configurar Turnstile real en Vercel (B02).
3. Mitigar 503 de RSC (B03).
4. Rotar el PAT de GitHub expuesto.
5. Cargar contenido faltante (directorio de funcionarios) y depurar rol legacy.
