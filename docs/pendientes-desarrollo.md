# Pendientes de desarrollo — auditado el 2026-06-02

> **Para Claude Code:** Este archivo es la fuente de verdad de lo que falta construir.
> Antes de empezar cualquier ítem, verifica el estado real leyendo los archivos indicados
> en "Evidencia". Varios ítems que el CLAUDE.md marcaba como pendientes **ya están
> implementados** — se listan al final para que no los vuelvas a escribir.
>
> Orden de trabajo sugerido: empieza por 🔴 Alta prioridad, luego 🟡 Media, luego 🟢.
> Dentro de cada grupo respeta el orden numérico.

---

## 🔴 Alta prioridad — MVP / cierre de módulos ya abiertos

### 1. Anular documentos de la cadena presupuestal (CDP / RP / Obligación)

**Por qué falta:** Solo existen rutas GET + POST. No hay `[id]/route.ts` bajo `psu/cdp/`, `psu/rp/` ni `psu/obligaciones/`.

**Qué construir:**
- `src/app/api/admin/psu/cdp/[id]/route.ts` — PATCH (`estado: 'ANULADO'`, `motivoAnulacion`) + GET (detalle)
- `src/app/api/admin/psu/rp/[id]/route.ts` — ídem
- `src/app/api/admin/psu/obligaciones/[id]/route.ts` — ídem

**Lógica de validación para cada endpoint de anulación:**
1. Verificar que el documento existe y pertenece al tenant.
2. Verificar que no está ya `ANULADO` o `AGOTADO`.
3. Contar hijos vigentes (`estado: 'VIGENTE'`):
   - CDP → contar RPs vigentes (`psuRp.count` donde `cdpId = id AND estado != 'ANULADO'`)
   - RP → contar Obligaciones vigentes
   - Obligación → contar Pagos no anulados
4. Si hay hijos vigentes → retornar HTTP 409 con mensaje: `"No se puede anular: tiene N hijos vigentes"`.
5. Si no hay hijos → actualizar `estado = 'ANULADO'`, guardar `anuladoEn`, `anuladoPor`, `motivoAnulacion`.
6. Registrar en `RegistroAuditoria`.

**Archivos de referencia:**
- `src/lib/validations.ts` — agregar `psuAnularSchema` (solo `motivoAnulacion: z.string().min(10)`)
- `src/app/api/admin/psu/pagos/route.ts` — para ver el patrón GET/POST existente
- `src/lib/authorization.ts` — para `checkApiRoles`

**UI:** Agregar botón "Anular" en la tabla de CDP/RP/Obligaciones de `src/app/(admin)/admin/presupuesto/client-page.tsx` (solo visible si `estado === 'VIGENTE'`, rol ADMIN/SUPER_ADMIN). Mostrar modal de confirmación con campo de motivo.

---

### 2. Selector de obligación en modal de Pago (presupuesto)

**Dónde está el problema:** `src/app/(admin)/admin/presupuesto/client-page.tsx` línea ~331 — hay un `<Input placeholder="Pegar id de la obligación">` de texto libre.

**Qué construir:**
- En el modal de Pago (`PagoModal`), reemplazar el input de texto por un `<select>` o lista filtrable.
- Al abrir el modal: hacer `GET /api/admin/psu/obligaciones?estado=VIGENTE&limit=20` (o filtrado por RP si se seleccionó previamente).
- Mostrar cada obligación como: `#{numero} — ${valor.toLocaleString()} — ${objeto.slice(0,40)}`.
- Al seleccionar una obligación, poblar automáticamente `obligacionId`.

**Endpoint existente:** `GET /api/admin/psu/obligaciones` ya existe — verificar que devuelve `numero`, `valor`, `objeto` para usarlos en el label del select.

---

### 3. Cierre anual automático — comprobante traslado cuentas 4/5 → 3110

**Qué construir:**

Nuevo endpoint: `POST /api/admin/cp/cierre-anual`

**Body:** `{ periodoId: string, numero?: string }`

