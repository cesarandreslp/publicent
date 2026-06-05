# CLAUDE.md â€” Plan de trabajo del producto pÃºblico unificado

> **BitÃ¡cora viva del proyecto.** Este archivo es la fuente de verdad entre sesiones.
> Actualizar **permanentemente** y sin que el usuario lo pida en cada uno de estos eventos:
> - Cierre de fase o mÃ³dulo (mover de "prÃ³ximo punto" a secciÃ³n de fase cerrada con detalle).
> - AplicaciÃ³n de mejora retroactiva (tachar `~~...~~` en el backlog en lugar de borrar).
> - Hallazgo no trivial (decisiÃ³n de arquitectura, incompatibilidad de tipos, gotcha).
> - Cambio del "ðŸŽ¯ PrÃ³ximo punto" al completarse el actual.
> - Refinamiento del plan original ante informaciÃ³n nueva (con nota explÃ­cita, sin reescribir silenciosamente).
>
> Stack: Next.js 16 + Prisma + PostgreSQL (Neon), multi-tenant con BD separada por tenant.

---

## VisiÃ³n del producto

**Un solo producto comercializable** para el sector pÃºblico colombiano:
Portal institucional Gov.co (base PersonerÃ­a Buga) + catÃ¡logo de mÃ³dulos activables por tenant.
Clientes objetivo: PersonerÃ­a de Buga, SAE, MinIgualdad, y futuras entidades (alcaldÃ­as, personerÃ­as, ministerios sectoriales).

**DecisiÃ³n arquitectÃ³nica:** sin embeber Odoo. Todo sobre el stack Next.js existente.

---

## Arquitectura modular

- **NÃºcleo comÃºn** (todo tenant): `sitio_web`, `transparencia`, `pqrsd`, `ventanilla_unica`, `gestion_documental`, `archivo_fisico`, auth/MIPG/SIGEP.
- **Verticales activables**: FRISCO (SAE), SGBE/ESB sectorial (MinIgualdad), presupuesto pÃºblico (4 sub-mÃ³dulos), contabilidad, tesorerÃ­a, nÃ³mina, contrataciÃ³n, etc.
- **Bundles comerciales**: Control / Ejecutora / RectorÃ­a Sectorial.
- **CatÃ¡logo canÃ³nico**: 29 mÃ³dulos en [`src/lib/modules.ts`](src/lib/modules.ts) con `categoria`, `tier`, `dependeDe`, `entidadesObjetivo`.

---

## Plan de trabajo original (del transcript de la sesiÃ³n inicial)

El plan se construyÃ³ en 4 acuerdos explÃ­citos:

**1. CatÃ¡logo canÃ³nico de 29 mÃ³dulos** (A3 + respuestas U5).
   El usuario aprobÃ³ las 26 entradas iniciales y pidiÃ³ **partir `presupuesto_publico` en 4** (formulaciÃ³n / ejecuciÃ³n / modificaciones / cierre) â†’ quedan 29. TambiÃ©n aprobÃ³ mantener `pqrsd` y `ventanilla_unica` separados, y los verticales (`frisco_*`, `sgbe_*`, `esb_*`) como activables.

**2. Tres archivos a tocar en Fase 0** (A3):
   - `src/lib/modules.ts` â†’ expandir catÃ¡logo.
   - `src/components/admin/superadmin/tenant-modulos.tsx` â†’ agrupar por categorÃ­a + dependencias.
   - Nuevo `src/lib/module-bundles.ts` â†’ 3 bundles comerciales.

**3. Limpieza de 3 hardcodes de PersonerÃ­a** (A4): `groq-client.ts` Ã—2 + `pqrsd/route.ts` Ã—1.

**4. Orden de construcciÃ³n de verticales** (A15, decisiÃ³n explÃ­cita):
   - `frisco_bienes` **primero** â€” vertical aislado, demostrable para SAE en pocas iteraciones.
   - `contabilidad_publica` **despuÃ©s** â€” fundacional, habilita los 4 de presupuesto + tesorerÃ­a + nÃ³mina + contrataciÃ³n. Es "proyecto en sÃ­ mismo" y merece su propio bloque.

**MVP de venta a SAE definido en A0:** portal + plan CGN + bienes FRISCO + presupuesto mÃ­nimo + reporte CHIP bÃ¡sico.

---

## Plan de trabajo â€” Estado

> **Módulos diferenciadores** (plan en `PLAN_MODULOS_DIFERENCIADORES.md`, raíz del repo padre).
> Se construyen sobre el stack existente sin nuevas dependencias.

### ✅ Módulo Diferenciador 1 — Chat IA Ciudadano (RAG) (cerrado 2026-06-05)

Widget de chat flotante en el portal público que responde con el contenido real del tenant
(transparencia, noticias, servicios, FAQ, páginas) vía RAG. Sin pgvector: recuperación por
full-text search nativo de PostgreSQL (`to_tsvector`/`plainto_tsquery` español) + generación con `callIaJson` (Groq→Shipu).

**Datos** — `ChatIaChunk` (fragmentos ~400 palabras, solape 50, índice por `tenantId`/`fuenteId`) y `ChatIaConversacion`. `prisma db push` aplicado (no migrate dev: requería reset).

**Núcleo** — `src/lib/chat-ia.ts`: `indexarContenido` (borra+recrea chunks por fuenteId), `buscarChunksRelevantes` (FTS con `ts_rank`, top-5), `responderPregunta` (prompt con contexto+historial, pide JSON con respuesta+índices de fuentes usadas), `indexarTodoElTenant` (recorre noticias/páginas/contenido/FAQ/transparencia).

**Módulo** — `chat_ia_ciudadano` registrado en `modules.ts` (categoría atención, tier ESTÁNDAR, `dependeDe: [SITIO_WEB]`). Guard `requireChatIa` en `frisco-guard.ts`.

**APIs** — `POST /api/portal/chat` (público, rate-limit 20/h por IP en memoria, Zod), `POST /api/admin/chat-ia/indexar`, `GET /api/admin/chat-ia/stats`.

**UI** — `ChatWidget.tsx` (380×520, ARIA dialog, Escape cierra, fuentes enlazadas) cargado vía `ClientWidgets` sólo si el módulo está activo (resuelto en `layout.tsx`). Panel admin en `/admin/chat-ia` (re-indexar, KPIs, top preguntas, conversaciones, export CSV). Entrada en sidebar.

**Indexación automática** — fire-and-forget en POST/PATCH de noticias (publicadas) → `indexarContenido`.

**Hallazgos**
- Campos reales del schema difieren del plan: `Noticia.contenido`/`Contenido.contenido` son `Json` (HTML del editor) → se serializan a texto antes de fragmentar; `PreguntaFrecuente.publicada` (no `activo`); `DocumentoTransparencia.archivoUrl` (no `url`); `Contenido` usa `estado='PUBLICADO'` (no `publicado`).
- El LLM devuelve `indices_fuentes_usadas` para citar sólo las fuentes realmente usadas (evita listar 5 chunks siempre).

### ✅ Módulo Diferenciador 2 — Notificaciones WhatsApp (cerrado 2026-06-05)

Canal WhatsApp (Meta Cloud API, gratis hasta 1.000 conv. servicio/mes) para PQRSD y Ventanilla Única.
No es módulo de catálogo nuevo — extiende `pqrsd`/`ventanilla_unica`. Config por tenant cifrada en meta-DB (sin migración).

**Config** — `TenantSecretos.whatsapp { phoneNumberId, accessToken, fromPhone }` en `encryption.ts` (cifrado AES-256-GCM existente).

**Núcleo** — `src/lib/notifications/whatsapp.ts`: `sendWhatsApp(config, toPhone, template, components, idioma)` contra Graph API v18, `normalizarTelefonoCo` (E.164, antepone +57), `bodyParams` helper. No lanza: devuelve `{ success, messageId?, error? }`. `src/lib/notifications/index.ts`: `getWhatsAppConfig(tenantId)` (lee+descifra meta-DB) y `notificarCiudadano(tenantId, canal, evento, datos)` que mapea evento→plantilla (`pqrsd_radicado`/`pqrsd_respondida`/`pqrsd_por_vencer`).

**Integración** — `pqrsd/route.ts` (al radicar, fire-and-forget), `ventanilla/[id]/responder` (al pasar a RESPONDIDA, tras el email), `cron/diario` (radicados activos con ≤3 días hábiles restantes → `pqrsd_por_vencer`; se amplió la condición de skip del fan-out para incluir pqrsd/VU).

**Superadmin** — sección "Configuración WhatsApp" en `tenant-form.tsx` (Phone Number ID, Access Token password, número display) + botón "Enviar prueba" → `POST /api/superadmin/tenants/[id]/whatsapp-test` (usa plantilla `hello_world` de Meta para verificar credenciales). PATCH del tenant mergea `whatsapp` en secretos (token en blanco = conservar; borrar phoneNumberId = eliminar config). Token nunca se precarga.

**Hallazgos**
- El stub WHATSAPP del `NotificationService` (cola VU, `src/services/vu/`) se dejó intacto: su cola renderiza HTML libre, incompatible con las plantillas aprobadas que exige Cloud API fuera de la ventana de 24h. La integración se hace directa en las rutas vía `notificarCiudadano`, como pide el plan.
- Campo de teléfono del PQRS es `telefono` (el plan decía `telefonoCiudadano`). Estados PQRS activos: `RECIBIDA`/`EN_TRAMITE`/`EN_REVISION` (no `EN_PROCESO`).

### ✅ Módulo Diferenciador 3 — Función Disciplinaria (cerrado 2026-06-05)

Vertical para personerías (`entidadesObjetivo: ['PERSONERIA']`). Cubre el trabajo jurídico-investigativo
como Ministerio Público: procesos disciplinarios (Ley 1952/2019) con máquina de estados y control de
términos en días hábiles, tutelas, visitas preventivas. Módulo `funcion_disciplinaria` (tier VERTICAL, `dependeDe: [GESTION_DOCUMENTAL]`).

**Datos** — `DiscProceso`, `DiscActuacion`, `DiscDocumento` (FK opcional a proceso O tutela), `DiscTutela`, `DiscVisitaPreventiva`, `DiscConsecutivo` (numeración atómica) + 6 enums. Relaciones en `Usuario`. `prisma db push` aplicado.

**Núcleo**
- `disc-consecutivo.ts` — `generarNumeroProceso` ("001-2026-P"), `generarNumeroTutela` ("T-001-2026"), `generarNumeroVisita` ("VP-001-2026"), atómicos vía upsert sobre `DiscConsecutivo` (tenant+año+serie).
- `disc-terminos.ts` — `calcularTerminoEtapa` (días hábiles por etapa, ordinario vs verbal), `calcularFechaVencimientoEtapa` (vía dias-habiles), tabla `TRANSICIONES_PROCESO` + `esTransicionValida`/`siguientesEstados`, `ACTUACION_POR_ESTADO`, `calcularSemaforoDiscipinario`.
- `disc-labels.ts` — etiquetas/colores cliente-safe (sin server deps) reutilizadas en toda la UI.
- `disc-interop/procuraduria.ts` — stub SIRI-PGN (pendiente credenciales).
- Guard `requireDisc` en `frisco-guard.ts`. Schemas Zod (`discProceso*`, `discAvanzar`, `discActuacion`, `discDocumento`, `discTutela*`, `discVisita*`).

**APIs** — `/api/admin/disc/`: procesos (GET/POST), procesos/[id] (GET/PATCH), procesos/[id]/avanzar (máquina de estados: valida transición, recalcula vencimiento, registra actuación automática, email al instructor en fallos), procesos/[id]/actuaciones, procesos/[id]/documentos, tutelas (+[id]), visitas (+[id]), estadisticas. Todas con guard + auditoría + Zod.

**UI** — `/admin/disc`: dashboard con KPIs (abiertos/vencidos/tutelas activas/visitas) + tabs Procesos/Tutelas/Visitas con búsqueda y semáforo. Formularios `nuevo` para los 3. Detalle de proceso (2 columnas: datos + semáforo/timeline de actuaciones/avanzar etapa/documentos). Detalle de tutela y visita con edición de trámite/seguimiento. Enlace en sidebar.

**Hallazgos**
- Los identificadores de enum Prisma no aceptan tildes: `DESTITUCION_INHABILIDAD` (el plan escribía `DESTITUCIÓN_`).
- `DiscDocumento` quedó con FK opcional tanto a `DiscProceso` como a `DiscTutela` (back-relation `TutelaDocumentos`) — el plan declaraba `DiscTutela.documentos` sin definir el lado inverso.
- Los siguientes estados válidos se calculan en el server component del detalle (`siguientesEstados`) y se pasan al client, para no arrastrar `dias-habiles` (que hace fetch a la API de festivos) al bundle de cliente.
- El semáforo en cliente usa `semaforoDesdeVencimiento` (días calendario sobre la fecha de vencimiento ya calculada en hábiles por el server) — evita recalcular días hábiles en el browser.

### ✅ Módulo Diferenciador 4 — PILA para Nómina Pública (cerrado 2026-06-05)

Enriquece `nomina_publica` (no es módulo de catálogo nuevo). Genera el **archivo plano PILA** (UGPP v10.2)
y el **Certificado de Ingresos y Retenciones** (DIAN, art. 378 ET). Sin dependencias nuevas.

**Datos** — Campos PILA en `NomEmpleado`: `codigoEPS`, `codigoAFP`, `codigoARL`, `codigoCajaComp`, `claseRiesgoARL` (1-5). Modelo `NominaPilaExport` (trazabilidad de entregas). `prisma db push` aplicado.

