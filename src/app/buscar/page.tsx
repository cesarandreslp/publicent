import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResultadosBusqueda } from './ResultadosBusqueda';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Buscar - Personería Municipal de Guadalajara de Buga',
  description: 'Busque información, noticias, documentos y servicios en el sitio web de la Personería Municipal de Guadalajara de Buga.',
  robots: {
    index: false,
    follow: true,
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const tipos = typeof params.tipos === 'string' ? params.tipos : undefined;
  const pagina = typeof params.pagina === 'string' ? parseInt(params.pagina) : 1;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header de búsqueda */}
      <div className="bg-gov-blue text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Búsqueda</h1>
          <p className="text-blue-100">
            Encuentre información, noticias, documentos y servicios
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Loading />}>
          <ResultadosBusqueda 
            query={query} 
            tiposParam={tipos}
            paginaInicial={pagina}
          />
        </Suspense>
      </div>
    </main>
  );
}
