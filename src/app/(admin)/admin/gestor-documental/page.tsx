/**
 * /admin/gestor-documental — REDIRIGE al módulo GD real.
 *
 * El módulo de gestión documental AGN-compatible vive en /admin/gd.
 * Esta ruta se mantiene por compatibilidad con links existentes.
 */
import { redirect } from "next/navigation"

export default function GestorDocumentalLegacyPage() {
  redirect("/admin/gd")
}
