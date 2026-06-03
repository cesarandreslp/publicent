# Auditoría de código — PublicEnt / PersoneríaBuga

**Fecha:** 2026-06-03
**Rama:** `feat/modulos-admin-financieros`
**Alcance:** código muerto/no usado · algoritmos duplicados · archivos legacy/temporales · calidad general.
**Tamaño del repo:** 515 archivos `.ts/.tsx`, ~94.700 líneas en `src/`.
**Nota:** este documento **solo informa**. No se ha modificado ningún archivo. Cada hallazgo indica *qué* hacer, *por qué* y el *riesgo*.

**Revisión 2 (2026-06-03):** tras aclaración del autor sobre la arquitectura del producto, se **reclasifica el hallazgo #1** (`src/services/vu/` no es basura conceptual sino la fuente original del proyecto VU independiente, hoy no cableada → archivar, no borrar), se contextualiza el #2 (Orfeo NG), se añade el hallazgo #11 (`test-editor`) y se incorpora un **inventario de módulos confirmados** al final (verticales SAE, contable/financiero, superadmin, CMS) para dejar claro qué es producto vivo y qué es residuo.

---

## Resumen ejecutivo

| # | Hallazgo | Acción | Líneas aprox. | Riesgo | Prioridad |
|---|----------|--------|--------------|--------|-----------|
| 1 | Fuente original del proyecto VU independiente, no cableada | `src/services/vu/` (23 archivos) → **archivar, NO borrar** sin confirmación | **4.651** | Bajo | 🟠 Media |
| 2 | Tipos/helper de gestión documental huérfanos (≠ módulo GD vivo) | eliminar `src/lib/gestor-documental/types.ts` | 172 | Bajo | 🟠 Media |
| 3 | Funciones muertas en `utils.ts` (incl. duplicados) | eliminar 6 funciones de `src/lib/utils.ts` | ~35 | Bajo | 🟠 Media |
| 4 | Volcado de errores TS obsoleto | eliminar `ts_errors.txt` (raíz, en git) | 142 | Nulo | 🔴 Alta |
| 5 | Script de diagnóstico de un solo uso | eliminar `diag-vercel.mjs` (raíz, en git) | 16 | Nulo | 🟠 Media |
| 6 | Script de prueba huérfano | eliminar `src/scripts/test-gd-e2e.ts` | ~80 | Nulo | 🟠 Media |
| 7 | Scripts de operación de un solo uso | mover a `archive/` o eliminar `scripts/{cleanup-tenant-db.js, separate-dbs.js, test-carga-pqrs.ts}` | ~400 | Medio | 🟡 Baja |
| 8 | Formateo de moneda COP duplicado en 10 pantallas | consolidar en `formatCOP`, no eliminar | — | Bajo | 🟡 Baja |
| 9 | Barrel de hooks sin uso e incompleto | eliminar `src/hooks/index.ts` | 2 | Nulo | 🟡 Baja |
| 10 | Exports `type`/interface sin consumir | quitar `export` caso a caso (no borrar) | — | Nulo | 🟡 Baja |
| 11 | Página playground del editor en rutas de admin | eliminar `src/app/(admin)/admin/test-editor/` | ~30 | Nulo | 🟠 Media |

**Impacto de limpieza segura inmediata (hallazgos 4, 5, 6, 9, 11): ~270 líneas + 2 archivos basura en la raíz.**
**Decisión del autor pendiente:** hallazgos 1 (archivar VU) y 7 (scripts de migración).

> Ninguno de estos hallazgos es un módulo vivo del producto. Ver el **inventario de módulos confirmados** al final: los duplicados reales son copias huérfanas, no la arquitectura modular descrita por el autor.

---

## 1. 🟠 `src/services/vu/` — fuente original del proyecto VU independiente, no cableada

> **Reclasificado en revisión 2.** No es "basura conceptual": según el autor, Ventanilla Única fue un **proyecto independiente** que se incorporó al producto como **módulo especializado de PQRS** (cuando una entidad lo contrata, reemplaza/enriquece el módulo PQRSD por defecto). Esa funcionalidad **sí está construida y viva**, pero en *otros* archivos (ver abajo). Este directorio es, con alta probabilidad, el **código fuente original** de ese proyecto, copiado al repo y nunca conectado porque la app Next reimplementó la lógica a su manera.

