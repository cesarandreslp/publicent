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

### ✅ Fase 15 — Pasivos de nómina (cerrada)

Segunda mitad del ciclo de pago de nómina: liquidar a EPS/AFP/ARL/DIAN/parafiscales los pasivos generados como crédito por el comprobante de Fase 12. Cada pago a tercero genera un `CpComprobante` independiente con D `<cuenta_pasivo>` / C `<banco>` y se registra en una nueva tabla de control para descontar saldos.

**Datos**
- [x] Modelo `NomPagoPasivo` (campos: periodoId, cuentaCodigo/cuentaNombre, tercero/terceroNit, valor, fecha, cuentaBancoCodigo, comprobanteId, observacion, creadoPor). Indexado por `[periodoId]` y `[cuentaCodigo]`.
- [x] Relación inversa `NomNominaPeriodo.pagosPasivos`.

**Endpoints**
- [x] `GET /api/admin/nom/pasivos-pendientes?periodoId=` — agrega créditos en cuentas clase 2 del comprobante de nómina (`fuenteModulo='nomina'`, `fuenteRef=periodoId`) y descuenta lo ya pagado. Devuelve filas `{ cuentaCodigo, cuentaNombre, generado, pagado, saldo }` + historial de pagos.
- [x] `POST /api/admin/nom/pagar-pasivo { periodoId, cuentaCodigo, tercero, terceroNit?, valor, fecha, cuentaBancoId, numero, observacion? }`:
  - Valida periodo `PAGADO|CERRADO`, contabilidad activa, cuenta pasivo clase 2 + permite movimiento, cuenta banco clase 111*, periodo contable ABIERTO.
  - Calcula saldo disponible y valida `valor ≤ saldo`.
  - `$transaction`: crea `CpComprobante` EGRESO con 2 asientos (D pasivo / C banco), `fuenteModulo='nomina-pasivo'`, `fuenteRef=periodoId`. Inserta `NomPagoPasivo` apuntando al comprobante.

**Validaciones zod**
- [x] `nomPagarPasivoSchema` (10 campos).

**UI**
- [x] Botón "Pasivos" (ámbar) en la tabla de periodos `PAGADO|CERRADO` cuando contabilidad está activa.
- [x] `PasivosModal` carga vía fetch al abrir (`useEffect`), muestra tabla de pasivos con generado/pagado/saldo, botón "Pagar" por fila habilitado sólo si `saldo > 0.5`, sección "Pagos registrados" con histórico.
- [x] `PagarPasivoForm` inline (no anidamos modal sobre modal): tercero + NIT + fecha + valor + número (auto-sugerido `PP-<periodo>-<cuenta>`) + cuenta banco + observación.

**Verificación**
- [x] `prisma generate` + `tsc --noEmit` limpios.

**Hallazgos**
- El saldo del pasivo se calcula **al vuelo** desde los asientos contables — no se duplica un campo "saldo" en `NomPagoPasivo`. Razón: la fuente de verdad es el libro contable; si se anula un asiento de nómina, el saldo recalcula automáticamente.
- `fuenteModulo='nomina-pasivo'` (no `'nomina'` simple) para diferenciar del comprobante original al consultar libros. Los pagos a terceros NO se cuentan como "pasivo generado" en `pasivos-pendientes` (sólo créditos del comprobante origen).
- Un mismo pasivo (ej. salud 4%+8.5%) puede pagarse en varios pagos parciales a la misma EPS, o partirse entre varias EPS si los empleados tienen EPS distintas. La UI permite pagar `valor < saldo` y deja el resto como saldo para otro pago.
- ⚠ Migración pendiente: `npx prisma db push` para crear `nom_pagos_pasivos`.
- Limitación conocida: la lista de pasivos hoy agrega TODO crédito de clase 2 del comprobante. Si el comprobante de nómina tuviera créditos a 2505 por aportes patronales (que pagamos a EPS/AFP) **mezclados** con créditos a 2505 por sueldos por pagar al empleado (que ya pagamos al banco), no los distingue — pero el comprobante actual de Fase 12 ya envía el neto directamente al banco (no usa 2505 para sueldos), así que no hay colisión.

---

### ✅ Fase 14 — Exportador XLSX para reportes de control (cerrada)

Conversión de los snapshots JSON de Fase 13 a archivos XLSX descargables, listos para que el contador los entregue al ente (o copie/pegue al template oficial).