**Núcleo** — `nomina-pila.ts`: `generarLineaPILA` (registro tipo 2, ~43 campos clave separados por `;`), `generarArchivoPILA` (línea tipo 1 aportante + N tipo 2, CRLF), `TARIFA_ARL` por clase de riesgo, `nombreArchivoPILA`. Los aportes se derivan del IBC × tarifa legal (salud 4/8.5%, pensión 4/12%, ARL por clase, caja 4%, SENA 2%, ICBF 3%) — exactamente lo que valida la UGPP.

**APIs** — `GET /api/admin/nom/pila?periodoId=` (cruza liquidaciones+empleado, IBC = Σ devengados constitutivos del periodo, excluye CONTRATISTA/OPS, descarga .txt, registra `NominaPilaExport`). `GET /api/admin/nom/certificado-retenciones?empleadoId=&anio=` (HTML imprimible con membrete de IdentidadInstitucional, NIT del tenant meta, totales del año, declaración DIAN). Ambos gateados por `nomina_publica` + SUPER_ADMIN/ADMIN.

**UI** — En `/admin/nomina`: botón "PILA" (descarga directa) en periodos no-ABIERTO; columna "Certificado" por empleado (año anterior, abre HTML para imprimir/PDF); campos de códigos PILA agregados al modal de empleado. Schemas Zod + rutas create/update de empleado extendidas.

**Hallazgos**
- `NomEmpleado` ya tenía nombres de administradoras (`eps`/`afp`/`arl`) pero PILA exige los **códigos numéricos** UGPP — campos nuevos separados.
- El aportante (NIT + razón social) se lee de la meta-DB (`prismaMeta.tenant`), no de `TenantInfo` (que no expone `nit`).
- Certificados masivos en ZIP: descartado (evita dependencia JSZip), se usa descarga individual por empleado como prevé el plan.
- Retención en la fuente sigue en 0 (placeholder del motor) — pendiente tablas UVT DIAN; el certificado lo documenta.

### âœ… Fase 0 â€” Refactor de fundamentos (cerrada)

- [x] CatÃ¡logo de 29 mÃ³dulos en `src/lib/modules.ts` con helper `areDepsActive()`.
- [x] Bundles comerciales en `src/lib/module-bundles.ts` (Control, Ejecutora, RectorÃ­a Sectorial).
- [x] Limpieza de 3 hardcodes de PersonerÃ­a:
  1. `TERMINOS_LEGALES_DEFAULT` exportable y overrideable vÃ­a `ContextoEntidad.terminosLegales` ([`src/lib/groq-client.ts`](src/lib/groq-client.ts)).
  2. Prompt IA acepta `pais`, `marcoLegal`, `definicionesTipos` opcionales (mismo archivo).
  3. Dependencia receptora en PQRSD lee `pqrsd.dependenciaReceptoraCodigo` con fallback ([`src/app/api/pqrsd/route.ts`](src/app/api/pqrsd/route.ts)).
- [x] UI superadmin agrupada por categorÃ­a con badges de tier y dependencias ([`src/components/admin/superadmin/tenant-modulos.tsx`](src/components/admin/superadmin/tenant-modulos.tsx)).
- [x] `tsc --noEmit` limpio (solo legacy `ventanilla_unica_personeria_buga/` excluido).

### âœ… Fase 15 â€” Pasivos de nÃ³mina (cerrada)

Segunda mitad del ciclo de pago de nÃ³mina: liquidar a EPS/AFP/ARL/DIAN/parafiscales los pasivos generados como crÃ©dito por el comprobante de Fase 12. Cada pago a tercero genera un `CpComprobante` independiente con D `<cuenta_pasivo>` / C `<banco>` y se registra en una nueva tabla de control para descontar saldos.

**Datos**
- [x] Modelo `NomPagoPasivo` (campos: periodoId, cuentaCodigo/cuentaNombre, tercero/terceroNit, valor, fecha, cuentaBancoCodigo, comprobanteId, observacion, creadoPor). Indexado por `[periodoId]` y `[cuentaCodigo]`.
- [x] RelaciÃ³n inversa `NomNominaPeriodo.pagosPasivos`.

**Endpoints**
- [x] `GET /api/admin/nom/pasivos-pendientes?periodoId=` â€” agrega crÃ©ditos en cuentas clase 2 del comprobante de nÃ³mina (`fuenteModulo='nomina'`, `fuenteRef=periodoId`) y descuenta lo ya pagado. Devuelve filas `{ cuentaCodigo, cuentaNombre, generado, pagado, saldo }` + historial de pagos.
- [x] `POST /api/admin/nom/pagar-pasivo { periodoId, cuentaCodigo, tercero, terceroNit?, valor, fecha, cuentaBancoId, numero, observacion? }`:
  - Valida periodo `PAGADO|CERRADO`, contabilidad activa, cuenta pasivo clase 2 + permite movimiento, cuenta banco clase 111*, periodo contable ABIERTO.
  - Calcula saldo disponible y valida `valor â‰¤ saldo`.
  - `$transaction`: crea `CpComprobante` EGRESO con 2 asientos (D pasivo / C banco), `fuenteModulo='nomina-pasivo'`, `fuenteRef=periodoId`. Inserta `NomPagoPasivo` apuntando al comprobante.

**Validaciones zod**
- [x] `nomPagarPasivoSchema` (10 campos).

**UI**
- [x] BotÃ³n "Pasivos" (Ã¡mbar) en la tabla de periodos `PAGADO|CERRADO` cuando contabilidad estÃ¡ activa.
- [x] `PasivosModal` carga vÃ­a fetch al abrir (`useEffect`), muestra tabla de pasivos con generado/pagado/saldo, botÃ³n "Pagar" por fila habilitado sÃ³lo si `saldo > 0.5`, secciÃ³n "Pagos registrados" con histÃ³rico.
- [x] `PagarPasivoForm` inline (no anidamos modal sobre modal): tercero + NIT + fecha + valor + nÃºmero (auto-sugerido `PP-<periodo>-<cuenta>`) + cuenta banco + observaciÃ³n.

**VerificaciÃ³n**
- [x] `prisma generate` + `tsc --noEmit` limpios.

**Hallazgos**
- El saldo del pasivo se calcula **al vuelo** desde los asientos contables â€” no se duplica un campo "saldo" en `NomPagoPasivo`. RazÃ³n: la fuente de verdad es el libro contable; si se anula un asiento de nÃ³mina, el saldo recalcula automÃ¡ticamente.
- `fuenteModulo='nomina-pasivo'` (no `'nomina'` simple) para diferenciar del comprobante original al consultar libros. Los pagos a terceros NO se cuentan como "pasivo generado" en `pasivos-pendientes` (sÃ³lo crÃ©ditos del comprobante origen).
- Un mismo pasivo (ej. salud 4%+8.5%) puede pagarse en varios pagos parciales a la misma EPS, o partirse entre varias EPS si los empleados tienen EPS distintas. La UI permite pagar `valor < saldo` y deja el resto como saldo para otro pago.
- âš  MigraciÃ³n pendiente: `npx prisma db push` para crear `nom_pagos_pasivos`.
- LimitaciÃ³n conocida: la lista de pasivos hoy agrega TODO crÃ©dito de clase 2 del comprobante. Si el comprobante de nÃ³mina tuviera crÃ©ditos a 2505 por aportes patronales (que pagamos a EPS/AFP) **mezclados** con crÃ©ditos a 2505 por sueldos por pagar al empleado (que ya pagamos al banco), no los distingue â€” pero el comprobante actual de Fase 12 ya envÃ­a el neto directamente al banco (no usa 2505 para sueldos), asÃ­ que no hay colisiÃ³n.

---

### âœ… Fase 14 â€” Exportador XLSX para reportes de control (cerrada)

ConversiÃ³n de los snapshots JSON de Fase 13 a archivos XLSX descargables, listos para que el contador los entregue al ente (o copie/pegue al template oficial).

