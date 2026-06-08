# Bitácora de sesión — 2026-06-08

> Consolidado de cambios y hallazgos de la sesión. Detalle técnico profundo de los
> módulos cerrados está en `personeriabuga/CLAUDE.md`. Este documento cubre el viraje
> de producto (plataforma vs. cliente), el aprovisionamiento automático, el dominio de
> plataforma y la auditoría de accesibilidad.

---

## 1. Resumen ejecutivo

En esta sesión se pasó de un app horneado para "Personería de Buga" a una **plataforma SaaS
real (Government One / OSS Innovation)** que crea clientes (tenants) limpios y automáticos:

- **SECOP II** reorientado de "publicar" (no existe API pública) a **lectura/conciliación** vía datos.gov.co.
- **Roles** alineados al enum del código (bug que tumbaba todo el admin en producción).
- **Plataforma separada del cliente**: seed parametrizado, **activación de módulos por contrato** (sin planes).
- **Aprovisionamiento automático de tenants** con Neon (crear BD + esquema + datos + módulos).
- **Panel de superadmin** ampliado (aprovisionar, auditoría, operadores) con alcance corregido.
- **Dominio de plataforma** `ossgovernmentone.lat` + **landing de Government One** con ingreso al SaaS.
- **"Personería de Buga" recreada limpia** como tenant demo en `buga.ossgovernmentone.lat`.
- **Auditoría de accesibilidad** del CMS (Res. 1519 / WCAG): contraste, alt text, medios.

---

## 2. Cambios realizados (por tema, con commit)

### 2.1 SECOP II — de publicación a lectura (`df5a15d`, `9cb7f95`)
- `src/lib/integraciones/secop.ts` reescrito: **Socrata Basic Auth** contra `datos.gov.co`
  (datasets `p6dx-8zbt` procesos, `jbjy-vk9h` contratos), filtra por NIT, normaliza NIT.
- Rutas: `GET /api/admin/contratacion/secop` (listar), `POST .../sincronizar-secop` (conciliar
  por `numero==referencia`), `secop-test` superadmin = verificación Socrata.
- UI contratación: badge "En SECOP", botón "Sincronizar", tab "Publicado en SECOP".
- Credenciales SECOP del tenant cargadas y verificadas (199 procesos de Buga).

### 2.2 Roles → identificadores del enum (`3aa7500`)
- `prisma/seed.ts`: los roles se siembran como **`SUPER_ADMIN | ADMIN | EDITOR | USER`**
  (antes "Super Administrador", etc.). La etiqueta legible va en `descripcion`.

### 2.3 Plataforma vs. cliente + modelo por contrato (`ce1d1d3`)
- `src/lib/seeders/tenant-seed.ts`: `seedTenant(prisma, params)` **parametrizado**, sin datos de Buga.
- `prisma/seed.ts`: wrapper que lee `TENANT_*` del entorno.
- **Activación por contrato**: se elimina el gating por `plan` en `PUT .../modulos` y en
  `tenant-modulos.tsx` (el `plan` queda como dato de referencia).

### 2.4 Aprovisionamiento automático con Neon (`0b1d2d9`, `744463b`)
- `src/lib/provisioning/`:
  - `neon.ts` → `createNeonProject()` (API Neon, resuelve `org_id`), `deleteNeonProject()`.
  - `schema-apply.ts` → `applyProvisionSchema()` ejecuta `prisma/provision-schema.sql` (139 tablas,
    88 enums); `waitForDatabaseReady()` espera DNS del endpoint nuevo.
  - `provision.ts` → `provisionTenant()`: Neon → esquema → seedTenant → seeds de módulos
    contratados → registro en meta-BD. Rollback + reintentos ante DNS.
- CLI: `npm run provision-tenant <config.json>` (+ `npm run db:provision-sql`).
- Requiere `NEON_API_KEY` en el entorno. **Validado E2E** contra Neon real.

### 2.5 Panel de superadmin (`a76e018`, `42e7104`, `ec31b45`)
- **Aprovisionar** desde el panel: `POST /api/superadmin/tenants/provision` +
  `/superadmin/tenants/aprovisionar` (formulario) + botón en la lista de tenants.
