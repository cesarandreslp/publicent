'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, FileText, Newspaper, BookOpen, Globe } from 'lucide-react';

interface Sugerencia {
  tipo: string;
  titulo: string;
  url: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  expandible?: boolean;
}

export function SearchBar({ 
  placeholder = 'Buscar en el sitio...', 
  className = '',
  expandible = false
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandido, setExpandido] = useState(!expandible);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarSugerencias(false);
        if (expandible && !query) {
          setExpandido(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandible, query]);

  // Buscar sugerencias con debounce
  const buscarSugerencias = useCallback(async (termino: string) => {
    if (termino.length < 2) {
      setSugerencias([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(termino)}&sugerencias=true`);
      if (response.ok) {
        const data = await response.json();
        setSugerencias(data.sugerencias || []);
      }
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce para las sugerencias
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        buscarSugerencias(query);
      } else {
        setSugerencias([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, buscarSugerencias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setMostrarSugerencias(false);
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSugerenciaClick = (sugerencia: string) => {
    setQuery(sugerencia);
    setMostrarSugerencias(false);
    router.push(`/buscar?q=${encodeURIComponent(sugerencia)}`);
  };

  const handleExpand = () => {
    setExpandido(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (expandible && !expandido) {
    return (
      <button
        onClick={handleExpand}
        className={`p-2 text-gray-600 hover:text-gov-blue transition-colors ${className}`}
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setMostrarSugerencias(true);
            }}
            onFocus={() => setMostrarSugerencias(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSugerencias([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de sugerencias */}
      {mostrarSugerencias && (query.length >= 2 || sugerencias.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gov-blue" />
            </div>
          ) : sugerencias.length > 0 ? (
            <ul>
              {sugerencias.map((sugerencia, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSugerenciaClick(sugerencia)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{sugerencia}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron sugerencias
            </div>
          ) : null}
          
          {query.length >= 2 && (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-4 py-2 text-sm text-gov-blue hover:bg-blue-50 rounded flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Icono según el tipo de resultado
 */
export function TipoResultadoIcon({ tipo }: { tipo: string }) {
  switch (tipo) {
    case 'noticia':
      return <Newspaper className="w-5 h-5 text-blue-500" />;
    case 'documento':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'transparencia':
      return <BookOpen className="w-5 h-5 text-green-500" />;
    case 'pagina':
      return <Globe className="w-5 h-5 text-purple-500" />;
    default:
      return <Search className="w-5 h-5 text-gray-500" />;
  }
}

/**
 * Etiqueta de tipo de resultado
 */
export function TipoResultadoBadge({ tipo }: { tipo: string }) {
  const estilos: Record<string, string> = {
    noticia: 'bg-blue-100 text-blue-800',
    documento: 'bg-red-100 text-red-800',
    transparencia: 'bg-green-100 text-green-800',
    pagina: 'bg-purple-100 text-purple-800',
    servicio: 'bg-orange-100 text-orange-800',
  };

  const nombres: Record<string, string> = {
    noticia: 'Noticia',
    documento: 'Documento',
    transparencia: 'Transparencia',
    pagina: 'Página',
    servicio: 'Servicio',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${estilos[tipo] || 'bg-gray-100 text-gray-800'}`}>
      {nombres[tipo] || tipo}
    </span>
  );
}