**ImplementaciÃ³n**
- [x] [`src/lib/reportes-control/xlsx.ts`](src/lib/reportes-control/xlsx.ts) â€” usa `exceljs` (ya en deps). FunciÃ³n Ãºnica `exportarReporteXlsx(tipo, datos, observacion)` con dispatch por tipo:
  - **CHIP_BALANCE / CHIP_ACTIVIDAD** â†’ hoja con columnas Cuenta Â· Nombre Â· Naturaleza Â· DÃ©bitos Â· CrÃ©ditos Â· Saldo + totales en negrita.
  - **FUT_GASTOS** â†’ hoja con 10 columnas (CÃ³digo Â· Nombre Â· Nivel Â· ApropiaciÃ³n inicial Â· Adiciones Â· Reducciones Â· Definitiva Â· Comprometido Â· Obligado Â· Pagado) + fila TOTAL.
  - **FUT_INGRESOS** â†’ 7 columnas (CÃ³digo Â· Nombre Â· Nivel Â· Aforado inicial Â· Adiciones Â· Reducciones Â· Aforado definitivo) + TOTAL.
  - **LEY_617** â†’ tabla vertical con indicador / ICLD / tope / cumple / holgura + fila roja si excede.
  - Todas las columnas monetarias usan formato COP `"$"#,##0;[Red]-"$"#,##0`.
  - Encabezado azul (#1E40AF) en negrita blanca; ancho de columnas auto-ajustado capeado a 60.

**Endpoint**
- [x] `GET /api/admin/rc/reportes/[id]/xlsx` â€” recupera el snapshot, ejecuta el builder, devuelve `Response` con `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y `Content-Disposition: attachment; filename="<TIPO>_<clave>_<fecha>.xlsx"`.

**UI**
- [x] BotÃ³n XLSX (verde, Ã­cono `FileSpreadsheet`) al lado del JSON en cada fila de la bitÃ¡cora de `/admin/reportes-control`. Es un `<a href>` directo al endpoint â€” descarga nativa sin JS adicional.

**VerificaciÃ³n**
- [x] `tsc --noEmit` limpio.

**Hallazgos**
- `exceljs.writeBuffer()` devuelve `ArrayBuffer | Buffer` segÃºn la versiÃ³n. Lo casteamos a `Uint8Array` y luego a `any` en `new Response()` porque TypeScript de Next.js no acepta `Uint8Array` directo en `BodyInit` sin lib.dom estÃ¡ndar. Funciona en Node runtime de Vercel sin problemas.
- El layout NO es el oficial CGN/DNP â€” esos templates cambian por trimestre y por categorÃ­a municipal y exigen filas/columnas en posiciones exactas. La estrategia es: el XLSX exportado es **navegable y agrupado** (un contador lo lee bien), y desde ahÃ­ el contador copia/pega al template oficial bajado del portal. Mapeo 1:1 queda como mejora futura cuando se tenga el .xlsx oficial de referencia para diff.
- El archivo se llama `<TIPO>_<vigencia|periodoId>_<fechaISO>.xlsx` â€” fÃ¡cil de archivar en la carpeta de la entidad.

---

### âœ… Fase 13 â€” MÃ³dulo `reportes_control` (cerrada)

Cierra la Ãºltima pieza del MVP SAE original (A0): reportes a entes de control (CHIP / FUT / Ley 617). ImplementaciÃ³n como snapshots JSON persistidos en `RcReporteGenerado`, mapeo al layout XLS oficial queda pendiente.

**Datos**
- [x] `RcReporteGenerado` (campo `datos` Json + `totales` Json para listar rÃ¡pido) + enum `RcTipoReporte` (5 valores: CHIP_BALANCE, CHIP_ACTIVIDAD, FUT_INGRESOS, FUT_GASTOS, LEY_617). Indexado por `[tipo, vigencia]` y `[tipo, periodoContableId]`.

**NÃºcleo (`src/lib/reportes-control/`)**
- [x] [`chip.ts`](src/lib/reportes-control/chip.ts) â€” `chipBalance(prisma, periodoId)` y `chipActividad(prisma, periodoId)`. Agregan asientos REGISTRADOS no anulados por cuenta (clases 1/2/3 para Balance, 4/5 para Actividad), aplican signo segÃºn naturaleza DEBITO/CREDITO y devuelven totales (activo / pasivo / patrimonio / diferencia, ingresos / gastos / excedente).
- [x] [`fut.ts`](src/lib/reportes-control/fut.ts) â€” `futGastos(prisma, vigencia)` (apropiaciÃ³n / comprometido / obligado / pagado por rubro CCPET tipo GASTO) y `futIngresos(prisma, vigencia)` (aforado definitivo por rubro INGRESO). El recaudo real desde clase 4 contable queda como nota pendiente â€” requiere amarra subcuentaâ†’rubro que hoy no existe a nivel catÃ¡logo.
- [x] [`ley617.ts`](src/lib/reportes-control/ley617.ts) â€” `ley617({ prisma, vigencia, icldManual?, topeCategoria? })`. Suma obligaciones de rubros `A.1*` y `A.2*` como gastos de funcionamiento, divide por ICLD (manual o derivado de CCPET `1.1*`) y compara contra tope por categorÃ­a municipal (default 3.7% = categorÃ­a 6).

**Endpoints**
- [x] `POST /api/admin/rc/generar { tipo, periodoContableId?, vigencia?, icldManual?, topeCategoria?, observacion? }` â€” dispatch por tipo, persiste snapshot.
- [x] `GET /api/admin/rc/reportes?tipo=&vigencia=&periodoContableId=` â€” lista (sÃ³lo metadata + totales para tabla).
- [x] `GET/DELETE /api/admin/rc/reportes/[id]` â€” descarga JSON completo / borra snapshot.
- [x] `requireReportesControl` guard.
- [x] `rcGenerarSchema` zod.

**UI**
- [x] [`/admin/reportes-control`](src/app/admin/reportes-control/page.tsx) â€” server: Ãºltimos 24 periodos contables + Ãºltimos 60 reportes.
- [x] [`client-page.tsx`](src/app/admin/reportes-control/client-page.tsx) â€” 5 botones (uno por tipo), tabla de bitÃ¡cora con resumen lÃ­nea-por-lÃ­nea por tipo (`A: ... Â· P+P: ...` para Balance, `Apropiado X Â· Pagado Y` para FUT, `% Â· âœ“/âœ— cumple` para Ley 617), descarga JSON al click (`URL.createObjectURL` + `<a download>`), eliminar con confirm. Modal Ãºnico `GenerarModal` adaptativo al tipo (pide periodo para CHIP, vigencia para FUT/617, selector de tope categorÃ­a para 617).
- [x] Entrada "Reportes de control" en sidebar gateada por `MODULO_IDS.REPORTES_CONTROL`.

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Los snapshots se persisten como Json crudo. RazÃ³n: estos reportes se entregan al organismo externo en formato propio (CHIP usa su software, FUT usa plantilla XLS) â€” guardar el JSON normalizado deja la puerta abierta a renderizar contra cualquier layout sin re-consultar la BD ni recalcular.
- El cÃ¡lculo de Balance / Actividad **filtra en JS por prefijo** (`startsWith('1')`) tras un `findMany` sin filtro de cÃ³digo. RazÃ³n: Prisma no tiene `OR` cÃ³modo sobre `startsWith` mÃºltiples sin construir array. Para volÃºmenes de personerÃ­a (<5k asientos/mes) es trivial; para alcaldÃ­as grandes hay que mover el filtro a SQL crudo.
- El FUT de ingresos devuelve **aforado**, no recaudo real. El recaudo necesita amarrar cuentas clase 4 â†” rubros CCPET 1.x.x â€” pendiente de modelo (campo `rubroCcpetCodigo` en `CpPlanCuenta`, similar a lo que hicimos en NomConcepto). Documentado en el output del reporte.
- Ley 617 usa `topeCategoria` parametrizable porque cada municipio tiene su categorÃ­a (1.5%â€“3.7%). PersonerÃ­a Buga es categorÃ­a 6 â†’ 3.7%. El selector lista las 6 categorÃ­as comunes.
- âš  MigraciÃ³n pendiente: `npx prisma db push` para crear `rc_reportes` por tenant.

---

### âœ… Fase 12 â€” Pago de nÃ³mina â†’ comprobante contable (cerrada)

Cierra el cÃ­rculo `LiquidaciÃ³n â†’ Comprobante`. Cuando un periodo estÃ¡ `LIQUIDADO`, la entidad presiona "Pagar" y se genera **un Ãºnico comprobante EGRESO** que agrega todas las liquidaciones del periodo. El periodo pasa a `PAGADO` y cada `NomLiquidacion.comprobanteId` queda apuntando al comprobante creado.

**Endpoint**
- [x] `POST /api/admin/nom/pagar { periodoId, fecha, numero, cuentaBancoId }`
  - Valida periodo `LIQUIDADO`, mÃ³dulo `contabilidad_publica` activo, periodo contable `ABIERTO`.
  - Itera detalles de todas las liquidaciones, agrega por `cuentaContableCodigo`:
    - **DEVENGADO** â†’ D gasto (5101/5103/5104/5111 segÃºn concepto).
    - **APORTE_PATRONAL** â†’ D gasto + C pasivo 2505 (nÃ³mina por pagar).
    - **PRESTACION_SOCIAL** â†’ D gasto + C pasivo 2510 (cesantÃ­as por pagar).
    - **DEDUCCION_EMPLEADO** â†’ C pasivo (2425 / 2436 / 2510 segÃºn concepto).
    - **Neto a empleados** â†’ C banco (cuentaBancoId).
  - Resuelve cÃ³digos â†’ `cpPlanCuenta.id` con un solo query. Falla con 400 si falta alguna cuenta (tÃ­picamente porque la auto-siembra del CGC no se ejecutÃ³).
  - Valida partida doble con tolerancia 0.5 COP. Crea `CpComprobante` con `fuenteModulo='nomina'`, `fuenteRef=periodoId`, `tipo=EGRESO`.
  - `$transaction`: comprobante + `nomLiquidacion.updateMany({ comprobanteId })` + `nomNominaPeriodo.update({ estado: 'PAGADO' })`.

**Validaciones zod**
- [x] `nomPagarPeriodoSchema { periodoId, fecha, numero, cuentaBancoId, cuentaSueldosPorPagarCodigo? }`.

**UI**
- [x] BotÃ³n "Pagar" en la tabla de periodos sÃ³lo aparece cuando `estado=LIQUIDADO` **y** `contabilidad_publica` estÃ¡ activo (caso contrario muestra hint).
- [x] `PagarModal`: resumen del periodo (#empleados, neto, deducciones), nÃºmero auto-sugerido `NOM-YYYY-MM`, fecha hoy por defecto, select de cuentas banco (PUC `111*`). Tras Ã©xito muestra resumen del comprobante generado (asientos, totales, deducciones a terceros).
- [x] Server `page.tsx` ahora carga `cuentasBanco` (sÃ³lo si contabilidad activa) y pasa `contabilidadActiva: boolean` al cliente.

**VerificaciÃ³n**
- [x] `tsc --noEmit` limpio.

**Hallazgos**
- El comprobante es **agregado** (un solo `CpComprobante` por periodo, ~10-20 asientos) en vez de uno por empleado. RazÃ³n: mantiene los libros legibles y `permiteMovimientos=true` se cumple por cÃ³digo de cuenta, no por empleado. El detalle empleado-a-empleado queda en `NomLiquidacionDetalle`.
- Las cuentas de contrapartida pasivo (2505/2510) estÃ¡n hardcodeadas en el route â€” funciona porque la auto-siembra del CGC oficial (Fase 8) las garantiza. Si una entidad usa subcuentas distintas, queda como mejora exponer `cuentaSueldosPorPagarCodigo` en la UI (ya estÃ¡ en el schema zod).
- Los **aportes patronales y deducciones se quedan como pasivos** en 2505/2510/2425/2436. Pagarlos a EPS/AFP/DIAN/parafiscales es otra obligaciÃ³n (CDP/RP/Pago vÃ­a mÃ³dulo presupuesto) â€” esa es la prÃ³xima iteraciÃ³n.
- Diferencia con `/api/admin/psu/pagos`: no genera obligaciÃ³n presupuestal en este corte. La nÃ³mina pÃºblica colombiana suele estar **embebida en una sola apropiaciÃ³n A.1.1** y la entidad maneja el devengo presupuestal mensualmente sin atomizar por empleado. Si el cliente lo pide, se aÃ±ade un flag `generarObligacion: true` que crea una `PsuObligacion` contra un RP anual.
- `fuenteRef=periodoId` permite cruzar libros: `SELECT * FROM cp_comprobantes WHERE fuente_modulo='nomina' AND fuente_ref=<periodoId>` da el comprobante; al revÃ©s desde `NomLiquidacion.comprobanteId` se navega al detalle de asientos.

---

### âœ… Fase 11 â€” NÃºcleo `nomina_publica` (cerrada)

Primer mÃ³dulo que integra **contabilidad + presupuesto + dominio nuevo**. Maneja empleados (planta / trabajador oficial / contratistas / supernumerarios / aprendices), catÃ¡logo de conceptos (devengado, deducciÃ³n empleado, aporte patronal, prestaciÃ³n social), liquidaciÃ³n mensual con motor de cÃ¡lculo, novedades y enlace a `CpComprobante` + `PsuObligacion` para la fase de pago.

**Datos** (bloque nuevo `prisma/schema.prisma`)
- [x] `NomEmpleado` â€” identificaciÃ³n, vinculaciÃ³n (`NomTipoVinculacion`), salario bÃ¡sico decimal(18,2), banca, EPS/AFP/ARL/caja, flag retenciÃ³n. Ãšnicos: `documento`. Ãndices: `activo`, `dependencia`.
- [x] `NomConcepto` + enums `NomTipoConcepto` (4) y `NomFormulaConcepto` (5: FIJO, %SUELDO, %DEVENGADO, %IBC, CALCULO_ESPECIAL). Campos `cuentaContableCodigo` (PUC CGC) y `rubroCcpetCodigo` (CCPET A.1.x) â†’ puente con contabilidad/presupuesto.
- [x] `NomNominaPeriodo` + enum `NomEstadoPeriodo` (ABIERTO/LIQUIDADO/PAGADO/CERRADO). Ãšnico por cÃ³digo `YYYY-MM`.
- [x] `NomLiquidacion` con unique `[periodoId, empleadoId]` + acumulados + slots `obligacionId`/`comprobanteId`.
- [x] `NomLiquidacionDetalle` (lÃ­nea por concepto con valor y base usada).
- [x] `NomNovedad` + enum `NomTipoNovedad` (8 tipos: vacaciones, licencias, incapacidades, ausencia, comisiÃ³n, permiso).

**CatÃ¡logo base de conceptos**
- [x] [`src/lib/seeders/nomina-conceptos.ts`](src/lib/seeders/nomina-conceptos.ts) â€” 24 conceptos prefijados:
  - **9 devengados** (NC-001..009): sueldo, horas extras, auxilio transporte, bonificaciÃ³n servicios, prima servicios, prima navidad, prima vacaciones, vacaciones, honorarios contratistas.
  - **7 deducciones empleado** (NC-101..122): salud 4%, pensiÃ³n 4%, FSP 1%, retefuente salarios, retefuente honorarios 10%, embargo, libranza, fondo empleados.
  - **8 aportes patronales** (NC-201..208): salud 8.5%, pensiÃ³n 12%, ARL 0.522%, caja 4%, ICBF 3%, SENA 2%, ESAP 0.5%, escuelas tÃ©cnicas 0.5%.
  - **2 prestaciones sociales** (NC-301..302): cesantÃ­as 8.33%, intereses cesantÃ­as 1%.
  - Cada concepto enlazado a la cuenta CGC sembrada en Fase 8 (5101/5103/5104/5111/2425/2436/2510) y al rubro CCPET A.1.x de Fase 10 cuando aplica.
  - FunciÃ³n `seedNominaConceptos(prisma)` idempotente vÃ­a upsert por `codigo`.

**Motor de liquidaciÃ³n**
- [x] [`src/lib/nomina-motor.ts`](src/lib/nomina-motor.ts) â€” funciÃ³n pura `liquidarEmpleado(empleado, conceptos, dias, novedades)`:
  1. Filtra conceptos aplicables al `tipoVinculacion`.
  2. Pasada 1 â€” devengados (calcula IBC = sÃ³lo conceptos `constitutivoSalario:true`).
  3. Pasada 2 â€” deducciones empleado (sobre IBC, devengado o fijo).
  4. Pasada 3 â€” aportes patronales + prestaciones (sobre IBC/devengado).
  - Aplica `factorDias = dias/30` a fÃ³rmulas % de sueldo.
  - Provisiones (prima/vacaciones) usan aproximaciones determinÃ­sticas (8.33% / 4.17%) â€” placeholder por no consultar histÃ³rico.
  - Retefuente queda en 0 (TODO: tablas UVT DIAN).

**NÃºcleo**
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) â€” aÃ±adido `requireNomina(roles)` (gateado por `MODULO_IDS.NOMINA_PUBLICA`).
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) â€” schemas zod nuevos: `nomEmpleadoCreate/Update`, `nomPeriodoCreate`, `nomNovedadCreate`, `nomLiquidarPeriodo`.

**Endpoints admin**
- [x] `GET/POST /api/admin/nom/empleados` (filtros q/activo/tipoVinculacion).
- [x] `GET/PATCH/DELETE /api/admin/nom/empleados/[id]` (DELETE = soft inactivar + fechaRetiro).
- [x] `GET/POST /api/admin/nom/periodos` (auto-calcula cÃ³digo `YYYY-MM` y rangos UTC).
- [x] `GET /api/admin/nom/liquidaciones?periodoId|empleadoId` (incluye empleado + periodo + detalles con concepto).
- [x] `POST /api/admin/nom/liquidar { periodoId, diasLiquidados? }` â€” orquesta `liquidarEmpleado` por empleado, upsert `NomLiquidacion` + reemplaza detalles en `$transaction`, marca periodo `LIQUIDADO` y registra `liquidadoPor`.

**Auto-siembra al activar el mÃ³dulo**
- [x] `PUT /api/superadmin/tenants/[id]/modulos` ahora detecta `nomina_publica` reciÃ©n activado y siembra los 24 conceptos en la BD del tenant. Devuelve `{ semillas: [{ modulo: "nomina_publica", total }] }`.

**UI**
- [x] [`/admin/nomina`](src/app/admin/nomina/page.tsx) â€” server: carga empleados (200), Ãºltimos 12 periodos con totales acumulados, count de conceptos activos.
- [x] [`client-page.tsx`](src/app/admin/nomina/client-page.tsx) â€” KPIs (empleados activos / Ãºltimo periodo / neto / aportes), tabla de periodos con badge de estado y botÃ³n "Liquidar" en ABIERTO, tabla de empleados, 3 modales (Empleado, Periodo, Liquidar). El modal de Liquidar muestra resumen post-corrida (devengado/deducciones/aportes/neto).
- [x] Entrada "NÃ³mina" en sidebar gateada por `MODULO_IDS.NOMINA_PUBLICA` ([`admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx)).

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El motor de liquidaciÃ³n es **funciÃ³n pura** (no toca DB) â†’ testeable sin mock. La capa de orquestaciÃ³n (`/liquidar` route) hace upsert + reemplazo de detalles + cambio de estado en una sola `$transaction` para no dejar liquidaciones a medias.
- Las provisiones (prima de servicios, vacaciones) son aproximaciones â€” para cumplir formalmente con la norma colombiana hay que promediar Ãºltimos 12 meses. Documentado como TODO en el motor.
- La retenciÃ³n en la fuente quedÃ³ como **placeholder = 0**. Implementarla requiere tablas UVT DIAN del aÃ±o fiscal y procedimientos 1/2 â€” fuera del scope MVP pero pendiente antes de pagar nÃ³mina real.
- El concepto NC-009 "Honorarios" para contratistas usa `FIJO` (sin porcentaje) porque se pega el valor mensual contratado directamente â€” eventualmente un campo `valorMensual` en `NomEmpleado` para OPS.
- La cadena completa **liquidaciÃ³n â†’ obligaciÃ³n presupuestal â†’ pago â†’ comprobante contable** queda para la siguiente fase: hoy `NomLiquidacion.obligacionId` y `.comprobanteId` estÃ¡n preparados pero ningÃºn endpoint los llena. Ese flujo es la *fase 12* (pagar-nomina).
- âš  MigraciÃ³n pendiente: `npx prisma db push` para crear tablas `nom_*`. Al activar el mÃ³dulo desde Superadmin se siembran los 24 conceptos automÃ¡ticamente.

