'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2,
  Minimize2,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';

interface PDFViewerProps {
  url: string;
  titulo?: string;
  mostrarControles?: boolean;
  altura?: string;
  onClose?: () => void;
}

export function PDFViewer({ 
  url, 
  titulo = 'Documento PDF',
  mostrarControles = true,
  altura = '600px',
  onClose
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detectar si es un PDF o una URL externa
  const esPDF = url.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = titulo.replace(/\s+/g, '_') + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200" style={{ height: altura }}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el documento</h3>
        <p className="text-gray-600 text-center mb-4">
          No se pudo cargar el documento. Puede intentar descargarlo directamente.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar documento
        </a>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-gray-100 rounded-lg overflow-hidden border border-gray-200 ${fullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Barra de herramientas */}
      {mostrarControles && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium truncate max-w-xs">{titulo}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {fullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded transition-colors ml-2"
                title="Cerrar"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenedor del PDF */}
      <div 
        className="relative flex-1 bg-gray-200"
        style={{ height: fullscreen ? '100%' : altura }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-gov-blue mb-2" />
              <span className="text-gray-600">Cargando documento...</span>
            </div>
          </div>
        )}
        
        {esPDF ? (
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full"
            title={titulo}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <iframe
            src={url}
            className="w-full h-full"
            title={titulo}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Modal para mostrar el visor de PDF
 */
interface PDFModalProps {
  url: string;
  titulo?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFModal({ url, titulo, isOpen, onClose }: PDFModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-5xl h-[90vh]">
        <PDFViewer
          url={url}
          titulo={titulo}
          altura="100%"
          onClose={onClose}
        />
      </div>
    </div>
  );
}

/**
 * Botón para ver/descargar PDF
 */
interface PDFButtonProps {
  url: string;
  titulo?: string;
  className?: string;
}

export function PDFButton({ url, titulo = 'Documento', className = '' }: PDFButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors ${className}`}
      >
        <FileText className="w-4 h-4" />
        Ver PDF
      </button>
      
      <PDFModal
        url={url}
        titulo={titulo}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
