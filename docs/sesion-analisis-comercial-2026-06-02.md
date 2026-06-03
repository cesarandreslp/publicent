# Sesión de análisis y estrategia comercial — 2026-06-02

> **Contexto:** Sesión completa de trabajo en Cowork. Se analizó el codebase del producto, se investigaron dos clientes objetivo (MinIgualdad y SAE), se construyeron propuestas comerciales en PDF y tablas de paralelo problema/solución.

---

## 1. Análisis exhaustivo del codebase

### 1.1 Arquitectura general y multi-tenancy

La plataforma opera como SaaS multi-tenant donde cada entidad pública tiene su propia BD PostgreSQL aislada (Neon serverless). Existe una meta-BD central con el registro de todos los tenants.

**Flujo de resolución de tenant:**
1. Cada request HTTP llega a `src/middleware.ts`
2. Se extrae el `host` → consulta meta-DB en Edge Runtime → inyecta headers `x-tenant-id` y `x-tenant-slug`
3. En Node.js, `getTenantPrisma()` crea o reutiliza un `PrismaClient` dedicado por tenant (pool máx. 5 conexiones)
4. Caché en proceso de `TenantInfo` con TTL de 5 minutos

**Modos de deploy:**
- Multi-tenant completo (N tenants, cada uno con BD propia)
- Single-tenant (`TENANT_SLUG` en env → usa `DATABASE_URL` directo)
- Desarrollo local (tenant `dev-tenant`, plan ENTERPRISE, todos los módulos activos)

### 1.2 Catálogo de módulos (`src/lib/modules.ts`)

| ID | Nombre | Tier |
|----|--------|------|
| `sitio_web` | Portal Institucional Gov.co | BASE |
| `transparencia` | Transparencia Activa | BASE |
| `pqrsd` | PQRSD ciudadano básico | BASE |
| `ventanilla_unica` | Ventanilla Única con IA | ESTANDAR |
| `gestion_documental` | Gestión Documental | ESTANDAR |
| `archivo_fisico` | Archivo Físico | AVANZADO |
| `mipg` | MIPG y Plan Anticorrupción | ESTANDAR |
| `contabilidad_publica` | Contabilidad NICSP/CGN | AVANZADO |
| `presupuesto_ejecucion` | Presupuesto (CDP→RP→Pago) | AVANZADO |
| `tesoreria` | Tesorería y PAC | AVANZADO |
| `contratacion` | Contratación pública | AVANZADO |
| `nomina_publica` | Nómina pública | AVANZADO |
| `activos_bienes` | Activos y bienes | AVANZADO |
| `almacen` | Almacén | AVANZADO |
| `rentas_locales` | Rentas municipales | VERTICAL |
| `frisco_bienes` | FRISCO Extinción dominio | VERTICAL |
| `frisco_interop` | FRISCO Interoperabilidad SNR/IGAC/Fiscalía | VERTICAL |
| `portal_externo` | Portales actores externos | AVANZADO |
| `observatorio` | Observatorio e indicadores | AVANZADO |
| `reportes_control` | Reportes de Control CHIP/FUT | INTEGRACION |

### 1.3 Autenticación y autorización

- **Tenant**: NextAuth v5, provider `Credentials`, bcrypt, JWT. Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `USER`
- **SuperAdmin**: cookie propia (`SA_COOKIE_NAME`), sesión completamente separada, consulta meta-DB
- Guards de módulo en `src/lib/frisco-guard.ts`: verifican rol + módulo activo antes de procesar la request

### 1.4 Módulo PQRSD

Flujo completo de radicación ciudadana:
1. Rate limiting (5 radicaciones/IP/min) → HTTP 429
2. Validación Zod (`pqrsPublicoSchema`)
3. CAPTCHA Cloudflare Turnstile
4. Despacho a sistema externo VU o guardado local
5. `guardarLocal()`: genera radicado (PET/QUE/REC/SUG/DEN), calcula vencimiento en días hábiles (Ley 1755/2015)
6. Integración GD: crea `GdRadicado` oficial con consecutivo atómico
7. Clasificación IA (Groq/LLaMA → Shipu z.ai como fallback): tipo, prioridad, dependencia sugerida, días término legal

