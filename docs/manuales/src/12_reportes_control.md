% Manual de usuario — Reportes a entes de control
% Plataforma PublicEnt
% Módulo: reportes_control

# Reportes a entes de control (CHIP / FUT / Ley 617)

## Para quién
**Contador** y **Administrador financiero** (ADMIN).

## Requisitos
Módulo **reportes_control**. Depende de **contabilidad_publica**.

## Qué permite
Generar y archivar reportes para organismos de control: **CHIP** (Balance y Actividad), **FUT** (Ingresos y Gastos) y **Ley 617**, con exportación a **Excel (.xlsx)**.

## Acceso
Panel **/admin → Reportes de control**: cinco botones (uno por tipo) y la **bitácora** de reportes generados (Tipo, Corte, Generado, Resumen).

## Tareas

### Generar un reporte
1. Pulse el tipo deseado:
   - **CHIP Balance / Actividad**: solicita el **periodo contable**.
   - **FUT Ingresos / Gastos**: solicita la **vigencia**.
   - **Ley 617**: solicita vigencia y **categoría municipal** (tope del indicador).
2. El sistema toma un **snapshot** de datos y lo guarda en la bitácora.

### Descargar
1. En cada fila, descargue el **JSON** o el **XLSX** (formato moneda COP, totales). El XLSX es navegable y se copia/pega al template oficial del organismo.

### Eliminar
Un snapshot puede eliminarse desde la bitácora (con confirmación).


## Notas generales
- Los **plazos en días hábiles** respetan la **Ley Emiliani** (festivos + traslado a lunes), vía cálculo central.
- **La IA sugiere y el funcionario decide**; el motor contable de doble partida y los saldos son validaciones determinísticas, sin IA.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
