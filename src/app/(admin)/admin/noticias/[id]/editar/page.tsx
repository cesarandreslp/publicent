import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NoticiaForm } from "../../components/noticia-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Editar Noticia | Panel de Administración",
  description: "Editar una noticia existente",
}

export default async function EditarNoticiaPage({ params }: PageProps) {
  const { id } = await params

  const noticia = await prisma.noticia.findUnique({
    where: { id },
    include: {
      categoria: true,
      etiquetas: true,
    },
  })

  if (!noticia) {
    notFound()
  }

  // Transformar los datos para el formulario
  const noticiaData = {
    id: noticia.id,
    titulo: noticia.titulo,
    extracto: noticia.extracto || "",
    contenido: typeof noticia.contenido === "string" 
      ? noticia.contenido 
      : JSON.stringify(noticia.contenido),
    imagenDestacada: noticia.imagenDestacada || "",
    galeria: (noticia.galeria as string[]) || [],
    videoUrl: noticia.videoUrl || "",
    estado: noticia.estado as "BORRADOR" | "PUBLICADO" | "ARCHIVADO",
    destacada: noticia.destacada,
    fechaPublicacion: noticia.fechaPublicacion
      ? noticia.fechaPublicacion.toISOString().slice(0, 16)
      : "",
    categoriaId: noticia.categoriaId || "",
    metaTitle: noticia.metaTitle || "",
    metaDescription: noticia.metaDescription || "",
    etiquetas: noticia.etiquetas.map((e: { id: string }) => e.id),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Noticia</h1>
        <p className="text-gray-600 mt-1">
          Modifica la información de la noticia
        </p>
      </div>

      <NoticiaForm noticia={noticiaData} isEditing />
    </div>
  )
}
