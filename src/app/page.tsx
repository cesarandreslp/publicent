import { HeroSlider } from "@/components/home/hero-slider"
import { EnlacesRapidos } from "@/components/home/enlaces-rapidos"
import { NoticiasHome } from "@/components/home/noticias-home"
import { TransparenciaHome } from "@/components/home/transparencia-home"
import { PQRSHome } from "@/components/home/pqrs-home"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* Hero Slider con counters institucionales */}
      <HeroSlider />

      {/* Accesos rápidos */}
      <EnlacesRapidos />

      {/* Sección de Transparencia — dark glassmorphism */}
      <TransparenciaHome />

      {/* Últimas Noticias — layout editorial */}
      <NoticiasHome />

      {/* PQRS — split layout con consulta rápida */}
      <PQRSHome />

      {/* Ubicación — mapa + información de contacto */}
      <section className="py-16 bg-white" aria-labelledby="ubicacion-title">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-gov-blue font-semibold text-sm uppercase tracking-widest mb-3">
              <span className="w-8 h-0.5 bg-gov-blue inline-block" />
              Encuéntrenos
            </div>
            <h2 id="ubicacion-title" className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dónde Estamos
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Info cards */}
            <div className="space-y-4">
              {[
                {
                  icon: MapPin,
                  label: "Dirección",
                  value: "Cra 14 #6-30, Centro",
                  sub: "Guadalajara de Buga, Valle del Cauca",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: Phone,
                  label: "Teléfono",
                  value: "+57 (2) 228-0000",
                  sub: "Línea de atención ciudadana",
                  color: "bg-emerald-50 text-emerald-600"
                },
                {
                  icon: Mail,
                  label: "Correo",
                  value: "info@personeriabuga.gov.co",
                  sub: "Respuesta en 1 día hábil",
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  icon: Clock,
                  label: "Horarios",
                  value: "Lunes a Viernes",
                  sub: "8:00 am – 5:00 pm (jornada continua)",
                  color: "bg-orange-50 text-orange-600"
                },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gov-blue/20 hover:shadow-sm transition-all">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
                      <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Map embed */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl h-[400px] bg-gray-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.6283!2d-76.2967!3d3.9003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwNTQnMDEuMSJOIDc2wrAxNyc4Mi4xIlc!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Personería Municipal de Guadalajara de Buga"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
