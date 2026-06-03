import type { Metadata } from "next"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Observatorio de indicadores",
  description: "Indicadores de gestión y desempeño institucional",
}

type ObsMetaTipo = 'MAYOR_ES_MEJOR' | 'MENOR_ES_MEJOR' | 'EXACTO'

function porcentaje(valorActual: number | null, meta: number, metaTipo: ObsMetaTipo): number {
  if (valorActual == null || meta === 0) return 0
  const v = Number(valorActual), m = Number(meta)
  if (metaTipo === 'MENOR_ES_MEJOR') return v === 0 ? 100 : Math.min(100, Math.round((m / v) * 100))
  return Math.min(100, Math.round((v / m) * 100))
}

function cumpleMeta(valorActual: number | null, meta: number, metaTipo: ObsMetaTipo): boolean | null {
  if (valorActual == null) return null
  const v = Number(valorActual), m = Number(meta)
  if (metaTipo === 'MAYOR_ES_MEJOR') return v >= m
  if (metaTipo === 'MENOR_ES_MEJOR') return v <= m
  return Math.abs(v - m) / Math.max(Math.abs(m), 1) <= 0.05
}

const CAT_LABEL: Record<string, string> = {
  GESTION_INTERNA: 'Gestión interna', ATENCION_CIUDADANA: 'Atención ciudadana',
  FINANCIERO: 'Financiero', CONTRATACION: 'Contratación',
  GESTION_DOCUMENTAL: 'Gestión documental', TALENTO_HUMANO: 'Talento humano',
  MIPG: 'MIPG / FURAG', OTRO: 'Otro',
}

export default async function ObservatorioPublicoPage() {
  const activo = await isTenantModuleActive(MODULO_IDS.OBSERVATORIO)
  if (!activo) notFound()

  const prisma = await getTenantPrisma()
  const indicadores = await prisma.obsIndicador.findMany({
    where: { publicado: true },
    include: { mediciones: { orderBy: { fecha: 'desc' }, take: 1 } },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  })

  // Agrupar por categoría
  const porCategoria = indicadores.reduce<Record<string, typeof indicadores>>((acc, ind) => {
    const cat = ind.categoria
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ind)
    return acc
  }, {})

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Observatorio institucional</h1>
        <p className="text-gray-500 mt-2">Indicadores de gestión y desempeño institucional publicados para consulta ciudadana.</p>
      </div>

      {Object.keys(porCategoria).length === 0 && (
        <p className="text-gray-400 text-center py-20">No hay indicadores publicados.</p>
      )}

      {Object.entries(porCategoria).map(([cat, inds]) => (
        <section key={cat}>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">{CAT_LABEL[cat] ?? cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {inds.map(ind => {
              const mt = ind.metaTipo as ObsMetaTipo
              const va = ind.valorActual != null ? Number(ind.valorActual) : null
              const pct = porcentaje(va, Number(ind.meta), mt)
              const ok  = cumpleMeta(va, Number(ind.meta), mt)
              const barColor = ok === true ? 'bg-green-500' : ok === false ? 'bg-red-400' : 'bg-gray-200'
              return (
                <div key={ind.id} className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">{ind.codigo}</p>
                    <h3 className="font-semibold text-gray-900 leading-tight mt-0.5">{ind.nombre}</h3>
                    {ind.descripcion && <p className="text-xs text-gray-500 mt-1">{ind.descripcion}</p>}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-2xl text-gray-800">
                        {va != null ? `${va.toLocaleString('es-CO')}` : '—'}
                        <span className="text-base font-normal text-gray-500 ml-1">{ind.unidad}</span>
                      </span>
                      <span className="text-xs text-gray-400 self-end">Meta: {Number(ind.meta).toLocaleString('es-CO')} {ind.unidad}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className={`text-xs font-medium ${ok === true ? 'text-green-600' : ok === false ? 'text-red-500' : 'text-gray-400'}`}>
                        {ok === true ? '✓ Cumple meta' : ok === false ? '✗ Sin cumplir' : 'Sin medición'}
                      </span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  {ind.dependenciaNombre && (
                    <p className="text-xs text-gray-400">{ind.dependenciaNombre}</p>
                  )}
                  {ind.fechaUltimaMedicion && (
                    <p className="text-xs text-gray-400">Actualizado: {new Date(ind.fechaUltimaMedicion).toLocaleDateString('es-CO')}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
