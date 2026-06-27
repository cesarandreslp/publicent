# BITÁCORA OPERATIVA — PublicEnt / OSS Government One

> **Regla:** este archivo se actualiza **cada vez que se hace un cambio** (código, datos, config,
> infraestructura) **o se establece un plan de acción**. Cada entrada deja rastro de qué, por qué,
> dónde y en qué estado quedó. Flujo estándar tras cada cambio: **actualizar bitácora → commit → push**.
>
> Distinta de `CLAUDE.md` (plan/diseño del producto). Aquí va el registro cronológico de operación y QA.
>
> Formato por entrada: fecha · tipo (`CAMBIO` | `PLAN` | `HALLAZGO` | `DECISIÓN`) · descripción ·
> archivos/rutas · estado (`PENDIENTE` | `EN CURSO` | `HECHO` | `DESPLEGADO`).

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
- **Rama/commit:** `fix/superadmin-login-middleware` · `6f653ce`.
- **Estado:** HECHO en repo · **PENDIENTE de desplegar a Vercel** (merge a `main`).

### HALLAZGO — 🟠 Captcha PQRSD desactivado en producción
- **Qué:** sitekey de Cloudflare Turnstile dummy `1x00000000000000000000AA` hardcodeada → captcha anti-bot
  inservible en prod (riesgo de radicación masiva por bots).
- **Dónde:** `src/app/atencion-ciudadano/pqrsd/page.tsx:595`.
- **Plan:** usar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + configurar llaves reales (site+secret) en Vercel.
- **Estado:** PENDIENTE.

### HALLAZGO — 🟠 Ráfagas de 503 en prefetch RSC
- **Qué:** prefetch RSC (`?_rsc=`) devuelve 503 en ráfaga; navegaciones completas 200. Probable
  agotamiento de conexiones Neon / concurrencia serverless.
- **Plan:** revisar pooling Prisma/Neon, cache/revalidate de páginas, `prefetch={false}` en links no críticos.
- **Estado:** PENDIENTE.

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

### PLAN — Próximos pasos
1. Desplegar fix del superadmin a producción (merge `fix/superadmin-login-middleware` → `main`).
2. Configurar Turnstile real en Vercel (B02).
3. Mitigar 503 de RSC (B03).
4. Rotar el PAT de GitHub expuesto.
5. Cargar contenido faltante (directorio de funcionarios) y depurar rol legacy.
