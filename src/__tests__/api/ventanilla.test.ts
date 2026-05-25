/**
 * ventanilla.test.ts
 * Tests de la API de Ventanilla Única (admin).
 * Los handlers de Next.js se prueban directamente con mocks de Prisma y auth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks globales ───────────────────────────────────────────────────────────

// Prisma mock
const mockPrismaVU = {
  pQRS: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  historialPQRS: {
    create: vi.fn(),
  },
  vuRespuesta: {
    create: vi.fn(),
  },
  usuario: {
    findUnique: vi.fn(),
  },
}

vi.mock('@/lib/tenant', () => ({
  getTenantPrisma: vi.fn().mockResolvedValue(mockPrismaVU),
  isTenantModuleActive: vi.fn().mockResolvedValue(true),
  MODULO_IDS: { VENTANILLA_UNICA: 'ventanilla_unica', GESTION_DOCUMENTAL: 'gestion_documental' },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'user-admin-123', name: 'Admin Test', role: 'ADMIN' },
  }),
}))

vi.mock('@/lib/mail', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/groq-client', () => ({
  calcularSemaforo: vi.fn().mockReturnValue('VERDE'),
}))

// ─── Helper: crear NextRequest ────────────────────────────────────────────────

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/ventanilla/test-id/responder', {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

function makeReasignarRequest(body?: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/ventanilla/test-id/reasignar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

// ─── Tests: /responder ────────────────────────────────────────────────────────

describe('POST /api/admin/ventanilla/[id]/responder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaVU.pQRS.findUnique.mockResolvedValue({
      id: 'test-id',
      radicado: 'PGB-2026-00001',
      email: 'ciudadano@test.com',
      asunto: 'Solicitud de información',
      anonimo: false,
      estado: 'EN_TRAMITE',
    })
    mockPrismaVU.vuRespuesta.create.mockResolvedValue({ id: 'resp-123' })
    mockPrismaVU.pQRS.update.mockResolvedValue({})
    mockPrismaVU.historialPQRS.create.mockResolvedValue({})
  })

  it('retorna 400 si el tipo es inválido', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'TIPO_INVALIDO', contenido: 'texto' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Tipo inválido')
  })

  it('retorna 400 si el contenido está vacío', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'COMPETENTE', contenido: '   ' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('contenido')
  })

  it('retorna 400 si tipo REMISION no tiene entidadDestino', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'REMISION', contenido: 'Se remite a...' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('entidadDestino')
  })

  it('retorna 400 si tipo TRASLADO no tiene entidadDestino', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'TRASLADO', contenido: 'Se traslada...' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 404 si el radicado no existe', async () => {
    mockPrismaVU.pQRS.findUnique.mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'COMPETENTE', contenido: 'Respuesta oficial' })
    const res = await POST(req, { params: Promise.resolve({ id: 'no-existe' }) })
    expect(res.status).toBe(404)
  })

  it('retorna 409 si el radicado ya está respondido', async () => {
    mockPrismaVU.pQRS.findUnique.mockResolvedValue({
      id: 'test-id', radicado: 'PGB-2026-00001', email: null, asunto: 'test',
      anonimo: false, estado: 'RESPONDIDA',
    })
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'COMPETENTE', contenido: 'Respuesta' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(409)
  })

  it('retorna 201 con respuesta COMPETENTE exitosa', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', {
      tipo: 'COMPETENTE',
      contenido: 'Le informamos que su solicitud ha sido atendida...',
      firmadoPor: 'Personero Municipal',
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.estado).toBe('RESPONDIDA')
  })

  it('cambia estado a ANULADA para tipo DESISTIMIENTO', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', {
      tipo: 'DESISTIMIENTO',
      contenido: 'El ciudadano desiste de su solicitud.',
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.estado).toBe('ANULADA')
  })

  it('llama a prisma.vuRespuesta.create con los datos correctos', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', {
      tipo: 'COMPETENTE',
      contenido: 'Respuesta de fondo oficial',
      firmadoPor: 'Juan Personero',
    })
    await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(mockPrismaVU.vuRespuesta.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: 'COMPETENTE',
          contenido: 'Respuesta de fondo oficial',
          firmadoPor: 'Juan Personero',
        }),
      })
    )
  })

  it('acepta REMISION con entidadDestino', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', {
      tipo: 'REMISION',
      contenido: 'Se remite a la entidad competente.',
      entidadDestino: 'Alcaldía de Buga',
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(201)
  })

  it('retorna 401 si no hay sesión', async () => {
    const { auth } = await import('@/lib/auth')
    ;(vi.mocked(auth) as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'COMPETENTE', contenido: 'texto' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(401)
  })

  it('retorna 403 si el módulo VU no está activo', async () => {
    const { isTenantModuleActive } = await import('@/lib/tenant')
    vi.mocked(isTenantModuleActive).mockResolvedValueOnce(false)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/responder/route')
    const req = makeRequest('POST', { tipo: 'COMPETENTE', contenido: 'texto' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(403)
  })
})

// ─── Tests: /reasignar ────────────────────────────────────────────────────────

describe('POST /api/admin/ventanilla/[id]/reasignar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrismaVU.pQRS.findUnique.mockResolvedValue({
      id: 'test-id',
      radicado: 'PGB-2026-00001',
      asunto: 'Solicitud de información',
      asignadoId: 'old-user-id',
    })
    mockPrismaVU.usuario.findUnique.mockResolvedValue({
      id: 'new-user-id',
      nombre: 'María',
      apellido: 'López',
      email: 'mlopez@personeria.gov.co',
    })
    mockPrismaVU.pQRS.update.mockResolvedValue({})
    mockPrismaVU.historialPQRS.create.mockResolvedValue({})
  })

  it('retorna 400 si falta funcionarioId', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ motivo: 'Por ausencia' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('funcionarioId')
  })

  it('retorna 404 si el radicado no existe', async () => {
    mockPrismaVU.pQRS.findUnique.mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id' })
    const res = await POST(req, { params: Promise.resolve({ id: 'no-existe' }) })
    expect(res.status).toBe(404)
  })

  it('retorna 404 si el nuevo funcionario no existe', async () => {
    mockPrismaVU.usuario.findUnique.mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'ghost-user' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toContain('Funcionario')
  })

  it('retorna 200 con mensaje de éxito en reasignación correcta', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id', motivo: 'Por vacaciones' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.mensaje).toContain('María')
    expect(json.mensaje).toContain('López')
  })

  it('actualiza el PQRS con EN_TRAMITE y el nuevo asignadoId', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id' })
    await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(mockPrismaVU.pQRS.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-id' },
        data: expect.objectContaining({
          asignadoId: 'new-user-id',
          estado: 'EN_TRAMITE',
        }),
      })
    )
  })

  it('crea entrada en historial con acción REASIGNACION', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id', motivo: 'Capacidad' })
    await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(mockPrismaVU.historialPQRS.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accion: 'REASIGNACION',
          descripcion: expect.stringContaining('María'),
        }),
      })
    )
  })

  it('incluye el motivo en la descripción del historial si se provee', async () => {
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id', motivo: 'Por vacaciones' })
    await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(mockPrismaVU.historialPQRS.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          descripcion: expect.stringContaining('Por vacaciones'),
        }),
      })
    )
  })

  it('retorna 401 si no hay sesión', async () => {
    const { auth } = await import('@/lib/auth')
    ;(vi.mocked(auth) as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/admin/ventanilla/[id]/reasignar/route')
    const req = makeReasignarRequest({ funcionarioId: 'new-user-id' })
    const res = await POST(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(401)
  })
})
