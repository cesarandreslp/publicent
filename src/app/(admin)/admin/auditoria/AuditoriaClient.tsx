'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  User,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  X,
  Loader2,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

interface RegistroAuditoria {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  detalles: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  fechaCreacion: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface Estadisticas {
  totalAcciones: number;
  accionesPorTipo: Array<{ accion: string; _count: number }>;
  usuariosMasActivos: Array<{ 
    usuarioId: string; 
    _count: number;
    usuario?: { nombre: string };
  }>;
  entidadesMasModificadas: Array<{ entidad: string; _count: number }>;
}

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
  { value: 'LOGIN', label: 'Iniciar sesión' },
  { value: 'LOGOUT', label: 'Cerrar sesión' },
  { value: 'UPLOAD', label: 'Subir archivo' },
  { value: 'DOWNLOAD', label: 'Descargar' },
  { value: 'EXPORT', label: 'Exportar' },
  { value: 'VIEW', label: 'Ver' },
  { value: 'PUBLISH', label: 'Publicar' },
  { value: 'UNPUBLISH', label: 'Despublicar' },
];

const COLORES_ACCION: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  UPLOAD: 'bg-yellow-100 text-yellow-800',
  DOWNLOAD: 'bg-cyan-100 text-cyan-800',
  EXPORT: 'bg-orange-100 text-orange-800',
  VIEW: 'bg-indigo-100 text-indigo-800',
  PUBLISH: 'bg-emerald-100 text-emerald-800',
  UNPUBLISH: 'bg-amber-100 text-amber-800',
};

export function AuditoriaClient() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  
  // Filtros
  const [accion, setAccion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Modal de detalles
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroAuditoria | null>(null);

  const limite = 20;

  const cargarRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('pagina', pagina.toString());
      params.set('limite', limite.toString());
      if (accion) params.set('accion', accion);
      if (entidad) params.set('entidad', entidad);
      if (fechaInicio) params.set('fechaInicio', fechaInicio);
      if (fechaFin) params.set('fechaFin', fechaFin);

      const response = await fetch(`/api/admin/auditoria?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRegistros(data.registros || []);
        setTotal(data.total || 0);
        setTotalPaginas(data.totalPaginas || 0);
      }
    } catch (error) {
      console.error('Error cargando auditoría:', error);
    } finally {
      setLoading(false);
    }
  }, [pagina, accion, entidad, fechaInicio, fechaFin]);

  const cargarEstadisticas = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/admin/auditoria?estadisticas=true&dias=30');
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const limpiarFiltros = () => {
    setAccion('');
    setEntidad('');
    setFechaInicio('');
    setFechaFin('');
    setPagina(1);
  };

  const exportarCSV = () => {
    // Crear CSV con los registros actuales
    const headers = ['Fecha', 'Usuario', 'Email', 'Acción', 'Entidad', 'ID Entidad', 'IP'];
    const rows = registros.map(r => [
      formatearFecha(r.fechaCreacion),
      r.usuario.nombre,
      r.usuario.email,
      r.accion,
      r.entidad,
      r.entidadId || '',
      r.ip || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-gov-blue" />
            Registro de Auditoría
          </h1>
          <p className="text-gray-600 mt-1">
            Monitoreo de todas las acciones realizadas en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cargarRegistros}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Acciones (30 días)</p>
              <p className="text-2xl font-bold text-gray-800">
                {loadingStats ? '-' : estadisticas?.totalAcciones || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Acción más frecuente</p>
              <p className="text-lg font-bold text-gray-800">
                {loadingStats ? '-' : estadisticas?.accionesPorTipo?.[0]?.accion || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuario más activo</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {loadingStats ? '-' : estadisticas?.usuariosMasActivos?.[0]?.usuario?.nombre || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Entidad más modificada</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {loadingStats ? '-' : estadisticas?.entidadesMasModificadas?.[0]?.entidad || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 text-gray-700 hover:text-gov-blue"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {(accion || entidad || fechaInicio || fechaFin) && (
              <span className="bg-gov-blue text-white px-2 py-0.5 rounded-full text-xs">
                Activos
              </span>
            )}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <select
                  value={accion}
                  onChange={(e) => { setAccion(e.target.value); setPagina(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {ACCIONES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entidad
                </label>
                <input
                  type="text"
                  value={entidad}
                  onChange={(e) => { setEntidad(e.target.value); setPagina(1); }}
                  placeholder="Ej: Noticia, Usuario..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => { setFechaInicio(e.target.value); setPagina(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => { setFechaFin(e.target.value); setPagina(1); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={limpiarFiltros}
                className="text-sm text-gray-600 hover:text-gov-blue"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Tabla de registros */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gov-blue" />
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron registros de auditoría</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registros.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatearFecha(registro.fechaCreacion)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {registro.usuario.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registro.usuario.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        COLORES_ACCION[registro.accion] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {registro.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{registro.entidad}</p>
                        {registro.entidadId && (
                          <p className="text-xs text-gray-500 truncate max-w-37.5">
                            ID: {registro.entidadId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {registro.ip || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setRegistroSeleccionado(registro)}
                        className="p-1 text-gray-400 hover:text-gov-blue"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {((pagina - 1) * limite) + 1} - {Math.min(pagina * limite, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {registroSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Detalles del Registro
              </h2>
              <button
                onClick={() => setRegistroSeleccionado(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatearFecha(registroSeleccionado.fechaCreacion)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acción</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    COLORES_ACCION[registroSeleccionado.accion] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {registroSeleccionado.accion}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usuario</p>
                  <p className="font-medium">{registroSeleccionado.usuario.nombre}</p>
                  <p className="text-sm text-gray-500">{registroSeleccionado.usuario.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entidad</p>
                  <p className="font-medium">{registroSeleccionado.entidad}</p>
                  {registroSeleccionado.entidadId && (
                    <p className="text-sm text-gray-500">ID: {registroSeleccionado.entidadId}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP</p>
                  <p className="font-medium">{registroSeleccionado.ip || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Agent</p>
                  <p className="text-xs text-gray-600 break-all">
                    {registroSeleccionado.userAgent || 'No disponible'}
                  </p>
                </div>
              </div>

              {registroSeleccionado.detalles && Object.keys(registroSeleccionado.detalles).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Detalles adicionales</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-60">
                    {JSON.stringify(registroSeleccionado.detalles, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