**Lógica:**
1. Verificar que el periodo existe, está `ABIERTO` o en `AJUSTE`, y que `anio` corresponde al año que se quiere cerrar.
2. Calcular saldos netos de todas las cuentas clase 4 (ingresos) y clase 5 (gastos) del periodo usando la misma lógica que `GET /api/admin/cp/balance`.
3. Construir los asientos del comprobante de cierre:
   - Por cada cuenta clase 4 con saldo crédito: Débito cuenta 4xxx / Crédito cuenta 5905 (Ganancias y pérdidas)
   - Por cada cuenta clase 5 con saldo débito: Débito cuenta 5905 / Crédito cuenta 5xxx
   - Asiento final: diferencia neta → cuenta 3110 (Resultado del ejercicio)
4. Crear `CpComprobante` con `tipo: 'CIERRE'`, `fuenteModulo: 'cierre-anual'`, `fuenteRef: periodoId`.
5. Marcar el periodo como `CERRADO`.
6. Todo en una sola `$transaction`.

**Cuentas necesarias (ya sembradas en CGC):** `5905`, `5910`, `5915`, `3110` — verificar que existen con `permiteMovimientos = true`.

**Referencia de patrón:** Ver `src/app/api/admin/cp/comprobantes/route.ts` para la estructura de creación de comprobante con asientos.

**UI:** Botón "Cierre anual" en `src/app/(admin)/admin/contabilidad/client-page.tsx`, visible solo para SUPER_ADMIN cuando hay un periodo ABIERTO. Mostrar resumen de saldos antes de confirmar.

---

### 4. Libros oficiales: Diario, Mayor, Auxiliar

**Qué construir — 3 endpoints nuevos:**

**a) Libro Diario** — `GET /api/admin/cp/libros/diario?periodoId=&page=&limit=`
- Lista cronológica de todos los asientos del periodo, agrupados por comprobante.
- Cada fila: fecha, número comprobante, descripción asiento, cuenta (código + nombre), débito, crédito.
- Ordenado por `CpComprobante.fecha ASC`, luego `CpAsiento.id ASC`.
- Include: `comprobante.numero`, `comprobante.fecha`, `comprobante.descripcion`, `cuenta.codigo`, `cuenta.nombre`, `tercero.nombre`.
- Paginado (default 100 filas).

**b) Libro Mayor** — `GET /api/admin/cp/libros/mayor?periodoId=&cuentaId=`
- Movimientos de una cuenta específica en el periodo.
- Columnas: fecha, referencia, descripción, débito, crédito, saldo acumulado.
- Saldo inicial = 0 (dentro del periodo) o saldo anterior si se piden varios periodos.
- Ordenado cronológicamente.

**c) Libro Auxiliar** — `GET /api/admin/cp/libros/auxiliar?periodoId=&terceroId=`
- Movimientos vinculados a un tercero auxiliar específico.
- Misma estructura que el Mayor pero filtrado por `CpAsiento.terceroId`.

**UI sugerida:** Nueva sección "Libros contables" en `/admin/contabilidad`, con tabs Diario / Mayor / Auxiliar y botón de exportar a XLSX (reutilizar patrón de `src/lib/reportes-control/xlsx.ts`).

---

### 5. Mapeo 1:1 al template oficial CHIP/FUT

**Estado actual:** `src/lib/reportes-control/xlsx.ts` genera un XLSX navegable correcto pero no sigue las posiciones exactas del template oficial del portal CHIP (CGN) ni del FUT (DNP).

**Qué se necesita:**
1. Descargar el template oficial XLSX del portal CHIP (CGN) y del FUT (DNP) y guardarlo en `docs/templates/`.
2. Analizar las posiciones exactas de celdas (fila/columna) de cada campo requerido.
3. Reescribir los builders correspondientes en `src/lib/reportes-control/xlsx.ts` usando `exceljs` con `worksheet.getCell('A5').value = ...` en lugar de construir tablas dinámicas.

**Esto es el ítem más dependiente de información externa** (los templates oficiales cambian por período y categoría municipal). Priorizar solo cuando el cliente lo solicite explícitamente.

---

## 🟡 Media prioridad — mejoras a módulos cerrados

### 6. Upload CSV real en Tesorería (reemplazar textarea)

**Dónde:** `src/app/(admin)/admin/tesoreria/client-page.tsx` — el modal de carga de extracto tiene un `<textarea>`.

**Qué construir:**
- Reemplazar el `<textarea>` por `<input type="file" accept=".csv,.tsv,.txt">`.
- En el `onChange`: leer con `FileReader.readAsText()`, parsear igual que la lógica actual.
- Mantener la vista previa de líneas parseadas antes de enviar.
- El endpoint `POST /api/admin/teso/extractos` ya acepta el payload JSON — no hay que tocarlo.

