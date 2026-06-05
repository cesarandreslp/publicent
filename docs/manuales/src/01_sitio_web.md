% Manual de usuario — Portal institucional (CMS)
% Plataforma PublicEnt
% Módulo: sitio_web

# Portal institucional (CMS)

## Para quién
Administrador del sitio (ADMIN/EDITOR) que publica y mantiene el contenido del portal Gov.co.

## Requisitos
Módulo **sitio_web** (núcleo, siempre activo). No depende de otros módulos.

## Qué permite
Gestionar el portal público de la entidad conforme a la guía Gov.co: páginas, menú de navegación, noticias, banners/slider y la configuración general del sitio.

## Acceso
Inicie sesión en **/login** y abra el panel **/admin**. En el menú lateral encontrará: Contenido, Páginas, Noticias, Slider, Menú y Configuración.

## Tareas

### Publicar una noticia
1. Vaya a **Noticias → Nueva**.
2. Complete título, resumen, contenido (editor enriquecido), imagen destacada y categoría.
3. Defina estado **Publicada** o **Borrador** y guarde.
4. La noticia queda disponible en **/noticias** del portal público.

### Crear o editar una página
1. **Páginas → Nueva** (o seleccione una existente).
2. Edite las **secciones** de la página (bloques de contenido).
3. Guarde; la página queda enlazada desde el menú si así se configura.

### Administrar el menú
1. **Menú**: agregue, ordene o elimine entradas del menú principal.
2. Cada entrada apunta a una página, sección o URL.

### Slider y banners
1. **Slider**: cargue imágenes de portada, defina orden y enlace.
2. Configure banners emergentes desde el mismo panel.

### Configuración del sitio
1. **Configuración**: datos de la entidad, logos, colores, redes y textos legales.


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