### 1.5 Módulo Ventanilla Única

- **Clasificación IA** (`src/lib/groq-client.ts`): Groq LLaMA 3.3 70B → Shipu Z1-32B como fallback. API keys cifradas AES-256-GCM en meta-DB
- **Semáforo**: Verde (<60% tiempo), Amarillo (60-80%), Rojo (80-100%), Negro (vencido)
- **Máquina de estados**: RECIBIDA → EN_TRAMITE → EN_REVISION → RESPONDIDA → CERRADA
- **SLAService**: calcula vencimientos con días hábiles, marca masivamente vencidos (para cron)
- **AIAssignmentService**: asigna PQRS al funcionario con menor carga usando IA
- **NotificationService**: EMAIL y SMS implementados; WHATSAPP, IN_APP, WEBHOOK pendientes
- **6 tipos de respuesta formal** (CPACA): COMPETENTE, REMISION, INSISTENCIA, TRASLADO, DESISTIMIENTO, IMPROCEDENTE

### 1.6 Gestor Documental AGN

- **TRD**: `GdTrdDependencia` → `GdTrdSerie` → `GdTrdSubserie` → `GdTrdTipoDocumental`
- **Consecutivo atómico** (`src/lib/gd-consecutivo.ts`): formato `2026-DEP-ENT-00123`, upsert transaccional sin duplicados
- **Radicación**: validación plan + cuota + dependencia → transacción atómica + log RADICACION
- **Funcionalidades avanzadas**: VoBo multi-nivel, firma QR con SHA-256, expedientes electrónicos, CC (informados)
- **Índice electrónico**: Acuerdo 006 AGN, XML manifiesto, hash global
- **Archivo físico**: jerarquía 7 niveles (Edificio→Piso→Bodega→Estante→Entrepano→Caja→Carpeta)
- **Plan Guard**: BASICO (50k radicados/año), PROFESIONAL (200k), ENTERPRISE (sin límite)

### 1.7 MIPG y FURAG

- Evaluaciones por `(politicaId, anioVigencia)`, datos radiales para Radar Chart, IDI automático
- **Validación automática FURAG** (`src/lib/furag-validator.ts`):
  - POL06-ATENCION-OPORTUNA: % PQRSD respondidos antes del vencimiento
  - POL06-CANAL-DIGITAL: % radicaciones con email real
  - POL07-GD-GENERAL: tasa respuesta GD + VoBo + TRD (ponderado 50%+30%+20%)
  - POL03-TRANSPARENCIA: documentos y noticias publicadas
- Semáforo brecha: CONSISTENTE (≤10 pts), ALERTA (10-20 pts), INCONSISTENTE (>20 pts)

### 1.8 Módulos financieros

- **Presupuesto**: cadena CDP→RP→Obligación→Pago. Helpers `saldoApropiacion`, `saldoCdp`, `saldoRp`, `saldoObligacion`
- **Contabilidad**: plan CGN Res. 414/2014 (3.745 cuentas), partida doble, comprobantes en transacción
- **Tesorería**: conciliación bancaria par a par, tolerancia $0.50, extractos CSV
- **Nómina** (`src/lib/nomina-motor.ts`): 3 pasadas (devengados → deducciones empleado → aportes patronales). 24 conceptos. Motor función pura
- **Contratación**: procesos Ley 80/1150, contratos, adiciones, documentos, flujo de estados
- **Reportes control**: CHIP Balance + Actividad, FUT Ingresos + Gastos, Ley 617. Exportación XLSX con ExcelJS

### 1.9 Módulo FRISCO

- `FriscoBien`: código, folio matrícula, placa, tipo, estado jurídico, estado físico, geoloc, avalúo, proceso, juzgado
- `FriscoDepositario` + `FriscoContrato` + `FriscoDestinacion`
- **Portal externo** (`src/lib/frisco-portal.ts`): token 32 bytes hex, almacena SHA-256, vigencia configurable, log de accesos
- **Análisis IA** (`src/lib/frisco-reporte-ia.ts`): urgencia NORMAL/ATENCION/CRITICA + 10 etiquetas + fallback regex
- **Interoperabilidad** (`src/lib/frisco-interop/`): stubs SNR, IGAC, Fiscalía (drop-in cuando lleguen credenciales)

