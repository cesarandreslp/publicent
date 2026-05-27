# CLAUDE.md — Plan de trabajo del producto público unificado

> **Bitácora viva del proyecto.** Este archivo es la fuente de verdad entre sesiones.
> Actualizar **permanentemente** y sin que el usuario lo pida en cada uno de estos eventos:
> - Cierre de fase o módulo (mover de "próximo punto" a sección de fase cerrada con detalle).
> - Aplicación de mejora retroactiva (tachar `~~...~~` en el backlog en lugar de borrar).
> - Hallazgo no trivial (decisión de arquitectura, incompatibilidad de tipos, gotcha).
> - Cambio del "🎯 Próximo punto" al completarse el actual.
> - Refinamiento del plan original ante información nueva (con nota explícita, sin reescribir silenciosamente).
>
> Stack: Next.js 16 + Prisma + PostgreSQL (Neon), multi-tenant con BD separada por tenant.

---

## Visión del producto

**Un solo producto comercializable** para el sector público colombiano:
Portal institucional Gov.co (base Personería Buga) + catálogo de módulos activables por tenant.
Clientes objetivo: Personería de Buga, SAE, MinIgualdad, y futuras entidades (alcaldías, personerías, ministerios sectoriales).

**Decisión arquitectónica:** sin embeber Odoo. Todo sobre el stack Next.js existente.

---

## Arquitectura modular

- **Núcleo común** (todo tenant): `sitio_web`, `transparencia`, `pqrsd`, `ventanilla_unica`, `gestion_documental`, `archivo_fisico`, auth/MIPG/SIGEP.
- **Verticales activables**: FRISCO (SAE), SGBE/ESB sectorial (MinIgualdad), presupuesto público (4 sub-módulos), contabilidad, tesorería, nómina, contratación, etc.
- **Bundles comerciales**: Control / Ejecutora / Rectoría Sectorial.
- **Catálogo canónico**: 29 módulos en [`src/lib/modules.ts`](src/lib/modules.ts) con `categoria`, `tier`, `dependeDe`, `entidadesObjetivo`.

---

## Plan de trabajo original (del transcript de la sesión inicial)

El plan se construyó en 4 acuerdos explícitos:

**1. Catálogo canónico de 29 módulos** (A3 + respuestas U5).
   El usuario aprobó las 26 entradas iniciales y pidió **partir `presupuesto_publico` en 4** (formulación / ejecución / modificaciones / cierre) → quedan 29. También aprobó mantener `pqrsd` y `ventanilla_unica` separados, y los verticales (`frisco_*`, `sgbe_*`, `esb_*`) como activables.

**2. Tres archivos a tocar en Fase 0** (A3):
   - `src/lib/modules.ts` → expandir catálogo.
   - `src/components/admin/superadmin/tenant-modulos.tsx` → agrupar por categoría + dependencias.
   - Nuevo `src/lib/module-bundles.ts` → 3 bundles comerciales.

**3. Limpieza de 3 hardcodes de Personería** (A4): `groq-client.ts` ×2 + `pqrsd/route.ts` ×1.

**4. Orden de construcción de verticales** (A15, decisión explícita):
   - `frisco_bienes` **primero** — vertical aislado, demostrable para SAE en pocas iteraciones.
   - `contabilidad_publica` **después** — fundacional, habilita los 4 de presupuesto + tesorería + nómina + contratación. Es "proyecto en sí mismo" y merece su propio bloque.

**MVP de venta a SAE definido en A0:** portal + plan CGN + bienes FRISCO + presupuesto mínimo + reporte CHIP básico.

---

## Plan de trabajo — Estado

### ✅ Fase 0 — Refactor de fundamentos (cerrada)

- [x] Catálogo de 29 módulos en `src/lib/modules.ts` con helper `areDepsActive()`.
- [x] Bundles comerciales en `src/lib/module-bundles.ts` (Control, Ejecutora, Rectoría Sectorial).
- [x] Limpieza de 3 hardcodes de Personería:
  1. `TERMINOS_LEGALES_DEFAULT` exportable y overrideable vía `ContextoEntidad.terminosLegales` ([`src/lib/groq-client.ts`](src/lib/groq-client.ts)).
  2. Prompt IA acepta `pais`, `marcoLegal`, `definicionesTipos` opcionales (mismo archivo).
  3. Dependencia receptora en PQRSD lee `pqrsd.dependenciaReceptoraCodigo` con fallback ([`src/app/api/pqrsd/route.ts`](src/app/api/pqrsd/route.ts)).
