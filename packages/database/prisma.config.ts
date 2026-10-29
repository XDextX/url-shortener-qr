import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI migrates over Neon's direct URL: migrations must not go through the pooler.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  }
});
