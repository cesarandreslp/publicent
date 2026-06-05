% Manual de usuario — MIPG y FURAG
% Plataforma PublicEnt
% Módulo: mipg

# MIPG y FURAG

## Para quién
**Enlace MIPG** y **Administrador** (ADMIN) responsables del reporte institucional.

## Requisitos
Módulo **mipg**. Depende de **sitio_web**. Los indicadores se alimentan de los módulos activos (PQRSD/VU, Gestión Documental, Transparencia).

## Qué permite
Tablero MIPG por dimensiones y políticas, **estado del FURAG**, evaluación de indicadores, carga de evidencias y **alerta de vigencia** de la ventana de reporte FURAG (DAFP, octubre→marzo).

## Acceso
Panel **/admin → MIPG**: Dashboard MIPG con *Índice de Desempeño (IDI)*, *Desempeño por Dimensión*, *Políticas Evaluadas*, *Evidencias confirmadas* y *Estado del FURAG*.

## Tareas

### Revisar indicadores FURAG
1. Abra **MIPG → Evaluación**.
2. Revise los indicadores que se autoalimentan:
   - **POL06 — Atención al ciudadano**: oportunidad de PQRSD + cobertura demográfica (requiere pqrsd / ventanilla_unica).
   - **POL07 — Gestión documental**: radicados, TRD y expedientes (requiere gestion_documental).
   - **POL03 — Transparencia**: ítems Ley 1712 publicados (requiere transparencia).

### Cargar evidencias
1. En **MIPG → Evidencias**, suba los soportes por política.
2. Confirme las evidencias; el tablero refleja el avance.

### Alerta de vigencia FURAG
1. El sistema indica el **estado de la vigencia** (INFORMATIVA, ADVERTENCIA, URGENTE, CRÍTICA o VENCIDA) y los días restantes hasta el cierre.
2. La ventana del DAFP va de **octubre del año de vigencia a marzo del año siguiente** (por defecto cierre 31 de marzo).

## Notas del módulo
- A mayor número de módulos activos, mayor cobertura automática de indicadores FURAG.
- Las fechas de la ventana se calculan en UTC para no desfasar el día de cierre.


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