- [x] UI superadmin agrupada por categoría con badges de tier y dependencias ([`src/components/admin/superadmin/tenant-modulos.tsx`](src/components/admin/superadmin/tenant-modulos.tsx)).
- [x] `tsc --noEmit` limpio (solo legacy `ventanilla_unica_personeria_buga/` excluido).

### ✅ Fase 6 — Núcleo `presupuesto_ejecucion` (cerrada)

Cadena clásica del gasto público colombiano: **CDP → RP → Obligación → Pago**, con validación de saldos disponibles en cada paso y generación automática del comprobante contable al confirmar el pago.

**Datos** (nuevo bloque al final de `prisma/schema.prisma`)
- [x] `PsuRubro` — jerárquico (parent/hijos), tipo GASTO/INGRESO, niveles 1..6, `permiteMovimientos` (sólo hojas).
- [x] `PsuApropiacion` — única por (rubro, vigencia). Campos: `apropiacionInicial`, `adiciones`, `reducciones`. Saldo apropiación se calcula como `inicial + adiciones - reducciones - Σ(CDP vigentes)`.
- [x] `PsuCdp`, `PsuRp`, `PsuObligacion`, `PsuPago` — cada uno con `numero @unique`, `valor`, `estado` enum `PsuEstadoDoc {VIGENTE, ANULADO, AGOTADO}`, trazabilidad (`creadoPor/anuladoEn/anuladoPor/motivoAnulacion`).
- [x] `PsuPago` enlaza opcionalmente a `CpComprobante` vía `comprobanteId` y al PUC vía `cuentaBancoId`. Enum `PsuMedioPago {TRANSFERENCIA, CHEQUE, EFECTIVO, OTRO}`.
- [x] Relación inversa nueva en `CpAuxiliarTercero.rps PsuRp[]` (named "PsuRpTercero").

**Núcleo**
- [x] [`src/lib/presupuesto-saldos.ts`](src/lib/presupuesto-saldos.ts) — 4 helpers `saldoApropiacion`, `saldoCdp`, `saldoRp`, `saldoObligacion`. Cada uno suma documentos hijos no-anulados y retorna `{ total, comprometido/obligado/pagado, disponible }`.
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) — añadido `requirePresupuesto(roles)`.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) — 6 schemas zod nuevos (`psuRubroCreate`, `psuApropiacionCreate`, `psuCdpCreate`, `psuRpCreate`, `psuObligacionCreate`, `psuPagoCreate`).

**Endpoints admin**
- [x] `POST/GET /api/admin/psu/rubros`
- [x] `POST/GET /api/admin/psu/apropiaciones` (upsert por `[rubroId, vigencia]`)
- [x] `POST/GET /api/admin/psu/cdp` — valida `valor ≤ saldo apropiación`.
- [x] `POST/GET /api/admin/psu/rp` — valida `valor ≤ saldo CDP` y CDP no anulado.
- [x] `POST/GET /api/admin/psu/obligaciones` — valida `valor ≤ saldo RP`.
- [x] `POST/GET /api/admin/psu/pagos` — valida `valor ≤ saldo obligación` y, si `contabilidad_publica` está activo + `cuentaBancoId` provista, **genera `CpComprobante` tipo EGRESO en la misma `$transaction`**:
  - Cabecera con `fuenteModulo='presupuesto'`, `fuenteRef=<pagoId>` (post-update para cerrar el círculo).
  - 2 asientos: D cuenta de gasto (default: primera `5111*` activa si no se pasa `cuentaGastoId`) / C cuenta de banco.
  - Usa el periodo contable ABIERTO actual del tenant; falla si no hay ninguno.
- [x] `GET /api/admin/psu/ejecucion?vigencia=YYYY` — vista consolidada con apropiado, comprometido (Σ CDP), obligado (Σ Obligaciones), pagado (Σ Pagos), disponible y % ejecución. Incluye totales.

