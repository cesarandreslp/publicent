"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Users,
  FileText,
  FolderOpen,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
} from "lucide-react"

interface Estadisticas {
  resumen: {
    totalUsuarios: number
    totalNoticias: number
    totalDocumentos: number
    totalPQRS: number
    pqrsPendientes: number
    transparenciaItems: number
    porcentajeCumplimientoITA: number
    pqrsProximosVencer: number
    pqrsVencidos: number
  }
  actividad: {
    noticiasRecientes: number
    documentosRecientes: number
    pqrsRecientes: number
  }
  graficos: {
    pqrsPorTipo: { tipo: string; cantidad: number }[]
    pqrsPorEstado: { estado: string; cantidad: number }[]
    pqrsMensuales: { mes: string; mesCompleto: string; cantidad: number }[]
    noticiasConCategoria: { categoria: string; cantidad: number }[]
    documentosPorCategoria: { categoria: string; cantidad: number }[]
    cumplimientoTransparencia: {
      categoria: string
      codigo: string
      total: number
      cumplidos: number
      porcentaje: number
    }[]
    usuariosPorRol: { rol: string; cantidad: number }[]
  }
}

const COLORS = [
  "#003366",
  "#0066cc",
  "#3399ff",
  "#66b3ff",
  "#99ccff",
  "#cce5ff",
]

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "#f59e0b",
  EN_PROCESO: "#3b82f6",
  RESUELTO: "#10b981",
  CERRADO: "#6b7280",
}

const TIPO_LABELS: Record<string, string> = {
  PETICION: "Petición",
  QUEJA: "Queja",
  RECLAMO: "Reclamo",
  SUGERENCIA: "Sugerencia",
  DENUNCIA: "Denuncia",
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
}

const ROL_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  EDITOR: "Editor",
  MODERADOR: "Moderador",
  VIEWER: "Visualizador",
}

export function EstadisticasClient() {
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/estadisticas")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
      </div>
    )
  }

  const cumplimientoData = [
    {
      name: "Cumplimiento ITA",
      value: stats.resumen.porcentajeCumplimientoITA,
      fill: stats.resumen.porcentajeCumplimientoITA >= 80 ? "#10b981" : stats.resumen.porcentajeCumplimientoITA >= 60 ? "#f59e0b" : "#ef4444",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard de Estadísticas
          </h1>
          <p className="text-gray-600 mt-1">
            Métricas de cumplimiento y gestión
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total PQRS</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resumen.totalPQRS}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.resumen.pqrsPendientes} pendientes
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Noticias</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resumen.totalNoticias}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{stats.actividad.noticiasRecientes} este mes
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resumen.totalDocumentos}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            +{stats.actividad.documentosRecientes} este mes
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resumen.totalUsuarios}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas PQRS */}
      {(stats.resumen.pqrsVencidos > 0 ||
        stats.resumen.pqrsProximosVencer > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.resumen.pqrsVencidos > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">
                  {stats.resumen.pqrsVencidos} PQRS Vencidos
                </h3>
                <p className="text-sm text-red-600">
                  Requieren atención inmediata según Ley 1755/2015
                </p>
              </div>
            </div>
          )}

          {stats.resumen.pqrsProximosVencer > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">
                  {stats.resumen.pqrsProximosVencer} Próximos a Vencer
                </h3>
                <p className="text-sm text-amber-600">
                  Vencen en los próximos 3 días
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cumplimiento ITA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[#003366]" />
            <h3 className="font-semibold text-gray-900">Cumplimiento ITA</h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={cumplimientoData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold"
                  fill="#111827"
                >
                  {stats.resumen.porcentajeCumplimientoITA}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Resolución 1519/2020
          </p>
        </div>

        {/* PQRS por estado */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">PQRS por Estado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.graficos.pqrsPorEstado.map((item) => ({
                  name: ESTADO_LABELS[item.estado] || item.estado,
                  value: item.cantidad,
                  fill: ESTADO_COLORS[item.estado] || "#6b7280",
                }))}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {stats.graficos.pqrsPorEstado.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={ESTADO_COLORS[entry.estado] || COLORS[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PQRS mensuales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Tendencia PQRS (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.graficos.pqrsMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                labelFormatter={(value, payload) => {
                  const item = payload?.[0]?.payload
                  return item?.mesCompleto || value
                }}
              />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke="#003366"
                strokeWidth={3}
                dot={{ fill: "#003366", strokeWidth: 2 }}
                name="PQRS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PQRS por tipo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">PQRS por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={stats.graficos.pqrsPorTipo.map((item) => ({
                tipo: TIPO_LABELS[item.tipo] || item.tipo,
                cantidad: item.cantidad,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumplimiento por categoría de transparencia */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Cumplimiento por Categoría (Res. 1519/2020)
        </h3>
        <div className="space-y-3">
          {stats.graficos.cumplimientoTransparencia.map((cat) => (
            <div key={cat.codigo} className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <span className="text-sm font-medium text-gray-700">
                  {cat.codigo}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 truncate flex-1">
                    {cat.categoria}
                  </span>
                  <span className="text-xs text-gray-600">
                    {cat.cumplidos}/{cat.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cat.porcentaje >= 80
                        ? "bg-green-500"
                        : cat.porcentaje >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${cat.porcentaje}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  cat.porcentaje >= 80
                    ? "text-green-600"
                    : cat.porcentaje >= 60
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {cat.porcentaje}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Noticias por categoría */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Noticias por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.graficos.noticiasConCategoria}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="cantidad"
                nameKey="categoria"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {stats.graficos.noticiasConCategoria.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Usuarios por rol */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Usuarios por Rol</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={stats.graficos.usuariosPorRol.map((item) => ({
                rol: ROL_LABELS[item.rol] || item.rol,
                cantidad: item.cantidad,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="rol" width={100} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#003366" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-center text-sm text-gray-500">
        Última actualización:{" "}
        {lastUpdate.toLocaleString("es-CO", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
    </div>
  )
}