### 1.10 Infraestructura transversal

- **Cifrado** (`src/lib/encryption.ts`): AES-256-GCM, IV 12 bytes, tag 16 bytes, formato `<iv>:<tag>:<cipher>`
- **Auditoría** (`src/lib/auditoria.ts`): CREATE/UPDATE/DELETE/LOGIN/DOWNLOAD/PUBLISH/EXPORT; fallo aislado no cancela operación
- **Storage** (`src/lib/storage.ts`): 7 proveedores (S3, MinIO, R2, GCS, Azure, SFTP, Local)
- **Email** (`src/lib/mail.ts`): Resend, remitente dinámico desde `IdentidadInstitucional`, escape HTML
- **Días hábiles** (`src/lib/dias-habiles.ts`): Ley Emiliani + API Nager.Date + fallback algorítmico (Butcher-Meeus para Pascua)
- **SuperAdmin IA**: informe mensual ejecutivo cruzando métricas de todos los tenants del sector

---

## 2. Cliente 1 — Ministerio de Igualdad y Equidad

### 2.1 Estructura del sector (Ley 2281/2023, Decreto 1074/2023)

| Entidad | Rol |
|---------|-----|
| Ministerio de Igualdad y Equidad | Cabeza del sector |
| ICBF | 33 regionales, 206 centros zonales |
| INCI | Nacional — 212+ entidades asesoradas |
| INSOR | Nacional — Estrategia Ed. Superior Inclusiva |

**7 programas sociales activos:** Jóvenes en Paz (30.436 jóvenes), Hambre Cero, Mujeres Amancay, Casas para la Dignidad (38 casas, 62.204 mujeres atendidas), Agua es Vida, Raíces en Movimiento (9 ciudades, 11 Centros Intégrate), Barrismo Social.

**Coordinación con:** 5 Viceministerios (Mujeres, Juventud, Poblaciones/Territorios, Diversidades, Pueblos Étnicos/Campesinos) + 20+ Direcciones Técnicas.

### 2.2 Necesidades tecnológicas identificadas (fuentes oficiales)

**Informe Trimestral PQRSD Q1 2025 — citas textuales:**

> *"Los canales de atención telefónico y presencial aún se encuentran en una etapa incipiente, enmarcados dentro de un proceso de mejoramiento continuo."*

> *"Desde el mes de octubre y hasta diciembre de 2024 esta dependencia fue responsable de la asignación de las PQRSD a través del correo de manera **manual**."*

> *"La marcada preferencia por el canal telefónico (83,18%) pone en evidencia la necesidad de fortalecer la infraestructura de comunicación interna."*

**Datos clave del informe:**
- 434 atenciones Q1 2025 (361 telefónicas 83%, 73 presenciales 17%)
- El 33,18% de solicitudes va a Jóvenes en Paz; el 25,81% va a la ORC (no saben a qué dependencia dirigirse)
- Bogotá: 42% de atenciones; Cali: 14%; Medellín: 7%; Quibdó: 5%
- El gestor documental entró en operación en **diciembre de 2024** (menos de 6 meses de operación)

### 2.3 Tabla de paralelo — Problemas vs. Soluciones

| Área | Problema | Solución PublicEnt | Módulo |
|------|----------|--------------------|--------|
| PQRSD manual | Distribución manual por correo hasta dic. 2024 | Radicación web + asignación automática | `pqrsd` |
| Clasificación incorrecta | 25,81% llega a ORC sin saber a qué dirección ir | IA determina la dependencia competente automáticamente | `ventanilla_unica` + IA |
| Vencimientos sin control | Sin semáforo, los términos Ley 1755 se incumplen | Semáforo Verde/Amarillo/Rojo/Negro con días hábiles reales | `SLAService` |
| GD inmaduro | Menos de 6 meses de operación, sin VoBo ni índice AGN | TRD, VoBo multi-nivel, índice Acuerdo 006, firma QR | `gestion_documental` |
| FURAG en Excel | IDI declarado sin cruzar con datos operativos | Cruce automático PQRSD + docs + VoBo vs. puntajes | `mipg` |
| Portal Gov.co parcial | Brechas en transparencia activa e ITA | Portal completo Res. 1519 con ITA automático | `sitio_web` + `transparencia` |
| Sector desconectado | ICBF, INCI, INSOR sin conexión al Ministerio rector | Multi-tenancy + SuperAdmin intersectorial | SuperAdmin sector |
| Sin módulos financieros | FonIgualdad y convenios sin sistema unificado | CDP→RP→Pago + nómina + contratos + CHIP/FUT | `presupuesto` + `nomina` + `contratacion` |
| Sin observatorio | Ley 2281 función 17 exige sistema de indicadores | Observatorio por programa y territorio | `observatorio` |

