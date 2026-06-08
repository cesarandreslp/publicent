import Link from "next/link"

export const metadata = {
  title: "Government One — Plataforma SaaS para entidades públicas",
  description: "Portales institucionales y módulos de gestión para entidades públicas colombianas: transparencia, PQRSD, gestión documental, contabilidad, presupuesto y más.",
}

const FEATURES = [
  { titulo: "Portal Gov.co", desc: "Sitio institucional conforme a la Resolución 1519/2020: transparencia, accesibilidad y atención al ciudadano." },
  { titulo: "PQRSD y Ventanilla Única", desc: "Radicación, trazabilidad y términos legales en días hábiles, con notificaciones automáticas." },
  { titulo: "Gestión Documental (AGN)", desc: "TRD, radicación oficial, expedientes electrónicos y archivo, alineado con la normatividad del AGN." },
  { titulo: "Financiero público", desc: "Contabilidad (CGN), presupuesto (CCPET), tesorería, nómina (PILA) y reportes de control (CHIP/FUT/Ley 617)." },
  { titulo: "Verticales por entidad", desc: "Función disciplinaria para personerías, FRISCO para la SAE, y más módulos activables por contrato." },
  { titulo: "Multi-tenant aislado", desc: "Cada entidad con su propia base de datos y dominio. Aprovisionamiento automático en minutos." },
]

export default function PlataformaLanding() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">G1</div>
            <div className="leading-tight">
              <p className="font-bold">Government One</p>
              <p className="text-[11px] text-slate-500">by OSS Innovation</p>
            </div>
          </div>
          <Link href="/superadmin-login"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20">
            Ingresar al SaaS
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
          Plataforma SaaS para el sector público colombiano
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight">
          Portales y gestión pública,<br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">listos por contrato.</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-slate-400 text-lg">
          Government One provisiona el portal institucional y los módulos que cada entidad
          contrata —transparencia, PQRSD, gestión documental, financiero y verticales— con
          aislamiento total por entidad.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/superadmin-login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-500/20">
            Ingresar al SaaS
          </Link>
          <a href="#modulos"
            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition">
            Ver módulos
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="modulos" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.titulo} className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
              <h3 className="font-semibold text-white">{f.titulo}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} OSS Innovation — Government One</span>
          <Link href="/superadmin-login" className="hover:text-slate-300">Acceso operadores</Link>
        </div>
      </footer>
    </div>
  )
}