**UI**
- [x] [`/admin/presupuesto`](src/app/admin/presupuesto/page.tsx) — server component, carga vigencia desde query string (default año actual), tabla por rubro, recientes (CDP/RP), terceros y cuentas bancarias del PUC (filtra `111*`).
- [x] [`client-page.tsx`](src/app/admin/presupuesto/client-page.tsx) — KPIs apropiado/comprometido/obligado/pagado, tabla detallada por rubro con % ejecución, 6 modales independientes (Rubro, Apropiación, CDP, RP, Obligación, Pago) — el de Pago marca opción "Generar comprobante contable automáticamente".
- [x] Entrada "Presupuesto" en sidebar gateada por `MODULO_IDS.PRESUPUESTO_EJECUCION`.

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El campo `fuenteRef` del `CpComprobante` se actualiza **post-create** dentro de la misma transacción porque necesita el `pago.id` que sólo existe después de crear el pago. Sin esto, el comprobante quedaba apuntando a `'<pendiente>'`. Patrón a replicar en otros módulos que generen comprobantes.
- El selector de obligación en el modal de Pago todavía pide pegar el `cuid` (no hay tabla de obligaciones recientes en este snapshot). Mejora obvia para iteración 2: traer las últimas obligaciones VIGENTES y mostrarlas como `<select>`. Aceptable para MVP porque el flujo intencional es Obligación → Pago en la misma sesión.
- Cuando se quiera **anular** un documento de la cadena, los hijos vigentes deben anularse primero (no implementado aún — pendiente para iteración 2: validar `_count` de hijos vigentes antes de pasar a ANULADO).
- ⚠ Migración pendiente: `npx prisma db push` para crear las 6 tablas `psu_*` y la nueva columna de relación en `cp_terceros`.

---

### ✅ Fase 5 — Núcleo `contabilidad_publica` (cerrada)

Siguiente palanca grande del MVP SAE. Motor de doble partida con PUC CGN, primer corte fino.

**Datos**
- [x] Modelos Prisma ya existían en `schema.prisma`: `CpPlanCuenta` (jerárquico, niveles 1..5, `naturaleza` DEBITO/CREDITO, `tipo` BALANCE/RESULTADO/ORDEN, `permiteMovimientos`), `CpPeriodoContable` (estados ABIERTO/CERRADO/AJUSTE), `CpAuxiliarTercero` (NIT/CC con `tipoDocumento`), `CpComprobante` (totalDebito/totalCredito, fuenteModulo+fuenteRef para trazabilidad cruzada), `CpAsiento` (cuenta + tercero opcional + débito/crédito con `@db.Decimal(18,2)`).
- [x] Enums: `CpNaturaleza`, `CpTipoCuenta`, `CpTipoComprobante` (CONTABLE/EGRESO/INGRESO/AJUSTE/APERTURA/CIERRE), `CpEstadoComprobante`, `CpEstadoPeriodo`, `CpTipoDocumento`.

**Seed PUC CGN**
- [x] [`prisma/seeds/puc-cgn.json`](prisma/seeds/puc-cgn.json) — semilla mínima viable (≈45 cuentas) cubriendo clases 1..5 + 8/9, niveles raíz/grupo/cuenta/auxiliar. Marca `permiteMovimientos=true` sólo en hojas.
- [x] [`scripts/seed-puc.ts`](scripts/seed-puc.ts) — loader idempotente con upsert por `codigo`; resuelve `parentId` por pasadas hasta cerrar el grafo. Uso: `npx tsx scripts/seed-puc.ts` (toma `DATABASE_URL` del .env del tenant). Falla explícitamente si quedan cuentas con parent inexistente.

**Núcleo**
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) — añadido `requireContabilidad(roles)` reutilizando `requireModule` interno. Gatea por `MODULO_IDS.CONTABILIDAD_PUBLICA`.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) — schemas zod: `cpCuentaCreate/Update`, `cpPeriodoCreate/Update`, `cpTerceroCreate/Update`, `cpAsientoSchema` (refine: exactamente uno de débito/crédito > 0), `cpComprobanteCreateSchema` (refine: ∑débitos ≈ ∑créditos con tolerancia 0.005, mínimo 2 asientos).

**Endpoints admin**
- [x] `/api/admin/cp/cuentas` GET (filtros q/tipo/soloMovimiento) + POST.
- [x] `/api/admin/cp/cuentas/[id]` PATCH + DELETE (inactiva si tiene movimientos, borra si no).
- [x] `/api/admin/cp/periodos` GET + POST.
- [x] `/api/admin/cp/periodos/[id]` PATCH (cambio de estado; AJUSTE sólo SUPER_ADMIN).
- [x] `/api/admin/cp/terceros` GET + POST.
- [x] `/api/admin/cp/comprobantes` GET + POST con validaciones en cascada:
   1. Periodo existe y está ABIERTO (o AJUSTE con SUPER_ADMIN).
   2. Todas las cuentas existen, están activas y `permiteMovimientos=true`.
   3. Partida doble (cuadre ∑D = ∑C).
   4. Crea comprobante + N asientos en una sola `$transaction`.
