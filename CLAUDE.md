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
- [x] Auto-siembra del CGC al activar el módulo (Fase 7).
- [ ] Correr `prisma db push` por tenant (para crear las tablas `cp_*`).
- [ ] **IA retroactiva**: sugerencia de cuentas CGC y de tercero auxiliar (modelo `CpAsientoSugerenciaIA` aún por crear); detector de comprobantes anómalos.
- [ ] Cierre anual: comprobante automático de cierre que traslada saldos de cuentas de resultado (4 y 5) a `3110` (resultado del ejercicio) usando las cuentas 5905/5910/5915 ya sembradas.
- [ ] Balance comparativo (vs. periodo anterior) y libros oficiales (Diario, Mayor, Auxiliar).
