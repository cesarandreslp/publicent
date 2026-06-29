import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { GovBar } from "@/components/layout/gov-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClientWidgets } from "@/components/layout/client-widgets";
import AuthProvider from "@/components/auth/auth-provider";
import { TenantIdentityProvider } from "@/components/providers/tenant-identity-provider";
import { headers } from "next/headers";
import { getTenantInfo, getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant";

const nunitoSans = Nunito_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Hosts de plataforma / superadmin: metadata neutral (sin tenant)
  const layoutHint = (await headers()).get("x-layout")
  if (layoutHint === "platform" || layoutHint === "superadmin") {
    return {
      title: { default: "Government One", template: "%s — Government One" },
      description: "Government One — Plataforma SaaS para entidades públicas, por OSS Innovation.",
      robots: { index: layoutHint === "platform", follow: layoutHint === "platform" },
    }
  }

  let identidad: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['identidadInstitucional']['findFirst']>
  > = null
  let tenantInfo: Awaited<ReturnType<typeof getTenantInfo>> | null = null

  try {
    const prisma = await getTenantPrisma()
    identidad = await prisma.identidadInstitucional.findFirst({
      where: { singletonKey: 'default' },
    })
  } catch {}
  try {
    tenantInfo = await getTenantInfo()
  } catch {}

  const nombreCompleto =
    identidad?.nombreCompleto ?? tenantInfo?.nombre ?? 'Entidad Pública'
  const nombreCorto =
    identidad?.nombreCorto ?? tenantInfo?.nombreCorto ?? nombreCompleto

  const titleDefault = identidad?.seoTitle ?? nombreCompleto
  const titleTemplate = identidad?.seoTitleTemplate ?? `%s | ${nombreCorto}`
  const description =
    identidad?.seoDescription ??
    `Sitio web oficial de ${nombreCompleto}.`
  const keywords = identidad?.seoKeywords
    ? identidad.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined
  const ogUrl = identidad?.seoOgUrl ?? undefined
  const ogImage = identidad?.seoOgImageUrl ?? undefined

  return {
    title: {
      default: titleDefault,
      template: titleTemplate,
    },
    description,
    keywords,
    authors: [{ name: nombreCompleto }],
    creator: nombreCompleto,
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      url: ogUrl,
      siteName: nombreCorto,
      title: titleDefault,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const layoutHint = headersList.get("x-layout");
  const isSuperAdmin = layoutHint === "superadmin";
  const isPlatform = layoutHint === "platform";

  // Cargar identidad visual del tenant (solo en contexto de tenant activo)
  let tenantLogoUrl: string | null = null
  let tenantNombre: string | null = null
  let tenantNombreCorto: string | null = null
  let tenantTelefono: string | null = null
  let tenantEmail: string | null = null
  let tenantCssVars = ''
  let chatIaActivo = false
  if (!isSuperAdmin && !isPlatform) {
    try {
      const tenant = await getTenantInfo()
      tenantLogoUrl = tenant.logoUrl ?? null
      tenantNombre = tenant.nombre ?? null
      tenantNombreCorto = tenant.nombreCorto ?? null
      const parts: string[] = []
      if (tenant.colorPrimario) parts.push(`--primary: ${tenant.colorPrimario};`)
      if (tenant.colorSecundario) parts.push(`--secondary: ${tenant.colorSecundario};`)
      if (parts.length > 0) tenantCssVars = `:root { ${parts.join(' ')} }`
    } catch {
      // Tenant no disponible (build time, superadmin, etc.) — usar defaults de globals.css
    }
    try {
      const prisma = await getTenantPrisma()
      const id = await prisma.identidadInstitucional.findFirst({
        where: { singletonKey: 'default' },
        select: { telefonoConmutador: true, emailContacto: true, nombreCompleto: true, nombreCorto: true },
      })
      tenantTelefono = id?.telefonoConmutador ?? null
      tenantEmail = id?.emailContacto ?? null
      // El nombre legal vive en identidadInstitucional; tiene prioridad sobre el
      // nombre del meta-tenant para que header, PQRSD y páginas legales coincidan.
      if (id?.nombreCompleto) tenantNombre = id.nombreCompleto
      if (id?.nombreCorto) tenantNombreCorto = id.nombreCorto
    } catch {}
    try {
      chatIaActivo = await isTenantModuleActive(MODULO_IDS.CHAT_IA_CIUDADANO)
    } catch {}
  }

  // Detectar rutas internas donde NO se muestran widgets públicos
  // El middleware ya pone x-layout=superadmin para /superadmin
  // Para /admin y /login lo detectamos aquí via x-next-url o referer
  const nextUrl = headersList.get("x-next-url") || headersList.get("x-invoke-path") || "";
  const isAdminRoute = nextUrl.startsWith("/admin");
  const isAuthRoute = nextUrl.startsWith("/login") || nextUrl.startsWith("/recuperar") || nextUrl.startsWith("/restablecer");

  // Solo mostrar widgets públicos en el sitio público (no admin, no login, no superadmin)
  const isPublicSite = !isSuperAdmin && !isAdminRoute && !isAuthRoute;

  // Panel de superadmin o landing de plataforma: shell mínimo sin componentes del tenant
  if (isSuperAdmin || isPlatform) {
    return (
      <html lang="es">
        <body className={`${nunitoSans.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={`${nunitoSans.variable} font-sans antialiased`}>
        {tenantCssVars ? <style dangerouslySetInnerHTML={{ __html: tenantCssVars }} /> : null}
        <AuthProvider>
         <TenantIdentityProvider nombre={tenantNombre} nombreCorto={tenantNombreCorto}>
          {isPublicSite && (
            <>
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
              <Header
                logoUrl={tenantLogoUrl}
                nombre={tenantNombre}
                nombreCorto={tenantNombreCorto}
                telefono={tenantTelefono}
                email={tenantEmail}
              />
            </>
          )}
          
          {/* Contenido principal */}
          <main id="contenido-principal" className="min-h-screen" role="main">
            {children}
          </main>
          
          {isPublicSite && (
            <>
              {/* Footer */}
              <Footer />

              {/* Widgets cargados client-only via dynamic — evita hydration mismatch */}
              <ClientWidgets chatIaActivo={chatIaActivo} nombreEntidad={tenantNombre} />
            </>
          )}
         </TenantIdentityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