- **Auditoría** (`/superadmin/auditoria`): eventos de todos los tenants.
- **Superadmins** (`/superadmin/admins` + API): listar/crear operadores de plataforma.
- **Corrección de alcance** (`ec31b45`): se **quitó** la gestión de usuarios del tenant del
  superadmin. El superadmin solo crea el admin inicial (en el aprovisionamiento); la gestión
  de usuarios/roles/permisos es del **admin del tenant**.

### 2.6 Seed de contenido base del CMS (`3ad447a`, `b6047e0`)
- `seedPaginasBase()`: páginas institucionales editables (`mision-vision`, `funciones`,
  `historia`, `organigrama`) que el portal lee por slug.
- `seedContenidoBase()`: `IdentidadInstitucional` (singleton), sede principal, canales de
  atención y FAQ base — parametrizados. (Buga actual backfilleado.)

### 2.7 Dominio de plataforma + landing (`844fa3e`, `a5aa0cc`)
- Middleware detecta `PLATFORM_HOSTS` (`ossgovernmentone.lat`, `www...`) y sirve `/plataforma`
  (landing de Government One con botón "Ingresar al SaaS" → `/superadmin-login`), en vez de 404.
- `src/app/plataforma/page.tsx` + layout omite el shell de tenant para `x-layout=platform`.
- Metadata neutral (sin nombre de tenant) para plataforma/superadmin.
- Vercel: comodín `*.ossgovernmentone.lat` + apex agregados; DNS delegado a Vercel (Spaceship).

### 2.8 Recreación de "Personería de Buga" limpio
- Eliminado el registro meta del Buga viejo; provisionado limpio en `buga.ossgovernmentone.lat`
  (proyecto Neon nuevo). Módulos: `gestion_documental` + `funcion_disciplinaria` (vertical de
  control) + `sitio_web` (obligatorio). Sitio en vivo (HTTP 200, SSL).

### 2.9 Accesibilidad del CMS (`7371aa1`, `36227b6`)
- **Contraste en desplegables** (`globals.css`): opciones de `<select>` con fondo oscuro/texto
  claro y blanco al resaltar (WCAG 1.4.3 / Res. 1519).
- **Medios + alt obligatorio** (`media-library-modal.tsx`, `block-editor.tsx`): la biblioteca de
  medios deja de usar datos mock, **sube de verdad a `/api/upload`** y **exige texto alternativo**
  antes de insertar una imagen (con opción "decorativa"). El editor aplica `setImage({src, alt})`.

---

## 3. Hallazgos

1. **SECOP II no tiene API pública de escritura.** Publicar es transaccional dentro de la
   plataforma de CCE; sus datos se leen en `datos.gov.co` (Socrata, solo lectura). Las "API keys"
   generadas resultaron ser de Socrata, no OAuth de CCE. Publicar requiere convenio B2B con CCE.

2. **Convención de roles latente.** `session.user.role = Rol.nombre` (sin mapeo) se compara
   contra el enum `SUPER_ADMIN|ADMIN|EDITOR|USER`. El seed los creaba en español → en producción
   `requireRoles` lanzaba y **toda página admin devolvía 500**. Corregido en datos y en el seed.

3. **App horneado para Buga.** Seed, configuración e identidad estaban hardcodeados para la
   Personería de Buga. Se separó plataforma (OSS Innovation) de cliente (tenant).

4. **Modelo de negocio por contrato, no por plan.** La contratación pública es por licitación;
   no aplican tiers comerciales. Se quitó el gating por plan.

5. **No existía aprovisionamiento.** Crear un tenant era 100% manual (crear BD en Neon + push +
   seed). Se construyó el aprovisionamiento automático.

6. **Páginas/contenido del CMS no se sembraban.** Tenants nuevos nacían con el CMS vacío
   (páginas, identidad, sedes, canales, FAQ). El Buga viejo TAMBIÉN tenía 0 páginas (no se perdió
   nada). Resuelto con seeders base.

7. **Hosts de plataforma daban 404.** El middleware solo resolvía tenants; el apex/www no eran
   tenant → 404. Resuelto con landing de plataforma.

