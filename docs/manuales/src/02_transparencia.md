% Manual de usuario — Transparencia (Ley 1712)
% Plataforma PublicEnt
% Módulo: transparencia

# Transparencia y acceso a la información

## Para quién
Administrador (ADMIN/EDITOR) responsable de la sección de transparencia.

## Requisitos
Módulo **transparencia** (núcleo). Depende de **sitio_web**.

## Qué permite
Publicar y mantener la información mínima obligatoria de la **Ley 1712 de 2014**, organizada por categorías e ítems, con sus documentos asociados.

## Acceso
Panel **/admin → Transparencia**. El público la consulta en **/transparencia**.

## Tareas

### Crear una categoría
1. **Transparencia → Categorías → Nueva**.
2. Defina nombre y orden (corresponde a los numerales de la Ley 1712).

### Publicar un ítem o documento
1. Entre a la categoría y use **Nuevo ítem**.
2. Cargue el documento o enlace, con título y fecha.
3. Guarde; queda visible en la categoría pública correspondiente.

### Verificación
Revise en **/transparencia** que cada numeral obligatorio tenga contenido. Este módulo alimenta el indicador **FURAG POL03 (Transparencia)**.


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
