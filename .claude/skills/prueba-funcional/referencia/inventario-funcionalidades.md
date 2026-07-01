# Inventario de funcionalidades — mapa de prueba

> Verificar siempre contra la realidad: el sidebar de `/admin` y el menú del portal mandan
> (los módulos activos varían por tenant). Rutas confirmadas en `src/app/**/page.tsx` a 2026-06.
> API correspondiente en `src/app/api/...`; validación Zod en `src/lib/validations.ts`.

## Credenciales y URLs base
- App local: `npm run dev` en `C:\projects\publicent2\personeriabuga` → http://localhost:3000
- Admin/Editor: `/login` → `admin@personeriabuga.gov.co` / `Test1234!` (override `E2E_ADMIN_EMAIL/PASSWORD`)
- Funcionario PQRS: `/login` → `funcionario@personeriabuga.gov.co` / `Test1234!` (override `E2E_FUNCIONARIO_*`)
- Superadmin: `/superadmin-login` → `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (en `.env`)
- Ciudadano: sin login
- Convención de roles: `Rol.nombre ∈ {SUPER_ADMIN, ADMIN, EDITOR, USER}` (ver CLAUDE.md). Cambiar rol exige logout+login.

## Actor 1 — Ciudadano / público (sin login) · PRIORIDAD 1 (camino crítico)
| Funcionalidad | Ruta | Notas de flujo |
|---|---|---|
| Home / portal | `/` | slider, noticias destacadas, accesos, widget Chat IA si activo |
| Entidad (historia, misión/visión, funciones, organigrama, directorio) | `/entidad/*` | contenido CMS |
| Transparencia | `/transparencia`, `/transparencia/[categoria]`, `/mipg`, `/calendario`, `/entes-vigilancia` | taxonomía Res.1519 |
| Servicios | `/servicios`, `/servicios/[id]` | |
| Noticias | `/noticias`, `/noticias/[slug]` | |
| Atención al ciudadano | `/atencion-ciudadano`, `/canales-atencion`, `/defensoria`, `/preguntas-frecuentes` | |
| **PQRSD radicar** | `/atencion-ciudadano/pqrsd` | Turnstile + Zod; genera radicado `PGB-AAAA-#####` → notificación email/WhatsApp |
| **PQRSD consulta** | `/atencion-ciudadano/pqrsd/consulta` | consulta por número de radicado |
| Verificar documento | `/verificar`, `/verificar/page` | validación de autenticidad |
| Participa | `/participa` | |
| Buscar | `/buscar` | full-text |
| Mapa del sitio | `/mapa-sitio` | |
| Chat IA ciudadano | widget flotante | si módulo `chat_ia_ciudadano` activo |
| Legales | `/privacidad`, `/terminos`, `/tratamiento-datos`, `/accesibilidad`, `/politicas/derechos-autor` | |

## Actor 2 — Admin / Editor (`/admin`) · CMS núcleo · PRIORIDAD 2
**Contenido:** Identidad institucional `/admin/contenido/identidad` · Sedes `/sedes` · Canales `/canales` · FAQs `/faqs` · Funcionarios `/funcionarios` · Noticias `/admin/noticias` (+`/nueva`, `/[id]/editar`) · Páginas y secciones `/admin/paginas` (+`/nueva`, `/[id]`, `/[id]/secciones/nueva`) · Slider `/admin/slider` · Documentos `/admin/documentos`.
**Gestión:** PQRSD `/admin/pqrs` · Gestor Documental `/admin/gd` (+expedientes, trd, archivo, bi, reportes) · Transparencia `/admin/transparencia` · Menú `/admin/menu` · MIPG `/admin/mipg` (+evidencias, evaluacion) · Observatorio `/admin/observatorio` · Auditoría `/admin/auditoria`.
**Sistema:** Usuarios `/admin/usuarios` · Estadísticas `/admin/estadisticas` · Configuración `/admin/configuracion` · Apariencia `/admin/ajustes/apariencia`.

Flujos clave a probar a fondo (CRUD + persistencia + visibilidad en el portal):
- Crear noticia (editor TipTap) → publicar → verla en `/noticias` y re-indexada para Chat IA.
- Crear página con secciones → verla en el portal.
- Subir documento → aparece en transparencia/documentos públicos.
- Crear usuario con rol → login con ese usuario respeta permisos.

## Actor 3 — Funcionario PQRS · PRIORIDAD 3
- Bandeja de PQRSD `/admin/pqrs`: ver radicados, filtrar por estado (`RECIBIDA/EN_TRAMITE/EN_REVISION/RESPONDIDA`).
- Responder un PQRSD → estado pasa a `RESPONDIDA` → email + WhatsApp al ciudadano → visible en consulta pública.
- Ventanilla Única `/admin/ventanilla` (+responder).

## Actor 4 — Módulos verticales activables (`/admin`) · PRIORIDAD 4
Probar solo los **activos** en el tenant (si no, marcar ⛔ o activar vía Superadmin). Catálogo en `src/lib/modules.ts`.
| Módulo | Ruta | Flujo demostrable |
|---|---|---|
| Ventanilla Única | `/admin/ventanilla` | radicar → asignar → responder |
| FRISCO — Bienes | `/admin/frisco`, `/frisco/bienes/[id]` | inventario de bienes (SAE) |
| Contabilidad | `/admin/contabilidad`, `/terceros` | comprobantes, terceros, libros |
| Presupuesto | `/admin/presupuesto` | CDP → RP → obligación → pago (CCPET) |
| Nómina | `/admin/nomina` | empleados → liquidar periodo → pagar → comprobante → PILA/certificado |
| Reportes de control | `/admin/reportes-control` | CHIP / FUT / Ley 617 → XLSX |
| Tesorería | `/admin/tesoreria` | |
| Contratación | `/admin/contratacion` | (SECOP solo lectura/conciliación) |
| Activos y bienes | `/admin/activos` | |
| Rentas locales | `/admin/rentas` | |
| Almacén | `/admin/almacen` | |
| Chat IA ciudadano | `/admin/chat-ia` | re-indexar, KPIs, conversaciones, export CSV |
| Función disciplinaria | `/admin/disc` (+procesos, tutelas, visitas) | proceso → avanzar etapa (máquina de estados) → semáforo de términos |
| Gestor/Gestión documental | `/admin/gd`, `/admin/gestor-documental` | expediente → radicar → respuesta |

## Actor 5 — Superadmin (`/superadmin`) · PRIORIDAD 5
- Dashboard `/superadmin`, informes `/superadmin/informes`.
- Ciclo de vida de tenant: crear `/superadmin/tenants/nuevo` → activar módulos contratados → crear admin inicial.
- Aprovisionamiento automático (Neon) — puede no estar cableado a la UI todavía (ver CLAUDE.md). Marcar 🚧 si el botón no existe.
- Activar un módulo desde la UI y verificar la auto-siembra (p.ej. activar `nomina_publica` siembra 24 conceptos).

## Cosas transversales a verificar en cada pantalla
- Errores 4xx/5xx en `network` y excepciones en `console` (un 500 silencioso es bug crítico).
- Estados de carga / vacío / error.
- Accesibilidad básica: foco visible, labels en inputs, contraste, navegación por teclado, `aria` en diálogos.
- Responsive (el proyecto soporta móvil — ver `e2e/09-mobile.spec.ts`).
- Permisos por rol: que EDITOR/USER no acceda a lo de ADMIN/SUPER_ADMIN (403/redirect, no 500).

## Tests E2E existentes (referencia, NO sustituyen el recorrido manual)
`e2e/01-portal-ciudadano` · `02-auth` · `03-funcionario-bandeja` · `04-funcionario-responder` · `05-chat` · `06-admin-mipg` · `07-redirects` · `08-portal-publico` · `09-mobile` · `10-flujo-completo`. Útiles para conocer selectores y flujos esperados.
