'use client';

import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2,
  Calendar,
  FileText,
  Users,
  Shield,
  Newspaper,
  BookOpen,
  ClipboardList
} from 'lucide-react';

interface TipoReporte {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  soportaFechas: boolean;
  soportaEstado?: boolean;
  estados?: { value: string; label: string }[];
}

const TIPOS_REPORTE: TipoReporte[] = [
  {
    id: 'pqrsd',
    nombre: 'PQRSD',
    descripcion: 'Reporte de peticiones, quejas, reclamos, sugerencias y denuncias',
    icono: <ClipboardList className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    soportaFechas: true,
    soportaEstado: true,
    estados: [
      { value: '', label: 'Todos los estados' },
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'EN_PROCESO', label: 'En proceso' },
      { value: 'RESUELTO', label: 'Resuelto' },
      { value: 'CERRADO', label: 'Cerrado' },
      { value: 'VENCIDO', label: 'Vencido' },
    ],
  },
  {
    id: 'noticias',
    nombre: 'Noticias',
    descripcion: 'Listado de noticias publicadas con estadísticas',
    icono: <Newspaper className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600',
    soportaFechas: true,
  },
  {
    id: 'documentos',
    nombre: 'Documentos',
    descripcion: 'Inventario de documentos de transparencia',
    icono: <FileText className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    soportaFechas: true,
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion: 'Listado de usuarios registrados en el sistema',
    icono: <Users className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600',
    soportaFechas: false,
  },
  {
    id: 'auditoria',
    nombre: 'Auditoría',
    descripcion: 'Registro de acciones realizadas en el sistema',
    icono: <Shield className="w-6 h-6" />,
    color: 'bg-red-100 text-red-600',
    soportaFechas: true,
  },
  {
    id: 'transparencia',
    nombre: 'Transparencia',
    descripcion: 'Resumen de cumplimiento de transparencia por categorías',
    icono: <BookOpen className="w-6 h-6" />,
    color: 'bg-cyan-100 text-cyan-600',
    soportaFechas: false,
  },
];

export function ReportesClient() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoReporte | null>(null);
  const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const generarReporte = async () => {
    if (!tipoSeleccionado) return;

    setGenerando(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set('tipo', tipoSeleccionado.id);
      params.set('formato', formato);
      if (fechaInicio) params.set('fechaInicio', fechaInicio);
      if (fechaFin) params.set('fechaFin', fechaFin);
      if (estado) params.set('estado', estado);

      const response = await fetch(`/api/admin/reportes?${params.toString()}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error generando reporte');
      }

      // Descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || `reporte.${formato}`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-gov-blue" />
          Generación de Reportes
        </h1>
        <p className="text-gray-600 mt-1">
          Exporte información del sistema en formato Excel o CSV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selección de tipo de reporte */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Seleccione el tipo de reporte
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIPOS_REPORTE.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => {
                    setTipoSeleccionado(tipo);
                    setEstado('');
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    tipoSeleccionado?.id === tipo.id
                      ? 'border-gov-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${tipo.color}`}>
                      {tipo.icono}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{tipo.nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tipo.descripcion}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de configuración */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Configuración
            </h2>

            {!tipoSeleccionado ? (
              <p className="text-gray-500 text-sm">
                Seleccione un tipo de reporte para ver las opciones disponibles.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Formato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de exportación
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormato('xlsx')}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                        formato === 'xlsx'
                          ? 'bg-gov-blue text-white border-gov-blue'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => setFormato('csv')}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                        formato === 'csv'
                          ? 'bg-gov-blue text-white border-gov-blue'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Rango de fechas */}
                {tipoSeleccionado.soportaFechas && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Estado (solo para PQRSD) */}
                {tipoSeleccionado.soportaEstado && tipoSeleccionado.estados && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {tipoSeleccionado.estados.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Botón de generación */}
                <button
                  onClick={generarReporte}
                  disabled={generando}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gov-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {generando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generar Reporte
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">
          Información sobre los reportes
        </h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Los reportes de auditoría están limitados a 10,000 registros</li>
          <li>El formato Excel (.xlsx) incluye formato de columnas automático</li>
          <li>Los reportes PQRSD incluyen días restantes para vencimiento</li>
          <li>Todas las exportaciones quedan registradas en el sistema de auditoría</li>
        </ul>
      </div>
    </div>
  );
}
