# Informe de prueba funcional — OSS Government One / <tenant>

**Fecha:** <YYYY-MM-DD> · **Build/commit:** <hash o rama> · **Entorno:** local (npm run dev) · **Probado por:** Claude Code
**Alcance:** <todo | público | admin | módulo X> · **Profundidad:** <humo | funcional | exhaustiva>

## Resumen ejecutivo
- Funcionalidades probadas: **N** · OK: **N (xx%)** · Con bugs: **N** · Con mejoras: **N** · Bloqueadas: **N**
- Bugs por severidad: 🔴 crítico **N** · 🟠 alto **N** · 🟡 medio **N** · ⚪ bajo **N**
- Estado general: <semáforo + 2-3 frases>
- Top 5 urgentes: 1) … 2) … 3) … 4) … 5) …

---

## Detalle por funcionalidad

### [Actor] — <Nombre de la funcionalidad>  ·  Ruta: `/...`  ·  API: `POST /api/...`

**Diagrama de flujo esperado**
```mermaid
flowchart TD
    ...
```

**Recorrido y veredictos**
| # | Paso (nodo del diagrama) | Acción en navegador | Resultado | Veredicto | Evidencia |
|---|---|---|---|---|---|
| 1 | Precondición: login admin | fill+submit /login | redirige a /admin | ✅ OK | evidencias/<f>-01.png |
| 2 | Crear registro QA- | … | … | 🐞 Bug (alto) | evidencias/<f>-02.png |
| … | … | … | … | … | … |

**Hallazgos**
- 🐞 **[alto] <título>** — Reproducir: <pasos>. Esperado: <…>. Obtenido: <…>. Consola/red: `<error>`. Archivo probable: `src/...`.
- ⚠️ **[medio] <mejora>** — <descripción y por qué>. Sugerencia: <…>.

**Veredicto del flujo:** ✅ OK | 🐞 con bugs | ⛔ bloqueado — <una línea>.

---
<!-- repetir el bloque anterior por cada funcionalidad, en el orden priorizado -->

---

## Backlog priorizado (consolidado)
| ID | Tipo | Sev/Prio | Funcionalidad | Descripción | Reproducir | Archivo/ruta sugerida |
|----|------|----------|---------------|-------------|------------|-----------------------|
| B01 | 🐞 Bug | 🔴 crítico | PQRSD radicar | 500 al enviar | … | `src/app/api/pqrsd/route.ts` |
| B02 | 🐞 Bug | 🟠 alto | … | … | … | … |
| M01 | ⚠️ Mejora | alto | … | … | — | … |

## Cobertura
- Funcionalidades del inventario cubiertas: <lista> · No cubiertas y por qué: <lista>.
- Módulos no activos en el tenant (no probados): <lista>.

## Datos de prueba creados
- <lista de registros QA-/test_ creados> — limpiados: sí/no.

## Notas de entorno
- Credenciales usadas, versiones, anomalías de arranque, migraciones pendientes detectadas, etc.
