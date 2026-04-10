/**
 * Motor de Búsqueda
 * 
 * Búsqueda global en noticias, documentos, transparencia y servicios
 */

import { getTenantPrisma } from "@/lib/prisma";

export interface ResultadoBusqueda {
  tipo: 'noticia' | 'documento' | 'transparencia' | 'servicio' | 'pagina';
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  fecha?: Date;
  categoria?: string;
  relevancia: number;
}

export interface OpcionesBusqueda {
  query: string;
  tipos?: ('noticia' | 'documento' | 'transparencia' | 'servicio' | 'pagina')[];
  limite?: number;
  pagina?: number;
}

/**
 * Realiza una búsqueda global en el sitio
 */
export async function buscarGlobal(opciones: OpcionesBusqueda): Promise<{
  resultados: ResultadoBusqueda[];
  total: number;
  pagina: number;
  totalPaginas: number;
}> {
  const {
    query,
    tipos = ['noticia', 'documento', 'transparencia', 'servicio', 'pagina'],
    limite = 20,
    pagina = 1
  } = opciones;

  if (!query || query.trim().length < 2) {
    return { resultados: [], total: 0, pagina: 1, totalPaginas: 0 };
  }

  const termino = query.trim().toLowerCase();
  const resultados: ResultadoBusqueda[] = [];

  // Búsqueda en paralelo
  const [noticias, documentos, transparencia] = await Promise.all([
    tipos.includes('noticia') ? buscarNoticias(termino) : [],
    tipos.includes('documento') ? buscarDocumentos(termino) : [],
    tipos.includes('transparencia') ? buscarTransparencia(termino) : [],
  ]);

  resultados.push(...noticias, ...documentos, ...transparencia);

  // Agregar páginas estáticas si coinciden
  if (tipos.includes('pagina')) {
    resultados.push(...buscarPaginasEstaticas(termino));
  }

  // Ordenar por relevancia
  resultados.sort((a, b) => b.relevancia - a.relevancia);

  // Paginar
  const total = resultados.length;
  const totalPaginas = Math.ceil(total / limite);
  const inicio = (pagina - 1) * limite;
  const resultadosPaginados = resultados.slice(inicio, inicio + limite);

  return {
    resultados: resultadosPaginados,
    total,
    pagina,
    totalPaginas,
  };
}

/**
 * Buscar en noticias
 */
