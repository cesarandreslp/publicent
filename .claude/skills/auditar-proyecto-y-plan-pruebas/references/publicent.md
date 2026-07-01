# Contexto específico — PublicEnt / OSS Government One

SaaS multi-tenant para entidades públicas colombianas. Úsalo como espina dorsal cuando
audites este proyecto. Verifica siempre contra el código actual (puede haber cambiado).

## Fuentes de verdad
- **Catálogo de módulos:** `src/lib/modules.ts` (`MODULO_IDS`, `MODULOS_CATALOGO`,
  `MODULOS_DEFAULT`). Es la espina dorsal del inventario. Cuenta los módulos con cuidado:
  hay claves con espaciado irregular que pueden engañar un `grep` simple — vuelve a contar
  con `awk`/`sort -u` y reconcilia `MODULO_IDS` contra las entradas `id: MODULO_IDS.*`.
- **Bundles comerciales:** `src/lib/module-bundles.ts` (`CONTROL`, `EJECUTORA`,
  `RECTORIA_SECTORIAL`) — atajos de activación por perfil de entidad.
- **Bitácora destino:** `personeriabuga/BITACORA.md`. Respeta su cabecera/formato y NO
  contradigas sus hallazgos (B01–B09), decisiones ni la 🎯 SOLICITUD PRINCIPAL.

## Arquitectura transversal a documentar
- Multi-tenant por dominio: `src/middleware.ts` + `src/lib/tenant-edge.ts`.
- Dos planos de datos: **meta-DB** (catálogo de tenants/módulos/superadmins) + **BD por
  tenant**. Clientes: `src/lib/prisma.ts`, `prisma-meta.ts`, `src/generated/meta-client/`.
- Auth CMS: NextAuth v5, roles `SUPER_ADMIN|ADMIN|EDITOR|USER` (`src/lib/authorization.ts`).
- Auth superadmin: JWT `sa_token` (`src/lib/superadmin-auth*.ts`).
- Provisioning: `src/lib/provisioning/` + `scripts/provision-tenant.ts`; seeders en
  `src/lib/seeders/`.
- Servicios comunes: storage (`storage.ts`/`upload.ts`), mail, WhatsApp, ALTCHA
  (`altcha.ts`), rate-limit, auditoría, IA/LLM (`groq-client.ts` + helpers por dominio).
- Endpoints especiales: `api/v1/public/radicados`, `api/webhooks/ventanilla`,
  `api/cron/diario`, `api/altcha/challenge`, `portal/frisco/[token]`.

## Reglas de seguridad ya fijadas (no contradecir)
- **La meta-DB del `.env` es la de PRODUCCIÓN.** Toda alta de tenant o escritura destructiva
  va en entorno dev/aislado, nunca en la meta de prod salvo decisión explícita del usuario.
- **Regla de oro:** local (desarrollar+verificar) → commit → push → merge a `main` → Vercel
  deploya → verificar en la URL real.
- Pendientes de seguridad heredados: rotar el PAT de GitHub expuesto; quitar `TENANT_SLUG`
  en Vercel al operar multi-tenant (B06); usar connection-string pooled de Neon (B03).

## Metodología de pruebas ya acordada (la 🎯 SOLICITUD PRINCIPAL)
Probar **desde el Superadmin del SaaS**, no desde un tenant existente:
1. Login Superadmin → crear tenant desde cero (datos, logo, usuarios, config).
2. Activar **solo** los módulos que el tipo de entidad requiere (`entidadesObjetivo`/`dependeDe`).
3. Repetir por arquetipos: Alcaldía, Ministerio, SAE, Personería.
4. Operar cada tenant: crear y **radicar** PQRSD y ejercer sus módulos de punta a punta.
5. **Prueba de aislamiento:** ningún dato de un tenant debe aparecer en otro (detecta
   hardcodes residuales de "Personería de Buga").

## Hallazgos visuales abiertos (incluir en la capa visual)
- Botón "Radicar PQRSD" del header: azul sobre azul, sin contraste (WCAG).
- Redundancia nombre oficial + nombre corto en el header del tenant.
- Pendiente: barrido sistemático de contraste/branding/consistencia.

## Activos de prueba existentes (reutilizar, no recrear)
- Vitest: `src/__tests__/` (api, components, hooks, lib). Scripts `test:run`, `test:coverage`.
- Playwright: `e2e/` (10 specs) + `helpers.ts`. Nota: `parseRadicado` usa un regex que NO
  coincide con el formato real de radicado `TIPO-AAAAMMDD-######` (B08) — corregir al tocar tests.
- Skill QA browser-driven: `.claude/skills/prueba-funcional/`.
