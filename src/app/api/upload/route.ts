/**
 * API de Subida de Archivos del CMS
 *
 * POST /api/upload — Sube uno o más archivos al ALMACENAMIENTO EN NUBE del tenant
 * (R2/S3/GCS/Azure según su configuración en Superadmin → Almacenamiento).
 *
 * NOTA: antes escribía al filesystem local, que NO persiste en Vercel (serverless
 * efímero). Ahora usa `uploadFile()` con la `StorageConfig` del tenant, igual que
 * el módulo de gestión documental.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantModulos } from '@/lib/tenant'
import { getStorageConfig } from '@/lib/modules'
import { uploadFile } from '@/lib/storage'
import { TIPOS_PERMITIDOS, LIMITES_TAMANO, MAX_ARCHIVOS_POR_REQUEST } from '@/lib/upload'
import { registrarAuditoria } from '@/lib/auditoria'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const archivos = (formData.getAll('archivos') as File[]).filter(Boolean)
    const tipo = (formData.get('tipo') as string) || 'todos'

    const lista = [archivo, ...archivos].filter(
      (f): f is File => !!f && typeof f === 'object' && 'arrayBuffer' in f
    )
    if (lista.length === 0) {
      return NextResponse.json({ success: false, error: 'No se proporcionaron archivos' }, { status: 400 })
    }
    if (lista.length > MAX_ARCHIVOS_POR_REQUEST) {
      return NextResponse.json({ success: false, error: `Máximo ${MAX_ARCHIVOS_POR_REQUEST} archivos por solicitud` }, { status: 400 })
    }

    // Validación de tipo/tamaño
    const tiposPermitidos =
      tipo === 'imagen' ? TIPOS_PERMITIDOS.imagen
      : tipo === 'documento' ? TIPOS_PERMITIDOS.documento
      : tipo === 'excel' ? TIPOS_PERMITIDOS.excel
      : TIPOS_PERMITIDOS.todos
    const maxTamano =
      tipo === 'imagen' ? LIMITES_TAMANO.imagen
      : tipo === 'documento' ? LIMITES_TAMANO.documento
      : tipo === 'excel' ? LIMITES_TAMANO.excel
      : LIMITES_TAMANO.default

    for (const f of lista) {
      if (f.type && tiposPermitidos.length && !tiposPermitidos.includes(f.type)) {
        return NextResponse.json({ success: false, error: `Tipo de archivo no permitido: ${f.type}` }, { status: 400 })
      }
      if (f.size > maxTamano) {
        return NextResponse.json({ success: false, error: `El archivo "${f.name}" supera el tamaño máximo permitido` }, { status: 400 })
      }
    }

    // Configuración de almacenamiento del tenant
    const modulos = await getTenantModulos()
    const storageCfg = getStorageConfig(modulos)
    if (storageCfg.provider === 'local' && process.env.VERCEL) {
      return NextResponse.json({
        success: false,
        error: 'Almacenamiento en la nube no configurado. Configúralo en Superadmin → entidad → "Almacenamiento de Documentos" (R2/S3) para poder subir archivos en producción.',
      }, { status: 422 })
    }

    const anio = new Date().getFullYear()
    const mes = String(new Date().getMonth() + 1).padStart(2, '0')
    const resultados: { url: string; nombreArchivo: string; tipo: string }[] = []
    for (const f of lista) {
      const buffer = Buffer.from(await f.arrayBuffer())
      const r = await uploadFile(storageCfg, buffer, f.name, f.type || 'application/octet-stream', `cms/${anio}/${mes}`)
      resultados.push({ url: r.url, nombreArchivo: f.name, tipo: f.type })
    }

    await registrarAuditoria({
      accion: 'UPLOAD',
      entidad: 'Archivo',
      usuarioId: user!.id,
      datosDespues: { cantidad: resultados.length, archivos: resultados.map((r) => r.url) },
    }).catch(() => null)

    // Compatibilidad: un solo archivo → shape simple { success, url, nombreArchivo }
    if (resultados.length === 1) {
      return NextResponse.json({ success: true, ...resultados[0] })
    }
    return NextResponse.json({ success: true, archivos: resultados })
  } catch (error) {
    console.error('Error en /api/upload:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error al subir el archivo' }, { status: 502 })
  }
}
