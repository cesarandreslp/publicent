% Manual de usuario — Ventanilla Única
% Plataforma PublicEnt
% Módulo: ventanilla_unica

# Ventanilla Única (con IA)

## Para quién
**Funcionario** y **Supervisor** (ADMIN/EDITOR) que gestionan la bandeja de PQRSD.

## Requisitos
Módulo **ventanilla_unica**. Depende de **pqrsd**. Reemplaza/enriquece la atención básica.

## Qué permite
Clasificación automática de PQRSD con IA (tipo, prioridad, dependencia y término legal sugeridos), **semáforo** de vencimiento (CPACA / Ley 1437), asignación a funcionarios, tipos de respuesta formales y, opcionalmente, **delegación a un sistema externo** (configurando su URL de API).

## Acceso
Panel **/admin → Ventanilla**: *Bandeja de radicados PQRSD* con columnas Radicado, Solicitante, Tipo, Prioridad, Estado, Asignado a, Semáforo y Vence. Filtros por estado/prioridad y búsqueda.

## Tareas

### Revisar la clasificación de IA
1. Abra un radicado de la bandeja.
2. El sistema muestra la **sugerencia de IA**: tipo, prioridad, dependencia y funcionario sugeridos y el término legal.
3. **Confirme o corrija** (la IA sugiere; usted decide).

### Asignar / reasignar
1. Asigne el radicado a la dependencia/funcionario.
2. Use **reasignar** si corresponde a otra área; queda trazado.

### Responder
1. Use **responder** y elija el tipo de respuesta (competente, remisión, traslado, insistencia, desistimiento, improcedente).
2. El **semáforo** (verde/amarillo/rojo/negro) refleja el tiempo restante hasta el vencimiento en días hábiles.

### Demografía (FURAG)
Los datos demográficos voluntarios del ciudadano alimentan el indicador **FURAG POL06**.

## Notas del módulo
- El **vencimiento** usa días hábiles + Ley Emiliani, igual que la ruta base.
- Si la entidad configuró una **URL de sistema externo**, la Ventanilla puede delegar la gestión a ese sistema.


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
