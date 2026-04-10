// Configuración Prisma para la META-BD (registro central de tenants)
// Usar con: npx prisma migrate dev --config prisma.config.meta.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/meta/schema.prisma",
  migrations: {
    path: "prisma/meta/migrations",
    seed: "npx tsx prisma/meta/seed.ts",
  },
  datasource: {
    url: process.env["META_DATABASE_URL"],
  },
});
