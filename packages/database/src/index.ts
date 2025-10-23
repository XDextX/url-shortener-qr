import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root or local .env when available.
loadEnv();
loadEnv({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  const fallbackDbPath = path.resolve(__dirname, "../prisma/dev.db");
  process.env.DATABASE_URL = `file:${fallbackDbPath}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let schemaReady: Promise<void> | null = null;

const ensureSchema = async (): Promise<void> => {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Url" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "originalUrl" TEXT NOT NULL,
        "qrSvg" TEXT,
        "hits" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Url_code_key" ON "Url"("code");
    `);
  }
};

export const ensureDatabase = async (): Promise<void> => {
  if (!schemaReady) {
    schemaReady = ensureSchema();
  }

  await schemaReady;
};

export * from "@prisma/client";
