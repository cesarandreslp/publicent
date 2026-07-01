---
name: prueba-funcional
description: Ejecuta una prueba funcional completa del producto (portal público + admin + superadmin) manejando el navegador, siguiendo un diagrama de flujo por funcionalidad y documentando TODO — qué funciona, qué está roto y las mejoras/correcciones a hacer. Úsalo cuando el usuario pida "prueba funcional", "probar todo el proyecto desde el navegador", "test funcional completo", "QA end-to-end", o auditar/documentar todas las funcionalidades.
---

# Prueba funcional completa (browser-driven)

Auditoría funcional end-to-end de **OSS Government One / Personería de Buga** (Next.js 16, multi-tenant)
conduciendo un navegador real. Para **cada** funcionalidad: primero se dibuja el diagrama de flujo,
luego se recorre ese flujo paso a paso en el navegador y se documenta el resultado y las mejoras.

> **Principio rector (el usuario lo pidió explícito):** el diagrama de flujo manda. Se construye
> ANTES de tocar el navegador y se ejecuta **en su orden**. No se improvisa el recorrido.

## Cuándo usar este skill
- "Hazme una prueba funcional completa", "prueba todo desde el navegador", "documenta todas las funcionalidades".
- Auditoría de QA de una entrega, validación antes de demo, o levantar el backlog de correcciones.

## Entradas que conviene confirmar antes de arrancar
Si el usuario no lo dijo, **elige el default y avísalo** (no bloquees por esto salvo credenciales):
- **Alcance**: todo (default) | solo público | solo admin/CMS | un módulo específico.
- **Profundidad**: *humo* (cada pantalla carga sin error) | *funcional* (default: crear/editar/flujo real con datos de prueba) | *exhaustiva* (casos borde + validaciones + permisos por rol).
- **Datos de prueba**: ¿se permite crear/editar registros reales en la BD del tenant? (default: sí, marcando todo lo creado con prefijo `QA-` / `test_` para poder limpiarlo).

## Herramientas de navegador
Usa el **MCP de preview/navegador** (cárgalo con ToolSearch si está diferido):
- Preferido para dev server local: `mcp__Claude_Preview__*` (`preview_start`, `preview_click`, `preview_fill`,
  `preview_screenshot`, `preview_eval`, `preview_console_logs`, `preview_network`, `preview_snapshot`).
- Alternativa: `mcp__Claude_in_Chrome__*` (`navigate`, `find`, `form_input`, `read_page`, `read_console_messages`, `read_network_requests`, `computer`).

Carga en bloque: `ToolSearch { query: "preview", max_results: 30 }` o `{ query: "claude-in-chrome", max_results: 30 }`.

**Siempre** que cargues una pantalla: captura `console_logs` y `network` para detectar errores 4xx/5xx
y excepciones JS aunque la UI "se vea bien". Un 500 silencioso es un hallazgo.

## Procedimiento

### Fase 0 — Levantar la app y autenticarse
1. App: `npm run dev` en `C:\projects\publicent2\personeriabuga` → http://localhost:3000 (usa `run_in_background`).
   Espera a que compile (`preview_start` con esa URL, o navega y reintenta hasta 200).
2. Credenciales (de `e2e/helpers.ts` y `.env`; ver `referencia/inventario-funcionalidades.md`):
   - **Admin/CMS**: `/login` → `admin@personeriabuga.gov.co` / `Test1234!`
   - **Funcionario PQRS**: `/login` → `funcionario@personeriabuga.gov.co` / `Test1234!`
   - **Superadmin**: `/superadmin-login` → `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` de `.env`.
   - **Ciudadano/público**: sin login.
   Si una credencial falla, es un hallazgo **bloqueante** — pregunta al usuario las correctas antes de seguir.

### Fase 1 — Inventario y priorización
3. Construye la lista de funcionalidades por **actor** a partir de `referencia/inventario-funcionalidades.md`
   y **verifica contra la realidad**: en `/admin` lee el sidebar (módulos activos varían por tenant);
   en el portal recorre el menú. Una entrada de menú que existe pero no está en la referencia = agrégala.
