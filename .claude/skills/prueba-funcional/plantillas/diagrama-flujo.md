# Convención de diagrama de flujo (Mermaid)

Cada funcionalidad se prueba **siguiendo su diagrama**. Dibújalo ANTES de abrir el navegador.
Refleja el comportamiento **esperado** (no el bug). Formato: `flowchart TD`.

## Plantilla

```mermaid
flowchart TD
    A([Actor: <ciudadano|admin|funcionario|superadmin>]) --> P[Precondición: <login/datos previos>]
    P --> S1[Paso 1: <acción concreta>]
    S1 --> S2[Paso 2: <acción>]
    S2 --> D{¿Validación / decisión?}
    D -- camino feliz --> S3[Paso 3: <acción>]
    D -- caso inválido --> E[Esperado: error/validación visible]
    S3 --> F([Estado final esperado: <radicado PGB-2026-#####, registro persiste y se ve al recargar>])
```

## Reglas del diagrama
- **Actor** y **precondición** explícitos (qué sesión, qué datos previos).
- Incluye al menos **una rama de decisión** (camino feliz + un caso que DEBE fallar/validar).
- El **estado final esperado** debe ser observable y verificable (un radicado generado, un comprobante
  con partida doble cuadrada, un registro que persiste tras recargar, un email/WhatsApp disparado).
- Numera los pasos para poder mapear cada veredicto del informe a un nodo (`Paso 2 → 🐞 Bug`).
- Marca los nodos que dependen de un módulo activable o de credenciales externas.

## Cómo se usa al ejecutar
1. Dibuja el diagrama en la sección de la funcionalidad dentro del informe.
2. Recorre el navegador **nodo por nodo, en orden**.
3. Por cada nodo: screenshot + lectura de console/network + veredicto (✅/🐞/⚠️/🚧/⛔).
4. El flujo solo es ✅ si llegaste al nodo de **estado final esperado**.