- [x] `/api/admin/cp/comprobantes/[id]` GET (detalle con cuenta+tercero) + DELETE (anula con motivo).
- [x] `/api/admin/cp/balance?periodoId=...` — agrega débitos/créditos/saldo por cuenta del periodo (sólo comprobantes REGISTRADOS), con totales para verificar cuadre global.

**UI**
- [x] [`/admin/contabilidad`](src/app/admin/contabilidad/page.tsx) — server component, carga periodo abierto + KPIs por clase + balance del periodo + últimos comprobantes + cuentas con movimiento.
- [x] [`client-page.tsx`](src/app/admin/contabilidad/client-page.tsx) — dashboard con 5 KPIs (clases 1-5), tabla de balance con totales, lista de últimos 15 comprobantes, modal "Nuevo periodo" (autocalcula código `YYYY-MM` y rangos UTC) y modal "Nuevo comprobante" con grilla editable de N líneas: select de cuenta · débito · crédito · detalle, totales en vivo y badge "✓ partida doble" / "⚠ no cuadra" que habilita el botón Registrar.
- [x] Entrada "Contabilidad" en sidebar gateada por `MODULO_IDS.CONTABILIDAD_PUBLICA` ([`admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx)).

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Los modelos `Cp*` ya estaban definidos en `schema.prisma` (presumiblemente de una sesión previa que no llegó a CLAUDE.md). Confirma la lección del transcript de Fase 1: siempre `git status` antes de re-modelar.
- El refine de Zod para partida doble usa tolerancia `< 0.005` para evitar artefactos de coma flotante con dos decimales. Si en el futuro se necesitan 3+ decimales (multimoneda), bajar a `< 0.0005` y revisar el `@db.Decimal(18,2)`.
- `permiteMovimientos` es la clave del modelo: sólo cuentas hoja reciben asientos; las cuentas de grupo agregan saldos por suma de hojas. El seed ya marca esto correctamente — replicar en cargas futuras del PUC ampliado.
- ⚠ Migración pendiente: las tablas `cp_*` ya están en el `schema.prisma` pero hay que correr `npx prisma db push` contra cada tenant Neon donde se vaya a activar el módulo + `npx tsx scripts/seed-puc.ts` con el `DATABASE_URL` apuntando a ese tenant.

---

### ✅ Fase 4 — IA del reporte del depositario (cerrada)

Primer retroactivo del barrido de IA. Analogía directa al clasificador de Ventanilla Única.

**Datos**
- [x] Modelo `FriscoReporteAnalisisIA` (1:1 con `FriscoReporteDepositario`, cascade): `urgencia` (enum NORMAL/ATENCION/CRITICA), `etiquetas` (String[]), `resumen`, `confianza`, `modelo`, `proveedor`, `promptVersion`, `raw` (Json), `tokensPrompt`/`tokensRespuesta`, `errorMsg`, `revisadoPor`/`revisadoEn`.
- [x] Relación inversa `FriscoReporteDepositario.analisisIA`.

**Núcleo IA**
- [x] [`src/lib/groq-client.ts`](src/lib/groq-client.ts) — añadido helper exportado `callIaJson(tenantId, prompt)` con el mismo patrón Groq → Shipu de `classifyPQRSD`. No se tocó la función existente para evitar regresiones.
- [x] [`src/lib/frisco-reporte-ia.ts`](src/lib/frisco-reporte-ia.ts) — `analizarReporte()` clasifica urgencia + asigna etiquetas (10 categorías cerradas: ocupación indebida, intento de venta, deterioro grave, daños estructurales, amenazas, robo, incendio, póliza vencida, documento pendiente, operación normal). Si la IA falla → fallback determinístico por regex sobre `novedades` + estado físico, marca `proveedor: "fallback"` y `errorMsg`. El reporte nunca se queda sin análisis.
- [x] `promptVersion: "frisco-reporte-v1"` para poder versionar prompts sin perder histórico.

**Endpoint público**
- [x] `POST /api/portal/frisco/[token]/reporte` ahora dispara `dispararAnalisisIA()` post-upsert. No-bloqueante: si la IA tarda, el ciudadano ya recibió 201. Persiste en `FriscoReporteAnalisisIA` por upsert (sobreescribe si el reporte se reedita en el mismo mes).

**API admin**
- [x] `GET  /api/admin/frisco/bienes/[id]/reportes` — lista hasta 60 reportes del bien con `analisisIA` incluido.
- [x] `PATCH /api/admin/frisco/reportes/[reporteId]/analisis` — override humano: actualiza urgencia/etiquetas y registra `revisadoPor` + `revisadoEn`. **IA sugiere, humano decide**.

**UI admin**
- [x] Nueva tab "Reportes" en la ficha del bien (oculta si `portal_externo` no está activo).
- [x] Cada reporte muestra: cabecera con depositario + período + estado físico + badge de urgencia, novedades del custodio, **bloque azul con sugerencia IA** (proveedor, confianza, resumen, etiquetas como chips), botones de override `NORMAL | ATENCIÓN | CRÍTICA`. Marca "Revisado" si ya hubo override.

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El motor de IA estaba acoplado a PQRSD vía función monolítica. Extracción mínima (`callIaJson`) habilita reutilizar el patrón Groq+Shipu+keys-por-tenant sin tocar lo existente. Replicable para los siguientes módulos.
- `dispararAnalisisIA()` se invoca con `void` (fire-and-forget). En Vercel/Edge esto puede no terminar; si en producción se observan reportes sin análisis, considerar cola (BullMQ / QStash) o sincronizar la llamada aceptando el retraso de ~2s para el ciudadano.
- Las etiquetas son enum-cerrado de strings (no enum Prisma) — permite ampliar la lista sin migración pero el clasificador filtra sólo las conocidas para evitar etiquetas alucinadas.

---

### ✅ Fase 3 — Módulo `portal_externo` (cerrada)

Portal de auto-consulta del depositario SAE. Acceso por token (sin password).

**Datos**
- [x] `FriscoPortalAcceso` — guarda **SHA-256** del token (nunca el plano). Campos: `tokenHash` (unique), `depositarioId`, `expiraEn`, `revocadoEn`, `ultimoAccesoEn`, `accesoCount`, `createdBy`.
- [x] `FriscoReporteDepositario` — reporte mensual con unique `[depositarioId, periodo]` (un reporte por mes, idempotente vía upsert). Campos: `estadoBien` (enum `FriscoEstadoFisico`), `novedades`, `fotoUrl`, `adjuntoUrl`, `ipOrigen`.
- [x] Relaciones inversas en `FriscoDepositario.accesos` y `.reportes`.

**Helpers**
- [x] [`src/lib/frisco-portal.ts`](src/lib/frisco-portal.ts) — `generarToken()` (32 bytes hex), `hashToken()`, `resolverAcceso()` (valida hash + expiración + revocación + incluye bien y reportes), `periodoActual()` formato `YYYY-MM`.
- [x] `requirePortalExterno` añadido a [`frisco-guard.ts`](src/lib/frisco-guard.ts).

**API admin**
- [x] `GET  /api/admin/frisco/depositarios/[id]/portal-acceso` — lista accesos del depositario.
- [x] `POST /api/admin/frisco/depositarios/[id]/portal-acceso` — genera token (revoca activos previos en transacción), opcional `enviarEmail: true`. Devuelve token plano **una sola vez** + URL del portal.
- [x] `DELETE /api/admin/frisco/portal-acceso/[accesoId]` — revoca acceso (marca `revocadoEn`, no elimina).

**API pública (sin login)**
- [x] `POST /api/portal/frisco/[token]/reporte` — valida token, upsert reporte del mes, actualiza `FriscoDepositario.ultimoReporte`. Captura IP origen.

**Portal público**
- [x] [`/portal/frisco/[token]`](src/app/portal/frisco/[token]/page.tsx) — server page con `dynamic = 'force-dynamic'` y `robots: noindex`. Si token inválido/expirado/revocado → `notFound()`. Registra `ultimoAccesoEn` + incrementa `accesoCount` (no-bloqueante).
- [x] UI con 4 secciones: datos del depositario (con alerta de póliza vencida), bien custodiado, reporte mensual (estado + novedades + URLs opcionales), historial de últimos 12 reportes.

**UI admin**
- [x] Botón `KeyRound` por depositario en la tab Depositarios (sólo si `portal_externo` está activo).
- [x] Modal `PortalAccesoModal`: días de vigencia + checkbox de envío por email (deshabilitado si depositario sin email). Tras generar, muestra URL una sola vez con botón copiar y avisa si el email se envió OK.
- [x] Columna nueva "Último reporte" en la tabla.

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Infra de email ya existía: [`src/lib/mail.ts`](src/lib/mail.ts) (Resend) + `sendMail()` genérico — reutilizado sin tocar.
- `getTenantPrisma()` funciona también en rutas públicas sin auth (resuelve tenant por host). Sin esto el portal externo necesitaba un esquema diferente; ya estaba resuelto.
- `dynamic = "force-dynamic"` necesario en la página pública para que Next no intente prerender con un token dummy.

---

### ✅ Fase 2 — Módulo `frisco_interop` (cerrada)

Conectores externos para mantener el inventario FRISCO consistente.

**Datos**
- [x] Modelo `FriscoInteropLog` + enum `FriscoInteropServicio` (SNR/FISCALIA/IGAC) en [`prisma/schema.prisma`](prisma/schema.prisma). Relación inversa en `FriscoBien.interopLogs`.

**Servicios (stub)**
- [x] [`src/lib/frisco-interop/types.ts`](src/lib/frisco-interop/types.ts) — contratos compartidos `InteropResult<T>` + tipos por servicio.
- [x] [`snr.ts`](src/lib/frisco-interop/snr.ts), [`fiscalia.ts`](src/lib/frisco-interop/fiscalia.ts), [`igac.ts`](src/lib/frisco-interop/igac.ts) — stubs determinísticos con latencia simulada; mismo shape que la API real esperada (drop-in replace cuando SAE provea credenciales).

**API**
- [x] `POST /api/admin/frisco/interop/snr`
- [x] `POST /api/admin/frisco/interop/fiscalia`
- [x] `POST /api/admin/frisco/interop/igac`
- [x] Cada llamada registra `FriscoInteropLog` (servicio, params, payload, latencia, error, usuario). Errores remotos → 502.
- [x] Helper `requireFriscoInterop` añadido a [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) (refactor: `requireModule` interno reutilizable).

**UI**
- [x] Nueva tab "Interop" en `/admin/frisco/bienes/[id]` (oculta si el módulo no está activo). Tres tarjetas con botón "Consultar", auto-rellena `folioMatricula` / `numeroProceso` desde el bien, deshabilita si falta el dato. Renderizado tipado por servicio + latencia visible.

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgo** — Prisma exige `Prisma.JsonNull` (no `null` literal) al escribir `Json?`. Se corrigió en los 3 endpoints.

---

### ✅ Fase 1 — Módulo FRISCO (cerrada en esta sesión)

Primer vertical activable. Cliente piloto: **SAE**.

**Datos**
- [x] Modelos Prisma: `FriscoBien`, `FriscoDepositario`, `FriscoContrato`, `FriscoDestinacion` ([`prisma/schema.prisma`](prisma/schema.prisma):2154+).
- [x] Relaciones inversas en `GdExpediente` y `GaCarpeta` (vincula bienes a expediente y carpeta física).
- [x] Schemas zod: `friscoBien*`, `friscoDepositario*`, `friscoContrato*`, `friscoDestinacion*` ([`src/lib/validations.ts`](src/lib/validations.ts):460+).

**API**
- [x] `/api/admin/frisco/bienes` — GET (lista paginada con filtros tipo/estado/búsqueda) + POST.
- [x] `/api/admin/frisco/bienes/[id]` — GET (con includes), PATCH, DELETE.
- [x] `/api/admin/frisco/depositarios` — GET (filtrable por bienId, activo), POST.
- [x] `/api/admin/frisco/depositarios/[id]` — PATCH, DELETE.
- [x] `/api/admin/frisco/contratos` — GET (filtrable), POST.
- [x] `/api/admin/frisco/contratos/[id]` — PATCH, DELETE.
- [x] `/api/admin/frisco/destinaciones` — POST con `upsert` (relación 1:1 bien↔destinación).
- [x] Helper `requireFrisco(roles)` en [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts): gatea por módulo activo + roles.

**UI admin**
- [x] [`/admin/frisco`](src/app/admin/frisco/page.tsx) — dashboard con 5 KPIs (total / EN_PROCESO / CAUTELAR / EXTINTO / DEVUELTO), tabla con búsqueda + filtros tipo/estado, modal "Registrar bien".
- [x] [`/admin/frisco/bienes/[id]`](src/app/admin/frisco/bienes/[id]/page.tsx) — detalle con 4 tabs: Resumen, Depositarios, Contratos, Destinación. Cada tab tiene su modal de alta y acción de eliminación.
- [x] Entrada de menú "FRISCO — Bienes" en sidebar, gateada por `MODULO_IDS.FRISCO_BIENES` ([`src/components/admin/admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx):309).

