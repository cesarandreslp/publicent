"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  FileText,
  Users,
  AlertCircle,
  Timer,
} from "lucide-react"
import { DataTable } from "@/components/admin/shared"

interface PQRS {
  id: string
  radicado: string
  tipo: string
  asunto: string
  nombreCiudadano: string
  email: string | null
  estado: string
  prioridad: string
  fechaRadicado: string
  fechaVencimiento: string | null
  createdAt: string
  diasRestantes: number | null
  estaVencida: boolean
  proximaAVencer: boolean
  asignado: {
    id: string
    nombre: string
    apellido: string
  } | null
  _count: {
    respuestas: number
    adjuntos: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function PqrsClient() {
  const [pqrs, setPqrs] = useState<PQRS[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [soloVencidas, setSoloVencidas] = useState(false)

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    vencidas: 0,
    resueltasHoy: 0,
  })

  const fetchPqrs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(tipoFilter && { tipo: tipoFilter }),
        ...(estadoFilter && { estado: estadoFilter }),
        ...(soloVencidas && { vencidas: "true" }),
      })

      const response = await fetch(`/api/admin/pqrs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPqrs(data.pqrs)
        setPagination(data.pagination)

        // Calcular estadísticas
        const vencidas = data.pqrs.filter((p: PQRS) => p.estaVencida).length
        const pendientes = data.pqrs.filter(
          (p: PQRS) =>
            !["RESUELTO", "CERRADO", "RECHAZADO"].includes(p.estado)
        ).length

        setStats({
          total: data.pagination.total,
          pendientes,
          vencidas,
          resueltasHoy: 0, // Esto debería calcularse en el backend
        })
      }
    } catch (error) {
      console.error("Error al cargar PQRS:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPqrs()
  }, [pagination.page, searchTerm, tipoFilter, estadoFilter, soloVencidas])

  const getTipoBadge = (tipo: string) => {
    const styles: Record<string, string> = {
      PETICION: "bg-blue-100 text-blue-800",
      QUEJA: "bg-yellow-100 text-yellow-800",
      RECLAMO: "bg-orange-100 text-orange-800",
      SUGERENCIA: "bg-green-100 text-green-800",
      DENUNCIA: "bg-red-100 text-red-800",
      CONSULTA: "bg-purple-100 text-purple-800",
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[tipo] || "bg-gray-100 text-gray-800"}`}>
        {tipo.charAt(0) + tipo.slice(1).toLowerCase()}
      </span>
    )
  }

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { bg: string; icon: any }> = {
      RADICADO: { bg: "bg-gray-100 text-gray-800", icon: FileText },
      EN_TRAMITE: { bg: "bg-blue-100 text-blue-800", icon: Clock },
      EN_REVISION: { bg: "bg-yellow-100 text-yellow-800", icon: Eye },
      RESUELTO: { bg: "bg-green-100 text-green-800", icon: CheckCircle },
      CERRADO: { bg: "bg-gray-200 text-gray-600", icon: XCircle },
      RECHAZADO: { bg: "bg-red-100 text-red-800", icon: XCircle },
    }
    const { bg, icon: Icon } = config[estado] || { bg: "bg-gray-100", icon: FileText }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${bg}`}>
        <Icon className="h-3 w-3" />
        {estado.replace("_", " ")}
      </span>
    )
  }

  const getPrioridadBadge = (prioridad: string) => {
    const styles: Record<string, string> = {
      ALTA: "bg-red-500",
      MEDIA: "bg-yellow-500",
      BAJA: "bg-green-500",
    }
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${styles[prioridad] || "bg-gray-500"}`}
        title={`Prioridad ${prioridad.toLowerCase()}`}
      />
    )
  }

  const columns: ColumnDef<PQRS>[] = [
    {
      accessorKey: "radicado",
      header: "Radicado",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getPrioridadBadge(row.original.prioridad)}
          <span className="font-mono text-sm font-medium">
            {row.original.radicado}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => getTipoBadge(row.original.tipo),
    },
    {
      accessorKey: "asunto",
      header: "Asunto",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900 line-clamp-1">
            {row.original.asunto}
          </p>
          <p className="text-sm text-gray-500">
            {row.original.nombreCiudadano}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => getEstadoBadge(row.original.estado),
    },
    {
      accessorKey: "fechaVencimiento",
      header: "Vencimiento",
      cell: ({ row }) => {
        if (!row.original.fechaVencimiento) {
          return <span className="text-gray-400">-</span>
        }

        const { diasRestantes, estaVencida, proximaAVencer } = row.original

        return (
          <div className="flex items-center gap-2">
            {estaVencida ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : proximaAVencer ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : (
              <Timer className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`text-sm ${
                estaVencida
                  ? "text-red-600 font-medium"
                  : proximaAVencer
                    ? "text-yellow-600"
                    : "text-gray-600"
              }`}
            >
              {estaVencida
                ? `Vencida hace ${Math.abs(diasRestantes!)} días`
                : `${diasRestantes} días restantes`}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "asignado",
      header: "Asignado",
      cell: ({ row }) =>
        row.original.asignado ? (
          <span className="text-sm text-gray-600">
            {row.original.asignado.nombre} {row.original.asignado.apellido}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Sin asignar</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Link
          href={`/admin/pqrs/${row.original.id}`}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-[#003366] hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          Ver
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PQRSD</h1>
          <p className="text-gray-600 mt-1">
            Peticiones, Quejas, Reclamos, Sugerencias y Denuncias
          </p>
        </div>
        <Link
          href="/admin/pqrs/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva PQRS
        </Link>
      </div>

      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total PQRS</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resueltas hoy</p>
              <p className="text-2xl font-bold text-green-600">{stats.resueltasHoy}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por radicado, asunto o ciudadano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="PETICION">Petición</option>
              <option value="QUEJA">Queja</option>
              <option value="RECLAMO">Reclamo</option>
              <option value="SUGERENCIA">Sugerencia</option>
              <option value="DENUNCIA">Denuncia</option>
            </select>

            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="RADICADO">Radicado</option>
              <option value="EN_TRAMITE">En trámite</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <input
                type="checkbox"
                checked={soloVencidas}
                onChange={(e) => setSoloVencidas(e.target.checked)}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">Solo vencidas</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={pqrs} />
        )}
      </div>

      {/* Información normativa */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Tiempos de respuesta según Ley 1755 de 2015:</p>
            <ul className="mt-1 space-y-1">
              <li>• Peticiones generales: <strong>15 días hábiles</strong></li>
              <li>• Consultas: <strong>30 días hábiles</strong></li>
              <li>• Peticiones de documentos: <strong>10 días hábiles</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
