import { Client } from "pg";
import { randomUUID } from "node:crypto";
import type { DatabaseDriver, InsertUrlInput, UrlRecord } from "./contracts.js";

type PostgresContext = {
  client: Client;
};

let contextPromise: Promise<PostgresContext> | null = null;
let schemaEnsured = false;

/**
 * Lazily initializes the PostgreSQL connection.
 */
const loadContext = async (): Promise<PostgresContext> => {
  if (!contextPromise) {
    contextPromise = (async () => {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error(
          'DATABASE_URL environment variable is required for PostgreSQL driver'
        );
      }

      const client = new Client({ connectionString });
      await client.connect();

      return { client };
    })();
  }

  return contextPromise;
};

/**
 * Creates the Url table and indexes once per process.
 */
const ensureSchema = async (ctx: PostgresContext): Promise<void> => {
  if (schemaEnsured) {
    return;
  }

  await ctx.client.query(`
    CREATE TABLE IF NOT EXISTS "Url" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "originalUrl" TEXT NOT NULL UNIQUE,
      "qrSvg" TEXT,
      "hits" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Url_code_key" ON "Url"("code");
    CREATE UNIQUE INDEX IF NOT EXISTS "Url_originalUrl_key" ON "Url"("originalUrl");
  `);

  schemaEnsured = true;
};

/**
 * Converts a raw database row to a UrlRecord.
 */
const mapRow = (row: {
  id: string;
  code: string;
  originalUrl: string;
  qrSvg: string | null;
  hits: number;
  createdAt: Date;
  updatedAt: Date;
}): UrlRecord => ({
  id: row.id,
  code: row.code,
  originalUrl: row.originalUrl,
  qrSvg: row.qrSvg ?? null,
  hits: row.hits,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

/**
 * Ensures the schema is ready.
 */
const ensure = async (): Promise<void> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);
};

/**
 * Inserts a new Url record.
 */
const insert = async (input: InsertUrlInput): Promise<UrlRecord> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const id = randomUUID();
  const now = new Date();

  const result = await ctx.client.query(
    `
    INSERT INTO "Url" ("id", "code", "originalUrl", "qrSvg", "hits", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, 0, $5, $6)
    RETURNING *;
    `,
    [id, input.code, input.originalUrl, input.qrSvg ?? null, now, now]
  );

  return mapRow(result.rows[0]);
};

/**
 * Finds a Url record by its short code.
 */
const find = async (code: string): Promise<UrlRecord | null> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const result = await ctx.client.query(
    `SELECT * FROM "Url" WHERE "code" = $1 LIMIT 1;`,
    [code]
  );

  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
};

/**
 * Finds a Url record by the original URL.
 */
const findByOriginalUrl = async (originalUrl: string): Promise<UrlRecord | null> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const result = await ctx.client.query(
    `SELECT * FROM "Url" WHERE "originalUrl" = $1 LIMIT 1;`,
    [originalUrl]
  );

  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
};

/**
 * Increments the hit count for a given short code.
 */
const increment = async (code: string): Promise<boolean> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const now = new Date();

  const result = await ctx.client.query(
    `
    UPDATE "Url"
    SET "hits" = "hits" + 1, "updatedAt" = $1
    WHERE "code" = $2;
    `,
    [now, code]
  );

  return result.rowCount ?? 0 > 0;
};

/**
 * Removes every Url record from the database.
 */
const clear = async (): Promise<void> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  await ctx.client.query(`DELETE FROM "Url";`);
};

/**
 * Exposes the underlying PostgreSQL client for advanced consumers.
 */
const getConnection = async (): Promise<Client> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);
  return ctx.client;
};

/**
 * Factory that produces the PostgreSQL driver implementing the shared contract.
 */
export const createPostgresDriver = async (): Promise<DatabaseDriver> => {
  await ensure();

  return {
    ensure,
    insert,
    findByCode: find,
    findByOriginalUrl,
    incrementHits: increment,
    clear,
    getConnection
  };
};
