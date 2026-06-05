% Manual de administración — Superadmin (plataforma)
% Plataforma PublicEnt
% Ámbito: gestión multi-tenant

# Superadmin — Gestión de la plataforma

## Para quién
**SUPER_ADMIN** de la plataforma (no del tenant). Administra todas las entidades.

## Qué permite
Dar de alta entidades (**tenants**), activar/desactivar **módulos** por entidad, aplicar **ediciones comerciales** (bundles) y consultar el estado de cada tenant. Cada tenant tiene **base de datos separada**.

## Acceso
Inicie sesión en **/superadmin-login** y abra **/superadmin**. La sección **Entidades / Tenants** lista Entidad, Dominio, Municipio, Plan y Estado.

## Tareas

### Crear una entidad (tenant)
1. **Tenants → Nuevo**: nombre, dominio, municipio, tipo de entidad y plan.
2. Se aprovisiona la base de datos del tenant.

### Activar módulos
1. Abra el tenant → **Módulos**. Los módulos se muestran **agrupados por categoría** con su **tier** y **dependencias**.
2. Active los módulos requeridos. El sistema impide activar uno si faltan sus **dependencias**.
3. Al activar **contabilidad / presupuesto / nómina**, se ejecuta la **auto-siembra** de catálogos oficiales (CGC, CCPET, conceptos de nómina); la respuesta confirma cuántos registros se sembraron.

### Aplicar una edición (bundle)
Use las ediciones **Control**, **Ejecutora** o **Rectoría Sectorial** para activar de una vez el conjunto de módulos de un perfil (Personería, SAE, Ministerio, etc.).

### Auditoría
Cada cambio de módulos queda registrado como evento del tenant (anterior, nuevo, semillas) para auditoría.

## Notas
- Los IDs de módulos son **estables**: no se renombran una vez persistidos.
- El núcleo (sitio_web, transparencia, pqrsd) viene activo por defecto en todo tenant.

## Notas generales
- **La IA sugiere y el funcionario decide**: las clasificaciones de IA (urgencia, discrepancias) son sugerencias revisables.
- Roles: **SUPER_ADMIN, ADMIN, EDITOR, USER**.