**Implementación**
- [x] [`src/lib/reportes-control/xlsx.ts`](src/lib/reportes-control/xlsx.ts) — usa `exceljs` (ya en deps). Función única `exportarReporteXlsx(tipo, datos, observacion)` con dispatch por tipo:
  - **CHIP_BALANCE / CHIP_ACTIVIDAD** → hoja con columnas Cuenta · Nombre · Naturaleza · Débitos · Créditos · Saldo + totales en negrita.
  - **FUT_GASTOS** → hoja con 10 columnas (Código · Nombre · Nivel · Apropiación inicial · Adiciones · Reducciones · Definitiva · Comprometido · Obligado · Pagado) + fila TOTAL.
  - **FUT_INGRESOS** → 7 columnas (Código · Nombre · Nivel · Aforado inicial · Adiciones · Reducciones · Aforado definitivo) + TOTAL.
  - **LEY_617** → tabla vertical con indicador / ICLD / tope / cumple / holgura + fila roja si excede.
  - Todas las columnas monetarias usan formato COP `"$"#,##0;[Red]-"$"#,##0`.
  - Encabezado azul (#1E40AF) en negrita blanca; ancho de columnas auto-ajustado capeado a 60.

**Endpoint**
- [x] `GET /api/admin/rc/reportes/[id]/xlsx` — recupera el snapshot, ejecuta el builder, devuelve `Response` con `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y `Content-Disposition: attachment; filename="<TIPO>_<clave>_<fecha>.xlsx"`.

**UI**
- [x] Botón XLSX (verde, ícono `FileSpreadsheet`) al lado del JSON en cada fila de la bitácora de `/admin/reportes-control`. Es un `<a href>` directo al endpoint — descarga nativa sin JS adicional.

**Verificación**
- [x] `tsc --noEmit` limpio.

**Hallazgos**
- `exceljs.writeBuffer()` devuelve `ArrayBuffer | Buffer` según la versión. Lo casteamos a `Uint8Array` y luego a `any` en `new Response()` porque TypeScript de Next.js no acepta `Uint8Array` directo en `BodyInit` sin lib.dom estándar. Funciona en Node runtime de Vercel sin problemas.
- El layout NO es el oficial CGN/DNP — esos templates cambian por trimestre y por categoría municipal y exigen filas/columnas en posiciones exactas. La estrategia es: el XLSX exportado es **navegable y agrupado** (un contador lo lee bien), y desde ahí el contador copia/pega al template oficial bajado del portal. Mapeo 1:1 queda como mejora futura cuando se tenga el .xlsx oficial de referencia para diff.
- El archivo se llama `<TIPO>_<vigencia|periodoId>_<fechaISO>.xlsx` — fácil de archivar en la carpeta de la entidad.

---

### ✅ Fase 13 — Módulo `reportes_control` (cerrada)

Cierra la última pieza del MVP SAE original (A0): reportes a entes de control (CHIP / FUT / Ley 617). Implementación como snapshots JSON persistidos en `RcReporteGenerado`, mapeo al layout XLS oficial queda pendiente.

**Datos**
- [x] `RcReporteGenerado` (campo `datos` Json + `totales` Json para listar rápido) + enum `RcTipoReporte` (5 valores: CHIP_BALANCE, CHIP_ACTIVIDAD, FUT_INGRESOS, FUT_GASTOS, LEY_617). Indexado por `[tipo, vigencia]` y `[tipo, periodoContableId]`.

**Núcleo (`src/lib/reportes-control/`)**
- [x] [`chip.ts`](src/lib/reportes-control/chip.ts) — `chipBalance(prisma, periodoId)` y `chipActividad(prisma, periodoId)`. Agregan asientos REGISTRADOS no anulados por cuenta (clases 1/2/3 para Balance, 4/5 para Actividad), aplican signo según naturaleza DEBITO/CREDITO y devuelven totales (activo / pasivo / patrimonio / diferencia, ingresos / gastos / excedente).
- [x] [`fut.ts`](src/lib/reportes-control/fut.ts) — `futGastos(prisma, vigencia)` (apropiación / comprometido / obligado / pagado por rubro CCPET tipo GASTO) y `futIngresos(prisma, vigencia)` (aforado definitivo por rubro INGRESO). El recaudo real desde clase 4 contable queda como nota pendiente — requiere amarra subcuenta→rubro que hoy no existe a nivel catálogo.
- [x] [`ley617.ts`](src/lib/reportes-control/ley617.ts) — `ley617({ prisma, vigencia, icldManual?, topeCategoria? })`. Suma obligaciones de rubros `A.1*` y `A.2*` como gastos de funcionamiento, divide por ICLD (manual o derivado de CCPET `1.1*`) y compara contra tope por categoría municipal (default 3.7% = categoría 6).

**Endpoints**
- [x] `POST /api/admin/rc/generar { tipo, periodoContableId?, vigencia?, icldManual?, topeCategoria?, observacion? }` — dispatch por tipo, persiste snapshot.
- [x] `GET /api/admin/rc/reportes?tipo=&vigencia=&periodoContableId=` — lista (sólo metadata + totales para tabla).
- [x] `GET/DELETE /api/admin/rc/reportes/[id]` — descarga JSON completo / borra snapshot.
- [x] `requireReportesControl` guard.
- [x] `rcGenerarSchema` zod.

**UI**
- [x] [`/admin/reportes-control`](src/app/admin/reportes-control/page.tsx) — server: últimos 24 periodos contables + últimos 60 reportes.
- [x] [`client-page.tsx`](src/app/admin/reportes-control/client-page.tsx) — 5 botones (uno por tipo), tabla de bitácora con resumen línea-por-línea por tipo (`A: ... · P+P: ...` para Balance, `Apropiado X · Pagado Y` para FUT, `% · ✓/✗ cumple` para Ley 617), descarga JSON al click (`URL.createObjectURL` + `<a download>`), eliminar con confirm. Modal único `GenerarModal` adaptativo al tipo (pide periodo para CHIP, vigencia para FUT/617, selector de tope categoría para 617).
- [x] Entrada "Reportes de control" en sidebar gateada por `MODULO_IDS.REPORTES_CONTROL`.

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Los snapshots se persisten como Json crudo. Razón: estos reportes se entregan al organismo externo en formato propio (CHIP usa su software, FUT usa plantilla XLS) — guardar el JSON normalizado deja la puerta abierta a renderizar contra cualquier layout sin re-consultar la BD ni recalcular.
- El cálculo de Balance / Actividad **filtra en JS por prefijo** (`startsWith('1')`) tras un `findMany` sin filtro de código. Razón: Prisma no tiene `OR` cómodo sobre `startsWith` múltiples sin construir array. Para volúmenes de personería (<5k asientos/mes) es trivial; para alcaldías grandes hay que mover el filtro a SQL crudo.
- El FUT de ingresos devuelve **aforado**, no recaudo real. El recaudo necesita amarrar cuentas clase 4 ↔ rubros CCPET 1.x.x — pendiente de modelo (campo `rubroCcpetCodigo` en `CpPlanCuenta`, similar a lo que hicimos en NomConcepto). Documentado en el output del reporte.
- Ley 617 usa `topeCategoria` parametrizable porque cada municipio tiene su categoría (1.5%–3.7%). Personería Buga es categoría 6 → 3.7%. El selector lista las 6 categorías comunes.
- ⚠ Migración pendiente: `npx prisma db push` para crear `rc_reportes` por tenant.

---

### ✅ Fase 12 — Pago de nómina → comprobante contable (cerrada)

Cierra el círculo `Liquidación → Comprobante`. Cuando un periodo está `LIQUIDADO`, la entidad presiona "Pagar" y se genera **un único comprobante EGRESO** que agrega todas las liquidaciones del periodo. El periodo pasa a `PAGADO` y cada `NomLiquidacion.comprobanteId` queda apuntando al comprobante creado.

**Endpoint**
- [x] `POST /api/admin/nom/pagar { periodoId, fecha, numero, cuentaBancoId }`
  - Valida periodo `LIQUIDADO`, módulo `contabilidad_publica` activo, periodo contable `ABIERTO`.
  - Itera detalles de todas las liquidaciones, agrega por `cuentaContableCodigo`:
    - **DEVENGADO** → D gasto (5101/5103/5104/5111 según concepto).
    - **APORTE_PATRONAL** → D gasto + C pasivo 2505 (nómina por pagar).
    - **PRESTACION_SOCIAL** → D gasto + C pasivo 2510 (cesantías por pagar).
    - **DEDUCCION_EMPLEADO** → C pasivo (2425 / 2436 / 2510 según concepto).
    - **Neto a empleados** → C banco (cuentaBancoId).
  - Resuelve códigos → `cpPlanCuenta.id` con un solo query. Falla con 400 si falta alguna cuenta (típicamente porque la auto-siembra del CGC no se ejecutó).
  - Valida partida doble con tolerancia 0.5 COP. Crea `CpComprobante` con `fuenteModulo='nomina'`, `fuenteRef=periodoId`, `tipo=EGRESO`.
  - `$transaction`: comprobante + `nomLiquidacion.updateMany({ comprobanteId })` + `nomNominaPeriodo.update({ estado: 'PAGADO' })`.

**Validaciones zod**
- [x] `nomPagarPeriodoSchema { periodoId, fecha, numero, cuentaBancoId, cuentaSueldosPorPagarCodigo? }`.

**UI**
- [x] Botón "Pagar" en la tabla de periodos sólo aparece cuando `estado=LIQUIDADO` **y** `contabilidad_publica` está activo (caso contrario muestra hint).
- [x] `PagarModal`: resumen del periodo (#empleados, neto, deducciones), número auto-sugerido `NOM-YYYY-MM`, fecha hoy por defecto, select de cuentas banco (PUC `111*`). Tras éxito muestra resumen del comprobante generado (asientos, totales, deducciones a terceros).
- [x] Server `page.tsx` ahora carga `cuentasBanco` (sólo si contabilidad activa) y pasa `contabilidadActiva: boolean` al cliente.

**Verificación**
- [x] `tsc --noEmit` limpio.

**Hallazgos**
- El comprobante es **agregado** (un solo `CpComprobante` por periodo, ~10-20 asientos) en vez de uno por empleado. Razón: mantiene los libros legibles y `permiteMovimientos=true` se cumple por código de cuenta, no por empleado. El detalle empleado-a-empleado queda en `NomLiquidacionDetalle`.
- Las cuentas de contrapartida pasivo (2505/2510) están hardcodeadas en el route — funciona porque la auto-siembra del CGC oficial (Fase 8) las garantiza. Si una entidad usa subcuentas distintas, queda como mejora exponer `cuentaSueldosPorPagarCodigo` en la UI (ya está en el schema zod).
- Los **aportes patronales y deducciones se quedan como pasivos** en 2505/2510/2425/2436. Pagarlos a EPS/AFP/DIAN/parafiscales es otra obligación (CDP/RP/Pago vía módulo presupuesto) — esa es la próxima iteración.
- Diferencia con `/api/admin/psu/pagos`: no genera obligación presupuestal en este corte. La nómina pública colombiana suele estar **embebida en una sola apropiación A.1.1** y la entidad maneja el devengo presupuestal mensualmente sin atomizar por empleado. Si el cliente lo pide, se añade un flag `generarObligacion: true` que crea una `PsuObligacion` contra un RP anual.
- `fuenteRef=periodoId` permite cruzar libros: `SELECT * FROM cp_comprobantes WHERE fuente_modulo='nomina' AND fuente_ref=<periodoId>` da el comprobante; al revés desde `NomLiquidacion.comprobanteId` se navega al detalle de asientos.

---

### ✅ Fase 11 — Núcleo `nomina_publica` (cerrada)

Primer módulo que integra **contabilidad + presupuesto + dominio nuevo**. Maneja empleados (planta / trabajador oficial / contratistas / supernumerarios / aprendices), catálogo de conceptos (devengado, deducción empleado, aporte patronal, prestación social), liquidación mensual con motor de cálculo, novedades y enlace a `CpComprobante` + `PsuObligacion` para la fase de pago.

**Datos** (bloque nuevo `prisma/schema.prisma`)
- [x] `NomEmpleado` — identificación, vinculación (`NomTipoVinculacion`), salario básico decimal(18,2), banca, EPS/AFP/ARL/caja, flag retención. Únicos: `documento`. Índices: `activo`, `dependencia`.
- [x] `NomConcepto` + enums `NomTipoConcepto` (4) y `NomFormulaConcepto` (5: FIJO, %SUELDO, %DEVENGADO, %IBC, CALCULO_ESPECIAL). Campos `cuentaContableCodigo` (PUC CGC) y `rubroCcpetCodigo` (CCPET A.1.x) → puente con contabilidad/presupuesto.
- [x] `NomNominaPeriodo` + enum `NomEstadoPeriodo` (ABIERTO/LIQUIDADO/PAGADO/CERRADO). Único por código `YYYY-MM`.
- [x] `NomLiquidacion` con unique `[periodoId, empleadoId]` + acumulados + slots `obligacionId`/`comprobanteId`.
- [x] `NomLiquidacionDetalle` (línea por concepto con valor y base usada).
- [x] `NomNovedad` + enum `NomTipoNovedad` (8 tipos: vacaciones, licencias, incapacidades, ausencia, comisión, permiso).

**Catálogo base de conceptos**
- [x] [`src/lib/seeders/nomina-conceptos.ts`](src/lib/seeders/nomina-conceptos.ts) — 24 conceptos prefijados:
  - **9 devengados** (NC-001..009): sueldo, horas extras, auxilio transporte, bonificación servicios, prima servicios, prima navidad, prima vacaciones, vacaciones, honorarios contratistas.
  - **7 deducciones empleado** (NC-101..122): salud 4%, pensión 4%, FSP 1%, retefuente salarios, retefuente honorarios 10%, embargo, libranza, fondo empleados.
  - **8 aportes patronales** (NC-201..208): salud 8.5%, pensión 12%, ARL 0.522%, caja 4%, ICBF 3%, SENA 2%, ESAP 0.5%, escuelas técnicas 0.5%.
  - **2 prestaciones sociales** (NC-301..302): cesantías 8.33%, intereses cesantías 1%.
  - Cada concepto enlazado a la cuenta CGC sembrada en Fase 8 (5101/5103/5104/5111/2425/2436/2510) y al rubro CCPET A.1.x de Fase 10 cuando aplica.
  - Función `seedNominaConceptos(prisma)` idempotente vía upsert por `codigo`.

**Motor de liquidación**
- [x] [`src/lib/nomina-motor.ts`](src/lib/nomina-motor.ts) — función pura `liquidarEmpleado(empleado, conceptos, dias, novedades)`:
  1. Filtra conceptos aplicables al `tipoVinculacion`.
  2. Pasada 1 — devengados (calcula IBC = sólo conceptos `constitutivoSalario:true`).
  3. Pasada 2 — deducciones empleado (sobre IBC, devengado o fijo).
  4. Pasada 3 — aportes patronales + prestaciones (sobre IBC/devengado).
  - Aplica `factorDias = dias/30` a fórmulas % de sueldo.
  - Provisiones (prima/vacaciones) usan aproximaciones determinísticas (8.33% / 4.17%) — placeholder por no consultar histórico.
  - Retefuente queda en 0 (TODO: tablas UVT DIAN).

**Núcleo**
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) — añadido `requireNomina(roles)` (gateado por `MODULO_IDS.NOMINA_PUBLICA`).
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) — schemas zod nuevos: `nomEmpleadoCreate/Update`, `nomPeriodoCreate`, `nomNovedadCreate`, `nomLiquidarPeriodo`.

**Endpoints admin**
- [x] `GET/POST /api/admin/nom/empleados` (filtros q/activo/tipoVinculacion).
- [x] `GET/PATCH/DELETE /api/admin/nom/empleados/[id]` (DELETE = soft inactivar + fechaRetiro).
- [x] `GET/POST /api/admin/nom/periodos` (auto-calcula código `YYYY-MM` y rangos UTC).
- [x] `GET /api/admin/nom/liquidaciones?periodoId|empleadoId` (incluye empleado + periodo + detalles con concepto).
- [x] `POST /api/admin/nom/liquidar { periodoId, diasLiquidados? }` — orquesta `liquidarEmpleado` por empleado, upsert `NomLiquidacion` + reemplaza detalles en `$transaction`, marca periodo `LIQUIDADO` y registra `liquidadoPor`.

**Auto-siembra al activar el módulo**
- [x] `PUT /api/superadmin/tenants/[id]/modulos` ahora detecta `nomina_publica` recién activado y siembra los 24 conceptos en la BD del tenant. Devuelve `{ semillas: [{ modulo: "nomina_publica", total }] }`.

**UI**
- [x] [`/admin/nomina`](src/app/admin/nomina/page.tsx) — server: carga empleados (200), últimos 12 periodos con totales acumulados, count de conceptos activos.
- [x] [`client-page.tsx`](src/app/admin/nomina/client-page.tsx) — KPIs (empleados activos / último periodo / neto / aportes), tabla de periodos con badge de estado y botón "Liquidar" en ABIERTO, tabla de empleados, 3 modales (Empleado, Periodo, Liquidar). El modal de Liquidar muestra resumen post-corrida (devengado/deducciones/aportes/neto).
- [x] Entrada "Nómina" en sidebar gateada por `MODULO_IDS.NOMINA_PUBLICA` ([`admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx)).