---

### 7. Alertas de vencimiento de contratos

**Qué construir:**

Nuevo endpoint: `GET /api/admin/con/alertas-vencimiento?diasAnticipacion=30`
- Busca contratos con `estado: 'VIGENTE'` y `fechaTerminacion` entre hoy y hoy + N días.
- Retorna lista con: `id`, `numero`, `contratista`, `fechaTerminacion`, `diasRestantes`, `proceso.nombre`.

**Cron/job:** En Vercel, agregar un endpoint `GET /api/cron/alertas-contratos` protegido con `Authorization: Bearer ${CRON_SECRET}` que:
1. Llama a la lógica de alertas.
2. Por cada contrato encontrado, envía email al supervisor usando `src/lib/mail.ts`.
3. Configura en `vercel.json` con `crons: [{ path: "/api/cron/alertas-contratos", schedule: "0 8 * * *" }]`.

---

### 8. Alertas de pólizas FRISCO próximas a vencer (30/15/5 días)

**Qué construir:**

Nuevo endpoint: `GET /api/admin/frisco/alertas-polizas?diasAnticipacion=30`
- Busca `FriscoDepositario` con `polizaVigenciaHasta` entre hoy y hoy + N días y `activo: true`.
- Retorna lista con bien, depositario, fecha vencimiento y días restantes.

**Cron:** Similar al de contratos. `GET /api/cron/alertas-polizas` → email al funcionario responsable. Agregar en `vercel.json`.

---

### 9. Notificación al funcionario cuando IA marca reporte como CRÍTICA

**Dónde agregar:** `src/app/api/admin/frisco/reportes/[reporteId]/analisis/route.ts` — al final del handler, después de persistir el análisis.

**Lógica:**
```typescript
if (analisis.urgencia === 'CRITICA') {
  // Buscar el funcionario responsable del bien (o el primer ADMIN activo)
  const responsable = await prisma.usuario.findFirst({
    where: { activo: true, rol: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { email: true, name: true }
  });
  if (responsable?.email) {
    await sendMail({
      to: responsable.email,
      subject: `🔴 Reporte CRÍTICO — Bien ${bien.codigo}`,
      html: `<p>El análisis IA del reporte del bien <b>${bien.codigo}</b> ha sido clasificado como <b>CRÍTICO</b>.</p>
             <p>Etiquetas: ${analisis.etiquetas.join(', ')}</p>
             <p>Resumen: ${analisis.resumen}</p>`
    });
  }
}
```
- Importar `sendMail` de `src/lib/mail.ts`.
- El try/catch aislado para que el fallo del email no cancele la operación.

---

### 10. Vincular bien FRISCO a expediente GD y carpeta física desde la UI

**Estado:** El backend (`PATCH /api/admin/frisco/bienes/[id]`) ya acepta `expedienteId` y `carpetaFisicaId`. Solo falta la UI.

**Qué agregar en** `src/app/(admin)/admin/frisco/bienes/[id]/client-page.tsx`:
- En el formulario de edición del bien, agregar dos campos:
  1. `expedienteId`: select que carga `GET /api/admin/gd/expedientes?limit=50` y muestra `codigo + asunto`.
  2. `carpetaFisicaId`: select que carga `GET /api/admin/gd/archivo/carpetas?limit=50` y muestra `codigo + descripcion`.
- Incluir ambos en el PATCH al guardar.

---

### 11. Recordatorio mensual al depositario (cron)

**Qué construir:**

Nuevo endpoint: `GET /api/cron/recordatorio-depositarios`
- Busca `FriscoPortalAcceso` vigentes (no revocados, no expirados) con `FriscoDepositario.activo: true`.
- Filtra los que NO tienen un `FriscoReporteDepositario` con `periodo` igual al mes actual (`YYYY-MM`).
- Por cada uno: envía email al depositario con el link del portal (`/portal/frisco/${tokenPlano}` — ojo: el token plano no se almacena; enviar el link base y pedir que el depositario lo busque en su email anterior, o guardar el email del depositario y re-generar un token).
- **Alternativa más simple:** enviar email al funcionario SAE responsable del bien, informando qué depositarios no han reportado aún.