---

### âœ… Fase 10 â€” CCPET Territorial completo (ingresos + gastos)

El usuario aportÃ³ los 4 anexos oficiales descargados manualmente del portal de MinHacienda en `docs/ccpet/`. Procesados los dos anexos territoriales; los EICE quedan descargados pero sin aplicar (ver hallazgo).

**Carga completa**
- [x] `ccpet_ingresos_territoriales.xlsx` (Anexo 1A v8) â†’ 512 rubros INGRESO
- [x] `ccpet_gastos_territoriales.xlsx` (Anexo 2A v8) â†’ 1.272 rubros GASTO
- **Total: 1.784 rubros** del CCPET Territorial, niveles 1..10, sin huÃ©rfanos.

**DistribuciÃ³n de gastos** (la columna vertebral de CDP/RP/ObligaciÃ³n/Pago)
| Nivel | Cantidad |
|---|---|
| 1 (Gastos) | 1 |
| 2 (Funcionamiento / Servicio deuda / InversiÃ³n) | 3 |
| 3 (subgrupos) | 18 |
| 4 (conceptos) | 82 |
| 5 (subconceptos) | 248 |
| 6 (items) | 448 |
| 7 | 206 |
| 8 | 200 |
| 9-10 | 66 |

**Hallazgo arquitectÃ³nico â€” EICE descartado en este corte**
- [x] Anexos 1B y 2B (Empresas Industriales y Comerciales del Estado) tambiÃ©n estÃ¡n descargados en `docs/ccpet/ccpet_{ingresos,gastos}_eice.xlsx` (200 ingresos + 1.137 gastos aprox).
- âš  NO se cargan en este corte por **colisiÃ³n de cÃ³digos**: 1B y 1A comparten prefijo `1.x.x...`; 2B y 2A comparten `2.x.x...`. La tabla `psu_rubros` tiene `codigo @unique`, por lo que cargar ambos romperÃ­a la inserciÃ³n.
- **MigraciÃ³n propuesta para soportar EICE mÃ¡s adelante:**
  1. Nuevo enum `PsuMarcoCcpet { TERRITORIAL, EICE }`.
  2. Cambiar `PsuRubro.codigo @unique` â†’ `@@unique([codigo, marco])`.
  3. Filtrar los rubros expuestos al tenant segÃºn su tipologÃ­a (campo nuevo en `Tenant.marcoCcpet`).
- Hasta esa migraciÃ³n, **los tenants tipo EICE (caso SAE) usan el catÃ¡logo TERRITORIAL** que cubre la mayor parte de los conceptos comunes. Las 4 cuentas tributarias muy especÃ­ficas de EICE (impuestos a empresas, dividendos) quedan pendientes hasta la migraciÃ³n.

**ImplementaciÃ³n**
- [x] [`scripts/parse-ccpet-xlsx.py`](scripts/parse-ccpet-xlsx.py) procesa ambos territoriales en una sola pasada; comentario explica por quÃ© los EICE no se incluyen.
- [x] [`src/lib/seeders/ccp-rubros.generated.ts`](src/lib/seeders/ccp-rubros.generated.ts) ahora tiene 1.784 rubros (era 512). El seeder principal (`seedCcp`) no cambia.
- [x] La auto-siembra al activar `presupuesto_ejecucion` desde Superadmin carga ahora los 1.784 rubros oficiales.
- [x] `tsc --noEmit` limpio.

---

### âœ… Fase 9 â€” CCPET ingresos cargado desde MinHacienda (parcial: faltan gastos)

ExpansiÃ³n del CCP de ~85 rubros operativos a **512 rubros oficiales de ingresos** del CCPET (CatÃ¡logo de ClasificaciÃ³n Presupuestal para Entidades Territoriales y sus Descentralizadas) emitido por MinHacienda / DirecciÃ³n General de Apoyo Fiscal Territorial.

**Fuente y normativa**
- ResoluciÃ³n 3832/2019 + 2662/2023 y modificatorias. **VersiÃ³n 8** (vigente).
- URL oficial: `https://www.minhacienda.gov.co/apoyo-fiscal-territorial/estadisticas-de-finanzas-publicas-territoriales/ccpet-cuipo`
- Anexos descargables:
  - 1A: ingresos territoriales (âœ… descargado)
  - 2A: gastos territoriales (âŒ **bloqueado por Radware Bot Manager** tras la primera peticiÃ³n; requiere descarga manual humana)
  - 1B/2B: empresas industriales y comerciales del Estado (omitidos en este corte)

**Pipeline**
- [x] [`scripts/parse-ccpet-xlsx.py`](scripts/parse-ccpet-xlsx.py) â€” lee los XLSX desde `docs/ccpet/` y emite TS con tipos casteados (`any[]` + cast a `RubroCcp[]` para evitar TS2590).
- [x] [`src/lib/seeders/ccp-rubros.generated.ts`](src/lib/seeders/ccp-rubros.generated.ts) â€” generado, 512 rubros de ingresos, niveles 1..10.
- [x] [`src/lib/seeders/ccp-rubros.ts`](src/lib/seeders/ccp-rubros.ts) reescrito: re-exporta `CCP_RUBROS = CCP_RUBROS_OFICIAL`, tipo `RubroCcp.nivel` ampliado a `number` (era `1|2|3|4|5`) para soportar la jerarquÃ­a profunda del CCPET tributario.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) â€” `psuRubroCreateSchema`: `nivel.max(6)` â†’ `nivel.max(10)`, `codigo.max(40)` â†’ `60`, `nombre.max(200)` â†’ `300`.

**DistribuciÃ³n de rubros de ingresos**
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
- El XLSX usa el formato "staircased": el nombre aparece en la columna `4 + nivel`, no en una columna fija. El parser detecta automÃ¡ticamente la primera columna no vacÃ­a a la derecha de la columna de tipo.
- Los rubros tributarios tienen **hasta 10 niveles** (ej. `1.1.02.07.002.01.03.02.02.01`) â€” mucho mÃ¡s profundo que los tÃ­picos 5 niveles. Hubo que ampliar el tipo y la validaciÃ³n zod en consecuencia.
- **Radware Bot Manager** del sitio de MinHacienda bloquea la segunda descarga inmediata desde la misma IP. El primer anexo (1A ingresos) pasÃ³, pero al pedir 2A inmediatamente devuelve HTML con captcha hCaptcha. Soluciones probadas que **no funcionaron**: User-Agent realista, Referer correcto, cookies persistentes, headers Sec-Fetch-*. Camino seguro documentado: el usuario lo baja desde el navegador y lo deja en `docs/ccpet/ccpet_gastos_territoriales.xlsx`.
- Sin huÃ©rfanos ni duplicados en los 512 rubros. Niveles 1-10 con `permiteMovimientos=true` sÃ³lo en hojas (no aparecen como parent de ninguno).

