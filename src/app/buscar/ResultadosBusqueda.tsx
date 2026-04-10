'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Loader2
} from 'lucide-react';
import { SearchBar, TipoResultadoIcon, TipoResultadoBadge } from '@/components/shared/SearchBar';

interface ResultadoBusqueda {
  tipo: string;
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  fecha?: string;
  categoria?: string;
  relevancia: number;
}

interface ResultadosBusquedaProps {
  query: string;
  tiposParam?: string;
  paginaInicial?: number;
}

const TIPOS_FILTRO = [
  { value: 'noticia', label: 'Noticias', color: 'blue' },
  { value: 'documento', label: 'Documentos', color: 'red' },
  { value: 'transparencia', label: 'Transparencia', color: 'green' },
  { value: 'pagina', label: 'Páginas', color: 'purple' },
];

export function ResultadosBusqueda({ 
  query: queryInicial, 
  tiposParam,
  paginaInicial = 1
}: ResultadosBusquedaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(paginaInicial);
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(
    tiposParam ? tiposParam.split(',') : []
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const limite = 10;
  const totalPaginas = Math.ceil(total / limite);

  const buscar = useCallback(async () => {
    if (!queryInicial.trim()) {
      setResultados([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', queryInicial);
      params.set('limite', limite.toString());
      params.set('pagina', pagina.toString());
      
      if (tiposSeleccionados.length > 0) {
        params.set('tipos', tiposSeleccionados.join(','));
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data.resultados || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  }, [queryInicial, pagina, tiposSeleccionados]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  // Actualizar URL cuando cambian los filtros
  const actualizarURL = (nuevaPagina: number, nuevosTipos: string[]) => {
    const params = new URLSearchParams();
    if (queryInicial) params.set('q', queryInicial);
    if (nuevaPagina > 1) params.set('pagina', nuevaPagina.toString());
    if (nuevosTipos.length > 0) params.set('tipos', nuevosTipos.join(','));
    
    router.push(`/buscar?${params.toString()}`);
  };

  const handleTipoToggle = (tipo: string) => {
    const nuevos = tiposSeleccionados.includes(tipo)
      ? tiposSeleccionados.filter(t => t !== tipo)
      : [...tiposSeleccionados, tipo];
    
    setTiposSeleccionados(nuevos);
    setPagina(1);
    actualizarURL(1, nuevos);
  };

  const limpiarFiltros = () => {
    setTiposSeleccionados([]);
    setPagina(1);
    actualizarURL(1, []);
  };

  const cambiarPagina = (nuevaPagina: number) => {
    setPagina(nuevaPagina);
    actualizarURL(nuevaPagina, tiposSeleccionados);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <SearchBar 
          placeholder="Buscar en todo el sitio..."
          className="max-w-2xl"
        />
        
        {/* Botón de filtros móvil */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="mt-4 md:hidden flex items-center gap-2 text-sm text-gray-600"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {tiposSeleccionados.length > 0 && (
            <span className="bg-gov-blue text-white px-2 py-0.5 rounded-full text-xs">
              {tiposSeleccionados.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filtros lateral */}
        <aside className={`md:col-span-1 ${mostrarFiltros ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Filtros</h2>
              {tiposSeleccionados.length > 0 && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-gov-blue hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Tipo de contenido</h3>
              {TIPOS_FILTRO.map((tipo) => (
                <label 
                  key={tipo.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tiposSeleccionados.includes(tipo.value)}
                    onChange={() => handleTipoToggle(tipo.value)}
                    className="rounded border-gray-300 text-gov-blue focus:ring-gov-blue"
                  />
                  <span className="text-sm text-gray-600">{tipo.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div className="md:col-span-3">
          {/* Info de resultados */}
          {queryInicial && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </span>
                ) : (
                  <>
                    {total} resultado{total !== 1 ? 's' : ''} para{' '}
                    <span className="font-semibold">&quot;{queryInicial}&quot;</span>
                  </>
                )}
              </p>

              {/* Filtros activos */}
              {tiposSeleccionados.length > 0 && (
                <div className="flex items-center gap-2">
                  {tiposSeleccionados.map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => handleTipoToggle(tipo)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    >
                      {TIPOS_FILTRO.find(t => t.value === tipo)?.label}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Estado vacío */}
          {!queryInicial && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                ¿Qué está buscando?
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Utilice la barra de búsqueda para encontrar noticias, documentos, 
                información de transparencia y más.
              </p>
            </div>
          )}

          {/* Sin resultados */}
          {queryInicial && !loading && resultados.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron resultados
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                No hay resultados para &quot;{queryInicial}&quot;. 
                Intente con otros términos o revise los filtros seleccionados.
              </p>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Sugerencias:</p>
                <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                  <li>Verifique la ortografía</li>
                  <li>Use palabras más generales</li>
                  <li>Use menos palabras clave</li>
                  <li>Quite filtros de tipo de contenido</li>
                </ul>
              </div>
            </div>
          )}

          {/* Lista de resultados */}
          {resultados.length > 0 && (
            <div className="space-y-4">
              {resultados.map((resultado) => (
                <Link
                  key={`${resultado.tipo}-${resultado.id}`}
                  href={resultado.url}
                  className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <TipoResultadoIcon tipo={resultado.tipo} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TipoResultadoBadge tipo={resultado.tipo} />
                        {resultado.categoria && (
                          <span className="text-xs text-gray-500">
                            {resultado.categoria}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 hover:text-gov-blue transition-colors line-clamp-2">
                        {resultado.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {resultado.descripcion}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {resultado.fecha && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatearFecha(resultado.fecha)}
                          </span>
                        )}
                        <span className="text-gov-blue truncate max-w-xs">
                          {resultado.url}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => cambiarPagina(pagina - 1)}
                disabled={pagina === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Números de página */}
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let numeroPagina: number;
                if (totalPaginas <= 5) {
                  numeroPagina = i + 1;
                } else if (pagina <= 3) {
                  numeroPagina = i + 1;
                } else if (pagina >= totalPaginas - 2) {
                  numeroPagina = totalPaginas - 4 + i;
                } else {
                  numeroPagina = pagina - 2 + i;
                }

                return (
                  <button
                    key={numeroPagina}
                    onClick={() => cambiarPagina(numeroPagina)}
                    className={`w-10 h-10 rounded-lg border ${
                      pagina === numeroPagina
                        ? 'bg-gov-blue text-white border-gov-blue'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}

              <button
                onClick={() => cambiarPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