Agregar en `vercel.json`:
```json
{ "path": "/api/cron/recordatorio-depositarios", "schedule": "0 9 1 * *" }
```

---

### 12. Conciliación N:1 en Tesorería

**Estado actual:** `POST /api/admin/teso/conciliar` acepta exactamente un `movimientoId` + un `extractoLineaId`.

**Qué agregar:**

Nuevo endpoint: `POST /api/admin/teso/conciliar-multiple`
- Body: `{ movimientoId: string, extractoLineaIds: string[] }` (mínimo 2 líneas)
- Validaciones: misma cuenta, valores coherentes (suma de débitos/créditos de las líneas ≈ valor del movimiento, tolerancia $1), ninguna línea ya conciliada.
- En `$transaction`: marca el movimiento como conciliado, marca todas las líneas como conciliadas, vincula cada línea al movimiento con `movimientoId`.
- **Cambio de schema Prisma:** `TesoExtractoLinea.movimientoId` ya es `String?` — no necesita migración.

---

### 13. IA para modalidad/supervisor en contratación

**Qué construir:**

Nuevo archivo: `src/lib/contratacion-ia.ts`
```typescript
export async function sugerirModalidadYSupervisor(
  tenantId: string,
  descripcion: string,
  valorEstimado: number,
  funcionarios: { id: string; name: string; cargo: string }[]
): Promise<{ modalidad: string; supervisorId: string; razon: string; confianza: number }>
```
- Usar `callIaJson` de `src/lib/groq-client.ts` (ya implementado).
- Prompt con: descripción del proceso, valor estimado, lista de funcionarios disponibles, reglas Ley 80 (mínima cuantía, selección abreviada, licitación pública, concurso de méritos, contratación directa).

Nuevo endpoint: `POST /api/admin/con/procesos/sugerir-modalidad`

**UI:** Botón "Sugerir con IA" en el formulario de nuevo proceso contractual en `src/app/(admin)/admin/contratacion/client-page.tsx`.

---

## 🟢 Baja prioridad — retroactivos de IA

### 14. Cola de análisis IA para reportes FRISCO

**Problema:** `void dispararAnalisisIA()` en `src/app/api/portal/frisco/[token]/reporte/route.ts` es fire-and-forget y puede cortarse en Vercel serverless.

**Opciones (de menor a mayor complejidad):**

**Opción A — Síncrono con timeout corto (más simple):**
- Cambiar a `await dispararAnalisisIA()` con timeout de 8 segundos.
- El ciudadano espera ~2-3s más, pero el análisis siempre completa.

**Opción B — Endpoint dedicado de re-análisis:**
- Mantener fire-and-forget en el portal.
- Agregar `POST /api/admin/frisco/reportes/[reporteId]/re-analizar` para que el admin dispare manualmente si el análisis no llegó.

**Opción C — QStash (Upstash):**
- Instalar `@upstash/qstash`.
- En el route del reporte: publicar mensaje a QStash con `{ reporteId }`.
- Nuevo endpoint `POST /api/cron/analizar-reporte` que recibe el mensaje y ejecuta `dispararAnalisisIA`.

---

## ⚙️ Deuda técnica

### 15. Archivar ventanilla_unica_personeria_buga/

```bash
# Desde la raíz del repo
mkdir -p archive
mv ventanilla_unica_personeria_buga archive/
git add -A
git commit -m "chore: mover ventanilla_unica_personeria_buga a archive/"
```

El `tsconfig.json` ya lo excluye del compilador — esta es solo limpieza visual del repo.

---

### 16. Reemplazar stubs interop por APIs reales

**Estado:** Los tres stubs en `src/lib/frisco-interop/snr.ts`, `igac.ts` y `fiscalia.ts` tienen comentarios explícitos marcándolos como stubs. La interfaz `InteropResult<T>` en `types.ts` está estable.

**Cuando SAE entregue credenciales:**
1. Reemplazar el cuerpo de la función `lookup()` en cada archivo por la llamada HTTP real.
2. La firma de la función y el tipo de retorno no cambian — es drop-in.
3. Guardar las credenciales cifradas en la meta-DB del tenant (usando `encryptSecretos` de `src/lib/encryption.ts`).

---

## ✅ Ya implementados — NO volver a desarrollar

