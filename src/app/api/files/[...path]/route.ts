/**
 * GET /api/files/[...path]
 *
 * Endpoint autenticado para servir archivos almacenados en /private/uploads/.
 * Los archivos NO están en /public — solo usuarios con sesión activa pueden
 * descargarlos. Esto protege documentos de PQRSD, expedientes del gestor
 * documental y cualquier archivo subido desde el panel admin.
 *
 * Rutas públicas (logos, imágenes del sitio) deben seguir en /public.
 * En producción (Vercel) usar R2 con URLs firmadas — este endpoint es para
 * desarrollo local y staging.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Mapa de extensiones a Content-Type
const MIME_MAP: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls':  'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt':  'text/plain; charset=utf-8',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 1. Verificar sesión activa (admin o funcionario)
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Construir la ruta del archivo
  const { path: segments } = await params

  // Sanitizar: rechazar path traversal
  const joined = segments.join('/')
  if (joined.includes('..') || joined.includes('//')) {
    return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 })
  }

  // Los archivos se guardan en /private/uploads/... (fuera de /public)
  // Solo aceptamos rutas que empiecen con "uploads/" para limitar el acceso
  if (!joined.startsWith('uploads/')) {
    return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), 'private', joined)

  // 3. Verificar que el archivo existe
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  // 4. Leer y servir el archivo
  try {
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_MAP[ext] ?? 'application/octet-stream'
    const filename = path.basename(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // inline para PDFs e imágenes, attachment para el resto
        'Content-Disposition': ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)
          ? `inline; filename="${filename}"`
          : `attachment; filename="${filename}"`,
        // Evitar cacheo agresivo — el acceso depende de la sesión
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al leer el archivo' }, { status: 500 })
  }
}
