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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "_EtiquetaNoticiaToNoticia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EtiquetaNoticiaToNoticia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_sessionToken_key" ON "sesiones"("sessionToken");

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
CREATE UNIQUE INDEX "configuracion_sitio_clave_key" ON "configuracion_sitio"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_slug_key" ON "eventos"("slug");

-- CreateIndex
CREATE INDEX "_EtiquetaNoticiaToNoticia_B_index" ON "_EtiquetaNoticiaToNoticia"("B");

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
ALTER TABLE "historial_pqrs" ADD CONSTRAINT "historial_pqrs_pqrsId_fkey" FOREIGN KEY ("pqrsId") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pqrs" ADD CONSTRAINT "historial_pqrs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtiquetaNoticiaToNoticia" ADD CONSTRAINT "_EtiquetaNoticiaToNoticia_A_fkey" FOREIGN KEY ("A") REFERENCES "etiquetas_noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtiquetaNoticiaToNoticia" ADD CONSTRAINT "_EtiquetaNoticiaToNoticia_B_fkey" FOREIGN KEY ("B") REFERENCES "noticias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
