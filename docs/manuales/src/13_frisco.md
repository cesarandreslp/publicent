% Manual de usuario — FRISCO (SAE)
% Plataforma PublicEnt
% Módulos: frisco_bienes, frisco_interop, portal_externo

# FRISCO — Administración de bienes (SAE)

## Para quién
**Administrador de bienes** y **Funcionario SAE** (ADMIN/EDITOR); **Depositario** (externo, vía portal).

## Requisitos
Módulo **frisco_bienes** (depende de **gestion_documental** y **activos_bienes**). Opcionales **frisco_interop** y **portal_externo** (portal del depositario).

## Qué permite
Administrar bienes en proceso (extinción de dominio / FRISCO): registro del bien, **depositarios**, **contratos**, **destinación**, **interoperabilidad** (SNR / Fiscalía / IGAC) y el **portal del depositario** con reporte mensual y análisis de IA.

## Acceso
Panel **/admin → FRISCO — Bienes**: dashboard con KPIs por estado (En proceso, Cautelar, Extinto, Devuelto) y tabla con búsqueda/filtros. La ficha del bien tiene pestañas: **Resumen, Depositarios, Contratos, Destinación, Interop, Reportes**.

## Tareas

### Registrar un bien
1. **Registrar bien**: tipo, descripción, estado jurídico, avalúo, expediente GD y carpeta física (si aplica).

### Depositario, contrato y destinación
1. **Depositarios**: asigne el custodio (con póliza y datos de contacto).
2. **Contratos**: registre contrato (arrendamiento, comodato, etc.), canon y vigencia.
3. **Destinación**: defina la destinación del bien (relación 1:1 con el bien).

### Interoperabilidad
1. Pestaña **Interop**: consulte **SNR** (folio de matrícula), **Fiscalía** (número de proceso) e **IGAC**.
2. Use **Analizar discrepancias**: la IA cruza las respuestas y datos internos y reporta **discrepancias** con severidad (INFO/ALERTA/CRÍTICA), nivel de riesgo y resumen del proceso fiscal.

### Portal del depositario y reporte mensual
1. Desde **Depositarios**, genere el **acceso al portal** (token de un solo uso, opción de envío por email). El depositario ingresa sin contraseña.
2. El depositario presenta su **reporte mensual** (estado del bien, novedades) en el portal externo.
3. La **IA del reporte** clasifica la urgencia (NORMAL / ATENCIÓN / CRÍTICA) y etiqueta; en la pestaña **Reportes** el funcionario revisa y hace **override de urgencia** si corresponde.


## Notas generales
- **La IA sugiere y el funcionario decide**: las clasificaciones de IA (urgencia, discrepancias) son sugerencias revisables.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
