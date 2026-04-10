import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite hacer build aunque haya errores TS en archivos pre-existentes
  // (eliminar cuando todos los errores estén corregidos)
  typescript: {
    ignoreBuildErrors: true,
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://challenges.cloudflare.com https://www.google.com/recaptcha/ https://www.youtube.com/ https://www.google.com/maps/;"
          }
        ],
      },
    ]
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Servidor: expose el host header al middleware y server components
  // ──────────────────────────────────────────────────────────────────────────
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
};

export default nextConfig;