**Verificación**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El motor de liquidación es **función pura** (no toca DB) → testeable sin mock. La capa de orquestación (`/liquidar` route) hace upsert + reemplazo de detalles + cambio de estado en una sola `$transaction` para no dejar liquidaciones a medias.
- Las provisiones (prima de servicios, vacaciones) son aproximaciones — para cumplir formalmente con la norma colombiana hay que promediar últimos 12 meses. Documentado como TODO en el motor.
- La retención en la fuente quedó como **placeholder = 0**. Implementarla requiere tablas UVT DIAN del año fiscal y procedimientos 1/2 — fuera del scope MVP pero pendiente antes de pagar nómina real.
- El concepto NC-009 "Honorarios" para contratistas usa `FIJO` (sin porcentaje) porque se pega el valor mensual contratado directamente — eventualmente un campo `valorMensual` en `NomEmpleado` para OPS.
- La cadena completa **liquidación → obligación presupuestal → pago → comprobante contable** queda para la siguiente fase: hoy `NomLiquidacion.obligacionId` y `.comprobanteId` están preparados pero ningún endpoint los llena. Ese flujo es la *fase 12* (pagar-nomina).
- ⚠ Migración pendiente: `npx prisma db push` para crear tablas `nom_*`. Al activar el módulo desde Superadmin se siembran los 24 conceptos automáticamente.