**Qué es:** capa de servicios orientada a clases (`CaseService`, `InboxService`, `MetricsService`, `AIAssignmentService`, `SLAService`, `NotificationService`, `SMSService`, etc.) — 23 archivos, **4.651 líneas**.

**El módulo Ventanilla Única VIVO (lo que sí se usa en producción) es:**
- Catálogo: `ventanilla_unica` en `src/lib/modules.ts` ("Ventanilla Única con IA"), que **depende de** `pqrsd` y admite `apiUrl` para delegar a sistema externo.
- UI/rutas: `src/app/(admin)/admin/ventanilla/**` y `src/app/api/admin/ventanilla/**`, sobre `@/lib/tenant`, `@/lib/groq-client` (`calcularSemaforo`), `@/lib/mail`.
- Modelos: bloque `Vu*` en `prisma/schema.prisma` (semáforo CPACA/Ley 1437, 6 tipos de respuesta, demografía FURAG) sobre el modelo base PQRS.
- Sidebar: gatea PQRSD (`/admin/pqrs`) vs Ventanilla (`/admin/ventanilla`) según el módulo activo del tenant. **Esto confirma el "reemplaza al PQRS por defecto" descrito por el autor.**

**Por qué este directorio está muerto en el repo actual:**
- **Cero referencias externas.** Ningún archivo fuera de `src/services/vu/` lo importa. Verificado:
  - `grep "services/vu"` en `src` y `e2e` excluyendo la propia carpeta → **0 resultados**.
  - Clases/instancias (`CaseService`, `InboxService`, `MetricsService`, `aiAssignmentService`, `caseService`, `StateMachineService`) en `src/app`, `src/components`, `e2e` → **0 referencias**.
  - Detector de huérfanos: 15 de los 23 archivos no son importados por nadie; los 8 restantes solo se importan **entre ellos mismos** → isla cerrada sin punto de entrada.
- **La Ventanilla Única real NO usa esta capa.** Las rutas vivas (`src/app/api/admin/ventanilla/**`, `src/app/api/webhooks/ventanilla`) implementan la lógica directamente sobre `@/lib/tenant`, `@/lib/groq-client`, `@/lib/mail` y `@/lib/modules`. Es decir, hay **dos implementaciones del mismo dominio** y solo una está conectada.
- Concentra además casi todo el "ruido" de calidad del repo: **20 de los 28 `console.log`** del código y **los 2 únicos `TODO` reales** (`SMSService.ts`: "integrar con Twilio…").

**Acción recomendada:** **decisión del autor.** Como es el código original del proyecto VU, lo recomendable es **moverlo a `archive/`** (fuera del árbol compilado por `tsconfig`) en lugar de eliminarlo, para conservarlo como referencia de la implementación original sin que ensucie el build ni el análisis de código. Borrarlo solo si ya existe esa fuente en su repositorio original.

**Riesgo:** bajo (no está cableado, mover o borrar no afecta producción). Verificar con `tsc --noEmit` que no quede ninguna importación colgante.

---

## 2. 🟠 `src/lib/gestor-documental/types.ts` — archivo huérfano + algoritmo duplicado (≠ módulo GD vivo)

> **Importante (revisión 2):** este hallazgo **no toca el módulo de Gestión Documental vivo**. El módulo GD real — basado en **Orfeo NG / AGN** (el `schema.prisma` lo dice literal: *"Basado en estándar Orfeo NG / AGN"*, radicados padre/hijo `RadiRadicadosAsociados Orfeo`, usuarios informados `RadiInformados Orfeo`) — vive en `/admin/gd` + ~20 modelos `Gd*` en Prisma, e **integra transversalmente** otros procesos (los `GdExpediente` enlazan a series/subseries TRD, radicados, y a `FriscoBien[]` del vertical SAE). Eso confirma la intención del autor de un GD para *todos* los procesos documentales, no solo PQRS/ventanilla. La ruta `/admin/gestor-documental` es solo un `redirect` a `/admin/gd` por compatibilidad (correcto, conservar). Lo que aquí se marca es **otro** archivo, aislado, que duplica un cálculo.

