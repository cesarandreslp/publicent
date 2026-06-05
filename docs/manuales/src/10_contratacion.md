% Manual de usuario — Contratación
% Plataforma PublicEnt
% Módulo: contratacion

# Contratación pública

## Para quién
**Contratación/Jurídica** y **Administrador** (ADMIN).

## Requisitos
Módulo **contratacion**. Depende de **presupuesto_ejecucion**.

## Qué permite
Gestionar **procesos contractuales** (Ley 80/1150), **contratos** con su contratista y supervisor, documentos, adiciones/prórrogas y el flujo de estados.

## Acceso
Panel **/admin → Contratación**: KPI **Contratos suscritos**, tabla por **Proceso / Modalidad**, **Contratista**, **Supervisor**, **Estado**.

## Tareas

### Crear proceso
1. **Nuevo proceso contractual**: número, objeto, **modalidad**, dependencia, tipo.

### Suscribir contrato
1. **Suscribir contrato**: número de contrato, **N° CDP** y **N° RP**, contratista (nombre, NIT/CC, email), objeto, valor, plazo (meses), supervisor y cargo, fecha de suscripción.

### Documentos y estados
1. **Agregar documento**: tipo, fecha y archivo.
2. **Cambiar estado** del proceso/contrato según avance.


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
