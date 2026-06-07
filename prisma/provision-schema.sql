-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GaEstadoPrestamo" AS ENUM ('SOLICITADO', 'APROBADO', 'ENTREGADO', 'DEVUELTO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "GdEstadoExpediente" AS ENUM ('ABIERTO', 'CERRADO', 'TRANSFERIDO', 'TRANSFERIDO_CENTRAL', 'TRANSFERIDO_HISTORICO', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "PlantillaPagina" AS ENUM ('GENERICA', 'TRANSPARENCIA', 'CONTACTO', 'DIRECTORIO', 'SERVICIOS', 'NOTICIAS', 'GALERIA');

-- CreateEnum
CREATE TYPE "TipoSeccion" AS ENUM ('TEXTO', 'HTML', 'GALERIA', 'ACORDEON', 'TABS', 'TARJETAS', 'LISTA_DOCUMENTOS', 'FORMULARIO', 'IFRAME', 'VIDEO', 'MAPA', 'TIMELINE');

-- CreateEnum
CREATE TYPE "TipoContenido" AS ENUM ('PAGINA', 'SERVICIO', 'TRAMITE', 'NORMATIVA', 'ACUERDO', 'RESOLUCION', 'CIRCULAR');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('BORRADOR', 'EN_REVISION', 'PUBLICADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "TipoItemTransparencia" AS ENUM ('TEXTO', 'DOCUMENTO', 'ENLACE_EXTERNO', 'LISTADO', 'TABLA', 'MIXTO');

-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('NORMATIVIDAD', 'PLANEACION', 'PRESUPUESTO', 'CONTRATACION', 'INFORMES', 'RESOLUCIONES', 'ACUERDOS', 'CIRCULARES', 'MANUALES', 'FORMATOS', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoPQRS" AS ENUM ('PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA', 'DENUNCIA', 'FELICITACION', 'CONSULTA');

-- CreateEnum
CREATE TYPE "EstadoPQRS" AS ENUM ('RECIBIDA', 'EN_TRAMITE', 'EN_REVISION', 'RESPONDIDA', 'CERRADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "PrioridadPQRS" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "CanalPQRS" AS ENUM ('WEB', 'PRESENCIAL', 'TELEFONO', 'EMAIL', 'CORRESPONDENCIA');

-- CreateEnum
CREATE TYPE "TipoMedicionMIPG" AS ENUM ('PORCENTAJE', 'CANTIDAD', 'NUMERICO', 'BOOLEANO');

-- CreateEnum
CREATE TYPE "EstadoEvidencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "GdTipoRadicado" AS ENUM ('ENTRADA', 'SALIDA', 'INTERNO', 'PQRS', 'RESOLUCION', 'COMUNICADO');

-- CreateEnum
CREATE TYPE "GdMedioRecepcion" AS ENUM ('PRESENCIAL', 'CORREO', 'WEB', 'OFICIO', 'EMAIL_ELECTRONICO', 'FAX', 'OTRO');

-- CreateEnum
CREATE TYPE "GdPrioridad" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "GdEstadoRadicado" AS ENUM ('RADICADO', 'EN_TRAMITE', 'PENDIENTE_VOBO', 'PENDIENTE_FIRMA', 'RESPONDIDO', 'RESUELTO', 'ARCHIVADO', 'ANULADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "GdEstadoVoBo" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "GdTipoPersona" AS ENUM ('CIUDADANO', 'EMPRESA', 'FUNCIONARIO', 'ENTIDAD_PUBLICA', 'ANONIMO');

-- CreateEnum
CREATE TYPE "GdAccionTransaccion" AS ENUM ('RADICACION', 'REASIGNACION', 'CARGA_DOCUMENTO', 'RESPUESTA', 'DEVOLUCION', 'VOBO_SOLICITUD', 'VOBO_APROBACION', 'VOBO_RECHAZO', 'ARCHIVO', 'ANULACION', 'NOTIFICACION', 'INFORMADO', 'VINCULO_PADRE');

-- CreateEnum
CREATE TYPE "GdDisposicionFinal" AS ENUM ('CONSERVACION_TOTAL', 'ELIMINACION', 'SELECCION', 'MICROFILMACION');

-- CreateEnum
CREATE TYPE "GdPlanNivel" AS ENUM ('BASICO', 'PROFESIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "VuColorSemaforo" AS ENUM ('VERDE', 'AMARILLO', 'ROJO', 'NEGRO');

-- CreateEnum
CREATE TYPE "VuTipoRespuesta" AS ENUM ('COMPETENTE', 'REMISION', 'INSISTENCIA', 'TRASLADO', 'DESISTIMIENTO', 'IMPROCEDENTE');

-- CreateEnum
CREATE TYPE "VuGenero" AS ENUM ('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERE_NO_DECIR');

-- CreateEnum
CREATE TYPE "VuZona" AS ENUM ('URBANA', 'RURAL', 'NO_INFORMA');

-- CreateEnum
CREATE TYPE "VuCondicionVulnerabilidad" AS ENUM ('NINGUNA', 'DISCAPACIDAD', 'LGBTIQ', 'VICTIMA_CONFLICTO', 'INDIGENA', 'AFRODESCENDIENTE', 'ADULTO_MAYOR', 'PRIMERA_INFANCIA');

-- CreateEnum
CREATE TYPE "TipoCanalAtencion" AS ENUM ('PRESENCIAL', 'VIRTUAL', 'TELEFONICO', 'EMAIL', 'REDES_SOCIALES', 'CHAT', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "CategoriaFaq" AS ENUM ('GENERAL', 'PQRSD', 'TRAMITES', 'ACCESO_INFORMACION', 'ATENCION', 'OTROS');

-- CreateEnum
CREATE TYPE "VuEstadoAsignacion" AS ENUM ('ACTIVA', 'REEMPLAZADA', 'REVOCADA');

-- CreateEnum
CREATE TYPE "VuTipoNotificacion" AS ENUM ('RADICACION', 'ASIGNACION', 'REASIGNACION', 'CAMBIO_ESTADO', 'RESPUESTA', 'PROXIMO_A_VENCER', 'VENCIDO', 'CIERRE', 'CHAT', 'MENCION');

-- CreateEnum
CREATE TYPE "VuCanalNotificacion" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "VuEstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'ENTREGADA', 'LEIDA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "VuEstadoPeticionReasignacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "VuTipoCanalAtencion" AS ENUM ('PRESENCIAL', 'TELEFONICO', 'VIRTUAL', 'EMAIL', 'WHATSAPP', 'OTRO');

-- CreateEnum
CREATE TYPE "VuTipoDocumento" AS ENUM ('SOLICITUD', 'EVIDENCIA', 'RESPUESTA', 'ANEXO', 'NOTA_INTERNA', 'OTRO');

-- CreateEnum
CREATE TYPE "FriscoTipoBien" AS ENUM ('INMUEBLE_URBANO', 'INMUEBLE_RURAL', 'VEHICULO', 'SEMOVIENTE', 'ESTABLECIMIENTO_COMERCIO', 'EMBARCACION', 'AERONAVE', 'OBRA_ARTE', 'TITULO_VALOR', 'EMPRESA', 'OTRO');

-- CreateEnum
CREATE TYPE "FriscoEstadoJuridico" AS ENUM ('EN_PROCESO', 'CAUTELAR', 'EXTINTO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "FriscoEstadoFisico" AS ENUM ('BUENO', 'REGULAR', 'MALO', 'PERDIDO', 'DESTRUIDO', 'SIN_VERIFICAR');

-- CreateEnum
CREATE TYPE "FriscoTipoPersona" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "FriscoReporteUrgencia" AS ENUM ('NORMAL', 'ATENCION', 'CRITICA');

-- CreateEnum
CREATE TYPE "FriscoTipoContrato" AS ENUM ('ARRENDAMIENTO', 'ADMINISTRACION', 'COMODATO', 'OTRO');

-- CreateEnum
CREATE TYPE "FriscoPeriodicidad" AS ENUM ('MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "FriscoEstadoContrato" AS ENUM ('VIGENTE', 'VENCIDO', 'TERMINADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "FriscoTipoDestinacion" AS ENUM ('VICTIMAS', 'TRANSFERENCIA', 'SUBASTA', 'DONACION', 'DESTRUCCION', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "FriscoInteropServicio" AS ENUM ('SNR', 'FISCALIA', 'IGAC');

-- CreateEnum
CREATE TYPE "CpNaturaleza" AS ENUM ('DEBITO', 'CREDITO');

-- CreateEnum
CREATE TYPE "CpTipoCuenta" AS ENUM ('BALANCE', 'RESULTADO', 'ORDEN');

-- CreateEnum
CREATE TYPE "CpEstadoPeriodo" AS ENUM ('ABIERTO', 'CERRADO', 'AJUSTE');

-- CreateEnum
CREATE TYPE "CpTipoDocumento" AS ENUM ('NIT', 'CC', 'CE', 'PA', 'OTRO');

-- CreateEnum
CREATE TYPE "CpTipoComprobante" AS ENUM ('CONTABLE', 'EGRESO', 'INGRESO', 'AJUSTE', 'APERTURA', 'CIERRE');

-- CreateEnum
CREATE TYPE "CpEstadoComprobante" AS ENUM ('REGISTRADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "PsuTipoRubro" AS ENUM ('GASTO', 'INGRESO');

-- CreateEnum
CREATE TYPE "PsuEstadoDoc" AS ENUM ('VIGENTE', 'ANULADO', 'AGOTADO');

-- CreateEnum
CREATE TYPE "PsuMedioPago" AS ENUM ('TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'OTRO');

-- CreateEnum
CREATE TYPE "NomTipoVinculacion" AS ENUM ('PLANTA', 'TRABAJADOR_OFICIAL', 'CONTRATISTA', 'SUPERNUMERARIO', 'APRENDIZ');

-- CreateEnum
CREATE TYPE "NomTipoConcepto" AS ENUM ('DEVENGADO', 'DEDUCCION_EMPLEADO', 'APORTE_PATRONAL', 'PRESTACION_SOCIAL');

-- CreateEnum
CREATE TYPE "NomFormulaConcepto" AS ENUM ('FIJO', 'PORCENTAJE_SUELDO', 'PORCENTAJE_DEVENGADO', 'PORCENTAJE_IBC', 'CALCULO_ESPECIAL');

-- CreateEnum
CREATE TYPE "NomEstadoPeriodo" AS ENUM ('ABIERTO', 'LIQUIDADO', 'PAGADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "NomTipoNovedad" AS ENUM ('VACACIONES', 'LICENCIA_REMUNERADA', 'LICENCIA_NO_REMUNERADA', 'INCAPACIDAD_EPS', 'INCAPACIDAD_ARL', 'AUSENCIA', 'COMISION_SERVICIOS', 'PERMISO');

-- CreateEnum
CREATE TYPE "RcTipoReporte" AS ENUM ('CHIP_BALANCE', 'CHIP_ACTIVIDAD', 'FUT_INGRESOS', 'FUT_GASTOS', 'LEY_617');

-- CreateEnum
CREATE TYPE "TesoCuentaTipo" AS ENUM ('CORRIENTE', 'AHORROS', 'INVERSION_TEMPORAL', 'FONDOS_ESPECIALES');

-- CreateEnum
CREATE TYPE "TesoTipoMovimiento" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "ConModalidad" AS ENUM ('LICITACION_PUBLICA', 'SELECCION_ABREVIADA', 'CONCURSO_MERITOS', 'CONTRATACION_DIRECTA', 'MINIMA_CUANTIA', 'ASOCIACION_PUBLICO_PRIVADA');

-- CreateEnum
CREATE TYPE "ConEstadoProceso" AS ENUM ('PLANEACION', 'CONVOCATORIA', 'EVALUACION', 'ADJUDICADO', 'CONTRATADO', 'LIQUIDADO', 'DESIERTO', 'REVOCADO');

-- CreateEnum
CREATE TYPE "ConTipoContrato" AS ENUM ('PRESTACION_SERVICIOS', 'COMPRAVENTA', 'SUMINISTRO', 'OBRA_PUBLICA', 'CONSULTORIA', 'INTERADMINISTRATIVO', 'CONCESION', 'ARRENDAMIENTO', 'COMODATO', 'CONVENIO', 'OTRO');

-- CreateEnum
CREATE TYPE "ConEstadoContrato" AS ENUM ('SUSCRITO', 'EN_EJECUCION', 'SUSPENDIDO', 'TERMINADO', 'LIQUIDADO', 'INCUMPLIDO');

-- CreateEnum
CREATE TYPE "ConTipoAdicion" AS ENUM ('ADICION_VALOR', 'PROROGA', 'ADICION_VALOR_Y_PROROGA', 'SUSPENSION', 'REINICIO');

-- CreateEnum
CREATE TYPE "ConTipoDocumento" AS ENUM ('ESTUDIO_PREVIO', 'AVISO_CONVOCATORIA', 'PLIEGO_CONDICIONES', 'ADENDA', 'PROPUESTA_OFERENTE', 'INFORME_EVALUACION', 'ACTO_ADJUDICACION', 'CONTRATO', 'POLIZA', 'ACTA_INICIO', 'INFORME_SUPERVISION', 'ACTA_SUSPENSION', 'ACTA_REINICIO', 'ACTA_TERMINACION', 'ACTA_LIQUIDACION', 'OTRO');

-- CreateEnum
CREATE TYPE "ActivoCategoria" AS ENUM ('MUEBLE_ENSERE', 'EQUIPO_COMPUTO', 'EQUIPO_COMUNICACION', 'EQUIPO_AUDIOVISUAL', 'MAQUINARIA_EQUIPO', 'VEHICULO', 'INMUEBLE', 'SEMOVIENTE', 'INTANGIBLE', 'OTRO');

-- CreateEnum
CREATE TYPE "ActivoEstado" AS ENUM ('EN_SERVICIO', 'EN_MANTENIMIENTO', 'EN_BODEGA', 'DADO_DE_BAJA', 'EXTRAVIADO');

-- CreateEnum
CREATE TYPE "ActivoTipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'GARANTIA');

-- CreateEnum
CREATE TYPE "ActivoTipoMovimiento" AS ENUM ('INGRESO', 'ASIGNACION', 'TRASLADO', 'DEVOLUCION', 'BAJA', 'REINTEGRO');

-- CreateEnum
CREATE TYPE "AlmCategoria" AS ENUM ('PAPELERIA_UTILES', 'ASEO_CAFETERIA', 'TONER_INSUMOS_TIC', 'HERRAMIENTAS', 'MEDICAMENTOS', 'COMBUSTIBLE', 'MATERIALES_OBRA', 'OTRO');

-- CreateEnum
CREATE TYPE "AlmTipoEntrada" AS ENUM ('COMPRA', 'DONACION', 'REINTEGRO', 'AJUSTE_POSITIVO');

-- CreateEnum
CREATE TYPE "ObsCategoria" AS ENUM ('GESTION_INTERNA', 'ATENCION_CIUDADANA', 'FINANCIERO', 'CONTRATACION', 'GESTION_DOCUMENTAL', 'TALENTO_HUMANO', 'MIPG', 'OTRO');

-- CreateEnum
CREATE TYPE "ObsPeriodicidad" AS ENUM ('DIARIA', 'SEMANAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "ObsMetaTipo" AS ENUM ('MAYOR_ES_MEJOR', 'MENOR_ES_MEJOR', 'EXACTO');

-- CreateEnum
CREATE TYPE "RenTipoConcepto" AS ENUM ('PREDIAL_UNIFICADO', 'INDUSTRIA_COMERCIO', 'SOBRETASA_GASOLINA', 'ESTAMPILLA', 'DELINEACION_URBANA', 'AVISOS_TABLEROS', 'PLUSVALIA', 'ALUMBRADO_PUBLICO', 'OTRO');

-- CreateEnum
CREATE TYPE "RenPeriodicidad" AS ENUM ('ANUAL', 'SEMESTRAL', 'TRIMESTRAL', 'MENSUAL', 'UNICA');

-- CreateEnum
CREATE TYPE "RenEstadoLiquidacion" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'EN_ACUERDO_PAGO', 'ANULADA');

-- CreateEnum
CREATE TYPE "RenMedioPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'PSE', 'CHEQUE', 'DATAFONO', 'OTRO');

-- CreateEnum
CREATE TYPE "DiscTipoProceso" AS ENUM ('DISCIPLINARIO_ORDINARIO', 'DISCIPLINARIO_VERBAL', 'QUEJA_CIUDADANA', 'DERECHO_PETICION_INTERNO');

-- CreateEnum
CREATE TYPE "DiscEstadoProceso" AS ENUM ('INDAGACION_PRELIMINAR', 'INVESTIGACION_DISCIPLINARIA', 'PLIEGO_DE_CARGOS', 'DESCARGOS', 'PERIODO_PRUEBAS', 'ALEGATOS', 'FALLO_PRIMERA_INSTANCIA', 'RECURSO_APELACION', 'FALLO_SEGUNDA_INSTANCIA', 'EJECUTORIADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "DiscCalificacion" AS ENUM ('GRAVISIMA', 'GRAVE', 'LEVE');

-- CreateEnum
CREATE TYPE "DiscTipoSancion" AS ENUM ('DESTITUCION_INHABILIDAD', 'SUSPENSION_INHABILIDAD', 'SUSPENSION', 'MULTA', 'AMONESTACION_ESCRITA', 'ARCHIVO');

-- CreateEnum
CREATE TYPE "DiscEstadoTutela" AS ENUM ('RECIBIDA', 'EN_TRAMITE', 'FALLADA', 'IMPUGNADA', 'EJECUTORIADA', 'EN_CUMPLIMIENTO', 'CUMPLIDA', 'CERRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT,
    "telefono" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificado" TIMESTAMP(3),
    "rolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB NOT NULL,
    "esProtegido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacion" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_principal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "codigoITA" TEXT,
    "padreId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_principal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paginas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" JSONB,
    "plantilla" "PlantillaPagina" NOT NULL DEFAULT 'GENERICA',
    "metaKeywords" TEXT,
    "imagenDestacada" TEXT,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "menuId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paginas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones_pagina" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoSeccion" NOT NULL,
    "contenido" JSONB NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "configuracion" JSONB,
    "paginaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_pagina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_transparencia" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esObligatoria" BOOLEAN NOT NULL DEFAULT true,
    "codigoITA" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_transparencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategorias_transparencia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esObligatoria" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategorias_transparencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_transparencia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" JSONB,
    "tipo" "TipoItemTransparencia" NOT NULL DEFAULT 'TEXTO',
    "urlExterna" TEXT,
    "archivoUrl" TEXT,
    "fechaPublicacion" TIMESTAMP(3),
    "fechaActualizacion" TIMESTAMP(3),
    "esObligatorio" BOOLEAN NOT NULL DEFAULT true,
    "cumplido" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "subcategoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_transparencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_transparencia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "tamanio" INTEGER,
    "vigencia" TIMESTAMP(3),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_transparencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noticias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extracto" TEXT,
    "contenido" JSONB NOT NULL,
    "imagenDestacada" TEXT,
    "galeria" JSONB,
    "videoUrl" TEXT,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "fechaPublicacion" TIMESTAMP(3),
    "categoriaId" TEXT,
    "creadorId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_noticias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas_noticias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etiquetas_noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenidos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tipo" "TipoContenido" NOT NULL,
    "contenido" JSONB NOT NULL,
    "extracto" TEXT,
    "imagenDestacada" TEXT,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "fechaPublicacion" TIMESTAMP(3),
    "creadorId" TEXT NOT NULL,
    "actualizadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "tamanio" INTEGER,
    "categoria" "CategoriaDocumento" NOT NULL,
    "carpeta" TEXT,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "subidoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pqrs" (
    "id" TEXT NOT NULL,
    "radicado" TEXT NOT NULL,
    "tipo" "TipoPQRS" NOT NULL,
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nombreSolicitante" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "municipio" TEXT,
    "estado" "EstadoPQRS" NOT NULL DEFAULT 'RECIBIDA',
    "prioridad" "PrioridadPQRS" NOT NULL DEFAULT 'NORMAL',
    "fechaRadicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaRespuesta" TIMESTAMP(3),
    "archivosAdjuntos" JSONB,
    "respuesta" TEXT,
    "archivoRespuesta" TEXT,
    "asignadoId" TEXT,
    "registradoPorId" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "canal" "CanalPQRS" NOT NULL DEFAULT 'WEB',
    "gdRadicadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folios" INTEGER,
    "razonPrioridad" TEXT,
    "diasTerminoLegal" INTEGER,
    "fechaTerminoSuspendido" TIMESTAMP(3),
    "fechaTerminoReanudado" TIMESTAMP(3),
    "vencido" BOOLEAN NOT NULL DEFAULT false,
    "cerradoEn" TIMESTAMP(3),
    "cerradoPor" TEXT,
    "motivoCierre" TEXT,
    "metadata" JSONB,
    "colorSemaforo" "VuColorSemaforo",

    CONSTRAINT "pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_pqrs" (
    "id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "descripcion" TEXT,
    "estadoAnterior" "EstadoPQRS",
    "estadoNuevo" "EstadoPQRS",
    "pqrsId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "descripcion" TEXT,
    "grupo" TEXT,
    "esPublico" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "subtitulo" TEXT,
    "imagenUrl" TEXT NOT NULL,
    "imagenMovilUrl" TEXT,
    "enlace" TEXT,
    "textoBoton" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enlaces_rapidos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "enlace" TEXT NOT NULL,
    "esExterno" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enlaces_rapidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners_popup" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "contenido" TEXT,
    "imagenUrl" TEXT,
    "enlace" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_popup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identidad_institucional" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'default',
    "nombreCompleto" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "eslogan" TEXT,
    "direccionPrincipal" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,
    "codigoPostal" TEXT,
    "telefonoConmutador" TEXT,
    "telefonoPqrsd" TEXT,
    "emailContacto" TEXT,
    "emailPqrsd" TEXT,
    "emailNotificaciones" TEXT,
    "emailAccesibilidad" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "colorPrimario" TEXT,
    "colorSecundario" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "linkedinUrl" TEXT,
    "whatsappNumero" TEXT,
    "seoTitle" TEXT,
    "seoTitleTemplate" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "seoOgImageUrl" TEXT,
    "seoOgUrl" TEXT,
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "emailSignatureHtml" TEXT,
    "coordenadaLat" DOUBLE PRECISION,
    "coordenadaLng" DOUBLE PRECISION,
    "urlGoogleMapsEmbed" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identidad_institucional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "coordenadaLat" DOUBLE PRECISION,
    "coordenadaLng" DOUBLE PRECISION,
    "horarioAtencion" TEXT,
    "observaciones" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canales_atencion" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCanalAtencion" NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canales_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas_frecuentes" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "categoria" "CategoriaFaq" NOT NULL DEFAULT 'GENERAL',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "publicada" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preguntas_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "dependencia" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "extension" TEXT,
    "foto" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "formacionAcademica" TEXT,
    "experiencia" TEXT,
    "tipoVinculacion" TEXT,
    "visibleEnDirectorio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "horario" TEXT,
    "ubicacion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" JSONB,
    "imagenDestacada" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "lugar" TEXT,
    "direccion" TEXT,
    "enlaceVirtual" TEXT,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "datosAntes" JSONB,
    "datosDespues" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mipg_dimensiones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mipg_dimensiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mipg_politicas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "dimensionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mipg_politicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mipg_indicadores" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "formula" TEXT,
    "metaAnual" DOUBLE PRECISION,
    "tipoMedicion" "TipoMedicionMIPG" NOT NULL DEFAULT 'PORCENTAJE',
    "politicaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mipg_indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mipg_evidencias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT,
    "enlaceExterno" TEXT,
    "anioVigencia" INTEGER NOT NULL,
    "mesVigencia" INTEGER,
    "estado" "EstadoEvidencia" NOT NULL DEFAULT 'PENDIENTE',
    "indicadorId" TEXT NOT NULL,
    "subidoPorId" TEXT NOT NULL,
    "gdDocumentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mipg_evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mipg_evaluaciones" (
    "id" TEXT NOT NULL,
    "anioVigencia" INTEGER NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "politicaId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mipg_evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_trd_dependencias" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "padreId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_trd_dependencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_trd_series" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dependenciaId" TEXT NOT NULL,

    CONSTRAINT "gd_trd_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_trd_subseries" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tiempoGestion" INTEGER NOT NULL DEFAULT 2,
    "tiempoCentral" INTEGER NOT NULL DEFAULT 3,
    "soporteFisico" BOOLEAN NOT NULL DEFAULT false,
    "soporteElectronico" BOOLEAN NOT NULL DEFAULT true,
    "disposicion" "GdDisposicionFinal" NOT NULL DEFAULT 'CONSERVACION_TOTAL',
    "procedimiento" TEXT,
    "serieId" TEXT NOT NULL,

    CONSTRAINT "gd_trd_subseries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_trd_tipos_documentales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "diasTramite" INTEGER NOT NULL DEFAULT 15,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subserieId" TEXT NOT NULL,

    CONSTRAINT "gd_trd_tipos_documentales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_consecutivos" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "tipo" "GdTipoRadicado" NOT NULL,
    "codigoDep" TEXT NOT NULL,
    "ultimo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gd_consecutivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_festivos_colombia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "ley" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_festivos_colombia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_radicados" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "GdTipoRadicado" NOT NULL,
    "medioRecepcion" "GdMedioRecepcion" NOT NULL DEFAULT 'WEB',
    "asunto" TEXT NOT NULL,
    "folios" INTEGER NOT NULL DEFAULT 1,
    "prioridad" "GdPrioridad" NOT NULL DEFAULT 'NORMAL',
    "fechaVencimiento" TIMESTAMP(3),
    "radicadoOrigen" TEXT,
    "observacion" TEXT,
    "estado" "GdEstadoRadicado" NOT NULL DEFAULT 'EN_TRAMITE',
    "isRadicado" BOOLEAN NOT NULL DEFAULT true,
    "dependenciaId" TEXT NOT NULL,
    "subserieId" TEXT,
    "tipoDocumentalId" TEXT,
    "tramitadorId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "padreId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_radicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_remitentes" (
    "id" TEXT NOT NULL,
    "tipoPersona" "GdTipoPersona" NOT NULL DEFAULT 'CIUDADANO',
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "municipio" TEXT,
    "radicadoId" TEXT NOT NULL,

    CONSTRAINT "gd_remitentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_documentos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "folios" INTEGER NOT NULL DEFAULT 1,
    "subidoPorId" TEXT,
    "radicadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_expedientes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "estado" "GdEstadoExpediente" NOT NULL DEFAULT 'ABIERTO',
    "dependenciaId" TEXT NOT NULL,
    "serieId" TEXT,
    "subserieId" TEXT,
    "creadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_expedientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_indices_electronicos" (
    "id" TEXT NOT NULL,
    "hashCierre" TEXT NOT NULL,
    "documentoUrl" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "firmanteId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_indices_electronicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_edificios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,

    CONSTRAINT "ga_edificios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_pisos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edificioId" TEXT NOT NULL,

    CONSTRAINT "ga_pisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_bodegas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "pisoId" TEXT NOT NULL,

    CONSTRAINT "ga_bodegas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_estantes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "bodegaId" TEXT NOT NULL,

    CONSTRAINT "ga_estantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_entrepanos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estanteId" TEXT NOT NULL,

    CONSTRAINT "ga_entrepanos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_cajas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "entrepanoId" TEXT NOT NULL,

    CONSTRAINT "ga_cajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_carpetas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cajaId" TEXT NOT NULL,
    "expedienteId" TEXT,

    CONSTRAINT "ga_carpetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ga_prestamos" (
    "id" TEXT NOT NULL,
    "carpetaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" TIMESTAMP(3),
    "estado" "GaEstadoPrestamo" NOT NULL DEFAULT 'SOLICITADO',
    "observaciones" TEXT,

    CONSTRAINT "ga_prestamos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_plantillas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_plantillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_firmas_qr" (
    "id" TEXT NOT NULL,
    "hashFirma" TEXT NOT NULL,
    "urlVerificacion" TEXT NOT NULL,
    "ipFirmante" TEXT,
    "documentoId" TEXT NOT NULL,
    "firmanteId" TEXT NOT NULL,
    "fechaFirma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_firmas_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_log_transacciones" (
    "id" TEXT NOT NULL,
    "accion" "GdAccionTransaccion" NOT NULL,
    "descripcion" TEXT,
    "estadoAnterior" "GdEstadoRadicado",
    "estadoNuevo" "GdEstadoRadicado",
    "usuarioId" TEXT NOT NULL,
    "radicadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_log_transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_radicados_informados" (
    "id" TEXT NOT NULL,
    "radicadoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "leidoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_radicados_informados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_vobos" (
    "id" TEXT NOT NULL,
    "radicadoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "estado" "GdEstadoVoBo" NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" TEXT NOT NULL,
    "aprobadorId" TEXT,
    "comentario" TEXT,
    "fechaAccion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_vobos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_plan_config" (
    "id" TEXT NOT NULL,
    "nivel" "GdPlanNivel" NOT NULL DEFAULT 'BASICO',
    "limiteRadicados" INTEGER NOT NULL DEFAULT 50000,
    "limiteSedes" INTEGER NOT NULL DEFAULT 1,
    "apiPublica" BOOLEAN NOT NULL DEFAULT false,
    "slaHoras" INTEGER NOT NULL DEFAULT 72,
    "radicadosActuales" INTEGER NOT NULL DEFAULT 0,
    "anioActual" INTEGER NOT NULL DEFAULT 2026,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_plan_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_api_keys" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permisos" JSONB NOT NULL DEFAULT '[]',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoUso" TIMESTAMP(3),
    "usosTotal" INTEGER NOT NULL DEFAULT 0,
    "creadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_api_logs" (
    "id" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "ip" TEXT,
    "duracionMs" INTEGER NOT NULL DEFAULT 0,
    "apiKeyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gd_api_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gd_sigep_cache" (
    "id" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "entidad" TEXT,
    "dependencia" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "datosJson" JSONB,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gd_sigep_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_asignaciones_ia" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tokensPrompt" INTEGER NOT NULL DEFAULT 0,
    "tokensRespuesta" INTEGER NOT NULL DEFAULT 0,
    "razon" TEXT NOT NULL,
    "confianza" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dependenciaSugerida" TEXT,
    "funcionarioSugerido" TEXT,
    "prioridadSugerida" "PrioridadPQRS",
    "tipoDetectado" "TipoPQRS",
    "diasTerminoLegal" INTEGER,
    "pqrsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_asignaciones_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_respuestas" (
    "id" TEXT NOT NULL,
    "tipo" "VuTipoRespuesta" NOT NULL,
    "contenido" TEXT NOT NULL,
    "archivoUrl" TEXT,
    "entidadDestino" TEXT,
    "radicadoDestino" TEXT,
    "firmadoPor" TEXT,
    "firmaQrUrl" TEXT,
    "pqrsId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_respuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_chat_mensajes" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "archivoUrl" TEXT,
    "esInterno" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT,
    "pqrsId" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_chat_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_demografia" (
    "id" TEXT NOT NULL,
    "genero" "VuGenero" NOT NULL DEFAULT 'PREFIERE_NO_DECIR',
    "rangoEtario" TEXT,
    "zona" "VuZona" NOT NULL DEFAULT 'NO_INFORMA',
    "condicion" "VuCondicionVulnerabilidad" NOT NULL DEFAULT 'NINGUNA',
    "municipioResidencia" TEXT,
    "departamento" TEXT,
    "pqrsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_demografia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_asignaciones_funcionario" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "asignadoPorId" TEXT,
    "estado" "VuEstadoAsignacion" NOT NULL DEFAULT 'ACTIVA',
    "motivo" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_asignaciones_funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_asignacion_historial" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT NOT NULL,
    "funcionarioAnteriorId" TEXT,
    "funcionarioNuevoId" TEXT NOT NULL,
    "realizadoPorId" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_asignacion_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_peticiones_reasignacion" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "funcionarioPropuestoId" TEXT,
    "motivo" TEXT NOT NULL,
    "estado" "VuEstadoPeticionReasignacion" NOT NULL DEFAULT 'PENDIENTE',
    "resueltaPorId" TEXT,
    "resueltaEn" TIMESTAMP(3),
    "observacionResolucion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_peticiones_reasignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_configuracion_sla" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPQRS" NOT NULL,
    "diasHabiles" INTEGER NOT NULL,
    "diasAlerta" INTEGER NOT NULL,
    "diasCriticoVencido" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_configuracion_sla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_configuracion_sistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "descripcion" TEXT,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_directorio_email" (
    "id" TEXT NOT NULL,
    "nombreEntidad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailCc" TEXT,
    "telefono" TEXT,
    "responsable" TEXT,
    "categoria" TEXT,
    "notas" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_directorio_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_notificaciones" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT,
    "destinatarioUsuarioId" TEXT,
    "destinatarioEmail" TEXT,
    "destinatarioTelefono" TEXT,
    "tipo" "VuTipoNotificacion" NOT NULL,
    "canal" "VuCanalNotificacion" NOT NULL,
    "estado" "VuEstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "asunto" TEXT,
    "contenido" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "enviadaEn" TIMESTAMP(3),
    "leidaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_registro_atencion" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT,
    "ciudadanoNombre" TEXT NOT NULL,
    "ciudadanoDocumento" TEXT,
    "ciudadanoTelefono" TEXT,
    "ciudadanoEmail" TEXT,
    "canal" "VuTipoCanalAtencion" NOT NULL,
    "motivo" TEXT NOT NULL,
    "resolucion" TEXT,
    "atendidoPorId" TEXT,
    "duracionMinutos" INTEGER,
    "satisfaccion" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_registro_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_plantillas_reporte" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "consulta" JSONB NOT NULL,
    "esPublica" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_plantillas_reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_reportes" (
    "id" TEXT NOT NULL,
    "plantillaId" TEXT,
    "parametros" JSONB NOT NULL,
    "resultado" JSONB NOT NULL,
    "archivoUrl" TEXT,
    "generadoPorId" TEXT,
    "periodoDesde" TIMESTAMP(3),
    "periodoHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_opciones_dropdown" (
    "id" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vu_opciones_dropdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_documentos" (
    "id" TEXT NOT NULL,
    "pqrsId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "fileHash" TEXT,
    "documentType" "VuTipoDocumento" NOT NULL DEFAULT 'OTRO',
    "descripcion" TEXT,
    "esInterno" BOOLEAN NOT NULL DEFAULT false,
    "subidoPorId" TEXT,
    "subidoPorTipo" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vu_rutas_token_externo" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "pqrsId" TEXT NOT NULL,
    "permiteConsulta" BOOLEAN NOT NULL DEFAULT true,
    "permiteResponder" BOOLEAN NOT NULL DEFAULT false,
    "expiraEn" TIMESTAMP(3),
    "ultimoUsoEn" TIMESTAMP(3),
    "vecesUsado" INTEGER NOT NULL DEFAULT 0,
    "revocadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vu_rutas_token_externo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_bienes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "folioMatricula" TEXT,
    "placa" TEXT,
    "tipo" "FriscoTipoBien" NOT NULL,
    "estadoJuridico" "FriscoEstadoJuridico" NOT NULL DEFAULT 'EN_PROCESO',
    "estadoFisico" "FriscoEstadoFisico" DEFAULT 'SIN_VERIFICAR',
    "descripcion" TEXT NOT NULL,
    "ubicacion" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "avaluoVigente" DECIMAL(18,2),
    "monedaAvaluo" TEXT DEFAULT 'COP',
    "fechaAvaluo" TIMESTAMP(3),
    "numeroProceso" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "juzgado" TEXT,
    "expedienteId" TEXT,
    "carpetaFisicaId" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frisco_bienes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_depositarios" (
    "id" TEXT NOT NULL,
    "tipoPersona" "FriscoTipoPersona" NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "bienId" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoReporte" TIMESTAMP(3),
    "polizaVigenteHasta" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frisco_depositarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_portal_accesos" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "depositarioId" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadoEn" TIMESTAMP(3),
    "ultimoAccesoEn" TIMESTAMP(3),
    "accesoCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "frisco_portal_accesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_reportes_depositario" (
    "id" TEXT NOT NULL,
    "depositarioId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "estadoBien" "FriscoEstadoFisico" NOT NULL,
    "novedades" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "adjuntoUrl" TEXT,
    "ipOrigen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frisco_reportes_depositario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_reporte_analisis_ia" (
    "id" TEXT NOT NULL,
    "reporteId" TEXT NOT NULL,
    "urgencia" "FriscoReporteUrgencia" NOT NULL,
    "etiquetas" TEXT[],
    "resumen" TEXT NOT NULL,
    "confianza" DOUBLE PRECISION NOT NULL,
    "modelo" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "raw" JSONB,
    "tokensPrompt" INTEGER,
    "tokensRespuesta" INTEGER,
    "errorMsg" TEXT,
    "revisadoPor" TEXT,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frisco_reporte_analisis_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_contratos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "FriscoTipoContrato" NOT NULL,
    "bienId" TEXT NOT NULL,
    "contraparteNombre" TEXT NOT NULL,
    "contraparteDocumento" TEXT NOT NULL,
    "contraparteEmail" TEXT,
    "contraparteTelefono" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "canon" DECIMAL(18,2),
    "periodicidad" "FriscoPeriodicidad",
    "polizaNumero" TEXT,
    "polizaVigenteHasta" TIMESTAMP(3),
    "estado" "FriscoEstadoContrato" NOT NULL DEFAULT 'VIGENTE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frisco_contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_destinaciones" (
    "id" TEXT NOT NULL,
    "bienId" TEXT NOT NULL,
    "tipo" "FriscoTipoDestinacion" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "beneficiario" TEXT,
    "valorRealizacion" DECIMAL(18,2),
    "actoAdministrativo" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frisco_destinaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frisco_interop_logs" (
    "id" TEXT NOT NULL,
    "servicio" "FriscoInteropServicio" NOT NULL,
    "bienId" TEXT,
    "consulta" JSONB NOT NULL,
    "respuesta" JSONB,
    "exito" BOOLEAN NOT NULL,
    "errorMsg" TEXT,
    "latenciaMs" INTEGER,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frisco_interop_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cp_plan_cuentas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "naturaleza" "CpNaturaleza" NOT NULL,
    "tipo" "CpTipoCuenta" NOT NULL,
    "parentId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "permiteMovimientos" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_plan_cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cp_periodos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER,
    "estado" "CpEstadoPeriodo" NOT NULL DEFAULT 'ABIERTO',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "cerradoEn" TIMESTAMP(3),
    "cerradoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cp_terceros" (
    "id" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoDocumento" "CpTipoDocumento" NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_terceros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cp_comprobantes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "CpTipoComprobante" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "CpEstadoComprobante" NOT NULL DEFAULT 'REGISTRADO',
    "periodoId" TEXT NOT NULL,
    "totalDebito" DECIMAL(18,2) NOT NULL,
    "totalCredito" DECIMAL(18,2) NOT NULL,
    "fuenteModulo" TEXT,
    "fuenteRef" TEXT,
    "creadoPor" TEXT,
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_comprobantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cp_asientos" (
    "id" TEXT NOT NULL,
    "comprobanteId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "terceroId" TEXT,
    "debito" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credito" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_rubros" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "PsuTipoRubro" NOT NULL,
    "nivel" INTEGER NOT NULL,
    "fuente" TEXT,
    "programa" TEXT,
    "proyecto" TEXT,
    "parentId" TEXT,
    "permiteMovimientos" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_rubros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_apropiaciones" (
    "id" TEXT NOT NULL,
    "rubroId" TEXT NOT NULL,
    "vigencia" INTEGER NOT NULL,
    "apropiacionInicial" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "adiciones" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "reducciones" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_apropiaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_cdps" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "vigencia" INTEGER NOT NULL,
    "rubroId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "objeto" TEXT NOT NULL,
    "estado" "PsuEstadoDoc" NOT NULL DEFAULT 'VIGENTE',
    "creadoPor" TEXT,
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_cdps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_rps" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cdpId" TEXT NOT NULL,
    "terceroId" TEXT,
    "valor" DECIMAL(18,2) NOT NULL,
    "objeto" TEXT NOT NULL,
    "estado" "PsuEstadoDoc" NOT NULL DEFAULT 'VIGENTE',
    "creadoPor" TEXT,
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_rps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_obligaciones" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "rpId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "concepto" TEXT NOT NULL,
    "estado" "PsuEstadoDoc" NOT NULL DEFAULT 'VIGENTE',
    "creadoPor" TEXT,
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_obligaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu_pagos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "obligacionId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "medioPago" "PsuMedioPago" NOT NULL,
    "referencia" TEXT,
    "estado" "PsuEstadoDoc" NOT NULL DEFAULT 'VIGENTE',
    "comprobanteId" TEXT,
    "cuentaBancoId" TEXT,
    "creadoPor" TEXT,
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psu_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_empleados" (
    "id" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "primerNombre" TEXT NOT NULL,
    "segundoNombre" TEXT,
    "primerApellido" TEXT NOT NULL,
    "segundoApellido" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "cargo" TEXT NOT NULL,
    "dependencia" TEXT,
    "tipoVinculacion" "NomTipoVinculacion" NOT NULL DEFAULT 'PLANTA',
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaRetiro" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "salarioBasico" DECIMAL(18,2) NOT NULL,
    "cuentaBanco" TEXT,
    "bancoNombre" TEXT,
    "tipoCuenta" TEXT,
    "eps" TEXT,
    "afp" TEXT,
    "arl" TEXT,
    "cajaCompensacion" TEXT,
    "codigoEPS" TEXT,
    "codigoAFP" TEXT,
    "codigoARL" TEXT,
    "codigoCajaComp" TEXT,
    "claseRiesgoARL" INTEGER,
    "retencionFuenteAplica" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nom_empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_conceptos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "NomTipoConcepto" NOT NULL,
    "formula" "NomFormulaConcepto" NOT NULL DEFAULT 'FIJO',
    "porcentaje" DECIMAL(6,4),
    "valorFijo" DECIMAL(18,2),
    "aplicaA" "NomTipoVinculacion"[],
    "baseRetencion" BOOLEAN NOT NULL DEFAULT false,
    "baseAportes" BOOLEAN NOT NULL DEFAULT false,
    "constitutivoSalario" BOOLEAN NOT NULL DEFAULT true,
    "cuentaContableCodigo" TEXT,
    "rubroCcpetCodigo" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 100,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nom_conceptos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_periodos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "estado" "NomEstadoPeriodo" NOT NULL DEFAULT 'ABIERTO',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "liquidadoEn" TIMESTAMP(3),
    "liquidadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nom_periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_liquidaciones" (
    "id" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "totalDevengado" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalDeducciones" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAportesPatronales" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "netoPagar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "diasLiquidados" INTEGER NOT NULL DEFAULT 30,
    "salarioBasico" DECIMAL(18,2) NOT NULL,
    "obligacionId" TEXT,
    "comprobanteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nom_liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_liquidacion_detalles" (
    "id" TEXT NOT NULL,
    "liquidacionId" TEXT NOT NULL,
    "conceptoId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "base" DECIMAL(18,2),
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nom_liquidacion_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_novedades" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "tipo" "NomTipoNovedad" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "observacion" TEXT,
    "valor" DECIMAL(18,2),
    "aprobada" BOOLEAN NOT NULL DEFAULT false,
    "aprobadaPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nom_novedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nom_pagos_pasivos" (
    "id" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "cuentaCodigo" TEXT NOT NULL,
    "cuentaNombre" TEXT NOT NULL,
    "tercero" TEXT NOT NULL,
    "terceroNit" TEXT,
    "valor" DECIMAL(18,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuentaBancoCodigo" TEXT NOT NULL,
    "comprobanteId" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nom_pagos_pasivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rc_reportes" (
    "id" TEXT NOT NULL,
    "tipo" "RcTipoReporte" NOT NULL,
    "periodoContableId" TEXT,
    "vigencia" INTEGER,
    "datos" JSONB NOT NULL,
    "totales" JSONB,
    "generadoPor" TEXT,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,

    CONSTRAINT "rc_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teso_cuentas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "nitBanco" TEXT,
    "numeroCuenta" TEXT NOT NULL,
    "tipo" "TesoCuentaTipo" NOT NULL DEFAULT 'CORRIENTE',
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "cuentaContableCodigo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teso_cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teso_movimientos" (
    "id" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "tipo" "TesoTipoMovimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "numero" TEXT,
    "tercero" TEXT,
    "terceroNit" TEXT,
    "comprobanteId" TEXT,
    "pagoPresupId" TEXT,
    "conciliado" BOOLEAN NOT NULL DEFAULT false,
    "conciliadoEn" TIMESTAMP(3),
    "extractoLineaId" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teso_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teso_extractos" (
    "id" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "saldoInicial" DECIMAL(18,2) NOT NULL,
    "saldoFinal" DECIMAL(18,2) NOT NULL,
    "cargadoPor" TEXT,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teso_extractos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teso_extracto_lineas" (
    "id" TEXT NOT NULL,
    "extractoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "debito" DECIMAL(18,2),
    "credito" DECIMAL(18,2),
    "saldo" DECIMAL(18,2),
    "conciliada" BOOLEAN NOT NULL DEFAULT false,
    "movimientoId" TEXT,

    CONSTRAINT "teso_extracto_lineas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "con_procesos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "modalidad" "ConModalidad" NOT NULL,
    "estado" "ConEstadoProceso" NOT NULL DEFAULT 'PLANEACION',
    "objeto" TEXT NOT NULL,
    "vigencia" INTEGER NOT NULL,
    "valorEstimado" DECIMAL(18,2) NOT NULL,
    "cdpId" TEXT,
    "cdpNumero" TEXT,
    "rubroNombre" TEXT,
    "fechaAviso" TIMESTAMP(3),
    "fechaCierre" TIMESTAMP(3),
    "fechaAdjudicacion" TIMESTAMP(3),
    "supervisorNombre" TEXT,
    "supervisorCargo" TEXT,
    "dependencia" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "secopId" TEXT,
    "secopUrl" TEXT,
    "secopEstado" TEXT,
    "secopSyncAt" TIMESTAMP(3),

    CONSTRAINT "con_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "con_contratos" (
    "id" TEXT NOT NULL,
    "procesoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "ConTipoContrato" NOT NULL,
    "estado" "ConEstadoContrato" NOT NULL DEFAULT 'SUSCRITO',
    "contratistaNombre" TEXT NOT NULL,
    "contratistaDoc" TEXT NOT NULL,
    "contratistaEmail" TEXT,
    "contratistaTelefono" TEXT,
    "valorContrato" DECIMAL(18,2) NOT NULL,
    "valorAdiciones" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "plazoMeses" INTEGER,
    "fechaSuscripcion" TIMESTAMP(3) NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaTerminacion" TIMESTAMP(3),
    "fechaLiquidacion" TIMESTAMP(3),
    "rpId" TEXT,
    "rpNumero" TEXT,
    "supervisorNombre" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "con_contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "con_adiciones" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "tipo" "ConTipoAdicion" NOT NULL,
    "numero" TEXT NOT NULL,
    "valor" DECIMAL(18,2),
    "plazoMeses" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL,
    "justificacion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "con_adiciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "con_documentos" (
    "id" TEXT NOT NULL,
    "procesoId" TEXT,
    "contratoId" TEXT,
    "tipo" "ConTipoDocumento" NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT,
    "fechaDoc" TIMESTAMP(3),
    "observacion" TEXT,
    "creadoPor" TEXT,
    "secopDocId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "con_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos_bienes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" "ActivoCategoria" NOT NULL,
    "tipo" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "serial" TEXT,
    "color" TEXT,
    "valorAdquisicion" DECIMAL(18,2),
    "fechaAdquisicion" TIMESTAMP(3),
    "vidaUtilAnios" INTEGER,
    "dependenciaId" TEXT,
    "dependenciaNombre" TEXT,
    "responsableId" TEXT,
    "responsableNombre" TEXT,
    "ubicacion" TEXT,
    "estado" "ActivoEstado" NOT NULL DEFAULT 'EN_SERVICIO',
    "imagenUrl" TEXT,
    "observaciones" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activos_bienes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos_asignaciones" (
    "id" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "funcionarioNombre" TEXT NOT NULL,
    "dependenciaNombre" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "actaNumero" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activos_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos_mantenimientos" (
    "id" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "tipo" "ActivoTipoMantenimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "proveedor" TEXT,
    "costo" DECIMAL(18,2),
    "proximoMantenimiento" TIMESTAMP(3),
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activos_mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos_movimientos" (
    "id" TEXT NOT NULL,
    "activoId" TEXT NOT NULL,
    "tipo" "ActivoTipoMovimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "origenDependencia" TEXT,
    "destinoDependencia" TEXT,
    "actaNumero" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activos_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alm_articulos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad" TEXT NOT NULL,
    "categoria" "AlmCategoria" NOT NULL,
    "marca" TEXT,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "ubicacionBodega" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "imagenUrl" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alm_articulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alm_entradas" (
    "id" TEXT NOT NULL,
    "articuloId" TEXT NOT NULL,
    "tipo" "AlmTipoEntrada" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "valorUnitario" DECIMAL(18,2),
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "ordenCompraNumero" TEXT,
    "facturaNumero" TEXT,
    "proveedor" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alm_entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alm_salidas" (
    "id" TEXT NOT NULL,
    "articuloId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "dependenciaNombre" TEXT,
    "funcionarioNombre" TEXT,
    "actaNumero" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alm_salidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obs_indicadores" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad" TEXT NOT NULL,
    "categoria" "ObsCategoria" NOT NULL,
    "periodicidad" "ObsPeriodicidad" NOT NULL,
    "meta" DECIMAL(18,4) NOT NULL,
    "metaTipo" "ObsMetaTipo" NOT NULL DEFAULT 'MAYOR_ES_MEJOR',
    "dependenciaNombre" TEXT,
    "responsableNombre" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "valorActual" DECIMAL(18,4),
    "fechaUltimaMedicion" TIMESTAMP(3),
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obs_indicadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obs_mediciones" (
    "id" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "valor" DECIMAL(18,4) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "periodo" TEXT NOT NULL,
    "fuente" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obs_mediciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ren_conceptos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "RenTipoConcepto" NOT NULL,
    "periodicidad" "RenPeriodicidad" NOT NULL,
    "tasaBase" DECIMAL(10,6),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ren_conceptos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ren_contribuyentes" (
    "id" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoDoc" TEXT NOT NULL DEFAULT 'NIT',
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ren_contribuyentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ren_liquidaciones" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "conceptoId" TEXT NOT NULL,
    "contribuyenteId" TEXT NOT NULL,
    "vigencia" INTEGER NOT NULL,
    "periodo" TEXT,
    "baseGravable" DECIMAL(18,2) NOT NULL,
    "tarifa" DECIMAL(10,6) NOT NULL,
    "impuesto" DECIMAL(18,2) NOT NULL,
    "intereses" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "descuentos" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalACobrar" DECIMAL(18,2) NOT NULL,
    "totalPagado" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(18,2) NOT NULL,
    "estado" "RenEstadoLiquidacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaVencimiento" TIMESTAMP(3),
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ren_liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ren_pagos" (
    "id" TEXT NOT NULL,
    "liquidacionId" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "medioPago" "RenMedioPago" NOT NULL,
    "referencia" TEXT,
    "observacion" TEXT,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ren_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_ia_chunks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "fuenteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "url" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_ia_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_ia_conversaciones" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mensajes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_ia_conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_procesos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "tipo" "DiscTipoProceso" NOT NULL,
    "estado" "DiscEstadoProceso" NOT NULL DEFAULT 'INDAGACION_PRELIMINAR',
    "quejoso" TEXT,
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "disciplinadoNombre" TEXT NOT NULL,
    "disciplinadoCargo" TEXT NOT NULL,
    "disciplinadoEntidad" TEXT NOT NULL,
    "hechos" TEXT NOT NULL,
    "normaInfringida" TEXT,
    "calificacionFalta" "DiscCalificacion",
    "sancion" "DiscTipoSancion",
    "sancionDetalle" TEXT,
    "expedienteGdId" TEXT,
    "fechaQueja" TIMESTAMP(3) NOT NULL,
    "fechaApertura" TIMESTAMP(3),
    "fechaPliegoCargos" TIMESTAMP(3),
    "fechaDescargos" TIMESTAMP(3),
    "fechaFallo" TIMESTAMP(3),
    "fechaEjecutoria" TIMESTAMP(3),
    "terminoDiasHabiles" INTEGER,
    "fechaVencimiento" TIMESTAMP(3),
    "instructorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disc_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_actuaciones" (
    "id" TEXT NOT NULL,
    "procesoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "disc_actuaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_documentos" (
    "id" TEXT NOT NULL,
    "procesoId" TEXT,
    "tutelaId" TEXT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT,
    "gdDocId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disc_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_tutelas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "accionante" TEXT NOT NULL,
    "accionado" TEXT NOT NULL,
    "derechoVulnerado" TEXT NOT NULL,
    "juzgado" TEXT,
    "estado" "DiscEstadoTutela" NOT NULL DEFAULT 'RECIBIDA',
    "fechaRecepcion" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaFallo" TIMESTAMP(3),
    "falloSentido" TEXT,
    "impugnada" BOOLEAN NOT NULL DEFAULT false,
    "fechaImpugnacion" TIMESTAMP(3),
    "estadoCumplimiento" TEXT,
    "observaciones" TEXT,
    "procesoId" TEXT,
    "funcionarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disc_tutelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_visitas_preventivas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "entidadVisitada" TEXT NOT NULL,
    "dependencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "objetivo" TEXT NOT NULL,
    "hallazgos" TEXT NOT NULL,
    "recomendaciones" TEXT,
    "compromisos" TEXT,
    "fechaSeguimiento" TIMESTAMP(3),
    "estadoSeguimiento" TEXT,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disc_visitas_preventivas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disc_consecutivos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "serie" TEXT NOT NULL,
    "ultimo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "disc_consecutivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nomina_pila_exports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generadoPor" TEXT NOT NULL,
    "totalEmpleados" INTEGER NOT NULL,
    "archivoNombre" TEXT NOT NULL,

    CONSTRAINT "nomina_pila_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EtiquetaNoticiaToNoticia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EtiquetaNoticiaToNoticia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GdExpedienteToGdRadicado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GdExpedienteToGdRadicado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_sessionToken_key" ON "sesiones"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacion_token_key" ON "tokens_recuperacion"("token");

-- CreateIndex
CREATE UNIQUE INDEX "menu_principal_slug_key" ON "menu_principal"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "paginas_slug_key" ON "paginas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "paginas_menuId_key" ON "paginas"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_transparencia_slug_key" ON "categorias_transparencia"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subcategorias_transparencia_slug_key" ON "subcategorias_transparencia"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "noticias_slug_key" ON "noticias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_noticias_nombre_key" ON "categorias_noticias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_noticias_slug_key" ON "categorias_noticias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_noticias_nombre_key" ON "etiquetas_noticias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_noticias_slug_key" ON "etiquetas_noticias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "contenidos_slug_key" ON "contenidos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pqrs_radicado_key" ON "pqrs"("radicado");

-- CreateIndex
CREATE UNIQUE INDEX "pqrs_gdRadicadoId_key" ON "pqrs"("gdRadicadoId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sitio_clave_key" ON "configuracion_sitio"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "identidad_institucional_singletonKey_key" ON "identidad_institucional"("singletonKey");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_slug_key" ON "eventos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mipg_dimensiones_codigo_key" ON "mipg_dimensiones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "mipg_politicas_codigo_key" ON "mipg_politicas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "mipg_evidencias_gdDocumentoId_key" ON "mipg_evidencias"("gdDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "mipg_evaluaciones_politicaId_anioVigencia_key" ON "mipg_evaluaciones"("politicaId", "anioVigencia");

-- CreateIndex
CREATE UNIQUE INDEX "gd_trd_dependencias_codigo_key" ON "gd_trd_dependencias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "gd_trd_series_codigo_dependenciaId_key" ON "gd_trd_series"("codigo", "dependenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "gd_trd_subseries_codigo_serieId_key" ON "gd_trd_subseries"("codigo", "serieId");

-- CreateIndex
CREATE UNIQUE INDEX "gd_consecutivos_anio_tipo_codigoDep_key" ON "gd_consecutivos"("anio", "tipo", "codigoDep");

-- CreateIndex
CREATE UNIQUE INDEX "gd_festivos_colombia_fecha_key" ON "gd_festivos_colombia"("fecha");

-- CreateIndex
CREATE INDEX "gd_festivos_colombia_anio_idx" ON "gd_festivos_colombia"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "gd_radicados_numero_key" ON "gd_radicados"("numero");

-- CreateIndex
CREATE INDEX "gd_radicados_estado_createdAt_idx" ON "gd_radicados"("estado", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gd_radicados_tipo_estado_idx" ON "gd_radicados"("tipo", "estado");

-- CreateIndex
CREATE INDEX "gd_radicados_tramitadorId_estado_idx" ON "gd_radicados"("tramitadorId", "estado");

-- CreateIndex
CREATE INDEX "gd_radicados_dependenciaId_estado_idx" ON "gd_radicados"("dependenciaId", "estado");

-- CreateIndex
CREATE INDEX "gd_radicados_prioridad_estado_createdAt_idx" ON "gd_radicados"("prioridad", "estado", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gd_radicados_fechaVencimiento_estado_idx" ON "gd_radicados"("fechaVencimiento", "estado");

-- CreateIndex
CREATE INDEX "gd_radicados_createdAt_idx" ON "gd_radicados"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "gd_expedientes_codigo_key" ON "gd_expedientes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ga_carpetas_expedienteId_key" ON "ga_carpetas"("expedienteId");

-- CreateIndex
CREATE UNIQUE INDEX "gd_firmas_qr_hashFirma_key" ON "gd_firmas_qr"("hashFirma");

-- CreateIndex
CREATE UNIQUE INDEX "gd_firmas_qr_documentoId_key" ON "gd_firmas_qr"("documentoId");

-- CreateIndex
CREATE INDEX "gd_log_transacciones_radicadoId_createdAt_idx" ON "gd_log_transacciones"("radicadoId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gd_radicados_informados_usuarioId_leido_idx" ON "gd_radicados_informados"("usuarioId", "leido");

-- CreateIndex
CREATE UNIQUE INDEX "gd_radicados_informados_radicadoId_usuarioId_key" ON "gd_radicados_informados"("radicadoId", "usuarioId");

-- CreateIndex
CREATE INDEX "gd_vobos_radicadoId_nivel_idx" ON "gd_vobos"("radicadoId", "nivel");

-- CreateIndex
CREATE INDEX "gd_vobos_usuarioId_estado_idx" ON "gd_vobos"("usuarioId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "gd_api_keys_keyHash_key" ON "gd_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "gd_api_keys_keyHash_idx" ON "gd_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "gd_api_keys_activo_idx" ON "gd_api_keys"("activo");

-- CreateIndex
CREATE INDEX "gd_api_logs_apiKeyId_createdAt_idx" ON "gd_api_logs"("apiKeyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gd_api_logs_createdAt_idx" ON "gd_api_logs"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "gd_sigep_cache_cedula_key" ON "gd_sigep_cache"("cedula");

-- CreateIndex
CREATE INDEX "gd_sigep_cache_expiraEn_idx" ON "gd_sigep_cache"("expiraEn");

-- CreateIndex
CREATE INDEX "gd_sigep_cache_nombre_idx" ON "gd_sigep_cache"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "vu_asignaciones_ia_pqrsId_key" ON "vu_asignaciones_ia"("pqrsId");

-- CreateIndex
CREATE INDEX "vu_respuestas_pqrsId_idx" ON "vu_respuestas"("pqrsId");

-- CreateIndex
CREATE INDEX "vu_chat_mensajes_pqrsId_createdAt_idx" ON "vu_chat_mensajes"("pqrsId", "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "vu_demografia_pqrsId_key" ON "vu_demografia"("pqrsId");

-- CreateIndex
CREATE INDEX "vu_asignaciones_funcionario_pqrsId_estado_idx" ON "vu_asignaciones_funcionario"("pqrsId", "estado");

-- CreateIndex
CREATE INDEX "vu_asignaciones_funcionario_funcionarioId_estado_idx" ON "vu_asignaciones_funcionario"("funcionarioId", "estado");

-- CreateIndex
CREATE INDEX "vu_asignacion_historial_pqrsId_createdAt_idx" ON "vu_asignacion_historial"("pqrsId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "vu_peticiones_reasignacion_estado_createdAt_idx" ON "vu_peticiones_reasignacion"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "vu_peticiones_reasignacion_pqrsId_idx" ON "vu_peticiones_reasignacion"("pqrsId");

-- CreateIndex
CREATE UNIQUE INDEX "vu_configuracion_sla_tipo_key" ON "vu_configuracion_sla"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "vu_configuracion_sistema_clave_key" ON "vu_configuracion_sistema"("clave");

-- CreateIndex
CREATE INDEX "vu_directorio_email_categoria_activa_idx" ON "vu_directorio_email"("categoria", "activa");

-- CreateIndex
CREATE UNIQUE INDEX "vu_directorio_email_nombreEntidad_email_key" ON "vu_directorio_email"("nombreEntidad", "email");

-- CreateIndex
CREATE INDEX "vu_notificaciones_pqrsId_idx" ON "vu_notificaciones"("pqrsId");

-- CreateIndex
CREATE INDEX "vu_notificaciones_estado_canal_idx" ON "vu_notificaciones"("estado", "canal");

-- CreateIndex
CREATE INDEX "vu_notificaciones_destinatarioUsuarioId_leidaEn_idx" ON "vu_notificaciones"("destinatarioUsuarioId", "leidaEn");

-- CreateIndex
CREATE INDEX "vu_registro_atencion_canal_createdAt_idx" ON "vu_registro_atencion"("canal", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "vu_plantillas_reporte_nombre_key" ON "vu_plantillas_reporte"("nombre");

-- CreateIndex
CREATE INDEX "vu_reportes_plantillaId_createdAt_idx" ON "vu_reportes"("plantillaId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "vu_opciones_dropdown_grupo_orden_idx" ON "vu_opciones_dropdown"("grupo", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "vu_opciones_dropdown_grupo_valor_key" ON "vu_opciones_dropdown"("grupo", "valor");

-- CreateIndex
CREATE INDEX "vu_documentos_pqrsId_createdAt_idx" ON "vu_documentos"("pqrsId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "vu_rutas_token_externo_token_key" ON "vu_rutas_token_externo"("token");

-- CreateIndex
CREATE INDEX "vu_rutas_token_externo_pqrsId_idx" ON "vu_rutas_token_externo"("pqrsId");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_bienes_codigo_key" ON "frisco_bienes"("codigo");

-- CreateIndex
CREATE INDEX "frisco_bienes_estadoJuridico_idx" ON "frisco_bienes"("estadoJuridico");

-- CreateIndex
CREATE INDEX "frisco_bienes_tipo_idx" ON "frisco_bienes"("tipo");

-- CreateIndex
CREATE INDEX "frisco_bienes_folioMatricula_idx" ON "frisco_bienes"("folioMatricula");

-- CreateIndex
CREATE INDEX "frisco_bienes_placa_idx" ON "frisco_bienes"("placa");

-- CreateIndex
CREATE INDEX "frisco_bienes_numeroProceso_idx" ON "frisco_bienes"("numeroProceso");

-- CreateIndex
CREATE INDEX "frisco_depositarios_bienId_idx" ON "frisco_depositarios"("bienId");

-- CreateIndex
CREATE INDEX "frisco_depositarios_activo_idx" ON "frisco_depositarios"("activo");

-- CreateIndex
CREATE INDEX "frisco_depositarios_documento_idx" ON "frisco_depositarios"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_portal_accesos_tokenHash_key" ON "frisco_portal_accesos"("tokenHash");

-- CreateIndex
CREATE INDEX "frisco_portal_accesos_depositarioId_idx" ON "frisco_portal_accesos"("depositarioId");

-- CreateIndex
CREATE INDEX "frisco_portal_accesos_expiraEn_idx" ON "frisco_portal_accesos"("expiraEn");

-- CreateIndex
CREATE INDEX "frisco_reportes_depositario_periodo_idx" ON "frisco_reportes_depositario"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_reportes_depositario_depositarioId_periodo_key" ON "frisco_reportes_depositario"("depositarioId", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_reporte_analisis_ia_reporteId_key" ON "frisco_reporte_analisis_ia"("reporteId");

-- CreateIndex
CREATE INDEX "frisco_reporte_analisis_ia_urgencia_createdAt_idx" ON "frisco_reporte_analisis_ia"("urgencia", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_contratos_numero_key" ON "frisco_contratos"("numero");

-- CreateIndex
CREATE INDEX "frisco_contratos_bienId_idx" ON "frisco_contratos"("bienId");

-- CreateIndex
CREATE INDEX "frisco_contratos_estado_idx" ON "frisco_contratos"("estado");

-- CreateIndex
CREATE INDEX "frisco_contratos_fechaFin_idx" ON "frisco_contratos"("fechaFin");

-- CreateIndex
CREATE UNIQUE INDEX "frisco_destinaciones_bienId_key" ON "frisco_destinaciones"("bienId");

-- CreateIndex
CREATE INDEX "frisco_interop_logs_servicio_createdAt_idx" ON "frisco_interop_logs"("servicio", "createdAt");

-- CreateIndex
CREATE INDEX "frisco_interop_logs_bienId_idx" ON "frisco_interop_logs"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "cp_plan_cuentas_codigo_key" ON "cp_plan_cuentas"("codigo");

-- CreateIndex
CREATE INDEX "cp_plan_cuentas_parentId_idx" ON "cp_plan_cuentas"("parentId");

-- CreateIndex
CREATE INDEX "cp_plan_cuentas_nivel_idx" ON "cp_plan_cuentas"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "cp_periodos_codigo_key" ON "cp_periodos"("codigo");

-- CreateIndex
CREATE INDEX "cp_periodos_anio_mes_idx" ON "cp_periodos"("anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "cp_terceros_documento_key" ON "cp_terceros"("documento");

-- CreateIndex
CREATE INDEX "cp_terceros_razonSocial_idx" ON "cp_terceros"("razonSocial");

-- CreateIndex
CREATE UNIQUE INDEX "cp_comprobantes_numero_key" ON "cp_comprobantes"("numero");

-- CreateIndex
CREATE INDEX "cp_comprobantes_periodoId_idx" ON "cp_comprobantes"("periodoId");

-- CreateIndex
CREATE INDEX "cp_comprobantes_fecha_idx" ON "cp_comprobantes"("fecha");

-- CreateIndex
CREATE INDEX "cp_comprobantes_fuenteModulo_fuenteRef_idx" ON "cp_comprobantes"("fuenteModulo", "fuenteRef");

-- CreateIndex
CREATE INDEX "cp_asientos_comprobanteId_idx" ON "cp_asientos"("comprobanteId");

-- CreateIndex
CREATE INDEX "cp_asientos_cuentaId_idx" ON "cp_asientos"("cuentaId");

-- CreateIndex
CREATE INDEX "cp_asientos_terceroId_idx" ON "cp_asientos"("terceroId");

-- CreateIndex
CREATE UNIQUE INDEX "psu_rubros_codigo_key" ON "psu_rubros"("codigo");

-- CreateIndex
CREATE INDEX "psu_rubros_parentId_idx" ON "psu_rubros"("parentId");

-- CreateIndex
CREATE INDEX "psu_rubros_nivel_idx" ON "psu_rubros"("nivel");

-- CreateIndex
CREATE INDEX "psu_apropiaciones_vigencia_idx" ON "psu_apropiaciones"("vigencia");

-- CreateIndex
CREATE UNIQUE INDEX "psu_apropiaciones_rubroId_vigencia_key" ON "psu_apropiaciones"("rubroId", "vigencia");

-- CreateIndex
CREATE UNIQUE INDEX "psu_cdps_numero_key" ON "psu_cdps"("numero");

-- CreateIndex
CREATE INDEX "psu_cdps_vigencia_idx" ON "psu_cdps"("vigencia");

-- CreateIndex
CREATE INDEX "psu_cdps_rubroId_idx" ON "psu_cdps"("rubroId");

-- CreateIndex
CREATE UNIQUE INDEX "psu_rps_numero_key" ON "psu_rps"("numero");

-- CreateIndex
CREATE INDEX "psu_rps_cdpId_idx" ON "psu_rps"("cdpId");

-- CreateIndex
CREATE INDEX "psu_rps_terceroId_idx" ON "psu_rps"("terceroId");

-- CreateIndex
CREATE UNIQUE INDEX "psu_obligaciones_numero_key" ON "psu_obligaciones"("numero");

-- CreateIndex
CREATE INDEX "psu_obligaciones_rpId_idx" ON "psu_obligaciones"("rpId");

-- CreateIndex
CREATE UNIQUE INDEX "psu_pagos_numero_key" ON "psu_pagos"("numero");

-- CreateIndex
CREATE INDEX "psu_pagos_obligacionId_idx" ON "psu_pagos"("obligacionId");

-- CreateIndex
CREATE UNIQUE INDEX "nom_empleados_documento_key" ON "nom_empleados"("documento");

-- CreateIndex
CREATE INDEX "nom_empleados_activo_idx" ON "nom_empleados"("activo");

-- CreateIndex
CREATE INDEX "nom_empleados_dependencia_idx" ON "nom_empleados"("dependencia");

-- CreateIndex
CREATE UNIQUE INDEX "nom_conceptos_codigo_key" ON "nom_conceptos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "nom_periodos_codigo_key" ON "nom_periodos"("codigo");

-- CreateIndex
CREATE INDEX "nom_periodos_anio_mes_idx" ON "nom_periodos"("anio", "mes");

-- CreateIndex
CREATE INDEX "nom_liquidaciones_empleadoId_idx" ON "nom_liquidaciones"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "nom_liquidaciones_periodoId_empleadoId_key" ON "nom_liquidaciones"("periodoId", "empleadoId");

-- CreateIndex
CREATE INDEX "nom_liquidacion_detalles_liquidacionId_idx" ON "nom_liquidacion_detalles"("liquidacionId");

-- CreateIndex
CREATE INDEX "nom_liquidacion_detalles_conceptoId_idx" ON "nom_liquidacion_detalles"("conceptoId");

-- CreateIndex
CREATE INDEX "nom_novedades_empleadoId_idx" ON "nom_novedades"("empleadoId");

-- CreateIndex
CREATE INDEX "nom_novedades_fechaInicio_idx" ON "nom_novedades"("fechaInicio");

-- CreateIndex
CREATE INDEX "nom_pagos_pasivos_periodoId_idx" ON "nom_pagos_pasivos"("periodoId");

-- CreateIndex
CREATE INDEX "nom_pagos_pasivos_cuentaCodigo_idx" ON "nom_pagos_pasivos"("cuentaCodigo");

-- CreateIndex
CREATE INDEX "rc_reportes_tipo_vigencia_idx" ON "rc_reportes"("tipo", "vigencia");

-- CreateIndex
CREATE INDEX "rc_reportes_tipo_periodoContableId_idx" ON "rc_reportes"("tipo", "periodoContableId");

-- CreateIndex
CREATE INDEX "teso_cuentas_activa_idx" ON "teso_cuentas"("activa");

-- CreateIndex
CREATE INDEX "teso_movimientos_cuentaId_fecha_idx" ON "teso_movimientos"("cuentaId", "fecha");

-- CreateIndex
CREATE INDEX "teso_movimientos_conciliado_idx" ON "teso_movimientos"("conciliado");

-- CreateIndex
CREATE INDEX "teso_movimientos_comprobanteId_idx" ON "teso_movimientos"("comprobanteId");

-- CreateIndex
CREATE INDEX "teso_extractos_cuentaId_idx" ON "teso_extractos"("cuentaId");

-- CreateIndex
CREATE UNIQUE INDEX "teso_extractos_cuentaId_periodo_key" ON "teso_extractos"("cuentaId", "periodo");

-- CreateIndex
CREATE INDEX "teso_extracto_lineas_extractoId_idx" ON "teso_extracto_lineas"("extractoId");

-- CreateIndex
CREATE INDEX "teso_extracto_lineas_conciliada_idx" ON "teso_extracto_lineas"("conciliada");

-- CreateIndex
CREATE UNIQUE INDEX "con_procesos_numero_key" ON "con_procesos"("numero");

-- CreateIndex
CREATE INDEX "con_procesos_estado_idx" ON "con_procesos"("estado");

-- CreateIndex
CREATE INDEX "con_procesos_vigencia_idx" ON "con_procesos"("vigencia");

-- CreateIndex
CREATE INDEX "con_procesos_modalidad_idx" ON "con_procesos"("modalidad");

-- CreateIndex
CREATE UNIQUE INDEX "con_contratos_numero_key" ON "con_contratos"("numero");

-- CreateIndex
CREATE INDEX "con_contratos_procesoId_idx" ON "con_contratos"("procesoId");

-- CreateIndex
CREATE INDEX "con_contratos_estado_idx" ON "con_contratos"("estado");

-- CreateIndex
CREATE INDEX "con_contratos_fechaTerminacion_idx" ON "con_contratos"("fechaTerminacion");

-- CreateIndex
CREATE INDEX "con_adiciones_contratoId_idx" ON "con_adiciones"("contratoId");

-- CreateIndex
CREATE INDEX "con_documentos_procesoId_idx" ON "con_documentos"("procesoId");

-- CreateIndex
CREATE INDEX "con_documentos_contratoId_idx" ON "con_documentos"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "activos_bienes_codigo_key" ON "activos_bienes"("codigo");

-- CreateIndex
CREATE INDEX "activos_bienes_codigo_idx" ON "activos_bienes"("codigo");

-- CreateIndex
CREATE INDEX "activos_bienes_estado_idx" ON "activos_bienes"("estado");

-- CreateIndex
CREATE INDEX "activos_bienes_categoria_idx" ON "activos_bienes"("categoria");

-- CreateIndex
CREATE INDEX "activos_asignaciones_activoId_idx" ON "activos_asignaciones"("activoId");

-- CreateIndex
CREATE INDEX "activos_asignaciones_fechaInicio_idx" ON "activos_asignaciones"("fechaInicio");

-- CreateIndex
CREATE INDEX "activos_mantenimientos_activoId_idx" ON "activos_mantenimientos"("activoId");

-- CreateIndex
CREATE INDEX "activos_movimientos_activoId_idx" ON "activos_movimientos"("activoId");

-- CreateIndex
CREATE UNIQUE INDEX "alm_articulos_codigo_key" ON "alm_articulos"("codigo");

-- CreateIndex
CREATE INDEX "alm_articulos_codigo_idx" ON "alm_articulos"("codigo");

-- CreateIndex
CREATE INDEX "alm_articulos_categoria_idx" ON "alm_articulos"("categoria");

-- CreateIndex
CREATE INDEX "alm_articulos_activo_idx" ON "alm_articulos"("activo");

-- CreateIndex
CREATE INDEX "alm_entradas_articuloId_idx" ON "alm_entradas"("articuloId");

-- CreateIndex
CREATE INDEX "alm_entradas_fechaEntrada_idx" ON "alm_entradas"("fechaEntrada");

-- CreateIndex
CREATE INDEX "alm_salidas_articuloId_idx" ON "alm_salidas"("articuloId");

-- CreateIndex
CREATE INDEX "alm_salidas_fechaSalida_idx" ON "alm_salidas"("fechaSalida");

-- CreateIndex
CREATE UNIQUE INDEX "obs_indicadores_codigo_key" ON "obs_indicadores"("codigo");

-- CreateIndex
CREATE INDEX "obs_indicadores_categoria_idx" ON "obs_indicadores"("categoria");

-- CreateIndex
CREATE INDEX "obs_indicadores_publicado_idx" ON "obs_indicadores"("publicado");

-- CreateIndex
CREATE INDEX "obs_mediciones_indicadorId_idx" ON "obs_mediciones"("indicadorId");

-- CreateIndex
CREATE INDEX "obs_mediciones_fecha_idx" ON "obs_mediciones"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ren_conceptos_codigo_key" ON "ren_conceptos"("codigo");

-- CreateIndex
CREATE INDEX "ren_conceptos_tipo_idx" ON "ren_conceptos"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "ren_contribuyentes_documento_key" ON "ren_contribuyentes"("documento");

-- CreateIndex
CREATE INDEX "ren_contribuyentes_documento_idx" ON "ren_contribuyentes"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "ren_liquidaciones_numero_key" ON "ren_liquidaciones"("numero");

-- CreateIndex
CREATE INDEX "ren_liquidaciones_contribuyenteId_idx" ON "ren_liquidaciones"("contribuyenteId");

-- CreateIndex
CREATE INDEX "ren_liquidaciones_conceptoId_idx" ON "ren_liquidaciones"("conceptoId");

-- CreateIndex
CREATE INDEX "ren_liquidaciones_vigencia_idx" ON "ren_liquidaciones"("vigencia");

-- CreateIndex
CREATE INDEX "ren_liquidaciones_estado_idx" ON "ren_liquidaciones"("estado");

-- CreateIndex
CREATE INDEX "ren_pagos_liquidacionId_idx" ON "ren_pagos"("liquidacionId");

-- CreateIndex
CREATE INDEX "ren_pagos_fecha_idx" ON "ren_pagos"("fecha");

-- CreateIndex
CREATE INDEX "chat_ia_chunks_tenantId_idx" ON "chat_ia_chunks"("tenantId");

-- CreateIndex
CREATE INDEX "chat_ia_chunks_tenantId_fuenteId_idx" ON "chat_ia_chunks"("tenantId", "fuenteId");

-- CreateIndex
CREATE INDEX "chat_ia_conversaciones_tenantId_createdAt_idx" ON "chat_ia_conversaciones"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "disc_procesos_tenantId_estado_idx" ON "disc_procesos"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "disc_procesos_tenantId_instructorId_idx" ON "disc_procesos"("tenantId", "instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "disc_procesos_tenantId_numero_key" ON "disc_procesos"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "disc_actuaciones_procesoId_idx" ON "disc_actuaciones"("procesoId");

-- CreateIndex
CREATE INDEX "disc_documentos_procesoId_idx" ON "disc_documentos"("procesoId");

-- CreateIndex
CREATE INDEX "disc_documentos_tutelaId_idx" ON "disc_documentos"("tutelaId");

-- CreateIndex
CREATE INDEX "disc_tutelas_tenantId_estado_idx" ON "disc_tutelas"("tenantId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "disc_tutelas_tenantId_numero_key" ON "disc_tutelas"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "disc_visitas_preventivas_tenantId_idx" ON "disc_visitas_preventivas"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "disc_visitas_preventivas_tenantId_numero_key" ON "disc_visitas_preventivas"("tenantId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "disc_consecutivos_tenantId_anio_serie_key" ON "disc_consecutivos"("tenantId", "anio", "serie");

-- CreateIndex
CREATE INDEX "nomina_pila_exports_tenantId_periodoId_idx" ON "nomina_pila_exports"("tenantId", "periodoId");

-- CreateIndex
CREATE INDEX "_EtiquetaNoticiaToNoticia_B_index" ON "_EtiquetaNoticiaToNoticia"("B");

-- CreateIndex
CREATE INDEX "_GdExpedienteToGdRadicado_B_index" ON "_GdExpedienteToGdRadicado"("B");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_principal" ADD CONSTRAINT "menu_principal_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "menu_principal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paginas" ADD CONSTRAINT "paginas_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu_principal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones_pagina" ADD CONSTRAINT "secciones_pagina_paginaId_fkey" FOREIGN KEY ("paginaId") REFERENCES "paginas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategorias_transparencia" ADD CONSTRAINT "subcategorias_transparencia_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_transparencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_transparencia" ADD CONSTRAINT "items_transparencia_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "subcategorias_transparencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_transparencia" ADD CONSTRAINT "documentos_transparencia_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items_transparencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_noticias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_actualizadorId_fkey" FOREIGN KEY ("actualizadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_gdRadicadoId_fkey" FOREIGN KEY ("gdRadicadoId") REFERENCES "gd_radicados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pqrs" ADD CONSTRAINT "historial_pqrs_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pqrs" ADD CONSTRAINT "historial_pqrs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_politicas" ADD CONSTRAINT "mipg_politicas_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "mipg_dimensiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_indicadores" ADD CONSTRAINT "mipg_indicadores_politicaId_fkey" FOREIGN KEY ("politicaId") REFERENCES "mipg_politicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_evidencias" ADD CONSTRAINT "mipg_evidencias_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "mipg_indicadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_evidencias" ADD CONSTRAINT "mipg_evidencias_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_evidencias" ADD CONSTRAINT "mipg_evidencias_gdDocumentoId_fkey" FOREIGN KEY ("gdDocumentoId") REFERENCES "gd_documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_evaluaciones" ADD CONSTRAINT "mipg_evaluaciones_politicaId_fkey" FOREIGN KEY ("politicaId") REFERENCES "mipg_politicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mipg_evaluaciones" ADD CONSTRAINT "mipg_evaluaciones_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_trd_dependencias" ADD CONSTRAINT "gd_trd_dependencias_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "gd_trd_dependencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_trd_series" ADD CONSTRAINT "gd_trd_series_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "gd_trd_dependencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_trd_subseries" ADD CONSTRAINT "gd_trd_subseries_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "gd_trd_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_trd_tipos_documentales" ADD CONSTRAINT "gd_trd_tipos_documentales_subserieId_fkey" FOREIGN KEY ("subserieId") REFERENCES "gd_trd_subseries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "gd_trd_dependencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_subserieId_fkey" FOREIGN KEY ("subserieId") REFERENCES "gd_trd_subseries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_tipoDocumentalId_fkey" FOREIGN KEY ("tipoDocumentalId") REFERENCES "gd_trd_tipos_documentales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_tramitadorId_fkey" FOREIGN KEY ("tramitadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados" ADD CONSTRAINT "gd_radicados_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "gd_radicados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_remitentes" ADD CONSTRAINT "gd_remitentes_radicadoId_fkey" FOREIGN KEY ("radicadoId") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_documentos" ADD CONSTRAINT "gd_documentos_radicadoId_fkey" FOREIGN KEY ("radicadoId") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_expedientes" ADD CONSTRAINT "gd_expedientes_dependenciaId_fkey" FOREIGN KEY ("dependenciaId") REFERENCES "gd_trd_dependencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_expedientes" ADD CONSTRAINT "gd_expedientes_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "gd_trd_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_expedientes" ADD CONSTRAINT "gd_expedientes_subserieId_fkey" FOREIGN KEY ("subserieId") REFERENCES "gd_trd_subseries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_expedientes" ADD CONSTRAINT "gd_expedientes_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_indices_electronicos" ADD CONSTRAINT "gd_indices_electronicos_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "gd_expedientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_indices_electronicos" ADD CONSTRAINT "gd_indices_electronicos_firmanteId_fkey" FOREIGN KEY ("firmanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_pisos" ADD CONSTRAINT "ga_pisos_edificioId_fkey" FOREIGN KEY ("edificioId") REFERENCES "ga_edificios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_bodegas" ADD CONSTRAINT "ga_bodegas_pisoId_fkey" FOREIGN KEY ("pisoId") REFERENCES "ga_pisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_estantes" ADD CONSTRAINT "ga_estantes_bodegaId_fkey" FOREIGN KEY ("bodegaId") REFERENCES "ga_bodegas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_entrepanos" ADD CONSTRAINT "ga_entrepanos_estanteId_fkey" FOREIGN KEY ("estanteId") REFERENCES "ga_estantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_cajas" ADD CONSTRAINT "ga_cajas_entrepanoId_fkey" FOREIGN KEY ("entrepanoId") REFERENCES "ga_entrepanos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_carpetas" ADD CONSTRAINT "ga_carpetas_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "ga_cajas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_carpetas" ADD CONSTRAINT "ga_carpetas_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "gd_expedientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_prestamos" ADD CONSTRAINT "ga_prestamos_carpetaId_fkey" FOREIGN KEY ("carpetaId") REFERENCES "ga_carpetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ga_prestamos" ADD CONSTRAINT "ga_prestamos_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_firmas_qr" ADD CONSTRAINT "gd_firmas_qr_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "gd_documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_firmas_qr" ADD CONSTRAINT "gd_firmas_qr_firmanteId_fkey" FOREIGN KEY ("firmanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_log_transacciones" ADD CONSTRAINT "gd_log_transacciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_log_transacciones" ADD CONSTRAINT "gd_log_transacciones_radicadoId_fkey" FOREIGN KEY ("radicadoId") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados_informados" ADD CONSTRAINT "gd_radicados_informados_radicadoId_fkey" FOREIGN KEY ("radicadoId") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_radicados_informados" ADD CONSTRAINT "gd_radicados_informados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_vobos" ADD CONSTRAINT "gd_vobos_radicadoId_fkey" FOREIGN KEY ("radicadoId") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_vobos" ADD CONSTRAINT "gd_vobos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_vobos" ADD CONSTRAINT "gd_vobos_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_api_keys" ADD CONSTRAINT "gd_api_keys_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gd_api_logs" ADD CONSTRAINT "gd_api_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "gd_api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignaciones_ia" ADD CONSTRAINT "vu_asignaciones_ia_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_respuestas" ADD CONSTRAINT "vu_respuestas_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_respuestas" ADD CONSTRAINT "vu_respuestas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_chat_mensajes" ADD CONSTRAINT "vu_chat_mensajes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_chat_mensajes" ADD CONSTRAINT "vu_chat_mensajes_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_demografia" ADD CONSTRAINT "vu_demografia_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignaciones_funcionario" ADD CONSTRAINT "vu_asignaciones_funcionario_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignaciones_funcionario" ADD CONSTRAINT "vu_asignaciones_funcionario_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignaciones_funcionario" ADD CONSTRAINT "vu_asignaciones_funcionario_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignacion_historial" ADD CONSTRAINT "vu_asignacion_historial_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignacion_historial" ADD CONSTRAINT "vu_asignacion_historial_funcionarioAnteriorId_fkey" FOREIGN KEY ("funcionarioAnteriorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignacion_historial" ADD CONSTRAINT "vu_asignacion_historial_funcionarioNuevoId_fkey" FOREIGN KEY ("funcionarioNuevoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_asignacion_historial" ADD CONSTRAINT "vu_asignacion_historial_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_peticiones_reasignacion" ADD CONSTRAINT "vu_peticiones_reasignacion_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_peticiones_reasignacion" ADD CONSTRAINT "vu_peticiones_reasignacion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_peticiones_reasignacion" ADD CONSTRAINT "vu_peticiones_reasignacion_funcionarioPropuestoId_fkey" FOREIGN KEY ("funcionarioPropuestoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_peticiones_reasignacion" ADD CONSTRAINT "vu_peticiones_reasignacion_resueltaPorId_fkey" FOREIGN KEY ("resueltaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_configuracion_sistema" ADD CONSTRAINT "vu_configuracion_sistema_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_notificaciones" ADD CONSTRAINT "vu_notificaciones_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_notificaciones" ADD CONSTRAINT "vu_notificaciones_destinatarioUsuarioId_fkey" FOREIGN KEY ("destinatarioUsuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_registro_atencion" ADD CONSTRAINT "vu_registro_atencion_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_registro_atencion" ADD CONSTRAINT "vu_registro_atencion_atendidoPorId_fkey" FOREIGN KEY ("atendidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_plantillas_reporte" ADD CONSTRAINT "vu_plantillas_reporte_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_reportes" ADD CONSTRAINT "vu_reportes_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "vu_plantillas_reporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_reportes" ADD CONSTRAINT "vu_reportes_generadoPorId_fkey" FOREIGN KEY ("generadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_documentos" ADD CONSTRAINT "vu_documentos_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_documentos" ADD CONSTRAINT "vu_documentos_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vu_rutas_token_externo" ADD CONSTRAINT "vu_rutas_token_externo_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_bienes" ADD CONSTRAINT "frisco_bienes_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "gd_expedientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_bienes" ADD CONSTRAINT "frisco_bienes_carpetaFisicaId_fkey" FOREIGN KEY ("carpetaFisicaId") REFERENCES "ga_carpetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_depositarios" ADD CONSTRAINT "frisco_depositarios_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "frisco_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_portal_accesos" ADD CONSTRAINT "frisco_portal_accesos_depositarioId_fkey" FOREIGN KEY ("depositarioId") REFERENCES "frisco_depositarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_reportes_depositario" ADD CONSTRAINT "frisco_reportes_depositario_depositarioId_fkey" FOREIGN KEY ("depositarioId") REFERENCES "frisco_depositarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_reporte_analisis_ia" ADD CONSTRAINT "frisco_reporte_analisis_ia_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "frisco_reportes_depositario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_contratos" ADD CONSTRAINT "frisco_contratos_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "frisco_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_destinaciones" ADD CONSTRAINT "frisco_destinaciones_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "frisco_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frisco_interop_logs" ADD CONSTRAINT "frisco_interop_logs_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "frisco_bienes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_plan_cuentas" ADD CONSTRAINT "cp_plan_cuentas_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cp_plan_cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_comprobantes" ADD CONSTRAINT "cp_comprobantes_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "cp_periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_asientos" ADD CONSTRAINT "cp_asientos_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "cp_comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_asientos" ADD CONSTRAINT "cp_asientos_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cp_plan_cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cp_asientos" ADD CONSTRAINT "cp_asientos_terceroId_fkey" FOREIGN KEY ("terceroId") REFERENCES "cp_terceros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_rubros" ADD CONSTRAINT "psu_rubros_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "psu_rubros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_apropiaciones" ADD CONSTRAINT "psu_apropiaciones_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "psu_rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_cdps" ADD CONSTRAINT "psu_cdps_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "psu_rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_rps" ADD CONSTRAINT "psu_rps_cdpId_fkey" FOREIGN KEY ("cdpId") REFERENCES "psu_cdps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_rps" ADD CONSTRAINT "psu_rps_terceroId_fkey" FOREIGN KEY ("terceroId") REFERENCES "cp_terceros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_obligaciones" ADD CONSTRAINT "psu_obligaciones_rpId_fkey" FOREIGN KEY ("rpId") REFERENCES "psu_rps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu_pagos" ADD CONSTRAINT "psu_pagos_obligacionId_fkey" FOREIGN KEY ("obligacionId") REFERENCES "psu_obligaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_liquidaciones" ADD CONSTRAINT "nom_liquidaciones_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "nom_periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_liquidaciones" ADD CONSTRAINT "nom_liquidaciones_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "nom_empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_liquidacion_detalles" ADD CONSTRAINT "nom_liquidacion_detalles_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "nom_liquidaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_liquidacion_detalles" ADD CONSTRAINT "nom_liquidacion_detalles_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "nom_conceptos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_novedades" ADD CONSTRAINT "nom_novedades_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "nom_empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nom_pagos_pasivos" ADD CONSTRAINT "nom_pagos_pasivos_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "nom_periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teso_movimientos" ADD CONSTRAINT "teso_movimientos_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "teso_cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teso_extractos" ADD CONSTRAINT "teso_extractos_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "teso_cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teso_extracto_lineas" ADD CONSTRAINT "teso_extracto_lineas_extractoId_fkey" FOREIGN KEY ("extractoId") REFERENCES "teso_extractos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "con_contratos" ADD CONSTRAINT "con_contratos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "con_procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "con_adiciones" ADD CONSTRAINT "con_adiciones_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "con_contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "con_documentos" ADD CONSTRAINT "con_documentos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "con_procesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "con_documentos" ADD CONSTRAINT "con_documentos_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "con_contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos_asignaciones" ADD CONSTRAINT "activos_asignaciones_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos_mantenimientos" ADD CONSTRAINT "activos_mantenimientos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos_movimientos" ADD CONSTRAINT "activos_movimientos_activoId_fkey" FOREIGN KEY ("activoId") REFERENCES "activos_bienes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alm_entradas" ADD CONSTRAINT "alm_entradas_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "alm_articulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alm_salidas" ADD CONSTRAINT "alm_salidas_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "alm_articulos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obs_mediciones" ADD CONSTRAINT "obs_mediciones_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "obs_indicadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ren_liquidaciones" ADD CONSTRAINT "ren_liquidaciones_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "ren_conceptos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ren_liquidaciones" ADD CONSTRAINT "ren_liquidaciones_contribuyenteId_fkey" FOREIGN KEY ("contribuyenteId") REFERENCES "ren_contribuyentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ren_pagos" ADD CONSTRAINT "ren_pagos_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "ren_liquidaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_procesos" ADD CONSTRAINT "disc_procesos_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_actuaciones" ADD CONSTRAINT "disc_actuaciones_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "disc_procesos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_actuaciones" ADD CONSTRAINT "disc_actuaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_documentos" ADD CONSTRAINT "disc_documentos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "disc_procesos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_documentos" ADD CONSTRAINT "disc_documentos_tutelaId_fkey" FOREIGN KEY ("tutelaId") REFERENCES "disc_tutelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_tutelas" ADD CONSTRAINT "disc_tutelas_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "disc_procesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_tutelas" ADD CONSTRAINT "disc_tutelas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disc_visitas_preventivas" ADD CONSTRAINT "disc_visitas_preventivas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtiquetaNoticiaToNoticia" ADD CONSTRAINT "_EtiquetaNoticiaToNoticia_A_fkey" FOREIGN KEY ("A") REFERENCES "etiquetas_noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtiquetaNoticiaToNoticia" ADD CONSTRAINT "_EtiquetaNoticiaToNoticia_B_fkey" FOREIGN KEY ("B") REFERENCES "noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GdExpedienteToGdRadicado" ADD CONSTRAINT "_GdExpedienteToGdRadicado_A_fkey" FOREIGN KEY ("A") REFERENCES "gd_expedientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GdExpedienteToGdRadicado" ADD CONSTRAINT "_GdExpedienteToGdRadicado_B_fkey" FOREIGN KEY ("B") REFERENCES "gd_radicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