**Verificación**
- [x] `tsc --noEmit` limpio post-cambios.

---

## Hallazgos y mejoras aplicadas en esta sesión

1. **Tipo `Role` real del proyecto** es `'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER'` (no `'VIEWER'` como asumía la sesión previa). Corregido en `frisco-guard.ts` y en las 4 rutas API que ya estaban escritas. Lección para módulos futuros: usar `USER` como rol de solo lectura.

2. **Sesión previa había llegado más lejos que el transcript.** Al retomar, encontré las 7 rutas API ya implementadas (sólidas), no stubs. El transcript se cortó justo después de empezar el helper guard, pero las rutas existían como cambios sin commitear. Verificar siempre `git status` antes de re-implementar.

3. **Relación bien ↔ destinación es 1:1**, por eso `/api/admin/frisco/destinaciones` usa `upsert` (no POST puro). Documentado en la cabecera de la ruta.

4. **Cascada de borrado**: borrar un `FriscoBien` elimina automáticamente sus depositarios, contratos y destinación (Prisma cascade). El DELETE de bien debe quedar restringido a `SUPER_ADMIN | ADMIN` (no EDITOR).

5. **Memoria del usuario:** no levantar dev local — el flujo es commit + push y Vercel auto-deploya. Verificación local con `tsc`, no con preview server.