**Qué es:** 172 líneas de tipos (`SerieDocumental`, `TipoRadicado`, `EstadoRadicado`, `FlujoBandeja`, …) y la función `calcularFechaVencimiento(tipo, fechaRadicacion)`. Su cabecera dice "alineado con la lógica de Orfeo NG", pero quedó como borrador suelto.

**Por qué es residuo:**
- **Nadie lo importa.** La única coincidencia de `gestor-documental` en otro archivo (`module-registry.ts:39`) es el **string literal** `'/gestor-documental'` (una ruta), no un `import`. Es el único archivo del directorio `src/lib/gestor-documental/` y no aporta nada al módulo GD real (que define sus tipos vía Prisma).
- **Algoritmo duplicado.** `calcularFechaVencimiento` calcula vencimientos en **días calendario** de forma síncrona, mientras que la implementación viva y usada por las rutas (`pqrsd`, `radicados`, `pqrs`) es `calcularFechaVencimientoHabil` en `src/lib/dias-habiles.ts`, que usa **días hábiles** con festivos colombianos. Coexisten dos formas de calcular lo mismo y solo la de `dias-habiles.ts` es correcta para PQRSD.

**Acción recomendada:** eliminar `src/lib/gestor-documental/types.ts` (y el directorio, que quedaría vacío). `src/lib/dias-habiles.ts` es la fuente de verdad para vencimientos; los tipos del dominio GD ya los provee Prisma.

**Riesgo:** bajo. Confirmar con `tsc` que ningún tipo de aquí se usa por re-export indirecto (la búsqueda indica que no).

---

## 3. 🟠 `src/lib/utils.ts` — funciones muertas y duplicadas

`utils.ts` exporta varias funciones sin uso fuera de su propio archivo de test. Verificado con conteo de referencias externas (excluyendo `__tests__`):

| Función | Usos externos | Observación |
|---------|--------------|-------------|
| `calcularDiasHabiles` | **0** | **Duplicado**: versión simplificada de lo que hace `dias-habiles.ts` (la real, con festivos). Solo la usa su propio test. |
| `generateRadicado` | **0** | **Duplicado**: la generación real de radicados/consecutivos vive en `gd-consecutivo.ts` y la usan las rutas `gd/consecutivo`, `gd/firmas`, `gd/radicados`, `pqrsd`. |
| `getFileExtension` | **0** | Extrae extensión desde nombre de archivo. La que se usa es `obtenerExtension(mimeType)` en `upload.ts` (otra entrada, otro propósito). Esta queda muerta. |
| `formatDateTime` | **0** | Sin consumidores. |
| `slugify` | **0** | Sin consumidores. |
| `truncateText` | **0** | Sin consumidores. |

> Conservar: `cn` (12 usos), `formatDate` (2 usos) y demás helpers vivos del archivo.

**Acción recomendada:** eliminar esas 6 funciones de `utils.ts` y sus asserts correspondientes en `src/__tests__/lib/utils.test.ts`. **Resolver el duplicado** dejando `dias-habiles.ts` (vencimientos) y `gd-consecutivo.ts` (radicados) como únicas implementaciones.

**Riesgo:** bajo. El único acoplamiento es con el test, que se actualiza en el mismo cambio.

---

## 4. 🔴 `ts_errors.txt` — volcado de errores TypeScript obsoleto (en git)

**Qué es:** archivo de **48 KB / 142 líneas** en la raíz, codificado en UTF-16, con un listado de errores `TS2323`, `TS2393`, `TS2304`… de `src/app/(admin)/admin/page.tsx`.

**Por qué es basura:**
- Es un volcado puntual de `tsc` de una sesión antigua (fechado el 9 de marzo). El `CLAUDE.md` indica que **`tsc --noEmit` está limpio** desde hace muchas fases, así que el contenido ya no aplica.
- **Está rastreado por git** (`git ls-files` lo lista), ensuciando el repo y el historial.

**Acción recomendada:** eliminar `ts_errors.txt` y añadir `ts_errors.txt` (o `*.txt` de raíz) a `.gitignore` para que no se vuelva a commitear.

**Riesgo:** nulo.

---