> Estos ítems estaban marcados como pendientes en el CLAUDE.md pero ya existen en el código.
> Verificados en auditoría del 2026-06-02.

| Ítem | Archivos que lo implementan |
|------|-----------------------------|
| Subida de archivos en portal externo (foto/adjunto) | `src/app/api/portal/frisco/[token]/upload/route.ts` + `client-page.tsx:49` |
| IA en `frisco_bienes`: sugerir tipo/estadoFísico/placa/folio | `src/lib/frisco-bien-ia.ts` + `src/app/api/admin/frisco/bienes/ia-sugerir/route.ts` + botón en `bienes/[id]/client-page.tsx:229` |
| IA en `frisco_interop`: discrepancias SNR↔IGAC + resumen fiscal | `src/lib/frisco-interop-ia.ts` + `src/app/api/admin/frisco/interop/analizar/route.ts` + botón en `bienes/[id]/client-page.tsx:832` |
| IA en `contabilidad_publica`: sugerencia de cuentas CGC | `src/lib/contabilidad-ia.ts` + `src/app/api/admin/cp/sugerir-cuentas/route.ts` |
| IA en `presupuesto_ejecucion`: sugerencia de rubro desde CDP | `src/lib/presupuesto-ia.ts` + `src/app/api/admin/psu/sugerir-rubro/route.ts` |
| Bundles comerciales en UI superadmin (botón Aplicar) | `src/components/admin/superadmin/tenant-modulos.tsx:306` — función `aplicarBundle()` + botones línea 365 |
| Seeds de catálogos comunes para onboarding | `src/lib/seeders/onboarding.ts` + `src/app/api/superadmin/tenants/[id]/modulos/route.ts:147` |

---

## Orden de desarrollo recomendado para la próxima sesión

```
1. ✅ Anular CDP/RP/Obligación (ítem 1) — DONE 2026-06-03
2. ✅ Selector obligación en modal Pago (ítem 2) — DONE 2026-06-03
3. ✅ Libros oficiales Diario/Mayor/Auxiliar (ítem 4) — DONE 2026-06-03
4. ✅ Cierre anual automático (ítem 3) — DONE 2026-06-03
5. ✅ Notificación CRÍTICA FRISCO (ítem 9) — DONE 2026-06-03
6. ✅ Upload CSV tesorería (ítem 6) — DONE 2026-06-03
7. ✅ Vincular bien a expediente GD desde UI (ítem 10) — DONE 2026-06-03
```

### Completados 2026-06-03 (segunda tanda):
- ✅ Ítem 7 — Alertas vencimiento contratos (lib + endpoint + cron + panel UI)
- ✅ Ítem 8 — Alertas pólizas FRISCO (lib + endpoint + cron + panel UI)
- ✅ Ítem 11 — Recordatorio mensual depositario (en cron global)
- ✅ Ítem 12 — Conciliación N:1 tesorería (endpoint conciliar-multiple + UI multiselect)
- ✅ Ítem 13 — IA modalidad/supervisor contratación (lib + endpoint + botón en modal)

**Infraestructura de crons (decisión arquitectónica):**
- Un solo cron global `/api/cron/diario` que hace fan-out a TODOS los tenants
  (vercel.json es estático, no admite cron por tenant). Maneja las 3 alertas
  adentro y envía un email-digest por tenant al primer admin activo.
- Protegido con `Authorization: Bearer ${CRON_SECRET}`.
- `vercel.json` → `schedule: "0 8 * * *"`. Cabe en el plan gratis (1 de 2 crons, diario).
- Lógica reutilizable en `src/lib/alertas.ts` (compartida por crons y endpoints on-demand).
- ⚠️ Configurar `CRON_SECRET` en variables de entorno de Vercel antes de desplegar.

### Pendiente único (bloqueado por insumo externo):
- Ítem 5 (Mapeo 1:1 CHIP/FUT — requiere los templates oficiales XLSX del cliente)

### ⚠️ Cambio de ruta importante:
- La carpeta API `con` se renombró a `contratacion` (era nombre reservado de Windows
  NTFS que rompía `git add`). Endpoints ahora en `/api/admin/contratacion/*`.

---

*Auditoría realizada el 2026-06-02 con revisión directa de archivos y Grep sobre el codebase completo.*
*Actualizar este archivo cada vez que se complete un ítem.*
