% Manual de usuario — Gestión Documental
% Plataforma PublicEnt
% Módulos: gestion_documental, archivo_fisico

# Gestión Documental (Orfeo NG / AGN)

## Para quién
**Ventanilla/Radicador**, **Tramitador** y **Administrador documental** (ADMIN/EDITOR).

## Requisitos
Módulo **gestion_documental**. Opcional **archivo_fisico** (depende de gestión documental).

## Qué permite
Radicar toda la correspondencia institucional (entrada, salida, interno), clasificarla por **TRD** (dependencia → serie → subserie), gestionar **expedientes**, **índice electrónico**, **firma QR**, **VoBo** y, si se contrata, el **archivo físico**.

## Acceso
Panel **/admin → GD**. La bandeja lista radicados con Número, Tipo, Asunto/Dependencia, Remitente, Tramitador, Estado y **Vence**. Filtros por tipo, estado y dependencia.

## Tareas

### Radicar un documento
1. **GD → Nuevo radicado**.
2. Elija tipo (entrada/salida/interno), remitente, asunto y dependencia.
3. El sistema asigna **consecutivo** y calcula la **fecha de vencimiento en días hábiles (Ley Emiliani)**.
4. Clasifique por **TRD** (serie/subserie) y asócielo a un **expediente**.

### Tramitar
1. El radicado se enruta a un **Tramitador**.
2. Avance el estado (En trámite → Pendiente VoBo → …) y registre el **Visto Bueno**.
3. Para documentos de salida, use **plantillas** y **firma QR**.

### Expediente y archivo físico
1. Consolide los documentos en el **expediente** y genere su **índice electrónico**.
2. Si **archivo_fisico** está activo, ubique el expediente en la estructura física (edificio→…→carpeta) y gestione préstamos/transferencias.

### Alertas
El sistema notifica en tiempo real los radicados **próximos a vencer** y nuevas asignaciones.

## Notas del módulo
- Alimenta el indicador **FURAG POL07 (Gestión Documental)**.
- Cuando coexiste con **Ventanilla Única**, una PQRSD que requiere trámite formal se radica aquí y queda trazada extremo a extremo.


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
