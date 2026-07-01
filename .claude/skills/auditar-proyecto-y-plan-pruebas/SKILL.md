---
name: auditar-proyecto-y-plan-pruebas
description: >-
  Recorre un proyecto/repositorio completo, inventaria todas sus funcionalidades,
  las documenta en una bitácora (BITACORA.md u otro registro) respetando el formato
  y las reglas ya existentes, y deriva un plan integral de pruebas por capas que no
  contradice lo previamente escrito. Úsalo cuando el usuario diga "recorre todo el
  proyecto y dime qué funcionalidades existen", "documenta las funcionalidades en la
  bitácora", "haz un inventario funcional", "arma un plan de pruebas", "audita el
  repositorio" o "establece un plan de QA sin romper lo que ya está".
---

# Auditar proyecto y establecer plan de pruebas

Produce dos entregables a partir de un código fuente existente: (1) un **inventario de
funcionalidades** documentado en la bitácora del proyecto, y (2) un **plan integral de
pruebas** por capas. La regla rectora es **no contradecir** lo ya escrito en la bitácora:
respetar su formato, sus reglas de actualización y sus hallazgos/decisiones previas.

## Principios

- **Leer antes de escribir.** Nunca documentes sin antes leer la bitácora destino completa.
  Su cabecera define el formato de entrada (fecha · tipo · descripción · archivos · estado)
  y reglas de flujo. Replícalo exactamente; no impongas un estilo nuevo.
- **Append, no reescribir.** Agrega una sección nueva fechada al final. No edites ni borres
  entradas previas. No "corrijas" decisiones ya tomadas; si algo cambia, regístralo como
  entrada nueva con su tipo (`CAMBIO`/`HALLAZGO`/`DECISIÓN`).
- **Verificar contra el código.** Cada funcionalidad afirmada debe respaldarse con una ruta
  o archivo real. Cuenta artefactos (rutas API, páginas, modelos) en vez de estimar.
- **El plan se subordina a lo establecido.** El plan de pruebas debe reutilizar la
  metodología, las reglas de seguridad y los hallazgos abiertos que ya figuran en la
  bitácora, y referenciarlos — no proponer un enfoque que los ignore o los contradiga.

## Procedimiento

### 1. Reconocer el terreno
Mapea la estructura antes de leer detalle:
- Árbol de directorios de `src/` (o equivalente) y archivos de configuración raíz.
- `package.json` / `pyproject.toml` / `go.mod`: scripts, dependencias, framework.
- Localiza un **registro/catálogo central** si existe (p. ej. un módulo de "modules",
  "registry", "config", "routes"). Suele ser la fuente única de verdad del alcance.
- Identifica la **bitácora destino** y léela íntegra. Extrae: formato de entrada, reglas,
  hallazgos abiertos, decisiones, metodología de pruebas ya acordada.

### 2. Inventariar funcionalidades
- Si hay catálogo central de módulos/features, úsalo como espina dorsal y agrupa por
  categoría. Verifica que cada entrada del catálogo tenga implementación real.
- Cuenta artefactos con precisión (`find ... -name route.ts | wc -l`, páginas, modelos de
  datos). Reporta los números, no aproximaciones — y vuelve a contar si una cifra parece
  redonda o si el primer comando pudo fallar por espaciado/regex.
- Documenta también la **arquitectura transversal** (auth, multi-tenant, capa de datos,
  servicios comunes) por separado: sostiene a todos los módulos pero no es un módulo.
- Inventaria los **activos de prueba ya existentes** (unit, e2e, fixtures, skills de QA)
  para no recrearlos y para reutilizarlos en el plan.

### 3. Documentar en la bitácora
- Abre una sección nueva con la fecha actual (usa `date` real, no la inventes).
- Usa el tipo de entrada que define la bitácora. Para el inventario: una entrada de tipo
  inventario/registro; para el plan: una entrada de tipo `PLAN`.
- Marca cada entrada con su `estado` según la convención del archivo
  (`PENDIENTE`/`EN CURSO`/`HECHO`/`DESPLEGADO` u otra que use el proyecto).
- Cita rutas/archivos reales en cada afirmación.

### 4. Derivar el plan integral de pruebas (por capas)
Estructura el plan en capas ejecutables, anclándolo a lo ya establecido. Capas sugeridas
(ajusta a la naturaleza del proyecto):

0. **Automatizado/regresión** — correr y dejar en verde la suite existente; saldar deuda
   de tests desalineados antes de exigirlos como gate.
1. **Onboarding/flujo real** — ejercer el camino de entrada principal del sistema (en SaaS,
   alta desde el panel de administración; respeta la metodología ya acordada en la bitácora).
2. **Aislamiento / integridad de datos** — en multi-tenant o multi-usuario, verificar que
   no se filtran datos entre contextos ni hay hardcodes residuales.
3. **Recorrido funcional por módulo** — de punta a punta (flujo de escritura real, no solo
   que la pantalla cargue), mínimos por área.
4. **Seguridad y autorización** — matriz de roles × rutas, captcha/rate-limit, webhooks,
   APIs públicas; arrastra los pendientes de seguridad abiertos.
5. **Rendimiento y resiliencia** — reproducir y cerrar los hallazgos de performance abiertos.
6. **Accesibilidad, visual y responsive** — barrido de contraste/branding/WCAG y móvil,
   incorporando los hallazgos visuales ya listados.
7. **Limpieza y cierre** — datos de prueba, dependencias huérfanas, credenciales temporales.

Cierra el plan con un **orden de ejecución sugerido** y la indicación de registrar cada
hallazgo nuevo en la bitácora con su tipo y estado.

### 5. Verificar coherencia y entregar
- Reconciliar el inventario con el código (conteos, nombres de módulos) y corregir cualquier
  desviación en la bitácora.
- Confirmar que el plan **menciona explícitamente** las reglas, hallazgos y metodología
  previos en vez de contradecirlos.
- Presentar la bitácora actualizada al usuario y resumir en pocas frases.

## Reglas de seguridad al documentar/probar

- No ejecutes escrituras destructivas contra producción. Si el entorno de datos meta/compartido
  es el de producción (revísalo en la bitácora/`.env`), toda alta o prueba destructiva va en
  entorno aislado salvo decisión explícita del usuario.
- No versiones secretos. No reproduzcas credenciales en la bitácora.
- Respeta la "regla de oro" del proyecto sobre cómo un cambio llega a producción, si existe.

## Específico de PublicEnt / OSS Government One

Cuando el proyecto sea PublicEnt / OSS Government One (SaaS multi-tenant para entidades
públicas colombianas), aplica el contexto detallado de `references/publicent.md`: catálogo
de módulos, planos de datos meta/tenant, bundles comerciales, metodología "desde el
Superadmin" y reglas de aislamiento ya fijadas en su `BITACORA.md`.