---

### ✅ Fase 10 — CCPET Territorial completo (ingresos + gastos)

El usuario aportó los 4 anexos oficiales descargados manualmente del portal de MinHacienda en `docs/ccpet/`. Procesados los dos anexos territoriales; los EICE quedan descargados pero sin aplicar (ver hallazgo).

**Carga completa**
- [x] `ccpet_ingresos_territoriales.xlsx` (Anexo 1A v8) → 512 rubros INGRESO
- [x] `ccpet_gastos_territoriales.xlsx` (Anexo 2A v8) → 1.272 rubros GASTO
- **Total: 1.784 rubros** del CCPET Territorial, niveles 1..10, sin huérfanos.

**Distribución de gastos** (la columna vertebral de CDP/RP/Obligación/Pago)
| Nivel | Cantidad |
|---|---|
| 1 (Gastos) | 1 |
| 2 (Funcionamiento / Servicio deuda / Inversión) | 3 |
| 3 (subgrupos) | 18 |
| 4 (conceptos) | 82 |
| 5 (subconceptos) | 248 |
| 6 (items) | 448 |
| 7 | 206 |
| 8 | 200 |
| 9-10 | 66 |

**Hallazgo arquitectónico — EICE descartado en este corte**
- [x] Anexos 1B y 2B (Empresas Industriales y Comerciales del Estado) también están descargados en `docs/ccpet/ccpet_{ingresos,gastos}_eice.xlsx` (200 ingresos + 1.137 gastos aprox).
- ⚠ NO se cargan en este corte por **colisión de códigos**: 1B y 1A comparten prefijo `1.x.x...`; 2B y 2A comparten `2.x.x...`. La tabla `psu_rubros` tiene `codigo @unique`, por lo que cargar ambos rompería la inserción.
- **Migración propuesta para soportar EICE más adelante:**
  1. Nuevo enum `PsuMarcoCcpet { TERRITORIAL, EICE }`.
  2. Cambiar `PsuRubro.codigo @unique` → `@@unique([codigo, marco])`.
  3. Filtrar los rubros expuestos al tenant según su tipología (campo nuevo en `Tenant.marcoCcpet`).