async function buscarNoticias(termino: string): Promise<ResultadoBusqueda[]> {
  const prisma = await getTenantPrisma()
  type NoticiaResult = {
    id: string;
    titulo: string;
    extracto: string | null;
    slug: string;
    fechaPublicacion: Date | null;
    categoria: { nombre: string } | null;
  };

  const noticias = await prisma.noticia.findMany({
    where: {
      estado: 'PUBLICADO',
      OR: [
        { titulo: { contains: termino, mode: 'insensitive' } },
        { extracto: { contains: termino, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      titulo: true,
      extracto: true,
      slug: true,
      fechaPublicacion: true,
      categoria: { select: { nombre: true } },
    },
    take: 50,
    orderBy: { fechaPublicacion: 'desc' },
  }) as NoticiaResult[];

  return noticias.map(n => ({
    tipo: 'noticia' as const,
    id: n.id,
    titulo: n.titulo,
    descripcion: n.extracto || '',
    url: `/noticias/${n.slug}`,
    fecha: n.fechaPublicacion || undefined,
    categoria: n.categoria?.nombre,
    relevancia: calcularRelevancia(termino, n.titulo, n.extracto || ''),
  }));
}

/**
 * Buscar en documentos
 */
async function buscarDocumentos(termino: string): Promise<ResultadoBusqueda[]> {
  const prisma = await getTenantPrisma()
  type DocumentoResult = {
    id: string;
    nombre: string;
    descripcion: string | null;
    archivoUrl: string;
    createdAt: Date;
    categoria: string;
  };

  const documentos = await prisma.documento.findMany({
    where: {
      publico: true,
      OR: [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { descripcion: { contains: termino, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      archivoUrl: true,
      categoria: true,
      createdAt: true,
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  }) as DocumentoResult[];

  return documentos.map(d => ({
    tipo: 'documento' as const,
    id: d.id,
    titulo: d.nombre,
    descripcion: d.descripcion || '',
    url: d.archivoUrl,
    fecha: d.createdAt,
    categoria: d.categoria || undefined,
    relevancia: calcularRelevancia(termino, d.nombre, d.descripcion || ''),
  }));
}

/**
 * Buscar en items de transparencia
 */
async function buscarTransparencia(termino: string): Promise<ResultadoBusqueda[]> {
  const prisma = await getTenantPrisma()
  type ItemResult = {
    id: string;
    titulo: string;
    descripcion: string | null;
    urlExterna: string | null;
    subcategoria: {
      nombre: string;
      categoria: { slug: string; nombre: string } | null;
    } | null;
  };

  const items = await prisma.itemTransparencia.findMany({
    where: {
      OR: [
        { titulo: { contains: termino, mode: 'insensitive' } },
        { descripcion: { contains: termino, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      urlExterna: true,
      subcategoria: {
        select: {
          nombre: true,
          categoria: {
            select: { slug: true, nombre: true }
          }
        }
      },
    },
    take: 50,
  }) as ItemResult[];

  return items.map(i => ({
    tipo: 'transparencia' as const,
    id: i.id,
    titulo: i.titulo,
    descripcion: i.descripcion || '',
    url: i.urlExterna || `/transparencia/${i.subcategoria?.categoria?.slug || 'general'}`,
    categoria: i.subcategoria?.categoria?.nombre,
    relevancia: calcularRelevancia(termino, i.titulo, i.descripcion || ''),
  }));
}

/**
 * Buscar en páginas estáticas
 */
function buscarPaginasEstaticas(termino: string): ResultadoBusqueda[] {
  const paginas = [
    { titulo: 'Inicio', descripcion: 'Página principal de la Personería Municipal de Guadalajara de Buga', url: '/' },
    { titulo: 'La Entidad', descripcion: 'Información sobre la Personería Municipal', url: '/entidad' },
    { titulo: 'Misión y Visión', descripcion: 'Misión, visión y valores de la entidad', url: '/entidad/mision-vision' },
    { titulo: 'Historia', descripcion: 'Historia de la Personería Municipal de Buga', url: '/entidad/historia' },
    { titulo: 'Organigrama', descripcion: 'Estructura organizacional de la entidad', url: '/entidad/organigrama' },
    { titulo: 'Directorio', descripcion: 'Directorio de funcionarios de la Personería', url: '/entidad/directorio' },
    { titulo: 'Funciones', descripcion: 'Funciones y deberes de la Personería Municipal', url: '/entidad/funciones' },
    { titulo: 'Transparencia', descripcion: 'Portal de transparencia y acceso a información pública', url: '/transparencia' },
    { titulo: 'Atención al Ciudadano', descripcion: 'Canales de atención y servicios al ciudadano', url: '/atencion-ciudadano' },
    { titulo: 'PQRSD', descripcion: 'Peticiones, quejas, reclamos, sugerencias y denuncias', url: '/atencion-ciudadano/pqrsd' },
    { titulo: 'Consulta PQRSD', descripcion: 'Consultar estado de su PQRSD', url: '/atencion-ciudadano/pqrsd/consulta' },
    { titulo: 'Preguntas Frecuentes', descripcion: 'Preguntas frecuentes sobre los servicios', url: '/atencion-ciudadano/preguntas-frecuentes' },
    { titulo: 'Canales de Atención', descripcion: 'Medios para contactar a la Personería', url: '/atencion-ciudadano/canales-atencion' },
    { titulo: 'Defensoría del Pueblo', descripcion: 'Información sobre la Defensoría del Pueblo', url: '/atencion-ciudadano/defensoria' },
    { titulo: 'Servicios', descripcion: 'Catálogo de servicios de la Personería', url: '/servicios' },
    { titulo: 'Noticias', descripcion: 'Noticias y comunicados de la Personería', url: '/noticias' },
    { titulo: 'Política de Privacidad', descripcion: 'Política de privacidad del sitio web', url: '/privacidad' },
    { titulo: 'Términos y Condiciones', descripcion: 'Términos de uso del sitio', url: '/terminos' },
    { titulo: 'Tratamiento de Datos', descripcion: 'Política de tratamiento de datos personales', url: '/tratamiento-datos' },
    { titulo: 'Accesibilidad', descripcion: 'Declaración de accesibilidad web', url: '/accesibilidad' },
    { titulo: 'Mapa del Sitio', descripcion: 'Estructura completa del sitio web', url: '/mapa-sitio' },
  ];

  return paginas
    .filter(p => 
      p.titulo.toLowerCase().includes(termino) || 
      p.descripcion.toLowerCase().includes(termino)
    )
    .map(p => ({
      tipo: 'pagina' as const,
      id: p.url,
      titulo: p.titulo,
      descripcion: p.descripcion,
      url: p.url,
      relevancia: calcularRelevancia(termino, p.titulo, p.descripcion),
    }));
}

/**
 * Calcula la relevancia de un resultado
 */
function calcularRelevancia(termino: string, titulo: string, descripcion: string): number {
  let relevancia = 0;
  const tituloLower = titulo.toLowerCase();
  const descripcionLower = descripcion.toLowerCase();

  // Coincidencia exacta en título = máxima relevancia
  if (tituloLower === termino) relevancia += 100;
  // Título comienza con el término
  else if (tituloLower.startsWith(termino)) relevancia += 80;
  // Título contiene el término
  else if (tituloLower.includes(termino)) relevancia += 60;

  // Coincidencias en descripción
  if (descripcionLower.includes(termino)) relevancia += 20;

  // Bonificación por palabras individuales
  const palabras = termino.split(' ').filter(p => p.length > 2);
  palabras.forEach(palabra => {
    if (tituloLower.includes(palabra)) relevancia += 10;
    if (descripcionLower.includes(palabra)) relevancia += 5;
  });

  return relevancia;
}

/**
 * Obtiene sugerencias de búsqueda
 */
export async function obtenerSugerencias(termino: string): Promise<string[]> {
  const prisma = await getTenantPrisma()
  if (!termino || termino.length < 2) return [];

  const [noticiasResult, documentosResult] = await Promise.all([
    prisma.noticia.findMany({
      where: {
        estado: 'PUBLICADO',
        titulo: { contains: termino, mode: 'insensitive' },
      },
      select: { titulo: true },
      take: 5,
    }),
    prisma.documento.findMany({
      where: {
        publico: true,
        nombre: { contains: termino, mode: 'insensitive' },
      },
      select: { nombre: true },
      take: 5,
    }),
  ]);

  const noticias = noticiasResult as { titulo: string }[];
  const documentos = documentosResult as { nombre: string }[];

  const sugerencias = new Set<string>();
  noticias.forEach(n => sugerencias.add(n.titulo));
  documentos.forEach(d => sugerencias.add(d.nombre));

  return Array.from(sugerencias).slice(0, 8);
}