---

## Pendiente

### En el módulo FRISCO

**Hecho** (resumen, detalle en fases 1–4):
- ~~Endpoint público de auto-consulta del depositario~~ → ✅ `portal_externo` (fase 3).
- ~~Integraciones interop SNR / Fiscalía / IGAC~~ → ✅ stub funcional en `frisco_interop` (fase 2). Falta: reemplazar stub por servicios reales cuando SAE provea credenciales.
- ~~Reporte mensual del depositario~~ → ✅ vía portal externo + clasificación IA (fases 3 y 4).

**Pendiente**:
- [ ] **IA retroactiva en `frisco_bienes`** — sugerir `tipo`/`estadoFisico` desde descripción; extracción de `placa`/`folioMatricula`/`numeroProceso` (OCR + LLM); análisis de foto.
- [ ] **IA retroactiva en `frisco_interop`** — detectar discrepancias semánticas SNR↔IGAC↔registro interno; resumen de 2 líneas del proceso fiscal.
- [ ] **Reemplazar stubs interop** por las APIs reales de SNR / Fiscalía / IGAC cuando SAE entregue credenciales. Drop-in en `src/lib/frisco-interop/{snr,fiscalia,igac}.ts` — interfaz ya estable.
- [ ] **Recordatorio mensual al depositario** vía email (cron) — el endpoint y modelo ya existen; falta el job que dispare el envío los primeros días de cada mes a depositarios activos sin reporte del período.
- [ ] **Alertas de pólizas** próximas a vencer (depositario y contrato): job + notificación al funcionario asignado. Aprovechable también por la IA del reporte para subir urgencia.
- [ ] **Vincular bien a expediente GD desde la UI** (campo `expedienteId` existe en schema y en API; falta selector en form de alta/edición de bien).
- [ ] **Vincular bien a carpeta física GA** (mismo caso que expediente).
- [ ] **Cola de análisis IA** — hoy `dispararAnalisisIA` es fire-and-forget. En Vercel serverless puede cortarse antes de terminar. Mover a cola (BullMQ / QStash) o pasar a sincrónico aceptando ~2s de latencia.
- [ ] **Acción de notificación al funcionario** cuando el clasificador marca un reporte como CRITICA (hoy sólo queda visible en la tab Reportes; no avisa a nadie).
- [ ] **Subida de archivos al portal externo** — el campo `fotoUrl`/`adjuntoUrl` acepta URLs externas; falta un componente de upload propio (S3/UploadThing) para que el depositario no tenga que hostear el archivo.
- [ ] **Tests E2E** del flujo completo: alta de bien → asignar depositario → generar acceso portal → reporte mensual → análisis IA → override admin → contrato → destinación.