### 2.4 Propuesta de implementación

- **Fase 1 (sem. 1-8):** Portal Gov.co + PQRSD con IA + GD AGN + MIPG/FURAG
- **Fase 2 (sem. 9-16):** ICBF, INCI, INSOR como tenants + SuperAdmin intersectorial
- **Fase 3 (sem. 17-28):** Presupuesto + Contabilidad + Contratación + Nómina + Reportes Control
- **Fase 4 (sem. 29-40):** Observatorio + SALVIA + Portal orgs. comunitarias + SGBE + API Prosperidad Social

### 2.5 Archivos generados

- `PublicEnt_MinIgualdad_Propuesta_Comercial.pdf` — propuesta comercial completa (portada, necesidades, módulos, cobertura sector, diferenciadores, fases, marco normativo, CTA)

---

## 3. Cliente 2 — SAE Sociedad de Activos Especiales S.A.S.

### 3.1 Perfil institucional

- **Naturaleza:** Empresa pública SAS, economía mixta, vinculada al MinHacienda
- **Objeto:** Administra el FRISCO (Fondo para la Rehabilitación, Inversión Social y Lucha contra el Crimen Organizado)
- **Rol:** Secuestre legal de bienes en proceso de extinción de dominio (Ley 1708/2014)
- **Marco contable:** CGN Res. 414/2014 (Marco para Empresas que no Cotizan — NO es el de Entidades de Gobierno)
- **Planta:** 383 cargos
- **Presupuesto:** Doble — SAE propia (Junta Directiva) + FRISCO (Consejo Nacional de Estupefacientes)

**4 Gerencias Regionales:** Centro (Bogotá), Occidente (Cali), Noroccidente (Medellín), Norte (Barranquilla)

### 3.2 Inventario FRISCO (datos reales, corte agosto 2020)

| Tipo de activo | Cantidad | Valor aprox. |
|---------------|----------|-------------|
| Inmuebles (urbanos + rurales) | >22.000 | $6,1 billones |
| Vehículos y transporte | >5.400 | $33.677 M |
| Joyas | >3.000 | $1.051 M |
| Metales preciosos | 13 | $5.059 M |
| Obras de arte | >800 | $2.584 M |
| Semovientes | >3.900 | — |
| Dinero (pesos + divisas) | — | $32.368 M + USD 48.479 K + EUR 7.851 K |

**Mecanismos de administración (Art. 92 Ley 1708):** Enajenación, Contratación, Destinación provisional, Depósito provisional, Destrucción/chatarrización, Donación entre entidades públicas.

### 3.3 Necesidades tecnológicas identificadas (fuentes oficiales)

**Respuesta oficial SAE a Comisión Segunda Cámara (CS2020-019765) — cita textual:**

> *"Se ejecutó un sistema de información de recaudo centralizado con el propósito de contar con información en tiempo real relacionada a la productividad de los activos a partir de la gestión de los depositarios provisionales... incluyendo portal de depositarios como canal de comunicación en línea con los depositarios provisionales."*

**Recaudo histórico:** $218.803 millones de enero 2015 a junio 2020 por concepto de arrendamientos, con crecimiento anual promedio del 43%.

### 3.4 Tabla de paralelo — Problemas vs. Soluciones