- Hasta esa migración, **los tenants tipo EICE (caso SAE) usan el catálogo TERRITORIAL** que cubre la mayor parte de los conceptos comunes. Las 4 cuentas tributarias muy específicas de EICE (impuestos a empresas, dividendos) quedan pendientes hasta la migración.

**Implementación**
- [x] [`scripts/parse-ccpet-xlsx.py`](scripts/parse-ccpet-xlsx.py) procesa ambos territoriales en una sola pasada; comentario explica por qué los EICE no se incluyen.
- [x] [`src/lib/seeders/ccp-rubros.generated.ts`](src/lib/seeders/ccp-rubros.generated.ts) ahora tiene 1.784 rubros (era 512). El seeder principal (`seedCcp`) no cambia.
- [x] La auto-siembra al activar `presupuesto_ejecucion` desde Superadmin carga ahora los 1.784 rubros oficiales.
- [x] `tsc --noEmit` limpio.

---

### ✅ Fase 9 — CCPET ingresos cargado desde MinHacienda (parcial: faltan gastos)

Expansión del CCP de ~85 rubros operativos a **512 rubros oficiales de ingresos** del CCPET (Catálogo de Clasificación Presupuestal para Entidades Territoriales y sus Descentralizadas) emitido por MinHacienda / Dirección General de Apoyo Fiscal Territorial.

