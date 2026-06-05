% Manual de usuario — Contabilidad pública
% Plataforma PublicEnt
% Módulo: contabilidad_publica

# Contabilidad pública (CGN / CGC)

## Para quién
**Contador** y **Administrador financiero** (ADMIN).

## Requisitos
Módulo **contabilidad_publica**. Al activarlo se **siembra automáticamente** el Catálogo General de Cuentas (CGC, ~3.745 cuentas de la CGN).

## Qué permite
Motor de **doble partida** con el CGC: periodos contables, comprobantes con asientos cuadrados (débito = crédito) y balance del periodo.

## Acceso
Panel **/admin → Contabilidad**: KPIs por clase (1–5), **Balance del periodo activo**, últimos comprobantes y cuentas con movimiento.

## Tareas

### Abrir un periodo
1. **Nuevo periodo**: el sistema autocalcula el código `YYYY-MM` y el rango de fechas.
2. El periodo queda **ABIERTO** (estados: ABIERTO, CERRADO, AJUSTE).

### Registrar un comprobante
1. **Nuevo comprobante**: indique fecha y descripción.
2. Agregue las **líneas** (asientos): cuenta, débito o crédito, detalle y tercero.
3. El sistema valida en vivo la **partida doble** (insignia "✓ partida doble"). Solo permite registrar si **Débitos = Créditos**.
4. Solo se permiten asientos sobre **cuentas hoja** (que permiten movimiento) y dentro de un periodo **ABIERTO**.

### Consultar el balance
En **Balance del periodo activo** se agregan débitos, créditos y saldo por cuenta, con totales para verificar el cuadre global.

### Anular
Un comprobante puede **anularse** con motivo (acción irreversible); el balance recalcula.


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
