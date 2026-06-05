% Manual de usuario — Nómina
% Plataforma PublicEnt
% Módulo: nomina_publica

# Nómina pública

## Para quién
**Talento humano / Nómina** y **Administrador** (ADMIN).

## Requisitos
Módulo **nomina_publica**. Depende de **contabilidad_publica**. Al activarlo se siembran **24 conceptos** (devengados, deducciones, aportes patronales, prestaciones).

## Qué permite
Gestionar **empleados**, **periodos** mensuales, **liquidación** con motor de cálculo y el **pago** que genera el comprobante contable, además de los **pasivos** a terceros (EPS/AFP/DIAN/parafiscales).

## Acceso
Panel **/admin → Nómina**: KPIs (empleados activos, último periodo, neto y aportes), tabla de periodos con estado, y tabla de empleados.

## Tareas

### Registrar empleado
1. **Empleado**: documento, vinculación (Planta, Trabajador oficial, **Contratista**, Supernumerario, **Aprendiz**), salario, banca, EPS/AFP/ARL/caja y dependencia.

### Liquidar un periodo
1. Cree el **periodo** (`YYYY-MM`).
2. **Liquidar**: el motor calcula devengados, deducciones, aportes y prestaciones (3 pasadas) y muestra el resumen. El periodo pasa a **LIQUIDADO**.

### Pagar
1. **Pagar**: genera **un comprobante EGRESO** que agrega todas las liquidaciones; el periodo pasa a **PAGADO**.

### Pasivos
1. Consulte **pasivos pendientes** del periodo y registre el **pago a cada tercero** (EPS/AFP/DIAN), con valor parcial permitido. Cada pago genera su comprobante (D pasivo / C banco).


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