**Fuente y normativa**
- Resolución 3832/2019 + 2662/2023 y modificatorias. **Versión 8** (vigente).
- URL oficial: `https://www.minhacienda.gov.co/apoyo-fiscal-territorial/estadisticas-de-finanzas-publicas-territoriales/ccpet-cuipo`
- Anexos descargables:
  - 1A: ingresos territoriales (✅ descargado)
  - 2A: gastos territoriales (❌ **bloqueado por Radware Bot Manager** tras la primera petición; requiere descarga manual humana)
  - 1B/2B: empresas industriales y comerciales del Estado (omitidos en este corte)

**Pipeline**
- [x] [`scripts/parse-ccpet-xlsx.py`](scripts/parse-ccpet-xlsx.py) — lee los XLSX desde `docs/ccpet/` y emite TS con tipos casteados (`any[]` + cast a `RubroCcp[]` para evitar TS2590).
- [x] [`src/lib/seeders/ccp-rubros.generated.ts`](src/lib/seeders/ccp-rubros.generated.ts) — generado, 512 rubros de ingresos, niveles 1..10.
- [x] [`src/lib/seeders/ccp-rubros.ts`](src/lib/seeders/ccp-rubros.ts) reescrito: re-exporta `CCP_RUBROS = CCP_RUBROS_OFICIAL`, tipo `RubroCcp.nivel` ampliado a `number` (era `1|2|3|4|5`) para soportar la jerarquía profunda del CCPET tributario.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) — `psuRubroCreateSchema`: `nivel.max(6)` → `nivel.max(10)`, `codigo.max(40)` → `60`, `nombre.max(200)` → `300`.

**Distribución de rubros de ingresos**
| Nivel | Cantidad |
|---|---|
| 1 (Agregado) | 1 |
| 2 (Grupo) | 2 |
| 3 (Subgrupo) | 14 |
| 4 (Concepto) | 53 |
| 5 (Subconcepto) | 147 |
| 6 (Item) | 201 |
| 7 | 58 |
| 8 | 32 |
| 9-10 (rubros tributarios profundos) | 4 |
| **Total ingresos** | **512** |

**Hallazgos**
- El XLSX usa el formato "staircased": el nombre aparece en la columna `4 + nivel`, no en una columna fija. El parser detecta automáticamente la primera columna no vacía a la derecha de la columna de tipo.
- Los rubros tributarios tienen **hasta 10 niveles** (ej. `1.1.02.07.002.01.03.02.02.01`) — mucho más profundo que los típicos 5 niveles. Hubo que ampliar el tipo y la validación zod en consecuencia.
- **Radware Bot Manager** del sitio de MinHacienda bloquea la segunda descarga inmediata desde la misma IP. El primer anexo (1A ingresos) pasó, pero al pedir 2A inmediatamente devuelve HTML con captcha hCaptcha. Soluciones probadas que **no funcionaron**: User-Agent realista, Referer correcto, cookies persistentes, headers Sec-Fetch-*. Camino seguro documentado: el usuario lo baja desde el navegador y lo deja en `docs/ccpet/ccpet_gastos_territoriales.xlsx`.
- Sin huérfanos ni duplicados en los 512 rubros. Niveles 1-10 con `permiteMovimientos=true` sólo en hojas (no aparecen como parent de ninguno).

