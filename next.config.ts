import type { NextConfig } from "next";
import { getAllRedirects } from "./src/lib/redirects";

// Si ya existe el archivo de redirects importados desde CSV, cargarlo:
let importedRedirects: Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>> = []
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const extra = require("./src/lib/redirects-extra")
  importedRedirects = extra.importedRedirects ?? []
} catch {
  // El archivo solo existe después de correr: node scripts/import-redirects.mjs
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // ──────────────────────────────────────────────────────────────────────────
  // Imágenes: permitir dominios de todos los tenants
  // ──────────────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // CDN/Storage para imágenes de cada tenant (p.ej. Cloudflare R2 o S3)
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      // Neon / Supabase Storage
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      // Wildcard para subdominios gestionados de la plataforma
      // (ej: personeria-buga.tuplatforma.com)
      {
        protocol: "https",
        hostname: "**.tuplatforma.com",  // ← cambiar al dominio real de la plataforma
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Headers de seguridad globales
  // ──────────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security",   value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            // 'unsafe-eval' eliminado — era el mayor vector de XSS.
            // 'unsafe-inline' requerido por Next.js (estilos inline en SSR).
            // Para eliminar 'unsafe-inline' en scripts se necesitan nonces
            // dinámicos por request (refactor futuro).
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://challenges.cloudflare.com https://www.google.com/recaptcha/ https://www.youtube.com/ https://www.google.com/maps/;"
          }
        ],
      },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Redirects 301: CMS anterior → nueva estructura de rutas
  //
  // Fuente estática: src/lib/redirects.ts  (~200 reglas)
  // Fuente dinámica: src/lib/redirects-extra.ts (generado por scripts/import-redirects.mjs)
  //
  // Para agregar los 327 URLs del sitio antiguo:
  //   1. Exportar el mapa de URLs del CMS anterior como CSV (Screaming Frog o Yoast)
  //   2. node scripts/import-redirects.mjs mi-export.csv
  //   3. Revisar src/lib/redirects-extra.ts y corregir los TODO
  // ──────────────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      ...getAllRedirects(),
      ...importedRedirects,
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Servidor: expose el host header al middleware y server components
  // ──────────────────────────────────────────────────────────────────────────
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "ssh2", "ssh2-sftp-client"],
};

export default nextConfig;