8. **Accesibilidad del CMS incompleta (crítico para Res. 1519 / WCAG):**
   - **Imágenes sin texto alternativo**: el editor insertaba `setImage({src})` sin `alt`.
   - **Biblioteca de medios mock**: datos falsos de Unsplash, botón "Subir" no funcional
     (aunque existe `/api/upload` real). Sin captura de metadatos.
   - **Contraste de desplegables** nativos (texto claro sobre fondo claro al abrir).
   - *Por auditar:* imagen destacada de noticias (URL pegada a mano, sin alt), jerarquía de
     encabezados, navegación por teclado/foco, etiquetas de formularios, metadatos de documentos.

9. **Infra/operación:**
   - La **integración Vercel↔GitHub** estaba caída (no desplegaba desde ~27 de mayo) — se
     reconectó. El build fallaba por `CRON_SECRET` con espacios — corregido vía Vercel CLI.
   - **DNS intermitente** en la red de desarrollo (`EAI_AGAIN` a github.com y a Neon) durante
     toda la sesión — mitigado con reintentos en scripts y push.

---

## 4. Estado de la plataforma

- **Plataforma:** `www.ossgovernmentone.lat` / `ossgovernmentone.lat` → landing Government One.
- **Superadmin:** `/superadmin-login` → panel (aprovisionar, módulos por contrato, integraciones,
  auditoría, operadores).
- **Tenant demo:** `buga.ossgovernmentone.lat` → Personería de Buga (limpio).
- **Aprovisionamiento:** automático (CLI hoy; botón en panel para tenants ligeros; los fiscales
  pesados conviene por CLI o Vercel Pro por el límite de 60s en Hobby).

---

## 5. Pendientes

### Accesibilidad — hecho en esta sesión (commits posteriores a la bitácora inicial)
- ✅ Contraste de desplegables (`7371aa1`).
- ✅ Imágenes del editor con `alt` obligatorio + upload real (`36227b6`).
- ✅ Imagen destacada de noticias: upload real + `alt` (los renders públicos ya usan `alt={titulo}`).
- ✅ Foco visible para navegación por teclado (`:focus-visible`, WCAG 2.4.7).

### ⚠️ Hallazgo crítico: subida de archivos del CMS no persistía en Vercel
- `/api/upload` usaba `subirArchivo` → **filesystem local**, que en Vercel (serverless
  efímero/solo-lectura) **no persiste**: los archivos subidos se perdían en producción.
- Existía `src/lib/storage.ts` (`uploadFile`) con almacenamiento en nube real (S3/R2/GCS/Azure),
  usado por gestión documental, pero el upload del CMS **no lo usaba**.
- **Corregido:** `/api/upload` ahora usa `uploadFile()` con la `StorageConfig` del tenant
  (igual que GD). **Pero requiere que cada tenant tenga almacenamiento en nube configurado**
  (Superadmin → entidad → "Almacenamiento de Documentos" → R2/S3). Sin eso, el upload responde
  422 con instrucción. **Buga demo aún no tiene storage configurado** → falta ese paso para que
  el CMS suba imágenes en producción.

### Accesibilidad / CMS — pendiente
- **Configurar almacenamiento en nube** (R2/S3) para el/los tenants demo (decisión de proveedor + credenciales).
- Jerarquía de encabezados (H1/H2), etiquetas en formularios (revisión componente a componente).
- Metadatos en documentos (gestión documental / `LISTA_DOCUMENTOS`).
- Biblioteca de medios **persistente** (hoy es por sesión; falta modelo + endpoint de listado).

### Producto / operación
- Branding real del landing de Government One (logo, textos, colores).
- Botón de aprovisionamiento en panel: manejar tenants con módulos fiscales pesados (cola/Pro).

### Seguridad (rotar credenciales expuestas en el chat de la sesión)
- `NEON_API_KEY`, contraseñas de admin generadas, secret de SECOP (Socrata), y el
  **GitHub PAT** embebido en `.git/config`.

---

*Documento generado el 2026-06-08. Commits de la sesión: `df5a15d` … `36227b6`.*
