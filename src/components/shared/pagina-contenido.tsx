import { getTenantPrisma } from '@/lib/tenant'

/**
 * Renderiza el contenido de una `Pagina` por slug.
 * - Si Pagina.contenido es string → render HTML
 * - Si Pagina.contenido es objeto con { html: string } → render html
 * - En cualquier otro caso → empty state
 */
export async function PaginaContenido({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  let pagina: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['pagina']['findUnique']>
  > = null
  try {
    const prisma = await getTenantPrisma()
    pagina = await prisma.pagina.findUnique({ where: { slug } })
  } catch {}

  if (!pagina || !pagina.publicada) {
    return (
      <div className={`bg-gray-50 rounded-xl border border-gray-200 p-12 text-center ${className ?? ''}`}>
        <p className="text-gray-500 mb-2">
          Esta página aún no tiene contenido publicado.
        </p>
        <p className="text-xs text-gray-400">
          Un administrador puede crear la página con slug <code className="bg-gray-200 px-1 rounded">{slug}</code> desde el panel.
        </p>
      </div>
    )
  }

  const contenidoHtml =
    typeof pagina.contenido === 'string'
      ? pagina.contenido
      : pagina.contenido && typeof pagina.contenido === 'object' && 'html' in (pagina.contenido as Record<string, unknown>)
        ? String((pagina.contenido as Record<string, unknown>).html ?? '')
        : null

  if (!contenidoHtml) {
    return (
      <div className={`bg-gray-50 rounded-xl border border-gray-200 p-12 text-center ${className ?? ''}`}>
        <p className="text-gray-500">
          La página existe pero no tiene contenido en formato compatible.
        </p>
      </div>
    )
  }

  return (
    <article
      className={`prose prose-gray max-w-none ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: contenidoHtml }}
    />
  )
}
