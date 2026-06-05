% Manual de usuario — Presupuesto
% Plataforma PublicEnt
% Módulos: presupuesto_formulacion, presupuesto_ejecucion, presupuesto_modificaciones, presupuesto_cierre

# Presupuesto público (CCPET)

## Para quién
**Presupuesto** y **Administrador financiero** (ADMIN).

## Requisitos
**presupuesto_formulacion** (depende de contabilidad) → **presupuesto_ejecucion** → (**modificaciones**, **cierre**, tesorería, contratación). Al activar ejecución se siembran ~1.784 rubros **CCPET**.

## Qué permite
La cadena del gasto público: **CDP → RP → Obligación → Pago**, con control de saldos en tiempo real y generación automática del comprobante contable al pagar.

## Acceso
Panel **/admin → Presupuesto**: KPIs **Apropiado, Comprometido, Obligado, Pagado, Disponible**; tabla **Ejecución por rubro** y últimos CDP/RP.

## Tareas

### Apropiación
1. Cree el **rubro** (CCPET) y registre su **apropiación** para la vigencia (inicial + adiciones − reducciones).

### Cadena de ejecución
1. **CDP** (Certificado de Disponibilidad): valida `valor ≤ saldo de apropiación`.
2. **RP** (Registro Presupuestal): contra un CDP vigente; valida `valor ≤ saldo CDP`.
3. **Obligación**: contra un RP; valida `valor ≤ saldo RP`.
4. **Pago**: contra una obligación; valida `valor ≤ saldo obligación`. Si la contabilidad está activa y se indica cuenta banco, **genera el comprobante contable (EGRESO)** en la misma transacción.

### Modificaciones y cierre
- **Modificaciones**: adiciones, reducciones y traslados (módulo modificaciones).
- **Cierre**: al 31 de diciembre, reservas presupuestales y cuentas por pagar (módulo cierre).


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