| Área | Problema | Solución PublicEnt | Módulo |
|------|----------|--------------------|--------|
| Inventario FRISCO sin sistema | +30.000 activos en hojas de cálculo, ingreso/egreso constante | Registro por tipo, estado jurídico, geoloc, avalúo, juzgado | `frisco_bienes` |
| Portal depositarios inexistente | Custodios reportan por correo o teléfono | Portal web por token, reporte desde celular con fotos | `portal_externo` |
| Sin análisis de riesgo | Reportes sin clasificación de urgencia | IA clasifica NORMAL/ATENCIÓN/CRÍTICA + 10 etiquetas | `frisco_reporte_ia` |
| Interop. manual SNR/IGAC/Fiscalía | Consultas manuales a portales externos uno a uno | Conectores drop-in, stubs listos, log por consulta | `frisco_interop` |
| Pólizas sin alertas | Vencimiento genera exposición patrimonial SAE | Alertas a 30, 15 y 5 días + notif. regional | `contratacion` alertas |
| Recaudo sin conciliación | Proceso manual por Gerencia Regional | Libro de tesorería + extracto CSV + conciliación par a par | `tesoreria` |
| Dos contabilidades sin sistema | SAE (JD) y FRISCO (CNE) requieren cuentas separadas | Dos instancias presupuestales aisladas + CGN 3.745 cuentas | `contabilidad_publica` + `presupuesto` |
| Expedientes judiciales sin GD | Autos, sentencias, escrituras sin trazabilidad | Expedientes + TRD + VoBo + índice AGN + firma QR | `gestion_documental` |
| PQRSD y MIPG rezagados | Informe PQRSD semestral, FURAG sin cruce operativo | Portal Res. 1519 + PQRSD con IA + MIPG cruzado | `sitio_web` + `mipg` |

### 3.5 Ciclo del activo FRISCO en PublicEnt

```
01 Ingreso (medida cautelar / sentencia firme)
  → 02 Inventario (clasificación, avalúo, estado físico)
  → 03 Depositario (asignación, portal de reporte, póliza)
  → 04 IA alerta (análisis mensual: urgencia y riesgo)
  → 05 Contrato (arrendamiento, destinación, comodato)
  → 06 Recaudo (facturación, cartera, tesorería)
  → 07 Contabilidad (CGN Res. 414, comprobantes, CHIP)
  → 08 Fin del ciclo (venta, donación o destinación final)
```

### 3.6 Propuesta de implementación

- **Fase 1 (sem. 1-8):** Portal Gov.co + PQRSD + Inventario FRISCO + Portal depositarios + GD expedientes
- **Fase 2 (sem. 9-16):** Contratos + alertas pólizas + tesorería + activación conectores SNR/IGAC/Fiscalía
- **Fase 3 (sem. 17-28):** Contabilidad CGN Res. 414 + presupuesto doble (SAE + FRISCO) + nómina + CHIP
- **Fase 4 (sem. 29-40):** Observatorio de activos + OCR/IA para escrituras + módulo enajenación + API juzgados

### 3.7 Archivos generados

- `PublicEnt_SAE_Propuesta_Comercial.pdf` — propuesta comercial completa (portada rojo/dorado, inventario FRISCO, ciclo del activo, módulos, mapa necesidad→módulo, diferenciadores, fases, marco normativo, CTA)

---

## 4. Tablas de paralelo — archivo unificado

`PublicEnt_Tablas_Paralelo.pdf` — PDF de 3 páginas:
- **Pág. 1:** Portada unificada (verde MinIgualdad / rojo SAE)
- **Pág. 2:** Tabla MinIgualdad (9 filas: área · problema · solución · módulo) con fuentes oficiales al pie
- **Pág. 3:** Tabla SAE (9 filas: área · problema · solución · módulo) con fuentes oficiales al pie

---

## 5. Marco normativo implementado en la plataforma

