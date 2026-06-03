/**
 * catalogo-entidades.ts — Definiciones extensibles de catálogos de onboarding
 *
 * Este archivo es el ÚNICO punto donde se agregan nuevas dependencias, series TRD
 * y terceros del Estado. El seeder en onboarding.ts lo lee y hace upserts.
 *
 * CÓMO AGREGAR:
 *   - Nueva dependencia: agregar un objeto a DEPENDENCIAS_BASE.
 *   - Nueva serie TRD: agregar a TRD_SERIES_BASE apuntando al código de la dependencia.
 *   - Nuevo tercero del Estado: agregar a TERCEROS_ESTADO.
 *
 * Los códigos deben ser únicos dentro de cada lista. Si dos tenants tienen la
 * misma entidad con distinto código, prevalece el que llegue primero (upsert por código).
 *
 * Normalización de NITs: sin dígito de verificación (ej. "800197268").
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DefinicionDependencia {
  codigo: string
  nombre: string
  descripcion?: string
  /** Código del padre si es una sub-dependencia */
  padresCodigo?: string
}

export interface DefinicionSubserie {
  codigo: string
  nombre: string
  tiempoGestion?: number  // años en Archivo de Gestión (default 2)
  tiempoCentral?: number  // años en Archivo Central (default 3)
  soporteFisico?: boolean
  soporteElectronico?: boolean
  disposicion?: 'CONSERVACION_TOTAL' | 'ELIMINACION' | 'MICROFILMACION' | 'SELECCION'
  procedimiento?: string
  tiposDocumentales?: string[]  // nombres de tipos documentales
}

export interface DefinicionSerie {
  /** Código de la dependencia a la que pertenece */
  dependenciaCodigo: string
  codigo: string
  nombre: string
  subseries: DefinicionSubserie[]
}

export interface DefinicionTerceroEstado {
  documento: string        // NIT sin dígito verificación
  razonSocial: string
  email?: string
  ciudad?: string
  tipo: 'NIT'
}

// ─── Dependencias estándar ────────────────────────────────────────────────────
// Estructura organizacional base de una entidad pública colombiana.
// Ajustar nombres según el tipo de entidad (Ministerio, Alcaldía, Personería, etc.).

export const DEPENDENCIAS_BASE: DefinicionDependencia[] = [
  {
    codigo: 'DEP-01',
    nombre: 'Despacho',
    descripcion: 'Despacho del director, jefe o representante legal de la entidad',
  },
  {
    codigo: 'DEP-02',
    nombre: 'Secretaría General',
    descripcion: 'Administración interna, gestión documental y comunicaciones oficiales',
  },
  {
    codigo: 'DEP-03',
    nombre: 'Oficina Jurídica',
    descripcion: 'Asesoría y representación legal, conceptos, procesos judiciales',
  },
  {
    codigo: 'DEP-04',
    nombre: 'Área Financiera y Contable',
    descripcion: 'Contabilidad, presupuesto, tesorería y reportes a entes de control',
  },
  {
    codigo: 'DEP-05',
    nombre: 'Talento Humano',
    descripcion: 'Gestión del personal, nómina, historia laboral, bienestar',
  },
  {
    codigo: 'DEP-06',
    nombre: 'Contratación',
    descripcion: 'Procesos contractuales Ley 80/1150, supervisión, interventoría',
  },
  {
    codigo: 'DEP-07',
    nombre: 'Planeación',
    descripcion: 'Plan de acción, MIPG, FURAG, seguimiento a indicadores',
  },
  {
    codigo: 'DEP-08',
    nombre: 'Tecnología e Información',
    descripcion: 'Infraestructura TI, sistemas de información, seguridad digital',
  },
  {
    codigo: 'DEP-09',
    nombre: 'Atención al Ciudadano',
    descripcion: 'PQRSD, tutelas, derechos de petición, atención presencial y virtual',
  },
  {
    codigo: 'DEP-10',
    nombre: 'Comunicaciones',
    descripcion: 'Imagen institucional, redes sociales, boletines de prensa, transparencia activa',
  },
  // ── Dependencias adicionales para verticales específicas ───────────────────
  // Descomentar o agregar según el perfil del tenant:
  //
  // { codigo: 'DEP-11', nombre: 'Control Disciplinario Interno', descripcion: 'Procesos disciplinarios Ley 734/2002' },
  // { codigo: 'DEP-12', nombre: 'Control Interno', descripcion: 'Auditoría interna, mapa de riesgos, seguimiento MECI' },
  // { codigo: 'DEP-13', nombre: 'Gestión Social', descripcion: 'Programas sociales, beneficiarios, convenios ICBF' },
  // { codigo: 'DEP-14', nombre: 'Archivo Central', descripcion: 'Custodia y disposición final de documentos' },
]