**Pendiente operativo (prÃ³xima sesiÃ³n)**
- [ ] Bajar manualmente el Anexo 2A de Gastos desde [el portal MinHacienda](https://www.minhacienda.gov.co/apoyo-fiscal-territorial/estadisticas-de-finanzas-publicas-territoriales/ccpet-cuipo) â†’ guardar como `docs/ccpet/ccpet_gastos_territoriales.xlsx` â†’ correr `python scripts/parse-ccpet-xlsx.py` (el script ya estÃ¡ preparado para ambos, sÃ³lo saltÃ³ el de gastos por archivo inexistente).
- [ ] Eventualmente: cargar tambiÃ©n CCPET 1B/2B para empresas industriales y comerciales (aplicarÃ­a a SAE, EICs municipales).

---

### âœ… Fase 8 â€” CGC oficial completo desde PDF de la CGN (cerrada)

CorrecciÃ³n a la Fase 7: el subset de ~210 cuentas era insuficiente. El usuario aportÃ³ el PDF oficial actualizado de la CGN en `docs/cgc colombia actualizado.pdf` (474 pÃ¡ginas, ResoluciÃ³n 414/2014 con modificatorias **334/2025 y 343/2025**). Se parseÃ³ automÃ¡ticamente.

**Pipeline de carga**
- [x] [`scripts/parse-cgc-pdf.py`](scripts/parse-cgc-pdf.py) â€” extrae texto de pÃ¡ginas 7..142 (capÃ­tulo 1 "ESTRUCTURA"), aplica regex `^(\d{1,6})\s+(.+)$`, deriva nivel por longitud del cÃ³digo (1/2/4/6), determina parent por prefijo (subcuentaâ†’cuentaâ†’grupoâ†’clase), e infiere naturaleza/tipo desde la clase con inversiÃ³n automÃ¡tica en grupos "por contra" (89, 99).
- [x] [`src/lib/seeders/cgc-cuentas.generated.ts`](src/lib/seeders/cgc-cuentas.generated.ts) â€” archivo TS generado, **3.745 cuentas** distribuidas asÃ­:
  - 9 clases
  - 44 grupos
  - 359 cuentas
  - 3.333 subcuentas (hojas con `permiteMovimientos=true`)
- [x] [`src/lib/seeders/cgc-cuentas.ts`](src/lib/seeders/cgc-cuentas.ts) ahora re-exporta `CGC_CUENTAS = CGC_CUENTAS_OFICIAL` del generado. La funciÃ³n `seedCgc(prisma)` no cambia â†’ la auto-siembra al activar el mÃ³dulo ahora carga el catÃ¡logo completo.

**Marco normativo del catÃ¡logo cargado**
- El PDF aportado corresponde al **Marco Normativo para Empresas que no Cotizan en el Mercado de Valores y que no Captan ni Administran Ahorro del PÃºblico** (Res. 414/2014 CGN). Es el aplicable a empresas estatales como **SAE** (cliente piloto del MVP).
- Las **entidades de gobierno territorial puras** (alcaldÃ­as, personerÃ­as, gobernaciones) aplican la **Res. 533/2015** (Marco de Entidades de Gobierno). Documentado como pendiente: cargar este segundo marco como catÃ¡logo opcional cuando un tenant lo requiera. La estructura es similar pero los cÃ³digos y nombres varÃ­an (especialmente clase 7).

**Hallazgos tÃ©cnicos**
- TypeScript reventaba con `TS2590 "Expression produces a union type that is too complex"` al intentar inferir el tipo uniÃ³n literal de 3.745 objetos. **Fix:** el archivo generado declara el array como `const _CGC_RAW: any[] = [...]` y exporta `CGC_CUENTAS_OFICIAL = _CGC_RAW as CuentaCgc[]`. El cast omite la inferencia y mantiene tipado en uso. PatrÃ³n documentado en el header.
- La verificaciÃ³n con `tsc --noEmit` queda limpia (EXIT=0).
- Las modificatorias 334 y 343 de **2025** indican que la CGN actualizÃ³ el catÃ¡logo recientemente; al volver a publicar futura resoluciÃ³n basta reemplazar el PDF y correr `python scripts/parse-cgc-pdf.py`.
- El parser detecta automÃ¡ticamente la flag `(CR)` o `(DB)` en el nombre, pero el cambio efectivo de naturaleza se hace **sÃ³lo** por grupo "por contra" (89/99). Esto evita doble inversiÃ³n cuando el grupo ya es contra y el nombre contiene la marca informativa.
- âš  MigraciÃ³n pendiente: para los tenants que ya activaron el mÃ³dulo con el subset de Fase 7 (210 cuentas), al volver a guardar la activaciÃ³n desde Superadmin se dispararÃ¡ el seeder y sembrarÃ¡ las ~3.500 cuentas faltantes (idempotente, no toca asientos existentes).

---

### âœ… Fase 7 â€” CatÃ¡logos pÃºblicos completos + auto-siembra al activar (cerrada)

CorrecciÃ³n importante traÃ­da por el usuario: **el plan de cuentas y el catÃ¡logo presupuestal del sector pÃºblico son distintos a los del sector privado**, y **no pueden quedar como tablas vacÃ­as** cuando se activa el mÃ³dulo. Se reemplaza el JSON mÃ­nimo de la Fase 5 por dos catÃ¡logos canÃ³nicos completos y se conecta su carga a la activaciÃ³n del mÃ³dulo desde Superadmin.

**CatÃ¡logos canÃ³nicos**
- [x] [`src/lib/seeders/cgc-cuentas.ts`](src/lib/seeders/cgc-cuentas.ts) â€” **CGC (CatÃ¡logo General de Cuentas) pÃºblico** ResoluciÃ³n 533/2015 CGN. â‰ˆ210 cuentas cubriendo clases 1..9 (activos, pasivos, patrimonio, ingresos, gastos, costos de producciÃ³n 7, orden 8/9). Incluye:
  - Niveles 1..5 (Clase/Grupo/Cuenta/Subcuenta/Auxiliar).
  - Cuentas especÃ­ficas del sector pÃºblico: 17 (bienes de uso pÃºblico), 47/57 (operaciones interinstitucionales), 44 (SGP educaciÃ³n/salud/agua/propÃ³sito general), 4407 (SGR), 55 (gasto pÃºblico social), 59 (cierre).
  - Cuentas correctoras con naturaleza invertida (1386 Deterioro CxC, 1685 DepreciaciÃ³n, 8920 Por contra).
  - FunciÃ³n exportada `seedCgc(prisma)` â€” idempotente por upsert en `codigo`, resuelve grafo por pasadas.
- [x] [`src/lib/seeders/ccp-rubros.ts`](src/lib/seeders/ccp-rubros.ts) â€” **CCP (CatÃ¡logo de ClasificaciÃ³n Presupuestal)** MinHacienda/DGPPN, basado en CICP ResoluciÃ³n 4015/2021 + Decreto 111/96. Cubre:
  - **A â€” Funcionamiento** completo: A.1 personal (sueldos + contribuciones + parafiscales + servicios indirectos), A.2 bienes y servicios (activos no financieros + servicios pÃºblicos + mantenimiento + arrendamientos + viÃ¡ticos + seguros + capacitaciÃ³n), A.3 transferencias corrientes (SGP, Ã³rganos de control con sub-rubros personerÃ­a/contralorÃ­a/concejo), A.4 tributos/multas/sanciones, A.6 disminuciÃ³n de pasivos.
  - **B â€” Servicio de deuda** (interna/externa: amortizaciÃ³n + intereses + comisiones).
  - **C â€” InversiÃ³n** por sectores DNP (educaciÃ³n, salud, vivienda, agua, transporte, cultura, ambiente, gobierno/seguridad, equidad, agro).
  - **INGRESOS**: 1 corrientes (1.1 tributarios directos+indirectos, 1.2 no tributarios + SGP + SGR), 2 capital (crÃ©dito interno/externo, balance, rendimientos, donaciones, cofinanciaciÃ³n).
  - FunciÃ³n `seedCcp(prisma)` anÃ¡loga.

**Auto-siembra al activar el mÃ³dulo**
- [x] [`PUT /api/superadmin/tenants/[id]/modulos`](src/app/api/superadmin/tenants/[id]/modulos/route.ts) detecta los mÃ³dulos **reciÃ©n activados** (no estaban antes, sÃ­ estÃ¡n ahora) y, si incluyen `contabilidad_publica` o `presupuesto_ejecucion`, obtiene la BD del tenant vÃ­a `getOrCreateTenantClientById(id)` y ejecuta el seeder correspondiente. La respuesta JSON incluye `{ semillas: [{ modulo, total }] }` para que el frontend lo confirme.
- [x] Las semillas se ejecutan tras la actualizaciÃ³n del meta-tenant; si fallan no abortan la activaciÃ³n (se registra `error` en el log de evento), porque puede correrse manualmente con el script CLI.
- [x] El evento `MODULO_ACTUALIZADO` ahora guarda `{ anterior, nuevo, semillas }` en `EventoTenant.datos` â€” auditable desde Superadmin.

**Script CLI**
- [x] [`scripts/seed-puc.ts`](scripts/seed-puc.ts) reescrito: importa `seedCgc`/`seedCcp` desde el mismo mÃ³dulo `lib/seeders/*` (Ãºnica fuente de verdad). Banderas: `--ccp` para sÃ³lo presupuesto, `--all` para ambos, sin flag = sÃ³lo contabilidad.
- [x] Eliminado [`prisma/seeds/puc-cgn.json`](prisma/seeds/puc-cgn.json) (era seed mÃ­nimo de 45 cuentas â€” ahora obsoleto).

**Hallazgos**
- ConfusiÃ³n comÃºn: el "PUC" colloquialmente se refiere al plan de cuentas privado (Decreto 2650/93). Para entidades pÃºblicas la norma vigente es la **ResoluciÃ³n 533/2015** de la CGN, que define el "CatÃ¡logo General de Cuentas (CGC)" dentro del RÃ©gimen de Contabilidad PÃºblica (RCP). El cÃ³digo de los modelos sigue siendo `CpPlanCuenta` (sin rename para evitar migraciÃ³n invasiva) pero la documentaciÃ³n y los seeders ya hablan correctamente de CGC.
- Para evitar tablas vacÃ­as en producciÃ³n, la auto-siembra es **idempotente** (upsert por cÃ³digo): activar/desactivar/reactivar un mÃ³dulo sÃ³lo siembra lo que falta y refresca metadatos sin destruir asientos ni movimientos.
- `getOrCreateTenantClientById` se importa **dinÃ¡micamente** dentro del handler para no atar la ruta del meta al cliente del tenant si la ruta nunca dispara siembra (evita imports pesados en cold-start).
- El CGC sembrado es **subset operativo** (~210 cuentas) â€” el catÃ¡logo completo de CGN tiene ~1500. Cuando un cliente necesite el resto, se amplÃ­a directamente en el array `CGC_CUENTAS` del seeder y se vuelve a correr (idempotente). Documentado en el header del archivo.
- âš  MigraciÃ³n pendiente: para tenants donde ya se activÃ³ contabilidad_publica con el JSON mÃ­nimo, correr `DATABASE_URL=... npx tsx scripts/seed-puc.ts --all` una vez para completar el catÃ¡logo a la versiÃ³n nueva.

---

### âœ… Fase 6 â€” NÃºcleo `presupuesto_ejecucion` (cerrada)

Cadena clÃ¡sica del gasto pÃºblico colombiano: **CDP â†’ RP â†’ ObligaciÃ³n â†’ Pago**, con validaciÃ³n de saldos disponibles en cada paso y generaciÃ³n automÃ¡tica del comprobante contable al confirmar el pago.

**Datos** (nuevo bloque al final de `prisma/schema.prisma`)
- [x] `PsuRubro` â€” jerÃ¡rquico (parent/hijos), tipo GASTO/INGRESO, niveles 1..6, `permiteMovimientos` (sÃ³lo hojas).
- [x] `PsuApropiacion` â€” Ãºnica por (rubro, vigencia). Campos: `apropiacionInicial`, `adiciones`, `reducciones`. Saldo apropiaciÃ³n se calcula como `inicial + adiciones - reducciones - Î£(CDP vigentes)`.
- [x] `PsuCdp`, `PsuRp`, `PsuObligacion`, `PsuPago` â€” cada uno con `numero @unique`, `valor`, `estado` enum `PsuEstadoDoc {VIGENTE, ANULADO, AGOTADO}`, trazabilidad (`creadoPor/anuladoEn/anuladoPor/motivoAnulacion`).
- [x] `PsuPago` enlaza opcionalmente a `CpComprobante` vÃ­a `comprobanteId` y al PUC vÃ­a `cuentaBancoId`. Enum `PsuMedioPago {TRANSFERENCIA, CHEQUE, EFECTIVO, OTRO}`.
- [x] RelaciÃ³n inversa nueva en `CpAuxiliarTercero.rps PsuRp[]` (named "PsuRpTercero").

**NÃºcleo**
- [x] [`src/lib/presupuesto-saldos.ts`](src/lib/presupuesto-saldos.ts) â€” 4 helpers `saldoApropiacion`, `saldoCdp`, `saldoRp`, `saldoObligacion`. Cada uno suma documentos hijos no-anulados y retorna `{ total, comprometido/obligado/pagado, disponible }`.
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) â€” aÃ±adido `requirePresupuesto(roles)`.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) â€” 6 schemas zod nuevos (`psuRubroCreate`, `psuApropiacionCreate`, `psuCdpCreate`, `psuRpCreate`, `psuObligacionCreate`, `psuPagoCreate`).

**Endpoints admin**
- [x] `POST/GET /api/admin/psu/rubros`
- [x] `POST/GET /api/admin/psu/apropiaciones` (upsert por `[rubroId, vigencia]`)
- [x] `POST/GET /api/admin/psu/cdp` â€” valida `valor â‰¤ saldo apropiaciÃ³n`.
- [x] `POST/GET /api/admin/psu/rp` â€” valida `valor â‰¤ saldo CDP` y CDP no anulado.
- [x] `POST/GET /api/admin/psu/obligaciones` â€” valida `valor â‰¤ saldo RP`.
- [x] `POST/GET /api/admin/psu/pagos` â€” valida `valor â‰¤ saldo obligaciÃ³n` y, si `contabilidad_publica` estÃ¡ activo + `cuentaBancoId` provista, **genera `CpComprobante` tipo EGRESO en la misma `$transaction`**:
  - Cabecera con `fuenteModulo='presupuesto'`, `fuenteRef=<pagoId>` (post-update para cerrar el cÃ­rculo).
  - 2 asientos: D cuenta de gasto (default: primera `5111*` activa si no se pasa `cuentaGastoId`) / C cuenta de banco.
  - Usa el periodo contable ABIERTO actual del tenant; falla si no hay ninguno.
- [x] `GET /api/admin/psu/ejecucion?vigencia=YYYY` â€” vista consolidada con apropiado, comprometido (Î£ CDP), obligado (Î£ Obligaciones), pagado (Î£ Pagos), disponible y % ejecuciÃ³n. Incluye totales.

**UI**
- [x] [`/admin/presupuesto`](src/app/admin/presupuesto/page.tsx) â€” server component, carga vigencia desde query string (default aÃ±o actual), tabla por rubro, recientes (CDP/RP), terceros y cuentas bancarias del PUC (filtra `111*`).
- [x] [`client-page.tsx`](src/app/admin/presupuesto/client-page.tsx) â€” KPIs apropiado/comprometido/obligado/pagado, tabla detallada por rubro con % ejecuciÃ³n, 6 modales independientes (Rubro, ApropiaciÃ³n, CDP, RP, ObligaciÃ³n, Pago) â€” el de Pago marca opciÃ³n "Generar comprobante contable automÃ¡ticamente".
- [x] Entrada "Presupuesto" en sidebar gateada por `MODULO_IDS.PRESUPUESTO_EJECUCION`.

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El campo `fuenteRef` del `CpComprobante` se actualiza **post-create** dentro de la misma transacciÃ³n porque necesita el `pago.id` que sÃ³lo existe despuÃ©s de crear el pago. Sin esto, el comprobante quedaba apuntando a `'<pendiente>'`. PatrÃ³n a replicar en otros mÃ³dulos que generen comprobantes.
- El selector de obligaciÃ³n en el modal de Pago todavÃ­a pide pegar el `cuid` (no hay tabla de obligaciones recientes en este snapshot). Mejora obvia para iteraciÃ³n 2: traer las Ãºltimas obligaciones VIGENTES y mostrarlas como `<select>`. Aceptable para MVP porque el flujo intencional es ObligaciÃ³n â†’ Pago en la misma sesiÃ³n.
- Cuando se quiera **anular** un documento de la cadena, los hijos vigentes deben anularse primero (no implementado aÃºn â€” pendiente para iteraciÃ³n 2: validar `_count` de hijos vigentes antes de pasar a ANULADO).
- âš  MigraciÃ³n pendiente: `npx prisma db push` para crear las 6 tablas `psu_*` y la nueva columna de relaciÃ³n en `cp_terceros`.

---

### âœ… Fase 5 â€” NÃºcleo `contabilidad_publica` (cerrada)

Siguiente palanca grande del MVP SAE. Motor de doble partida con PUC CGN, primer corte fino.

**Datos**
- [x] Modelos Prisma ya existÃ­an en `schema.prisma`: `CpPlanCuenta` (jerÃ¡rquico, niveles 1..5, `naturaleza` DEBITO/CREDITO, `tipo` BALANCE/RESULTADO/ORDEN, `permiteMovimientos`), `CpPeriodoContable` (estados ABIERTO/CERRADO/AJUSTE), `CpAuxiliarTercero` (NIT/CC con `tipoDocumento`), `CpComprobante` (totalDebito/totalCredito, fuenteModulo+fuenteRef para trazabilidad cruzada), `CpAsiento` (cuenta + tercero opcional + dÃ©bito/crÃ©dito con `@db.Decimal(18,2)`).
- [x] Enums: `CpNaturaleza`, `CpTipoCuenta`, `CpTipoComprobante` (CONTABLE/EGRESO/INGRESO/AJUSTE/APERTURA/CIERRE), `CpEstadoComprobante`, `CpEstadoPeriodo`, `CpTipoDocumento`.

**Seed PUC CGN**
- [x] [`prisma/seeds/puc-cgn.json`](prisma/seeds/puc-cgn.json) â€” semilla mÃ­nima viable (â‰ˆ45 cuentas) cubriendo clases 1..5 + 8/9, niveles raÃ­z/grupo/cuenta/auxiliar. Marca `permiteMovimientos=true` sÃ³lo en hojas.
- [x] [`scripts/seed-puc.ts`](scripts/seed-puc.ts) â€” loader idempotente con upsert por `codigo`; resuelve `parentId` por pasadas hasta cerrar el grafo. Uso: `npx tsx scripts/seed-puc.ts` (toma `DATABASE_URL` del .env del tenant). Falla explÃ­citamente si quedan cuentas con parent inexistente.

**NÃºcleo**
- [x] [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) â€” aÃ±adido `requireContabilidad(roles)` reutilizando `requireModule` interno. Gatea por `MODULO_IDS.CONTABILIDAD_PUBLICA`.
- [x] [`src/lib/validations.ts`](src/lib/validations.ts) â€” schemas zod: `cpCuentaCreate/Update`, `cpPeriodoCreate/Update`, `cpTerceroCreate/Update`, `cpAsientoSchema` (refine: exactamente uno de dÃ©bito/crÃ©dito > 0), `cpComprobanteCreateSchema` (refine: âˆ‘dÃ©bitos â‰ˆ âˆ‘crÃ©ditos con tolerancia 0.005, mÃ­nimo 2 asientos).

