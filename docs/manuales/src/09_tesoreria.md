% Manual de usuario — Tesorería
% Plataforma PublicEnt
% Módulo: tesoreria

# Tesorería

## Para quién
**Tesorero** y **Administrador financiero** (ADMIN).

## Requisitos
Módulo **tesoreria**. Depende de **presupuesto_ejecucion**.

## Qué permite
Gestionar **cuentas bancarias**, registrar **movimientos** del libro, cargar **extractos** y realizar **conciliación** par a par.

## Acceso
Panel **/admin → Tesorería**: KPIs **Saldo total en banco**, **Movimientos pendientes de conciliar** y total de cuentas; tabla de cuentas con **Saldo libro** y botón **Conciliar**.

## Tareas

### Crear cuenta bancaria
1. **Nueva cuenta bancaria**: nombre interno, banco, NIT banco, número, tipo y **cuenta CGC (111\*)**.

### Registrar movimiento
1. **Registrar movimiento**: cuenta, tipo **Ingreso (crédito)** o **Egreso (débito)**, fecha, valor, número (OR/OE), descripción y tercero.
2. El **saldo libro** se calcula al vuelo (Σ ingresos − Σ egresos).

### Cargar extracto
1. **Cargar extracto bancario**: indique periodo `YYYY-MM`, saldo inicial y final.
2. Pegue o seleccione el archivo **CSV/TSV/TXT** con las líneas (fecha, descripción, referencia, débito, crédito, saldo).

### Conciliar
1. En el panel de conciliación, seleccione un **movimiento pendiente** (izquierda) y la **línea de extracto** correspondiente (derecha).
2. Pulse **Conciliar par seleccionado**. El sistema valida misma cuenta, tipo coherente y diferencia ≤ 0,5 COP.


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