4. Prioriza el orden de prueba (esto define la secuencia de toda la corrida):
   1. **Camino crítico del ciudadano** (portal público → PQRSD → consulta de radicado): es la cara visible.
   2. **Núcleo CMS admin** (contenido, noticias, páginas, transparencia, documentos, usuarios).
   3. **Gestión** (PQRSD bandeja/responder, ventanilla, gestor documental, MIPG).
   4. **Módulos verticales activos** (FRISCO, contabilidad, presupuesto, nómina, disciplinaria, etc.).
   5. **Superadmin** (ciclo de vida de tenant, activar módulos).

### Fase 2 — Por cada funcionalidad: diagrama → ejecución → hallazgos
Repite este micro-ciclo para cada funcionalidad, **en el orden priorizado**:

**(a) Diagrama de flujo primero.** Escribe el flujo esperado como Mermaid `flowchart`
(ver `plantillas/diagrama-flujo.md`): actor, precondición, pasos, decisiones, estado final esperado.
Si no conoces el flujo real, derívalo rápido del código (la ruta `page.tsx`, su API en `src/app/api/...`,
schema Zod en `src/lib/validations.ts`) — pero el diagrama refleja el comportamiento **esperado**, no el bug.

**(b) Ejecuta el diagrama en el navegador, nodo por nodo.** Por cada paso: acción (click/fill/navigate),
screenshot, y lectura de console+network. Usa datos de prueba con prefijo `QA-`/`test_`. Sigue las
ramas de decisión reales (prueba al menos un camino feliz y una validación que deba fallar).

**(c) Registra el resultado** en el informe con uno de estos veredictos por paso/flujo:
- ✅ **OK** — se comporta como el diagrama.
- 🐞 **Bug** — diverge del esperado (incluye: pasos para reproducir, screenshot, error de consola/red, severidad).
- ⚠️ **Mejora** — funciona pero debería mejorarse (UX, accesibilidad, validación, copy, performance).
- 🚧 **No implementado / placeholder** — el flujo o un nodo no existe todavía.
- ⛔ **Bloqueado** — no se pudo probar (dependencia, credencial, dato faltante) — di por qué.

Severidad de bugs: **crítico** (rompe el flujo / 500 / pérdida de datos) · **alto** (función clave inutilizable) ·
**medio** (workaround posible) · **bajo** (cosmético). Las mejoras se priorizan **alto/medio/bajo**.

### Fase 3 — Informe consolidado
5. Entrega el informe en `docs/qa/prueba-funcional-<YYYY-MM-DD>.md` (crea `docs/qa/` si no existe), usando
   `plantillas/informe.md`. Debe incluir, para cada funcionalidad: el **diagrama Mermaid**, el recorrido con
   veredictos por paso, evidencias (screenshots guardados en `docs/qa/evidencias/`), y los hallazgos.
6. Al final, un **backlog priorizado** (tabla) de TODOS los bugs y mejoras, ordenado por severidad, con
   ruta/archivo sugerido para el fix cuando sea evidente del código.
7. Resumen ejecutivo arriba: # funcionalidades probadas, % OK, # bugs por severidad, # mejoras, bloqueados.

### Fase 4 — Cierre
8. Limpia los datos de prueba `QA-`/`test_` que hayas creado (o lístalos para que el usuario los borre).
9. Si encontraste algo de arquitectura/decisión no trivial, anótalo en `personeriabuga/CLAUDE.md`
   (es la bitácora viva del proyecto; respeta su formato de fases/hallazgos).
10. Reporta al usuario: dónde quedó el informe, el conteo de hallazgos y los 3-5 más urgentes.

## Reglas
- **No te saltes el diagrama.** Si vas a probar algo sin diagrama, primero dibújalo.
- **Documenta TODO**, incluido lo que funciona bien (el usuario pidió "absolutamente todas las funcionalidades").
- Un flujo no es "OK" hasta que llegaste al **estado final esperado** del diagrama (radicado generado, comprobante creado, registro persistido y visible al recargar).
- Prefiere los datos de prueba aislados con prefijo; nunca borres datos que no creaste tú.
- Si un módulo del sidebar no está activo para el tenant, anótalo como ⛔ "módulo no contratado/activo" y, si el alcance lo amerita, actívalo desde Superadmin para probarlo.
- Trabaja por lotes pero persiste el informe **incrementalmente** (no esperes al final para escribir).

## Archivos de apoyo
- `referencia/inventario-funcionalidades.md` — mapa actor → funcionalidad → ruta → API, y credenciales.
- `plantillas/diagrama-flujo.md` — convención Mermaid para los diagramas de flujo.
- `plantillas/informe.md` — estructura del informe de salida.
