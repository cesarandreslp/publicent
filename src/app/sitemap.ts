import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://personeriabuga.gov.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const paginasEstaticas: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/entidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/entidad/mision-vision`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/entidad/organigrama`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/entidad/funciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/transparencia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/atencion-ciudadano`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/atencion-ciudadano/pqrsd`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/mapa-sitio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/accesibilidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/tratamiento-datos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Noticias dinámicas
  let noticiasUrls: MetadataRoute.Sitemap = [];
  try {
    const noticias = await prisma.noticia.findMany({
      where: { estado: 'PUBLICADO' },
      select: { slug: true, updatedAt: true, fechaPublicacion: true },
      orderBy: { fechaPublicacion: 'desc' },
      take: 1000, // Limitar a las últimas 1000 noticias
    });

    noticiasUrls = noticias.map((noticia: { slug: string; updatedAt: Date; fechaPublicacion: Date | null }) => ({
      url: `${BASE_URL}/noticias/${noticia.slug}`,
      lastModified: noticia.updatedAt || noticia.fechaPublicacion || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error obteniendo noticias para sitemap:', error);
  }

  // Categorías de transparencia
  let transparenciaUrls: MetadataRoute.Sitemap = [];
  try {
    const categorias = await prisma.categoriaTransparencia.findMany({
      select: { slug: true, updatedAt: true },
    });

    transparenciaUrls = categorias.map((categoria: { slug: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/transparencia/${categoria.slug}`,
      lastModified: categoria.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error obteniendo categorías de transparencia para sitemap:', error);
  }

  // Documentos públicos de transparencia
  let documentosUrls: MetadataRoute.Sitemap = [];
  try {
    const documentos = await prisma.documentoTransparencia.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    });

    documentosUrls = documentos.map((doc: { id: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/transparencia/documento/${doc.id}`,
      lastModified: doc.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error obteniendo documentos para sitemap:', error);
  }

  return [
    ...paginasEstaticas,
    ...noticiasUrls,
    ...transparenciaUrls,
    ...documentosUrls,
  ];
}
