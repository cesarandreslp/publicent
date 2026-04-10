import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { GovBar } from "@/components/layout/gov-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AccessibilityToolbar } from "@/components/shared/AccessibilityToolbar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CookieConsent } from "@/components/shared/CookieConsent";
import AuthProvider from "@/components/auth/auth-provider";
import { headers } from "next/headers";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Personería Municipal de Guadalajara de Buga",
    template: "%s | Personería de Buga"
  },
  description: "Sitio web oficial de la Personería Municipal de Guadalajara de Buga. Defensores de los derechos ciudadanos. Transparencia, atención al ciudadano, PQRSD y servicios.",
  keywords: ["Personería", "Buga", "Guadalajara de Buga", "Valle del Cauca", "Colombia", "PQRSD", "Transparencia", "Derechos Humanos"],
  authors: [{ name: "Personería Municipal de Guadalajara de Buga" }],
  creator: "Personería Municipal de Guadalajara de Buga",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://www.personeriabuga.gov.co",
    siteName: "Personería de Buga",
    title: "Personería Municipal de Guadalajara de Buga",
    description: "Defensores de los derechos ciudadanos en Guadalajara de Buga",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personería Municipal de Guadalajara de Buga",
    description: "Defensores de los derechos ciudadanos en Guadalajara de Buga",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isSuperAdmin = headersList.get("x-layout") === "superadmin";

  // Panel de superadmin: shell mínimo sin componentes del tenant
  if (isSuperAdmin) {
    return (
      <html lang="es">
        <body className={`${workSans.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={`${workSans.variable} font-sans antialiased`}>
        <AuthProvider>
          {/* Skip links - PRIMERO para accesibilidad WCAG 2.1 */}
          <div className="skip-links">
            <a 
              href="#contenido-principal" 
              className="skip-link"
            >
              Ir al contenido principal
            </a>
            <a 
              href="#navegacion-principal" 
              className="skip-link"
            >
              Ir a la navegación
            </a>
            <a 
              href="#footer" 
              className="skip-link"
            >
              Ir al pie de página
            </a>
          </div>

          {/* Barra GOV.CO obligatoria */}
          <GovBar />
          
          {/* Header con navegación */}
          <Header />
          
          {/* Contenido principal */}
          <main id="contenido-principal" className="min-h-screen" role="main">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
          
          {/* Herramientas de accesibilidad */}
          <AccessibilityToolbar />
          
          {/* Botón de WhatsApp - Configuración desde CMS */}
          <WhatsAppButton />

          {/* Modal de advertencia de cookies - Obligatorio */}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