## 5. 🟠 `diag-vercel.mjs` — script de diagnóstico de un solo uso (en git)

**Qué es:** 16 líneas que lanzan **Puppeteer** contra `https://personeriabuga.vercel.app` para volcar errores de consola y fechas renderizadas.

**Por qué es basura:**
- Es una herramienta de depuración ad-hoc, no parte del producto ni de los scripts de `package.json`.
- Depende de `puppeteer`, que **no está en las dependencias** del proyecto → ni siquiera ejecutaría sin instalación manual.
- Está rastreado por git.

**Acción recomendada:** eliminar `diag-vercel.mjs`.

**Riesgo:** nulo (no referenciado por nada).

---

## 6. 🟠 `src/scripts/test-gd-e2e.ts` — script de prueba huérfano

**Qué es:** único archivo de `src/scripts/`, ~80 líneas, con 7 `console.log`.

**Por qué es basura:** **0 referencias externas**; no está enganchado a `package.json` ni a la suite de Playwright (`e2e/`) ni a Vitest. Es un script de prueba manual abandonado.

**Acción recomendada:** eliminar `src/scripts/test-gd-e2e.ts` (y el directorio, que quedaría vacío). Si la prueba E2E de gestión documental sigue siendo valiosa, portarla a `e2e/` (Playwright) o `src/__tests__/` (Vitest).

**Riesgo:** nulo.

---

## 7. 🟡 `scripts/` — scripts de operación de un solo uso

Estos scripts de la carpeta `scripts/` **no se referencian** desde `src`, `package.json` ni `CLAUDE.md`:

- `cleanup-tenant-db.js` (Apr 10) — limpieza puntual de BD de tenant.
- `separate-dbs.js` (Apr 10) — migración única "BD compartida → BD por tenant".
- `test-carga-pqrs.ts` (Apr 10) — script de carga/prueba de PQRS.

**Por qué dudoso (no "basura clara"):** son utilidades de operación/migración que pudieron ser de un solo uso y ya cumplieron su función. No afectan el build.

**Conservar con certeza** (sí referenciados / vigentes): `parse-ccpet-xlsx.py` y `parse-cgc-pdf.py` (pipeline de catálogos, citados en `CLAUDE.md`), `seed-puc.ts`, `seed-onboarding.ts`, `import-redirects.mjs` (alimenta `redirects.ts`).

**Acción recomendada:** confirmar con el equipo que las migraciones (`separate-dbs.js`, `cleanup-tenant-db.js`) ya se ejecutaron en todos los entornos; si es así, mover a `archive/` o eliminar. `test-carga-pqrs.ts` puede eliminarse o moverse a `e2e/`.

**Riesgo:** medio — son scripts de BD; eliminarlos pierde la posibilidad de re-ejecutar la migración. Por eso es decisión del equipo, no borrado automático.

---

## 8. 🟡 Formateo de moneda COP duplicado (10 implementaciones)

`Intl.NumberFormat` para pesos colombianos se reimplementa inline en **10 pantallas de admin**:

```
admin/activos, admin/contabilidad, admin/contratacion, admin/frisco/bienes/[id],
admin/frisco, admin/nomina, admin/presupuesto, admin/rentas,
admin/reportes-control, admin/tesoreria  (todas en su client-page.tsx)
```

**Por qué importa:** es el mismo algoritmo de formateo copiado 10 veces (riesgo de inconsistencia: decimales, símbolo, locale). No es "código muerto" pero sí **duplicación**.

**Acción recomendada (no eliminar, consolidar):** crear un único helper `formatCOP(valor)` en `src/lib/utils.ts` y reemplazar las 10 definiciones inline. Reduce duplicación y centraliza el formato moneda del producto financiero.

**Riesgo:** bajo (refactor mecánico, verificable con `tsc`).

---

## 9. 🟡 `src/hooks/index.ts` — barrel sin uso e incompleto

**Qué es:** barrel que re-exporta `useAccessibility` y `useTextToSpeech`.

**Por qué es basura:**
- **Nadie importa `@/hooks`** (el barrel). Los componentes importan los hooks directamente (`@/hooks/useAccessibility`, etc.).
- Además está **incompleto**: no re-exporta `use-tenant-modulos` ni `useGdNotificacion