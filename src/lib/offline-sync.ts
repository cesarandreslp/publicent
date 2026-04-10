/**
 * Cola de Sincronización Offline
 *
 * Cuando el funcionario está sin conexión:
 * 1. Las operaciones se encolan en IndexedDB
 * 2. Al recuperar conexión, se sincronizan automáticamente
 * 3. Badge visual muestra cambios pendientes
 *
 * Compatible con Service Worker + IndexedDB
 */

const DB_NAME = "gd-offline-queue"
const STORE_NAME = "pendientes"
const DB_VERSION = 1

export interface OperacionPendiente {
  id: string
  tipo: "CREAR_RADICADO" | "ACTUALIZAR_RADICADO" | "CARGA_DOCUMENTO"
  payload: Record<string, unknown>
  timestamp: number
  intentos: number
  ultimoError?: string
}

// ─── IndexedDB ────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Encolar una operación para sincronizar cuando haya conexión
 */
export async function encolarOperacion(
  tipo: OperacionPendiente["tipo"],
  payload: Record<string, unknown>
): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  const op: OperacionPendiente = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tipo,
    payload,
    timestamp: Date.now(),
    intentos: 0,
  }

  store.add(op)
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

/**
 * Obtener todas las operaciones pendientes
 */
export async function obtenerPendientes(): Promise<OperacionPendiente[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Eliminar una operación ya sincronizada
 */
export async function eliminarOperacion(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)
  store.delete(id)
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

/**
 * Marcar operación como fallida (incrementar intentos)
 */
export async function marcarFallida(id: string, error: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  const request = store.get(id)
  request.onsuccess = () => {
    const op = request.result as OperacionPendiente
    if (op) {
      op.intentos++
      op.ultimoError = error
      store.put(op)
    }
  }

  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

/**
 * Sincronizar todas las operaciones pendientes
 * Retorna el número de operaciones procesadas exitosamente
 */
export async function sincronizarPendientes(): Promise<{
  exitosas: number
  fallidas: number
  total: number
}> {
  const pendientes = await obtenerPendientes()
  let exitosas = 0
  let fallidas = 0

  for (const op of pendientes) {
    // Máximo 3 intentos
    if (op.intentos >= 3) continue

    try {
      let endpoint = ""
      let method = "POST"

      switch (op.tipo) {
        case "CREAR_RADICADO":
          endpoint = "/api/admin/gd/radicados"
          break
        case "ACTUALIZAR_RADICADO":
          endpoint = `/api/admin/gd/radicados/${op.payload.id}`
          method = "PUT"
          break
        case "CARGA_DOCUMENTO":
          endpoint = "/api/admin/gd/documentos"
          break
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload),
      })

      if (res.ok) {
        await eliminarOperacion(op.id)
        exitosas++
      } else {
        await marcarFallida(op.id, `HTTP ${res.status}`)
        fallidas++
      }
    } catch (err) {
      await marcarFallida(op.id, (err as Error).message)
      fallidas++
    }
  }

  return { exitosas, fallidas, total: pendientes.length }
}

/**
 * Obtener conteo de operaciones pendientes
 */
export async function contarPendientes(): Promise<number> {
  const pendientes = await obtenerPendientes()
  return pendientes.length
}