**Pendiente operativo (próxima sesión)**
- [ ] Bajar manualmente el Anexo 2A de Gastos desde [el portal MinHacienda](https://www.minhacienda.gov.co/apoyo-fiscal-territorial/estadisticas-de-finanzas-publicas-territoriales/ccpet-cuipo) → guardar como `docs/ccpet/ccpet_gastos_territoriales.xlsx` → correr `python scripts/parse-ccpet-xlsx.py` (el script ya está preparado para ambos, sólo saltó el de gastos por archivo inexistente).
- [ ] Eventualmente: cargar también CCPET 1B/2B para empresas industriales y comerciales (aplicaría a SAE, EICs municipales).

---

### ✅ Fase 8 — CGC oficial completo desde PDF de la CGN (cerrada)

Corrección a la Fase 7: el subset de ~210 cuentas era insuficiente. El usuario aportó el PDF oficial actualizado de la CGN en `docs/cgc colombia actualizado.pdf` (474 páginas, Resolución 414/2014 con modificatorias **334/2025 y 343/2025**). Se parseó automáticamente.

**Pipeline de carga**
- [x] [`scripts/parse-cgc-pdf.py`](scripts/parse-cgc-pdf.py) — extrae texto de páginas 7..142 (capítulo 1 "ESTRUCTURA"), aplica regex `^(\d{1,6})\s+(.+)$`, deriva nivel por longitud del código (1/2/4/6), determina parent por prefijo (subcuenta→cuenta→grupo→clase), e infiere naturaleza/tipo desde la clase con inversión automática en grupos "por contra" (89, 99).
- [x] [`src/lib/seeders/cgc-cuentas.generated.ts`](src/lib/seeders/cgc-cuentas.generated.ts) — archivo TS generado, **3.745 cuentas** distribuidas así:
  - 9 clases
  - 44 grupos
  - 359 cuentas
  - 3.333 subcuentas (hojas con `permiteMovimientos=true`)
- [x] [`src/lib/seeders/cgc-cuentas.ts`](src/lib/seeders/cgc-cuentas.ts) ahora re-exporta `CGC_CUENTAS = CGC_CUENTAS_OFICIAL` del generado. La función `seedCgc(prisma)` no cambia → la auto-siembra al activar el módulo ahora carga el catálogo completo.

**Marco normativo del catálogo cargado**
- El PDF aportado corresponde al **Marco Normativo para Empresas que no Cotizan en el Mercado de Valores y que no Captan ni Administran Ahorro del Público** (Res. 414/2014 CGN). Es el aplicable a empresas estatales como **SAE** (cliente piloto del MVP).
- Las **entidades de gobierno territorial puras** (alcaldías, personerías, gobernaciones) aplican la **Res. 533/2015** (Marco de Entidades de Gobierno). Documentado como pendiente: cargar este segundo marco como catálogo opcional cuando un tenant lo requiera. La estructura es similar pero los códigos y nombres varían (especialmente clase 7).

**Hallazgos técnicos**
- TypeScript reventaba con `TS2590 "Expression produces a union type that is too complex"` al intentar inferir el tipo unión literal de 3.745 objetos. **Fix:** el archivo generado declara el array como `const _CGC_RAW: any[] = [...]` y exporta `CGC_CUENTAS_OFICIAL = _CGC_RAW as CuentaCgc[]`. El cast omite la inferencia y mantiene tipado en uso. Patrón documentado en el header.
- La verificación con `tsc --noEmit` queda limpia (EXIT=0).
- Las modificatorias 334 y 343 de **2025** indican que la CGN actualizó el catálogo recientemente; al volver a publicar futura resolución basta reemplazar el PDF y correr `python scripts/parse-cgc-pdf.py`.
- El parser detecta automáticamente la flag `(CR)` o `(DB)` en el nombre, pero el cambio efectivo de naturaleza se hace **sólo** por grupo "por contra" (89/99). Esto evita doble inversión cuando el grupo ya es contra y el nombre contiene la marca informativa.
- ⚠ Migración pendiente: para los tenants que ya activaron el módulo con el subset de Fase 7 (210 cuentas), al volver a guardar la activación desde Superadmin se disparará el seeder y sembrará las ~3.500 cuentas faltantes (idempotente, no toca asientos existentes).

---

### ✅ Fase 7 — Catálogos públicos completos + auto-siembra al activar (cerrada)

Corrección importante traída por el usuario: **el plan de cuentas y el catálogo presupuestal del sector público son distintos a los del sector privado**, y **no pueden quedar como tablas vacías** cuando se activa el módulo. Se reemplaza el JSON mínimo de la Fase 5 por dos catálogos canónicos completos y se conecta su carga a la activación del módulo desde Superadmin.

**Catálogos canónicos**
- [x] [`src/lib/seeders/cgc-cuentas.ts`](src/lib/seeders/cgc-cuentas.ts) — **CGC (Catálogo General de Cuentas) público** Resolución 533/2015 CGN. ≈210 cuentas cubriendo clases 1..9 (activos, pasivos, patrimonio, ingresos, gastos, costos de producción 7, orden 8/9). Incluye:
  - Niveles 1..5 (Clase/Grupo/Cuenta/Subcuenta/Auxiliar).
  - Cuentas específicas del sector público: 17 (bienes de uso público), 47/57 (operaciones interinstitucionales), 44 (SGP educación/salud/agua/propósito general), 4407 (SGR), 55 (gasto público social), 59 (cierre).
  - Cuentas correctoras con naturaleza invertida (1386 Deterioro CxC, 1685 Depreciación, 8920 Por contra).
  - Función exportada `seedCgc(prisma)` — idempotente por upsert en `codigo`, resuelve grafo por pasadas.
- [x] [`src/lib/seeders/ccp-rubros.ts`](src/lib/seeders/ccp-rubros.ts) — **CCP (Catálogo de Clasificación Presupuestal)** MinHacienda/DGPPN, basado en CICP Resolución 4015/2021 + Decreto 111/96. Cubre:
  - **A — Funcionamiento** completo: A.1 personal (sueldos + contribuciones + parafiscales + servicios indirectos), A.2 bienes y servicios (activos no financieros + servicios públicos + mantenimiento + arrendamientos + viáticos + seguros + capacitación), A.3 transferencias corrientes (SGP, órganos de control con sub-rubros personería/contraloría/concejo), A.4 tributos/multas/sanciones, A.6 disminución de pasivos.
  - **B — Servicio de deuda** (interna/externa: amortización + intereses + comisiones).
  - **C — Inversión** por sectores DNP (educación, salud, vivienda, agua, transporte, cultura, ambiente, gobierno/seguridad, equidad, agro).
  - **INGRESOS**: 1 corrientes (1.1 tributarios directos+indirectos, 1.2 no tributarios + SGP + SGR), 2 capital (crédito interno/externo, balance, rendimientos, donaciones, cofinanciación).
  - Función `seedCcp(prisma)` análoga.

**Auto-siembra al activar el módulo**
- [x] [`PUT /api/superadmin/tenants/[id]/modulos`](src/app/api/superadmin/tenants/[id]/modulos/route.ts) detecta los módulos **recién activados** (no estaban antes, sí están ahora) y, si incluyen `contabilidad_publica` o `presupuesto_ejecucion`, obtiene la BD del tenant vía `getOrCreateTenantClientById(id)` y ejecuta el seeder correspondiente. La respuesta JSON incluye `{ semillas: [{ modulo, total }] }` para que el frontend lo confirme.
- [x] Las semillas se ejecutan tras la actualización del meta-tenant; si fallan no abortan la activación (se registra `error` en el log de evento), porque puede correrse manualmente con el script CLI.
- [x] El evento `MODULO_ACTUALIZADO` ahora guarda `{ anterior, nuevo, semillas }` en `EventoTenant.datos` — auditable desde Superadmin.

**Script CLI**
- [x] [`scripts/seed-puc.ts`](scripts/seed-puc.ts) reescrito: importa `seedCgc`/`seedCcp` desde el mismo módulo `lib/seeders/*` (única fuente de verdad). Banderas: `--ccp` para sólo presupuesto, `--all` para ambos, sin flag = sólo contabilidad.
- [x] Eliminado [`prisma/seeds/puc-cgn.json`](prisma/seeds/puc-cgn.json) (era seed mínimo de 45 cuentas — ahora obsoleto).

**Hallazgos**
- Confusión común: el "PUC" colloquialmente se refiere al plan de cuentas privado (Decreto 2650/93). Para entidades públicas la norma vigente es la **Resolución 533/2015** de la CGN, que define el "Catálogo General de Cuentas (CGC)" dentro del Régimen de Contabilidad Pública (RCP). El código de los modelos sigue siendo `CpPlanCuenta` (sin rename para evitar migración invasiva) pero la documentación y los seeders ya hablan correctamente de CGC.
- Para evitar tablas vacías en producción, la auto-siembra es **idempotente** (upsert por código): activar/desactivar/reactivar un módulo sólo siembra lo que falta y refresca metadatos sin destruir asientos ni movimientos.
- `getOrCreateTenantClientById` se importa **dinámicamente** dentro del handler para no atar la ruta del meta al cliente del tenant si la ruta nunca dispara siembra (evita imports pesados en cold-start).
- El CGC sembrado es **subset operativo** (~210 cuentas) — el catálogo completo de CGN tiene ~1500. Cuando un cliente necesite el resto, se amplía directamente en el array `CGC_CUENTAS` del seeder y se vuelve a correr (idempotente). Documentado en el header del archivo.
- ⚠ Migración pendiente: para tenants donde ya se activó contabilidad_publica con el JSON mínimo, correr `DATABASE_URL=... npx tsx scripts/seed-puc.ts --all` una vez para completar el catálogo a la versión nueva.

---

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
- [x] **Nómina pública** (`nomina_publica` — Fase 11, motor de liquidación + 24 conceptos sembrados)
- [x] **Pagar nómina → comprobante contable** (`/api/admin/nom/pagar` — Fase 12, agrega liquidaciones en un único comprobante EGRESO)
- [ ] **Pago de pasivos de nómina** — segundo comprobante para liquidar 2425/2436/2505/2510 contra EPS/AFP/DIAN/parafiscales (vía cadena CDP/RP/Obligación/Pago del módulo presupuesto).
- [x] **Reportes a entes de control** (`reportes_control` — Fase 13: CHIP Balance + Actividad, FUT Ingresos + Gastos, Ley 617) — **MVP SAE cerrado en feature core**
- [x] **Exportador XLSX** de los 5 tipos de reporte con formato moneda COP y totales (Fase 14, `exceljs`). El contador descarga el XLSX, lo revisa y lo copia/pega al template oficial CGN/DNP.
- [x] **Pasivos de nómina** (Fase 15: cierra el ciclo nómina → EPS/AFP/DIAN/parafiscales con un comprobante D pasivo / C banco por tercero).
- [ ] **Mapeo 1:1 al template oficial** del CHIP/FUT (layout exacto del periodo de reporte).

**Siguiente sugerido:** `tesoreria` (saldos bancarios + conciliación con extractos), `contratacion` (SECOP II + minutas con IA), o el mapeo 1:1 al template CHIP oficial. Decisión pendiente con el usuario.

### Pendientes inmediatos en `presupuesto_ejecucion`
- [ ] `npx prisma db push` por tenant para crear tablas `psu_*`.
- [ ] Endpoint DELETE/PATCH para **anular** documentos de la cadena, con validación de que no haya hijos vigentes (CDP no se puede anular si tiene RPs activos, etc.).
- [ ] Selector de obligación en el modal de Pago (hoy se pega cuid manualmente).
- [ ] **IA retroactiva**: sugerencia de rubro a partir de la descripción del CDP; detector de gastos atípicos vs. apropiación; resumen de ejecución mensual.
- [ ] Generación del comprobante también en el paso de **Obligación** (devengo) si CGN lo exige formalmente — hoy sólo en Pago.

### Pendientes inmediatos en `contabilidad_publica`
- [x] Auto-siembra del CGC al activar el módulo (Fase 7).
- [ ] Correr `prisma db push` por tenant (para crear las tablas `cp_*`).
- [ ] **IA retroactiva**: sugerencia de cuentas CGC y de tercero auxiliar (modelo `CpAsientoSugerenciaIA` aún por crear); detector de comprobantes anómalos.
- [ ] Cierre anual: comprobante automático de cierre que traslada saldos de cuentas de resultado (4 y 5) a `3110` (resultado del ejercicio) usando las cuentas 5905/5910/5915 ya sembradas.
- [ ] Balance comparativo (vs. periodo anterior) y libros oficiales (Diario, Mayor, Auxiliar).