### En el catálogo
- [ ] Decidir orden del siguiente módulo a construir (ver "Próximo punto" abajo).
- [ ] Materializar bundles comerciales en UI superadmin (botón "Aplicar bundle Control" que active de un click los módulos del paquete).

### Fundamentos transversales
- [ ] Excluir definitivamente `ventanilla_unica_personeria_buga/` del repo o moverlo a `archive/` (sigue generando ruido aunque esté excluido del tsc).
- [ ] Seeds de catálogos públicos comunes (entidades, dependencias estándar, TRD base) para acelerar onboarding de tenants nuevos.

---

## 🧠 Integración de IA por módulo

**Patrón base** (ya implementado en Ventanilla Única): Groq como motor primario, fallback determinístico, IA **sugiere** y humano **decide**. La sugerencia se persiste en un modelo separado (ej. `VuAsignacionIA`) con metadata: modelo, prompt versión, confianza, timestamp. Cliente compartido: [`src/lib/groq-client.ts`](src/lib/groq-client.ts).

### Pendiente retroactivo (módulos ya cerrados sin IA)

Aplicar el patrón a lo que ya está construido — son ganancias rápidas, no bloquean nada:

1. **`frisco_bienes`** — al registrar/editar un bien:
   - Sugerir `tipo` (INMUEBLE_URBANO/RURAL/VEHICULO/…) desde `descripcion`.
   - Extraer `placa`, `folioMatricula`, `numeroProceso` desde texto libre o documento adjunto (OCR + LLM).
   - Sugerir `estadoFisico` y palabras clave de riesgo (deterioro, ocupación) cuando se cargue una foto.