| Norma | Aplicación |
|-------|-----------|
| Ley 2281 de 2023 | Creación MinIgualdad — estructura del sector |
| Ley 1708 de 2014 | Código Extinción de Dominio — tipos activos, mecanismos Art. 92 |
| Res. 1519/2020 MinTIC | Portal Gov.co, ITA, transparencia activa |
| Ley 1755/2015 | Derecho de Petición — términos PQRSD |
| Ley 1437/2011 CPACA | Tipos de respuesta formal, máquina de estados |
| Ley 1712/2014 | Transparencia y Acceso a la Información Pública |
| Decreto 1122/2024 | Programa de Transparencia y Ética Pública |
| CGN Res. 414/2014 | Marco contable empresas no cotizantes — 3.745 cuentas CGC |
| CGN Res. 533/2015 | Marco contable entidades de gobierno |
| Modificatorias CGN 334/2025, 343/2025 | Actualizaciones más recientes del catálogo CGN |
| CCPET MinHacienda v8 | Catálogo presupuestal territorial — 1.784 rubros |
| Acuerdo 006/2014 AGN | Índice Electrónico de Expedientes |
| Ley 80/1990 + Ley 1150/2007 | Contratación pública |
| Decreto 2136/2015 | Reglamentación FRISCO — administración de bienes |
| Decreto 1068/2015 | Decreto Único Reglamentario Sector Hacienda |
| MIPG DAFP | Modelo Integrado de Planeación y Gestión — indicadores FURAG |
| Ley Emiliani (Ley 51/1983) | Festivos colombianos para cómputo de días hábiles |

---

## 6. Fuentes consultadas en esta sesión

### MinIgualdad
- [Informe Trimestral PQRSD Q1 2025 — Oficina de Relacionamiento con la Ciudadanía](https://www.minigualdadyequidad.gov.co/documents/d/guest/2025_03_30_informe_trimestral_enero_marzo_2025)
- [Informe de Gestión al Congreso 2024-2025 — Sector Igualdad y Equidad](https://www.camara.gov.co/wp-content/uploads/2025/12/INF-AL-CONG-MINIGUALDAD-2024-2025.pdf)
- [Manual de Estructura del Estado — Sector Igualdad y Equidad](https://www.funcionpublica.gov.co/eva/gestornormativo/manual-estado/pdf/19_Sector_Igualdad.pdf)
- [Decreto 1074 de 2023 — Integración del Sector Administrativo](https://www.suin-juriscol.gov.co/viewDocument.asp?id=30046822)

### SAE
- [Respuesta oficial SAE a Comisión Segunda Cámara (CS2020-019765, agosto 2020)](https://www.camara.gov.co/wp-content/uploads/2025/10/control_politico/Publicaci%C3%B3n/6291/respuestas_sae_0-4afb8c42.pdf)
- [Informe PQRSD II Semestre 2024 — SAE](https://www.saesas.gov.co/files/9ecd2ac9-6a05-4037-bc7c-9915c1e57386/9ecd2e73-44b2-4059-8ed9-cd57853ee4ad/Informe-PQRSD-II-Semestre-2024.pdf)
- [Manual de Estructura del Estado — SAE](https://www.funcionpublica.gov.co/eva/gestornormativo/manual-estado/estructura-estado.php?id=717)
- [Metodología de Administración de Bienes del FRISCO v18 (febrero 2025)](https://www.saesas.gov.co/files/9ecd2af0-b5a6-4df1-878e-cb86ff310b8a/9ecd2b81-21fb-4f75-917a-38c92226dfd4/MT-DE-001-V18-Metodologia-Administracion-de-Bienes-del-FRISCO-18022025.pdf)

---

## 7. Archivos generados en esta sesión

Todos guardados en `C:\projects\publicent2\personeriabuga\`:

| Archivo | Descripción |
|---------|-------------|
| `PublicEnt_MinIgualdad_Propuesta_Comercial.pdf` | Propuesta comercial completa para MinIgualdad (8 secciones, paleta verde) |
| `PublicEnt_SAE_Propuesta_Comercial.pdf` | Propuesta comercial completa para SAE (8 secciones, paleta rojo/dorado) |
| `PublicEnt_Tablas_Paralelo.pdf` | Tablas de paralelo problema/solución para ambos clientes (3 páginas) |
| `docs/sesion-analisis-comercial-2026-06-02.md` | Este archivo — bitácora completa de la sesión |

---

*Sesión registrada el 2026-06-02. Generado con Claude (Sonnet 4.6) en Cowork / PublicEnt SAS.*
