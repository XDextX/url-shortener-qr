import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import type { DatabaseDriver } from "./contracts.js";

/**
 * Factory that produces the Postgres driver, backed by Prisma, implementing the shared contract.
 * The schema belongs to the migrations, so this driver never creates tables.
 * @param url - connection string; defaults to `DATABASE_URL`
 * @returns the driver, whose client connects on first use
 */
export const createPrismaDriver = async (
  url = process.env.DATABASE_URL
): Promise<DatabaseDriver> => {
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required for the postgres driver");
  }

  let client: PrismaClient | null = null;
  const db = (): PrismaClient =>
    (client ??= new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }));

  return {
    ensure: async () => {
      await db().$queryRaw`SELECT 1`;
    },
    insert: (input) =>
      db().url.create({
        data: { code: input.code, originalUrl: input.originalUrl, qrSvg: input.qrSvg ?? null }
      }),
    findByCode: (code) => db().url.findUnique({ where: { code } }),
    findByOriginalUrl: (originalUrl) => db().url.findUnique({ where: { originalUrl } }),
    incrementHits: async (code) => {
      // updateMany, not update: a missing code answers false instead of throwing, as SQLite does.
      const { count } = await db().url.updateMany({
        where: { code },
        data: { hits: { increment: 1 } }
      });
      return count > 0;
    },
    clear: async () => {
      await db().url.deleteMany();
    },
    getConnection: db
  };
};