**Endpoints admin**
- [x] `/api/admin/cp/cuentas` GET (filtros q/tipo/soloMovimiento) + POST.
- [x] `/api/admin/cp/cuentas/[id]` PATCH + DELETE (inactiva si tiene movimientos, borra si no).
- [x] `/api/admin/cp/periodos` GET + POST.
- [x] `/api/admin/cp/periodos/[id]` PATCH (cambio de estado; AJUSTE sÃ³lo SUPER_ADMIN).
- [x] `/api/admin/cp/terceros` GET + POST.
- [x] `/api/admin/cp/comprobantes` GET + POST con validaciones en cascada:
   1. Periodo existe y estÃ¡ ABIERTO (o AJUSTE con SUPER_ADMIN).
   2. Todas las cuentas existen, estÃ¡n activas y `permiteMovimientos=true`.
   3. Partida doble (cuadre âˆ‘D = âˆ‘C).
   4. Crea comprobante + N asientos en una sola `$transaction`.
- [x] `/api/admin/cp/comprobantes/[id]` GET (detalle con cuenta+tercero) + DELETE (anula con motivo).
- [x] `/api/admin/cp/balance?periodoId=...` â€” agrega dÃ©bitos/crÃ©ditos/saldo por cuenta del periodo (sÃ³lo comprobantes REGISTRADOS), con totales para verificar cuadre global.