// ─── TRD base (series y subseries por dependencia) ───────────────────────────
// Basada en tablas de retención documental tipo de entidades públicas colombianas.
// Tiempos en años según Acuerdo 042/2002 AGN como referencia.

export const TRD_SERIES_BASE: DefinicionSerie[] = [

  // ── Despacho ──────────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-01',
    codigo: '1',
    nombre: 'Actos Administrativos',
    subseries: [
      { codigo: '1.1', nombre: 'Resoluciones', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Resolución', 'Acto administrativo'] },
      { codigo: '1.2', nombre: 'Circulares', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Circular interna', 'Circular externa'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-01',
    codigo: '2',
    nombre: 'Convenios y Acuerdos',
    subseries: [
      { codigo: '2.1', nombre: 'Convenios Interadministrativos', tiempoGestion: 5, tiempoCentral: 20, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Convenio', 'Acuerdo', 'Protocolo'] },
      { codigo: '2.2', nombre: 'Convenios con ONG y Cooperación', tiempoGestion: 5, tiempoCentral: 10, disposicion: 'CONSERVACION_TOTAL' },
    ],
  },
  {
    dependenciaCodigo: 'DEP-01',
    codigo: '3',
    nombre: 'Informes de Gestión',
    subseries: [
      { codigo: '3.1', nombre: 'Informes al Congreso o Asamblea', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Informe anual', 'Informe de gestión'] },
      { codigo: '3.2', nombre: 'Informes de Rendición de Cuentas', tiempoGestion: 2, tiempoCentral: 5, disposicion: 'CONSERVACION_TOTAL' },
    ],
  },

  // ── Secretaría General ────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-02',
    codigo: '1',
    nombre: 'Comunicaciones Oficiales',
    subseries: [
      { codigo: '1.1', nombre: 'Correspondencia Recibida', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Oficio recibido', 'Comunicación externa recibida'] },
      { codigo: '1.2', nombre: 'Correspondencia Enviada', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Oficio enviado', 'Comunicación externa enviada'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-02',
    codigo: '2',
    nombre: 'Actas',
    subseries: [
      { codigo: '2.1', nombre: 'Actas de Comités', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Acta'] },
      { codigo: '2.2', nombre: 'Actas de Consejos Directivos', tiempoGestion: 2, tiempoCentral: 50, disposicion: 'CONSERVACION_TOTAL' },
    ],
  },
  {
    dependenciaCodigo: 'DEP-02',
    codigo: '3',
    nombre: 'Historias Laborales',
    subseries: [
      {
        codigo: '3.1',
        nombre: 'Empleados Públicos',
        tiempoGestion: 80,
        tiempoCentral: 0,
        soporteFisico: true,
        soporteElectronico: true,
        disposicion: 'CONSERVACION_TOTAL',
        procedimiento: 'Conservar mientras el empleado esté activo más 80 años. Acuerdo 60/2001 AGN.',
        tiposDocumentales: ['Hoja de vida', 'Acto de nombramiento', 'Acta de posesión', 'Evaluación de desempeño', 'Certificado médico'],
      },
    ],
  },

  // ── Jurídica ──────────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-03',
    codigo: '1',
    nombre: 'Conceptos Jurídicos',
    subseries: [
      { codigo: '1.1', nombre: 'Conceptos de Asesoría Interna', tiempoGestion: 2, tiempoCentral: 10, disposicion: 'SELECCION', tiposDocumentales: ['Concepto jurídico'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-03',
    codigo: '2',
    nombre: 'Procesos Judiciales y Arbitrales',
    subseries: [
      { codigo: '2.1', nombre: 'Acciones de Tutela', tiempoGestion: 2, tiempoCentral: 5, disposicion: 'SELECCION', tiposDocumentales: ['Tutela', 'Impugnación', 'Fallo'] },
      { codigo: '2.2', nombre: 'Procesos Contencioso Administrativos', tiempoGestion: 5, tiempoCentral: 20, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Demanda', 'Contestación', 'Sentencia', 'Recurso'] },
      { codigo: '2.3', nombre: 'Derechos de Petición — Respuestas', tiempoGestion: 2, tiempoCentral: 5, disposicion: 'ELIMINACION', tiposDocumentales: ['Respuesta derecho de petición'] },
    ],
  },

  // ── Financiera ────────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-04',
    codigo: '1',
    nombre: 'Estados Financieros',
    subseries: [
      { codigo: '1.1', nombre: 'Balances y Estados de Actividad', tiempoGestion: 2, tiempoCentral: 28, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Balance general', 'Estado de actividad financiera'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-04',
    codigo: '2',
    nombre: 'Comprobantes Contables',
    subseries: [
      { codigo: '2.1', nombre: 'Comprobantes de Ingreso', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'ELIMINACION', tiposDocumentales: ['Comprobante de ingreso', 'Recibo de caja'] },
      { codigo: '2.2', nombre: 'Comprobantes de Egreso', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'ELIMINACION', tiposDocumentales: ['Comprobante de egreso', 'Orden de pago'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-04',
    codigo: '3',
    nombre: 'Presupuesto',
    subseries: [
      { codigo: '3.1', nombre: 'CDP — Certificados de Disponibilidad', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'ELIMINACION', tiposDocumentales: ['CDP'] },
      { codigo: '3.2', nombre: 'RP — Registros Presupuestales', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'ELIMINACION', tiposDocumentales: ['RP'] },
      { codigo: '3.3', nombre: 'Informes de Ejecución Presupuestal', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Informe FUT', 'Informe CHIP'] },
    ],
  },

  // ── Talento Humano ────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-05',
    codigo: '1',
    nombre: 'Nómina',
    subseries: [
      { codigo: '1.1', nombre: 'Liquidaciones de Nómina', tiempoGestion: 2, tiempoCentral: 10, disposicion: 'ELIMINACION', tiposDocumentales: ['Planilla de nómina', 'Comprobante de pago'] },
      { codigo: '1.2', nombre: 'Planillas de Seguridad Social', tiempoGestion: 2, tiempoCentral: 10, disposicion: 'ELIMINACION', tiposDocumentales: ['PILA', 'Planilla UGPP'] },
    ],
  },
  {
    dependenciaCodigo: 'DEP-05',
    codigo: '2',
    nombre: 'Bienestar e Incentivos',
    subseries: [
      { codigo: '2.1', nombre: 'Programas de Bienestar', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Programa de bienestar', 'Lista de asistencia'] },
    ],
  },

  // ── Contratación ──────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-06',
    codigo: '1',
    nombre: 'Procesos de Selección',
    subseries: [
      { codigo: '1.1', nombre: 'Licitación Pública', tiempoGestion: 5, tiempoCentral: 20, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Aviso convocatoria', 'Pliego de condiciones', 'Propuesta', 'Evaluación', 'Acto de adjudicación'] },
      { codigo: '1.2', nombre: 'Selección Abreviada', tiempoGestion: 5, tiempoCentral: 10, disposicion: 'CONSERVACION_TOTAL' },
      { codigo: '1.3', nombre: 'Contratación Directa', tiempoGestion: 5, tiempoCentral: 10, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Estudio de mercado', 'Contrato', 'Garantías'] },
      { codigo: '1.4', nombre: 'Mínima Cuantía', tiempoGestion: 2, tiempoCentral: 5, disposicion: 'ELIMINACION' },
    ],
  },
  {
    dependenciaCodigo: 'DEP-06',
    codigo: '2',
    nombre: 'Contratos',
    subseries: [
      {
        codigo: '2.1',
        nombre: 'Contratos de Prestación de Servicios',
        tiempoGestion: 5,
        tiempoCentral: 20,
        soporteFisico: true,
        soporteElectronico: true,
        disposicion: 'CONSERVACION_TOTAL',
        tiposDocumentales: ['Contrato', 'Adición', 'Prórroga', 'Acta de inicio', 'Informe de supervisión', 'Acta de liquidación'],
      },
      { codigo: '2.2', nombre: 'Contratos de Obra', tiempoGestion: 5, tiempoCentral: 30, disposicion: 'CONSERVACION_TOTAL' },
      { codigo: '2.3', nombre: 'Contratos de Compraventa', tiempoGestion: 5, tiempoCentral: 10, disposicion: 'SELECCION' },
    ],
  },

  // ── Planeación ────────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-07',
    codigo: '1',
    nombre: 'Planeación Institucional',
    subseries: [
      { codigo: '1.1', nombre: 'Plan de Acción Anual', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Plan de acción', 'Informe de seguimiento'] },
      { codigo: '1.2', nombre: 'MIPG y Plan Anticorrupción', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['PAAC', 'Informe FURAG', 'Diagnóstico MIPG'] },
    ],
  },

  // ── TI ────────────────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-08',
    codigo: '1',
    nombre: 'Gestión de Infraestructura TI',
    subseries: [
      { codigo: '1.1', nombre: 'Inventario de Equipos y Licencias', tiempoGestion: 2, tiempoCentral: 5, disposicion: 'ELIMINACION', tiposDocumentales: ['Inventario TI', 'Licencia de software'] },
      { codigo: '1.2', nombre: 'Contratos de Servicios Tecnológicos', tiempoGestion: 5, tiempoCentral: 10, disposicion: 'CONSERVACION_TOTAL' },
    ],
  },
  {
    dependenciaCodigo: 'DEP-08',
    codigo: '2',
    nombre: 'Seguridad de la Información',
    subseries: [
      { codigo: '2.1', nombre: 'Políticas y Procedimientos de Seguridad', tiempoGestion: 2, tiempoCentral: 10, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Política de seguridad', 'Procedimiento'] },
    ],
  },

  // ── Atención al Ciudadano ─────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-09',
    codigo: '1',
    nombre: 'PQRSD',
    subseries: [
      { codigo: '1.1', nombre: 'Peticiones', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Petición', 'Respuesta'] },
      { codigo: '1.2', nombre: 'Quejas y Reclamos', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'ELIMINACION', tiposDocumentales: ['Queja', 'Reclamo', 'Respuesta'] },
      { codigo: '1.3', nombre: 'Sugerencias y Denuncias', tiempoGestion: 2, tiempoCentral: 3, disposicion: 'SELECCION' },
    ],
  },

  // ── Comunicaciones ────────────────────────────────────────────────────────
  {
    dependenciaCodigo: 'DEP-10',
    codigo: '1',
    nombre: 'Transparencia Activa',
    subseries: [
      { codigo: '1.1', nombre: 'Publicaciones Portal Web', tiempoGestion: 1, tiempoCentral: 5, disposicion: 'ELIMINACION', tiposDocumentales: ['Publicación web', 'Boletín de prensa'] },
      { codigo: '1.2', nombre: 'Rendición de Cuentas Ciudadana', tiempoGestion: 2, tiempoCentral: 8, disposicion: 'CONSERVACION_TOTAL', tiposDocumentales: ['Informe de rendición de cuentas', 'Memoria de audiencia pública'] },
    ],
  },
]

// ─── Terceros del Estado colombiano ──────────────────────────────────────────
// Entidades con las que cualquier entidad pública tiene relaciones contables,
// presupuestales o contractuales frecuentes.
// Agregar aquí nuevas entidades según el sector del tenant.

export const TERCEROS_ESTADO: DefinicionTerceroEstado[] = [
  // ── Recaudadores y control fiscal ─────────────────────────────────────────
  { documento: '800197268', razonSocial: 'DIAN — Dirección de Impuestos y Aduanas Nacionales', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '899999090', razonSocial: 'Ministerio de Hacienda y Crédito Público', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800176890', razonSocial: 'Contaduría General de la Nación — CGN', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '899999119', razonSocial: 'Departamento Nacional de Planeación — DNP', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800154303', razonSocial: 'Departamento Administrativo de la Función Pública — DAFP', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── Entes de control ──────────────────────────────────────────────────────
  { documento: '899999109', razonSocial: 'Procuraduría General de la Nación', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800176825', razonSocial: 'Contraloría General de la República', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800210060', razonSocial: 'Defensoría del Pueblo', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800149923', razonSocial: 'Auditoría General de la República', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── Sistema financiero y banco central ────────────────────────────────────
  { documento: '899999006', razonSocial: 'Banco de la República', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '860034313', razonSocial: 'Bancolombia S.A.', ciudad: 'Medellín', tipo: 'NIT' },
  { documento: '860003020', razonSocial: 'Banco Bogotá S.A.', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800251330', razonSocial: 'Banco Davivienda S.A.', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '890903937', razonSocial: 'BBVA Colombia S.A.', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── Seguridad social y parafiscales ───────────────────────────────────────
  { documento: '900067014', razonSocial: 'Colpensiones', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '830002112', razonSocial: 'Porvenir S.A. (AFP)', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800140949', razonSocial: 'Protección S.A. (AFP)', ciudad: 'Medellín', tipo: 'NIT' },
  { documento: '830114846', razonSocial: 'Colfondos S.A. (AFP)', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '860013814', razonSocial: 'Positiva Compañía de Seguros (ARL)', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800155000', razonSocial: 'Sura ARL', ciudad: 'Medellín', tipo: 'NIT' },
  { documento: '899999034', razonSocial: 'SENA — Servicio Nacional de Aprendizaje', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '899999004', razonSocial: 'ICBF — Instituto Colombiano de Bienestar Familiar', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── Archivo y gestión documental ──────────────────────────────────────────
  { documento: '800176892', razonSocial: 'Archivo General de la Nación — AGN', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── CHIP / sistemas de información ────────────────────────────────────────
  { documento: '899999041', razonSocial: 'Departamento Administrativo Nacional de Estadística — DANE', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '899999071', razonSocial: 'Ministerio del Interior', ciudad: 'Bogotá D.C.', tipo: 'NIT' },
  { documento: '800114648', razonSocial: 'MinTIC — Ministerio de Tecnologías de la Información', ciudad: 'Bogotá D.C.', tipo: 'NIT' },

  // ── Agrega nuevas entidades aquí ──────────────────────────────────────────
  // Ejemplo:
  // { documento: '900123456', razonSocial: 'Nombre Entidad', ciudad: 'Ciudad', tipo: 'NIT' },
]