2. **`frisco_interop`** — al recibir respuesta de SNR / Fiscalía / IGAC:
   - Detectar discrepancias semánticas (dirección registrada vs. dirección IGAC) y resaltarlas.
   - Generar resumen de 2 líneas del proceso fiscal para mostrar en la ficha.

3. ~~**`portal_externo`** — clasificador de urgencia del reporte del depositario~~ — ✅ implementado en Fase 4.

### IA prevista para el módulo siguiente (`contabilidad_publica`)

Casos donde aporta:
1. **Sugerencia de cuentas PUC** dada la descripción del comprobante → propone débito/crédito con cuentas del PUC CGN, el contador confirma. Persistir en `CpAsientoSugerenciaIA`.
2. **Detección de comprobantes anómalos** — monto fuera de rango histórico de la cuenta, fecha invertida, contraparte no usual. Marca pero no bloquea.
3. **Sugerencia de tercero auxiliar** — match probabilístico con `CpAuxiliarTercero` existentes para evitar duplicados (mismo NIT con razón social levemente distinta).

Casos donde IA **NO** entra (definidos explícitamente):
- El motor de doble partida (débito = crédito) es validación determinística.
- Aprobación de comprobante.
- Cierre de período contable.
- Cálculo de saldos.

---

## 🎯 Próximo punto

Avance respecto al MVP SAE de A0 (portal + plan CGN + bienes FRISCO + presupuesto mínimo + reporte CHIP):

- [x] Portal (base Personería)
- [x] Bienes FRISCO (`frisco_bienes`)
- [x] Interoperabilidad SNR/Fiscalía/IGAC (`frisco_interop`)
- [x] Portal externo del depositario (`portal_externo`)
- [x] **Plan CGN + motor contable** (`contabilidad_publica` — Fase 5)
- [x] **Presupuesto mínimo (CDP/RP/Obligación/Pago)** (`presupuesto_ejecucion` — Fase 6, con comprobante contable auto al pagar)
- [ ] **Reporte CHIP básico** ← siguiente palanca del MVP SAE

**Siguiente: `reportes_control`** o `tesoreria` (a definir). Con el motor contable + cadena presupuestal vivos, el MVP SAE necesita los reportes a entes (CHIP/FUT) para cerrar el círculo de venta.

Alternativa razonable: `nomina_publica` (también depende del PUC; usa terceros, comprobantes y cuentas 2505/2510/5101/5103 ya sembradas). Decisión pendiente con el usuario.

### Pendientes inmediatos en `presupuesto_ejecucion`
- [ ] `npx prisma db push` por tenant para crear tablas `psu_*`.
- [ ] Endpoint DELETE/PATCH para **anular** documentos de la cadena, con validación de que no haya hijos vigentes (CDP no se puede anular si tiene RPs activos, etc.).
- [ ] Selector de obligación en el modal de Pago (hoy se pega cuid manualmente).
- [ ] **IA retroactiva**: sugerencia de rubro a partir de la descripción del CDP; detector de gastos atípicos vs. apropiación; resumen de ejecución mensual.
- [ ] Generación del comprobante también en el paso de **Obligación** (devengo) si CGN lo exige formalmente — hoy sólo en Pago.

### Pendientes inmediatos en `contabilidad_publica`
- [ ] Correr `prisma db push` + `npx tsx scripts/seed-puc.ts` en el tenant SAE.
- [ ] **IA retroactiva**: sugerencia de cuentas PUC y de tercero auxiliar (modelo `CpAsientoSugerenciaIA` aún por crear); detector de comprobantes anómalos.
- [ ] Cierre anual: comprobante automático de cierre que traslada saldos de cuentas de resultado (4 y 5) a `3110` (resultado del ejercicio).
- [ ] Balance comparativo (vs. periodo anterior) y libros oficiales (Diario, Mayor, Auxiliar).