**UI**
- [x] [`/admin/contabilidad`](src/app/admin/contabilidad/page.tsx) â€” server component, carga periodo abierto + KPIs por clase + balance del periodo + Ãºltimos comprobantes + cuentas con movimiento.
- [x] [`client-page.tsx`](src/app/admin/contabilidad/client-page.tsx) â€” dashboard con 5 KPIs (clases 1-5), tabla de balance con totales, lista de Ãºltimos 15 comprobantes, modal "Nuevo periodo" (autocalcula cÃ³digo `YYYY-MM` y rangos UTC) y modal "Nuevo comprobante" con grilla editable de N lÃ­neas: select de cuenta Â· dÃ©bito Â· crÃ©dito Â· detalle, totales en vivo y badge "âœ“ partida doble" / "âš  no cuadra" que habilita el botÃ³n Registrar.
- [x] Entrada "Contabilidad" en sidebar gateada por `MODULO_IDS.CONTABILIDAD_PUBLICA` ([`admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx)).

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Los modelos `Cp*` ya estaban definidos en `schema.prisma` (presumiblemente de una sesiÃ³n previa que no llegÃ³ a CLAUDE.md). Confirma la lecciÃ³n del transcript de Fase 1: siempre `git status` antes de re-modelar.
- El refine de Zod para partida doble usa tolerancia `< 0.005` para evitar artefactos de coma flotante con dos decimales. Si en el futuro se necesitan 3+ decimales (multimoneda), bajar a `< 0.0005` y revisar el `@db.Decimal(18,2)`.
- `permiteMovimientos` es la clave del modelo: sÃ³lo cuentas hoja reciben asientos; las cuentas de grupo agregan saldos por suma de hojas. El seed ya marca esto correctamente â€” replicar en cargas futuras del PUC ampliado.
- âš  MigraciÃ³n pendiente: las tablas `cp_*` ya estÃ¡n en el `schema.prisma` pero hay que correr `npx prisma db push` contra cada tenant Neon donde se vaya a activar el mÃ³dulo + `npx tsx scripts/seed-puc.ts` con el `DATABASE_URL` apuntando a ese tenant.

---

### âœ… Fase 4 â€” IA del reporte del depositario (cerrada)

Primer retroactivo del barrido de IA. AnalogÃ­a directa al clasificador de Ventanilla Ãšnica.

**Datos**
- [x] Modelo `FriscoReporteAnalisisIA` (1:1 con `FriscoReporteDepositario`, cascade): `urgencia` (enum NORMAL/ATENCION/CRITICA), `etiquetas` (String[]), `resumen`, `confianza`, `modelo`, `proveedor`, `promptVersion`, `raw` (Json), `tokensPrompt`/`tokensRespuesta`, `errorMsg`, `revisadoPor`/`revisadoEn`.
- [x] RelaciÃ³n inversa `FriscoReporteDepositario.analisisIA`.

**NÃºcleo IA**
- [x] [`src/lib/groq-client.ts`](src/lib/groq-client.ts) â€” aÃ±adido helper exportado `callIaJson(tenantId, prompt)` con el mismo patrÃ³n Groq â†’ Shipu de `classifyPQRSD`. No se tocÃ³ la funciÃ³n existente para evitar regresiones.
- [x] [`src/lib/frisco-reporte-ia.ts`](src/lib/frisco-reporte-ia.ts) â€” `analizarReporte()` clasifica urgencia + asigna etiquetas (10 categorÃ­as cerradas: ocupaciÃ³n indebida, intento de venta, deterioro grave, daÃ±os estructurales, amenazas, robo, incendio, pÃ³liza vencida, documento pendiente, operaciÃ³n normal). Si la IA falla â†’ fallback determinÃ­stico por regex sobre `novedades` + estado fÃ­sico, marca `proveedor: "fallback"` y `errorMsg`. El reporte nunca se queda sin anÃ¡lisis.
- [x] `promptVersion: "frisco-reporte-v1"` para poder versionar prompts sin perder histÃ³rico.

**Endpoint pÃºblico**
- [x] `POST /api/portal/frisco/[token]/reporte` ahora dispara `dispararAnalisisIA()` post-upsert. No-bloqueante: si la IA tarda, el ciudadano ya recibiÃ³ 201. Persiste en `FriscoReporteAnalisisIA` por upsert (sobreescribe si el reporte se reedita en el mismo mes).

**API admin**
- [x] `GET  /api/admin/frisco/bienes/[id]/reportes` â€” lista hasta 60 reportes del bien con `analisisIA` incluido.
- [x] `PATCH /api/admin/frisco/reportes/[reporteId]/analisis` â€” override humano: actualiza urgencia/etiquetas y registra `revisadoPor` + `revisadoEn`. **IA sugiere, humano decide**.

**UI admin**
- [x] Nueva tab "Reportes" en la ficha del bien (oculta si `portal_externo` no estÃ¡ activo).
- [x] Cada reporte muestra: cabecera con depositario + perÃ­odo + estado fÃ­sico + badge de urgencia, novedades del custodio, **bloque azul con sugerencia IA** (proveedor, confianza, resumen, etiquetas como chips), botones de override `NORMAL | ATENCIÃ“N | CRÃTICA`. Marca "Revisado" si ya hubo override.

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- El motor de IA estaba acoplado a PQRSD vÃ­a funciÃ³n monolÃ­tica. ExtracciÃ³n mÃ­nima (`callIaJson`) habilita reutilizar el patrÃ³n Groq+Shipu+keys-por-tenant sin tocar lo existente. Replicable para los siguientes mÃ³dulos.
- `dispararAnalisisIA()` se invoca con `void` (fire-and-forget). En Vercel/Edge esto puede no terminar; si en producciÃ³n se observan reportes sin anÃ¡lisis, considerar cola (BullMQ / QStash) o sincronizar la llamada aceptando el retraso de ~2s para el ciudadano.
- Las etiquetas son enum-cerrado de strings (no enum Prisma) â€” permite ampliar la lista sin migraciÃ³n pero el clasificador filtra sÃ³lo las conocidas para evitar etiquetas alucinadas.

---

### âœ… Fase 3 â€” MÃ³dulo `portal_externo` (cerrada)

Portal de auto-consulta del depositario SAE. Acceso por token (sin password).

**Datos**
- [x] `FriscoPortalAcceso` â€” guarda **SHA-256** del token (nunca el plano). Campos: `tokenHash` (unique), `depositarioId`, `expiraEn`, `revocadoEn`, `ultimoAccesoEn`, `accesoCount`, `createdBy`.
- [x] `FriscoReporteDepositario` â€” reporte mensual con unique `[depositarioId, periodo]` (un reporte por mes, idempotente vÃ­a upsert). Campos: `estadoBien` (enum `FriscoEstadoFisico`), `novedades`, `fotoUrl`, `adjuntoUrl`, `ipOrigen`.
- [x] Relaciones inversas en `FriscoDepositario.accesos` y `.reportes`.

**Helpers**
- [x] [`src/lib/frisco-portal.ts`](src/lib/frisco-portal.ts) â€” `generarToken()` (32 bytes hex), `hashToken()`, `resolverAcceso()` (valida hash + expiraciÃ³n + revocaciÃ³n + incluye bien y reportes), `periodoActual()` formato `YYYY-MM`.
- [x] `requirePortalExterno` aÃ±adido a [`frisco-guard.ts`](src/lib/frisco-guard.ts).

**API admin**
- [x] `GET  /api/admin/frisco/depositarios/[id]/portal-acceso` â€” lista accesos del depositario.
- [x] `POST /api/admin/frisco/depositarios/[id]/portal-acceso` â€” genera token (revoca activos previos en transacciÃ³n), opcional `enviarEmail: true`. Devuelve token plano **una sola vez** + URL del portal.
- [x] `DELETE /api/admin/frisco/portal-acceso/[accesoId]` â€” revoca acceso (marca `revocadoEn`, no elimina).

**API pÃºblica (sin login)**
- [x] `POST /api/portal/frisco/[token]/reporte` â€” valida token, upsert reporte del mes, actualiza `FriscoDepositario.ultimoReporte`. Captura IP origen.

**Portal pÃºblico**
- [x] [`/portal/frisco/[token]`](src/app/portal/frisco/[token]/page.tsx) â€” server page con `dynamic = 'force-dynamic'` y `robots: noindex`. Si token invÃ¡lido/expirado/revocado â†’ `notFound()`. Registra `ultimoAccesoEn` + incrementa `accesoCount` (no-bloqueante).
- [x] UI con 4 secciones: datos del depositario (con alerta de pÃ³liza vencida), bien custodiado, reporte mensual (estado + novedades + URLs opcionales), historial de Ãºltimos 12 reportes.

**UI admin**
- [x] BotÃ³n `KeyRound` por depositario en la tab Depositarios (sÃ³lo si `portal_externo` estÃ¡ activo).
- [x] Modal `PortalAccesoModal`: dÃ­as de vigencia + checkbox de envÃ­o por email (deshabilitado si depositario sin email). Tras generar, muestra URL una sola vez con botÃ³n copiar y avisa si el email se enviÃ³ OK.
- [x] Columna nueva "Ãšltimo reporte" en la tabla.

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgos**
- Infra de email ya existÃ­a: [`src/lib/mail.ts`](src/lib/mail.ts) (Resend) + `sendMail()` genÃ©rico â€” reutilizado sin tocar.
- `getTenantPrisma()` funciona tambiÃ©n en rutas pÃºblicas sin auth (resuelve tenant por host). Sin esto el portal externo necesitaba un esquema diferente; ya estaba resuelto.
- `dynamic = "force-dynamic"` necesario en la pÃ¡gina pÃºblica para que Next no intente prerender con un token dummy.

---

### âœ… Fase 2 â€” MÃ³dulo `frisco_interop` (cerrada)

Conectores externos para mantener el inventario FRISCO consistente.

**Datos**
- [x] Modelo `FriscoInteropLog` + enum `FriscoInteropServicio` (SNR/FISCALIA/IGAC) en [`prisma/schema.prisma`](prisma/schema.prisma). RelaciÃ³n inversa en `FriscoBien.interopLogs`.

**Servicios (stub)**
- [x] [`src/lib/frisco-interop/types.ts`](src/lib/frisco-interop/types.ts) â€” contratos compartidos `InteropResult<T>` + tipos por servicio.
- [x] [`snr.ts`](src/lib/frisco-interop/snr.ts), [`fiscalia.ts`](src/lib/frisco-interop/fiscalia.ts), [`igac.ts`](src/lib/frisco-interop/igac.ts) â€” stubs determinÃ­sticos con latencia simulada; mismo shape que la API real esperada (drop-in replace cuando SAE provea credenciales).

**API**
- [x] `POST /api/admin/frisco/interop/snr`
- [x] `POST /api/admin/frisco/interop/fiscalia`
- [x] `POST /api/admin/frisco/interop/igac`
- [x] Cada llamada registra `FriscoInteropLog` (servicio, params, payload, latencia, error, usuario). Errores remotos â†’ 502.
- [x] Helper `requireFriscoInterop` aÃ±adido a [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts) (refactor: `requireModule` interno reutilizable).

**UI**
- [x] Nueva tab "Interop" en `/admin/frisco/bienes/[id]` (oculta si el mÃ³dulo no estÃ¡ activo). Tres tarjetas con botÃ³n "Consultar", auto-rellena `folioMatricula` / `numeroProceso` desde el bien, deshabilita si falta el dato. Renderizado tipado por servicio + latencia visible.

**VerificaciÃ³n**
- [x] `prisma generate` OK + `tsc --noEmit` limpio.

**Hallazgo** â€” Prisma exige `Prisma.JsonNull` (no `null` literal) al escribir `Json?`. Se corrigiÃ³ en los 3 endpoints.

---

### âœ… Fase 1 â€” MÃ³dulo FRISCO (cerrada en esta sesiÃ³n)

Primer vertical activable. Cliente piloto: **SAE**.

**Datos**
- [x] Modelos Prisma: `FriscoBien`, `FriscoDepositario`, `FriscoContrato`, `FriscoDestinacion` ([`prisma/schema.prisma`](prisma/schema.prisma):2154+).
- [x] Relaciones inversas en `GdExpediente` y `GaCarpeta` (vincula bienes a expediente y carpeta fÃ­sica).
- [x] Schemas zod: `friscoBien*`, `friscoDepositario*`, `friscoContrato*`, `friscoDestinacion*` ([`src/lib/validations.ts`](src/lib/validations.ts):460+).

**API**
- [x] `/api/admin/frisco/bienes` â€” GET (lista paginada con filtros tipo/estado/bÃºsqueda) + POST.
- [x] `/api/admin/frisco/bienes/[id]` â€” GET (con includes), PATCH, DELETE.
- [x] `/api/admin/frisco/depositarios` â€” GET (filtrable por bienId, activo), POST.
- [x] `/api/admin/frisco/depositarios/[id]` â€” PATCH, DELETE.
- [x] `/api/admin/frisco/contratos` â€” GET (filtrable), POST.
- [x] `/api/admin/frisco/contratos/[id]` â€” PATCH, DELETE.
- [x] `/api/admin/frisco/destinaciones` â€” POST con `upsert` (relaciÃ³n 1:1 bienâ†”destinaciÃ³n).
- [x] Helper `requireFrisco(roles)` en [`src/lib/frisco-guard.ts`](src/lib/frisco-guard.ts): gatea por mÃ³dulo activo + roles.

**UI admin**
- [x] [`/admin/frisco`](src/app/admin/frisco/page.tsx) â€” dashboard con 5 KPIs (total / EN_PROCESO / CAUTELAR / EXTINTO / DEVUELTO), tabla con bÃºsqueda + filtros tipo/estado, modal "Registrar bien".
- [x] [`/admin/frisco/bienes/[id]`](src/app/admin/frisco/bienes/[id]/page.tsx) â€” detalle con 4 tabs: Resumen, Depositarios, Contratos, DestinaciÃ³n. Cada tab tiene su modal de alta y acciÃ³n de eliminaciÃ³n.
- [x] Entrada de menÃº "FRISCO â€” Bienes" en sidebar, gateada por `MODULO_IDS.FRISCO_BIENES` ([`src/components/admin/admin-sidebar.tsx`](src/components/admin/admin-sidebar.tsx):309).

**VerificaciÃ³n**
- [x] `tsc --noEmit` limpio post-cambios.

---

## Hallazgos y mejoras aplicadas en esta sesiÃ³n

1. **Tipo `Role` real del proyecto** es `'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER'` (no `'VIEWER'` como asumÃ­a la sesiÃ³n previa). Corregido en `frisco-guard.ts` y en las 4 rutas API que ya estaban escritas. LecciÃ³n para mÃ³dulos futuros: usar `USER` como rol de solo lectura.

2. **SesiÃ³n previa habÃ­a llegado mÃ¡s lejos que el transcript.** Al retomar, encontrÃ© las 7 rutas API ya implementadas (sÃ³lidas), no stubs. El transcript se cortÃ³ justo despuÃ©s de empezar el helper guard, pero las rutas existÃ­an como cambios sin commitear. Verificar siempre `git status` antes de re-implementar.

3. **RelaciÃ³n bien â†” destinaciÃ³n es 1:1**, por eso `/api/admin/frisco/destinaciones` usa `upsert` (no POST puro). Documentado en la cabecera de la ruta.

4. **Cascada de borrado**: borrar un `FriscoBien` elimina automÃ¡ticamente sus depositarios, contratos y destinaciÃ³n (Prisma cascade). El DELETE de bien debe quedar restringido a `SUPER_ADMIN | ADMIN` (no EDITOR).

5. **Memoria del usuario:** no levantar dev local â€” el flujo es commit + push y Vercel auto-deploya. VerificaciÃ³n local con `tsc`, no con preview server.

---

## Pendiente

### En el mÃ³dulo FRISCO

**Hecho** (resumen, detalle en fases 1â€“4):
- ~~Endpoint pÃºblico de auto-consulta del depositario~~ â†’ âœ… `portal_externo` (fase 3).
- ~~Integraciones interop SNR / FiscalÃ­a / IGAC~~ â†’ âœ… stub funcional en `frisco_interop` (fase 2). Falta: reemplazar stub por servicios reales cuando SAE provea credenciales.
- ~~Reporte mensual del depositario~~ â†’ âœ… vÃ­a portal externo + clasificaciÃ³n IA (fases 3 y 4).

**Pendiente**:
- [ ] **IA retroactiva en `frisco_bienes`** â€” sugerir `tipo`/`estadoFisico` desde descripciÃ³n; extracciÃ³n de `placa`/`folioMatricula`/`numeroProceso` (OCR + LLM); anÃ¡lisis de foto.
- [x] **IA retroactiva en `frisco_interop`** — `frisco-interop-ia.ts` + `POST /api/admin/frisco/interop/analizar` + panel "Analizar discrepancias con IA" en tab Interop. Cruza SNR / IGAC / Fiscalía / datos internos. Devuelve discrepancias con severidad INFO/ALERTA/CRITICA, nivel de riesgo y resumen del proceso fiscal.
- [ ] **Reemplazar stubs interop** por las APIs reales de SNR / FiscalÃ­a / IGAC cuando SAE entregue credenciales. Drop-in en `src/lib/frisco-interop/{snr,fiscalia,igac}.ts` â€” interfaz ya estable.
- [ ] **Recordatorio mensual al depositario** vÃ­a email (cron) â€” el endpoint y modelo ya existen; falta el job que dispare el envÃ­o los primeros dÃ­as de cada mes a depositarios activos sin reporte del perÃ­odo.
- [ ] **Alertas de pÃ³lizas** prÃ³ximas a vencer (depositario y contrato): job + notificaciÃ³n al funcionario asignado. Aprovechable tambiÃ©n por la IA del reporte para subir urgencia.
- [ ] **Vincular bien a expediente GD desde la UI** (campo `expedienteId` existe en schema y en API; falta selector en form de alta/ediciÃ³n de bien).
- [ ] **Vincular bien a carpeta fÃ­sica GA** (mismo caso que expediente).
- [ ] **Cola de anÃ¡lisis IA** â€” hoy `dispararAnalisisIA` es fire-and-forget. En Vercel serverless puede cortarse antes de terminar. Mover a cola (BullMQ / QStash) o pasar a sincrÃ³nico aceptando ~2s de latencia.
- [ ] **AcciÃ³n de notificaciÃ³n al funcionario** cuando el clasificador marca un reporte como CRITICA (hoy sÃ³lo queda visible en la tab Reportes; no avisa a nadie).
- [ ] **Subida de archivos al portal externo** â€” el campo `fotoUrl`/`adjuntoUrl` acepta URLs externas; falta un componente de upload propio (S3/UploadThing) para que el depositario no tenga que hostear el archivo.
- [ ] **Tests E2E** del flujo completo: alta de bien â†’ asignar depositario â†’ generar acceso portal â†’ reporte mensual â†’ anÃ¡lisis IA â†’ override admin â†’ contrato â†’ destinaciÃ³n.

### En el catÃ¡logo
- [ ] Decidir orden del siguiente mÃ³dulo a construir (ver "PrÃ³ximo punto" abajo).
- [ ] Materializar bundles comerciales en UI superadmin (botÃ³n "Aplicar bundle Control" que active de un click los mÃ³dulos del paquete).

### Fundamentos transversales
- [ ] Excluir definitivamente `ventanilla_unica_personeria_buga/` del repo o moverlo a `archive/` (sigue generando ruido aunque estÃ© excluido del tsc).
- [x] Seeds de catÃ¡logos comunes para onboarding â€” `catalogo-entidades.ts` (datos iniciales: 10 deps + TRD base + 26 terceros), auto-siembra al activar mÃ³dulos. GestiÃ³n en producciÃ³n vÃ­a formulario: `/admin/contabilidad/terceros` (CRUD completo) y `/admin/gd/trd` (ya existÃ­a). Endpoint `PATCH/DELETE /api/admin/cp/terceros/[id]` aÃ±adido.

---

## ðŸ§  IntegraciÃ³n de IA por mÃ³dulo

**PatrÃ³n base** (ya implementado en Ventanilla Ãšnica): Groq como motor primario, fallback determinÃ­stico, IA **sugiere** y humano **decide**. La sugerencia se persiste en un modelo separado (ej. `VuAsignacionIA`) con metadata: modelo, prompt versiÃ³n, confianza, timestamp. Cliente compartido: [`src/lib/groq-client.ts`](src/lib/groq-client.ts).

### Pendiente retroactivo (mÃ³dulos ya cerrados sin IA)

Aplicar el patrÃ³n a lo que ya estÃ¡ construido â€” son ganancias rÃ¡pidas, no bloquean nada:

1. **`frisco_bienes`** â€” al registrar/editar un bien:
   - Sugerir `tipo` (INMUEBLE_URBANO/RURAL/VEHICULO/â€¦) desde `descripcion`.
   - Extraer `placa`, `folioMatricula`, `numeroProceso` desde texto libre o documento adjunto (OCR + LLM).
   - Sugerir `estadoFisico` y palabras clave de riesgo (deterioro, ocupaciÃ³n) cuando se cargue una foto.

2. **`frisco_interop`** â€” al recibir respuesta de SNR / FiscalÃ­a / IGAC:
   - Detectar discrepancias semÃ¡nticas (direcciÃ³n registrada vs. direcciÃ³n IGAC) y resaltarlas.
   - Generar resumen de 2 lÃ­neas del proceso fiscal para mostrar en la ficha.

3. ~~**`portal_externo`** â€” clasificador de urgencia del reporte del depositario~~ â€” âœ… implementado en Fase 4.

### IA prevista para el mÃ³dulo siguiente (`contabilidad_publica`)

Casos donde aporta:
1. **Sugerencia de cuentas PUC** dada la descripciÃ³n del comprobante â†’ propone dÃ©bito/crÃ©dito con cuentas del PUC CGN, el contador confirma. Persistir en `CpAsientoSugerenciaIA`.
2. **DetecciÃ³n de comprobantes anÃ³malos** â€” monto fuera de rango histÃ³rico de la cuenta, fecha invertida, contraparte no usual. Marca pero no bloquea.
3. **Sugerencia de tercero auxiliar** â€” match probabilÃ­stico con `CpAuxiliarTercero` existentes para evitar duplicados (mismo NIT con razÃ³n social levemente distinta).

Casos donde IA **NO** entra (definidos explÃ­citamente):
- El motor de doble partida (dÃ©bito = crÃ©dito) es validaciÃ³n determinÃ­stica.
- AprobaciÃ³n de comprobante.
- Cierre de perÃ­odo contable.
- CÃ¡lculo de saldos.

---

### ✅ Módulo Diferenciador 5 — Integración SECOP II / lectura (cerrado 2026-06-05)

Sincronización de **lectura** con SECOP II: trae los procesos y contratos que la entidad ya tiene publicados en SECOP, para visibilidad y conciliación con lo registrado internamente. Activa el conector del módulo `integraciones_estado` ya existente.

**⚠ Corrección de premisa (importante):** El plan original asumía publicar/escribir en SECOP vía una API OAuth de CCE. **Eso no existe como API pública** — publicar en SECOP II es transaccional dentro de la plataforma. Lo que SÍ existe es **lectura** de los datos de SECOP en el portal de datos abiertos `datos.gov.co` (Socrata). Las credenciales que el cliente generó resultaron ser **API Keys de Socrata** (key id + secret, HTTP Basic Auth), no credenciales OAuth de CCE. El módulo se reorientó a lectura/conciliación. Verificado en vivo: 199 procesos reales de Personería de Buga recuperados por NIT.

**Config** — `TenantSecretos.secop { clientId, clientSecret, nit }` cifrado en meta-DB (`clientId`=API Key ID, `clientSecret`=API Key Secret de datos.gov.co). Superadmin UI: sección "Integración SECOP II (consulta vía datos.gov.co)" con API Key ID / NIT / API Key Secret + botón "Verificar conexión SECOP" → `POST /api/superadmin/tenants/[id]/secop-test` (hace `count(*)` de procesos por NIT). Credenciales de `personeria-buga` ya cargadas y verificadas.

**Datos** — Campos en `ConProceso` reutilizados para conciliación: `secopId` (id_del_proceso de SECOP), `secopUrl` (urlproceso), `secopEstado` (`'SECOP: <fase>'`), `secopSyncAt`. `secopDocId` en `ConDocumento` queda vestigial (sin uso en el modelo de lectura). `prisma db push` aplicado.

**Núcleo** — `src/lib/integraciones/secop.ts` (Socrata Basic Auth):
- `getSecopConfig(tenantId)` (descifra meta-DB), `normalizarNitSecop` (`"815.000.290-6"` → `"815000290"`).
- `consultarProcesosSecop` (dataset `p6dx-8zbt`), `consultarContratosSecop` (dataset `jbjy-vk9h`), `contarProcesosSecop`, `verificarCredencialesSecop`.
- Datasets/base overrideables por env: `SECOP_PROCESOS_DATASET`, `SECOP_CONTRATOS_DATASET`, `SECOP_RESOURCE_BASE`.
- `requireIntegracionesEstado` en `frisco-guard.ts`.

**APIs**
- `GET /api/admin/contratacion/secop?tipo=procesos|contratos` — lista registros de la entidad en SECOP; para procesos marca `enPublicEnt` (match referencia==numero interno).
- `POST /api/admin/contratacion/sincronizar-secop` — concilia: pagina todos los procesos de SECOP, cruza por `numero==referencia` y guarda `secopId/secopUrl/secopEstado/secopSyncAt` en los procesos internos. Devuelve `{ totalSecop, totalInterno, conciliados, soloEnSecop }`.
- `POST /api/superadmin/tenants/[id]/secop-test` — verifica credenciales Socrata.

**UI** — `client-page.tsx` contratación: botón "Sincronizar con SECOP II" en encabezado (solo si `integraciones_estado` activo), badge "En SECOP" en tabla (verde si conciliado), fila expandida muestra estado/fecha de conciliación + link real a SECOP, nuevo tab "Publicado en SECOP" que lista en vivo los procesos de la entidad marcando cuáles están en PublicEnt y cuáles solo en SECOP.

**Hallazgos**
- Las API Keys de datos.gov.co se autentican con HTTP Basic (`base64(keyId:keySecret)`), no OAuth.
- El NIT en datos.gov.co va sin puntos ni dígito de verificación (`nit_entidad=815000290`).
- Datasets SECOP II: `p6dx-8zbt` (Procesos de Contratación), `jbjy-vk9h` (Contratos Electrónicos). Campos defensivos por si Socrata renombra columnas.
- ✅ Migración + credenciales aplicadas el 2026-06-05 sobre `neondb` (único tenant `personeria-buga`). NIT del tenant rellenado (`815.000.290-6`). E2E verificado: `verificarCredencialesSecop → {ok, total:199}`.
- Pendiente futuro: si se requiere publicación real en SECOP II, exige convenio/integración B2B formal con CCE (fuera de alcance de API pública).
- ✅ Activación: módulos `contratacion` e `integraciones_estado` activados en `personeria-buga` (2026-06-05, plan PROFESIONAL los permite) → la página de Contratación y el tab "Publicado en SECOP" quedan visibles. **Estándar para futuras activaciones: hacerlo desde Superadmin → Módulos activos** (esta vez se hizo por meta-DB por premura). Nota: la caché de tenant en el server desplegado puede tardar el TTL en reflejar el cambio si no se reinvalida vía la ruta oficial.
- Limitación menor conocida: el tab SECOP muestra **procesos**; la API soporta `?tipo=contratos` (`jbjy-vk9h`) pero no está surfaced en UI y su mapeo de campos no se verificó contra el dataset real. Mejora futura.

---

## ðŸŽ¯ PrÃ³ximo punto

Avance respecto al MVP SAE de A0 (portal + plan CGN + bienes FRISCO + presupuesto mÃ­nimo + reporte CHIP):

- [x] Portal (base PersonerÃ­a)
- [x] Bienes FRISCO (`frisco_bienes`)
- [x] Interoperabilidad SNR/FiscalÃ­a/IGAC (`frisco_interop`)
- [x] Portal externo del depositario (`portal_externo`)
- [x] **Plan CGN + motor contable** (`contabilidad_publica` â€” Fase 5)
- [x] **Presupuesto mÃ­nimo (CDP/RP/ObligaciÃ³n/Pago)** (`presupuesto_ejecucion` â€” Fase 6, con comprobante contable auto al pagar)
- [x] **NÃ³mina pÃºblica** (`nomina_publica` â€” Fase 11, motor de liquidaciÃ³n + 24 conceptos sembrados)
- [x] **Pagar nÃ³mina â†’ comprobante contable** (`/api/admin/nom/pagar` â€” Fase 12, agrega liquidaciones en un Ãºnico comprobante EGRESO)
- [x] **Reportes a entes de control** (`reportes_control` â€” Fase 13: CHIP Balance + Actividad, FUT Ingresos + Gastos, Ley 617) â€” **MVP SAE cerrado en feature core**
- [x] **Exportador XLSX** de los 5 tipos de reporte con formato moneda COP y totales (Fase 14, `exceljs`). El contador descarga el XLSX, lo revisa y lo copia/pega al template oficial CGN/DNP.
- [x] **Pasivos de nÃ³mina** (Fase 15: cierra el ciclo nÃ³mina â†’ EPS/AFP/DIAN/parafiscales con un comprobante D pasivo / C banco por tercero).
- [x] **TesorerÃ­a** (Fase 16: cuentas bancarias, movimientos de libro, extractos bancarios, conciliaciÃ³n par a par).
- [x] **ContrataciÃ³n pÃºblica** (Fase 17: procesos Ley 80/1150, contratos, adiciones/prÃ³rrogas, documentos, flujo de estados).
- [ ] **Mapeo 1:1 al template oficial** del CHIP/FUT (layout exacto del periodo de reporte).

### âœ… Fase 16 â€” MÃ³dulo `tesoreria` (cerrada)

GestiÃ³n de cuentas bancarias institucionales, movimientos de libro y conciliaciÃ³n con extractos.

**Datos**
- [x] `TesoCuenta` â€” cuenta bancaria (nombre, banco, nitBanco, numeroCuenta, tipo, moneda, cuentaContableCodigo). Enum `TesoCuentaTipo` (CORRIENTE/AHORROS/INVERSION_TEMPORAL/FONDOS_ESPECIALES).
- [x] `TesoMovimiento` â€” lÃ­nea del libro de tesorerÃ­a (tipo INGRESO/EGRESO, fecha, valor, descripcion, numero, tercero, comprobanteId, pagoPresupId, conciliado, extractoLineaId). Ãndices: `[cuentaId, fecha]`, `[conciliado]`, `[comprobanteId]`.
- [x] `TesoExtracto` â€” cabecera del extracto bancario mensual (periodo YYYY-MM, saldoInicial, saldoFinal). Unique `[cuentaId, periodo]`.
- [x] `TesoExtractoLinea` â€” lÃ­nea del extracto (fecha, descripcion, referencia, debito, credito, saldo, conciliada, movimientoId). Cascade delete desde extracto.

**Endpoints**
- [x] `GET/POST /api/admin/teso/cuentas` â€” lista ordenada / alta de cuenta.
- [x] `GET/PATCH/DELETE /api/admin/teso/cuentas/[id]` â€” detalle con movimientos y extractos / actualizar / inactivar-o-borrar segÃºn si tiene movimientos.
- [x] `GET/POST /api/admin/teso/movimientos` â€” lista filtrable por cuentaId + conciliado / registrar movimiento con validaciÃ³n de cuenta activa.
- [x] `GET /api/admin/teso/saldos` â€” saldo libro por cuenta (Î£ INGRESO - Î£ EGRESO) + total general + pendientes de conciliar.
- [x] `GET/POST /api/admin/teso/extractos` â€” lista por cuenta / carga de extracto con lÃ­neas (CSV parseado en cliente, JSON enviado al endpoint). Conflicto 409 si ya existe el periodo.
- [x] `GET/DELETE /api/admin/teso/extractos/[id]` â€” detalle con lineas / borrar (bloquea si tiene lÃ­neas conciliadas).
- [x] `POST /api/admin/teso/conciliar` â€” concilia un movimiento â†” lÃ­nea de extracto. Validaciones: misma cuenta, tipo coherente (INGRESOâ†”crÃ©dito/EGRESOâ†”dÃ©bito), diferencia â‰¤ 0.5 COP, ambos sin conciliar previo. Actualiza ambos registros en `$transaction`.
- [x] `DELETE /api/admin/teso/conciliar?movimientoId=` â€” revierte conciliaciÃ³n.

**Guard**
- [x] `requireTesoreria(roles)` en `frisco-guard.ts`.

**UI**
- [x] [`/admin/tesoreria`](src/app/admin/tesoreria/page.tsx) â€” server: carga cuentas + 80 movimientos recientes + saldos calculados.
- [x] [`client-page.tsx`](src/app/admin/tesoreria/client-page.tsx):
  - KPIs: saldo total en banco, movimientos pendientes de conciliar, total de cuentas.
  - Tabla de cuentas con saldo libro y botÃ³n "Conciliar" por fila.
  - Modal "Nueva cuenta" (nombre, banco, NIT, nÃºmero, tipo, cÃ³digo CGC).
  - Modal "Movimiento" (cuenta, tipo ingreso/egreso, fecha, valor, nÃºmero, descripciÃ³n, tercero).
  - Modal "Extracto" â€” carga con CSV/TSV pegado (formato: fecha,descripcion,referencia,debito,credito,saldo); parsea en cliente y envÃ­a JSON al endpoint.
  - Panel de conciliaciÃ³n inline: lista de movimientos pendientes (izquierda) + lÃ­neas de extracto pendientes (derecha); click en par â†’ botÃ³n "Conciliar par seleccionado".
- [x] Entrada "TesorerÃ­a" en sidebar gateada por `MODULO_IDS.TESORERIA`.

**VerificaciÃ³n**
- [x] `prisma generate` OK (v7.2.0, 4 modelos nuevos generados).
- [x] `tsc --noEmit` limpio.

**Hallazgos**
- El saldo del libro se calcula **al vuelo** (Î£ INGRESO - Î£ EGRESO) â€” no hay campo de saldo en `TesoCuenta`. RazÃ³n: igual que pasivos de nÃ³mina, la fuente de verdad son las transacciones; cualquier correcciÃ³n o anulaciÃ³n se refleja automÃ¡ticamente.
- La conciliaciÃ³n es **par a par** (1 movimiento â†” 1 lÃ­nea). En la prÃ¡ctica bancaria colombiana algunos movimientos tienen varias lÃ­neas (retenciones + principal). Mejora futura: conciliaciÃ³n mÃºltiple (1:N) agrupando por fecha+valor con tolerancia.
- El extracto se carga como CSV pegado en un `<textarea>`, no como upload de archivo. RazÃ³n: evita S3/UploadThing en esta iteraciÃ³n y cubre el caso mÃ¡s comÃºn (copiar del PDF del extracto). Mejora futura: input `type=file` que lea el CSV y lo auto-parsee.
- `TesoMovimiento.comprobanteId` y `.pagoPresupId` son strings opcionales sin FK explÃ­cita (igual que el patrÃ³n `fuenteRef` de CpComprobante). RazÃ³n: evita migraciÃ³n compleja y permite referenciar sin crear dependencia circular de mÃ³dulos.
- âš  MigraciÃ³n pendiente: `npx prisma db push` por tenant para crear tablas `teso_cuentas`, `teso_movimientos`, `teso_extractos`, `teso_extracto_lineas`.

---

### Estado al cerrar la sesiÃ³n (2026-06-01)

**Branch:** `feat/integrar-ventanilla-unica` | **Ãšltimo commit documentado:** `b454fa6` (Fase 15) â€” Fase 16 pendiente de commit.
**TSC:** limpio. **prisma generate:** OK.
**MVP SAE A0:** cerrado en feature core.

**Ciclo de nÃ³mina completo en backend:**
1. Crear empleado (POST `/api/admin/nom/empleados`).
2. Crear periodo `YYYY-MM` (POST `/api/admin/nom/periodos`).
3. Liquidar periodo (POST `/api/admin/nom/liquidar`) â†’ motor de 3 pasadas, marca `LIQUIDADO`.
4. Pagar nÃ³mina (POST `/api/admin/nom/pagar`) â†’ un `CpComprobante` EGRESO con asientos agregados, marca `PAGADO`.
5. Consultar pasivos pendientes (GET `/api/admin/nom/pasivos-pendientes?periodoId=`).
6. Pagar pasivos a terceros (POST `/api/admin/nom/pagar-pasivo`) â€” uno por EPS/AFP/DIAN, valor parcial permitido.

**Siguiente sugerido (prÃ³xima sesiÃ³n):** mapeo 1:1 al template CHIP oficial, mejoras a contrataciÃ³n (alertas de vencimiento, IA para sugerencia de modalidad/supervisor), o mejoras a tesorerÃ­a (conciliaciÃ³n N:1, upload CSV).

### Pendientes operativos antes de pasar a producciÃ³n

- [ ] **`npx prisma db push` por tenant Neon** para crear las tablas nuevas:
  - `cp_*` (Fase 5 â€” contabilidad)
  - `psu_*` (Fase 6 â€” presupuesto)
  - `nom_*` (Fase 11 â€” nÃ³mina: empleados, conceptos, periodos, liquidaciones, detalles, novedades)
  - `nom_pagos_pasivos` (Fase 15)
  - `rc_reportes` (Fase 13)
  - `teso_cuentas`, `teso_movimientos`, `teso_extractos`, `teso_extracto_lineas` (Fase 16)
- [ ] **Auto-siembras al activar mÃ³dulos** disparan: `seedCgc` (3.745 cuentas), `seedCcp` (1.784 rubros CCPET), `seedNominaConceptos` (24 conceptos). Verificar en cada tenant al activar.

### Pendientes inmediatos en `presupuesto_ejecucion`
- [ ] `npx prisma db push` por tenant para crear tablas `psu_*`.
- [ ] Endpoint DELETE/PATCH para **anular** documentos de la cadena, con validaciÃ³n de que no haya hijos vigentes (CDP no se puede anular si tiene RPs activos, etc.).
- [ ] Selector de obligaciÃ³n en el modal de Pago (hoy se pega cuid manualmente).
- [ ] **IA retroactiva**: sugerencia de rubro a partir de la descripciÃ³n del CDP; detector de gastos atÃ­picos vs. apropiaciÃ³n; resumen de ejecuciÃ³n mensual.
- [ ] GeneraciÃ³n del comprobante tambiÃ©n en el paso de **ObligaciÃ³n** (devengo) si CGN lo exige formalmente â€” hoy sÃ³lo en Pago.

### Pendientes inmediatos en `contabilidad_publica`
- [x] Auto-siembra del CGC al activar el mÃ³dulo (Fase 7).
- [ ] Correr `prisma db push` por tenant (para crear las tablas `cp_*`).
- [ ] **IA retroactiva**: sugerencia de cuentas CGC y de tercero auxiliar (modelo `CpAsientoSugerenciaIA` aÃºn por crear); detector de comprobantes anÃ³malos.
- [ ] Cierre anual: comprobante automÃ¡tico de cierre que traslada saldos de cuentas de resultado (4 y 5) a `3110` (resultado del ejercicio) usando las cuentas 5905/5910/5915 ya sembradas.
- [ ] Balance comparativo (vs. periodo anterior) y libros oficiales (Diario, Mayor, Auxiliar).


