/**
 * disc-interop/procuraduria.ts — Stub de interoperabilidad con la Procuraduría
 * General de la Nación (sistema SIRI).
 *
 * TODO: integrar con API SIRI-PGN cuando se entreguen credenciales.
 */

export interface ConsultaSiriResult {
  disponible: false
  mensaje: string
}

/** Stub: consulta de antecedentes disciplinarios en SIRI-PGN. */
export async function consultarAntecedentesSiri(_documento: string): Promise<ConsultaSiriResult> {
  return {
    disponible: false,
    mensaje: "Integración con SIRI-PGN pendiente de credenciales.",
  }
}
