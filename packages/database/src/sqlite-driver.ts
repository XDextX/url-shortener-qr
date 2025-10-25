import initSqlJs, { type Database as SqlJsDatabase, type SqlJsStatic, type Statement } from "sql.js";
import { config as loadEnv } from "dotenv";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseDriver, InsertUrlInput, UrlRecord } from "./contracts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv();
loadEnv({ path: path.resolve(__dirname, "../.env") });

const DEFAULT_DB_PATH = path.resolve(__dirname, "../data/dev.db");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${DEFAULT_DB_PATH}`;
}

type DatabaseConfig = {
  persistent: boolean;
  path: string | null;
};

const resolveDatabasePath = (input: string): string => {
  if (input === ":memory:") {
    return input;
  }

  if (input.startsWith("file:")) {
    return input.slice("file:".length);
  }

  if (path.isAbsolute(input)) {
    return input;
  }

  return path.resolve(process.cwd(), input);
};

const getDatabaseConfig = (): DatabaseConfig => {
  const url = process.env.DATABASE_URL ?? `file:${DEFAULT_DB_PATH}`;

  if (url === ":memory:") {
    return { persistent: false, path: null };
  }

  const resolvedPath = resolveDatabasePath(url);

  return { persistent: true, path: resolvedPath };
};

const locateFile = (filename: string): string => {
  const localPath = path.resolve(__dirname, "../node_modules/sql.js/dist", filename);
  if (existsSync(localPath)) {
    return localPath;
  }

  const workspacePath = path.resolve(__dirname, "../../node_modules/sql.js/dist", filename);
  if (existsSync(workspacePath)) {
    return workspacePath;
  }

  const hoistedPath = path.resolve(__dirname, "../../../node_modules/sql.js/dist", filename);
  if (existsSync(hoistedPath)) {
    return hoistedPath;
  }

  return path.resolve(process.cwd(), "node_modules/sql.js/dist", filename);
};

type DatabaseContext = {
  SQL: SqlJsStatic;
  db: SqlJsDatabase;
  persistent: boolean;
  path: string | null;
};

let contextPromise: Promise<DatabaseContext> | null = null;
let schemaEnsured = false;

const loadDatabaseFile = async (filePath: string): Promise<Uint8Array | null> => {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const buffer = await fs.readFile(filePath);
    return new Uint8Array(buffer);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const persistDatabase = async (ctx: DatabaseContext): Promise<void> => {
  if (!ctx.persistent || !ctx.path) {
    return;
  }

  await fs.mkdir(path.dirname(ctx.path), { recursive: true });
  const data = ctx.db.export();
  await fs.writeFile(ctx.path, data);
};

const loadContext = async (): Promise<DatabaseContext> => {
  if (!contextPromise) {
    contextPromise = (async () => {
      const SQL = await initSqlJs({ locateFile });
      const config = getDatabaseConfig();

      const existing = config.persistent && config.path ? await loadDatabaseFile(config.path) : null;
      const db = existing ? new SQL.Database(existing) : new SQL.Database();

      return {
        SQL,
        db,
        persistent: config.persistent,
        path: config.path
      };
    })();
  }

  return contextPromise;
};

const ensureSchema = async (ctx: DatabaseContext): Promise<void> => {
  if (schemaEnsured) {
    return;
  }

  ctx.db.exec(`
    CREATE TABLE IF NOT EXISTS "Url" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "originalUrl" TEXT NOT NULL,
      "qrSvg" TEXT,
      "hits" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Url_code_key" ON "Url"("code");
  `);

  schemaEnsured = true;
  await persistDatabase(ctx);
};

const mapRow = (row: {
  id: string;
  code: string;
  originalUrl: string;
  qrSvg: string | null;
  hits: number;
  createdAt: string;
  updatedAt: string;
}): UrlRecord => ({
  id: row.id,
  code: row.code,
  originalUrl: row.originalUrl,
  qrSvg: row.qrSvg ?? null,
  hits: Number(row.hits),
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt)
});

const getRowFromStatement = (statement: Statement): {
  id: string;
  code: string;
  originalUrl: string;
  qrSvg: string | null;
  hits: number;
  createdAt: string;
  updatedAt: string;
} => {
  const raw = statement.getAsObject() as Record<string, string | number | null>;

  return {
    id: String(raw.id),
    code: String(raw.code),
    originalUrl: String(raw.originalUrl),
    qrSvg: raw.qrSvg === null ? null : String(raw.qrSvg),
    hits: Number(raw.hits ?? 0),
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt)
  };
};

const ensure = async (): Promise<void> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);
};

const insert = async (input: InsertUrlInput): Promise<UrlRecord> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const now = new Date().toISOString();

  const row = {
    id: randomUUID(),
    code: input.code,
    originalUrl: input.originalUrl,
    qrSvg: input.qrSvg ?? null,
    hits: 0,
    createdAt: now,
    updatedAt: now
  };

  const statement = ctx.db.prepare(`
    INSERT INTO "Url" (
      "id", "code", "originalUrl", "qrSvg", "hits", "createdAt", "updatedAt"
    ) VALUES (
      $id, $code, $originalUrl, $qrSvg, $hits, $createdAt, $updatedAt
    );
  `);

  statement.bind({
    $id: row.id,
    $code: row.code,
    $originalUrl: row.originalUrl,
    $qrSvg: row.qrSvg,
    $hits: row.hits,
    $createdAt: row.createdAt,
    $updatedAt: row.updatedAt
  });

  statement.step();
  statement.free();

  await persistDatabase(ctx);

  return mapRow(row);
};

const find = async (code: string): Promise<UrlRecord | null> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const statement = ctx.db.prepare(`
    SELECT "id", "code", "originalUrl", "qrSvg", "hits", "createdAt", "updatedAt"
    FROM "Url"
    WHERE "code" = $code
    LIMIT 1;
  `);

  statement.bind({ $code: code });

  const hasRow = statement.step();

  if (!hasRow) {
    statement.free();
    return null;
  }

  const row = getRowFromStatement(statement);
  statement.free();

  return mapRow(row);
};

const increment = async (code: string): Promise<boolean> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  const statement = ctx.db.prepare(`
    UPDATE "Url"
    SET "hits" = "hits" + 1,
        "updatedAt" = $updatedAt
    WHERE "code" = $code;
  `);

  const updatedAt = new Date().toISOString();
  statement.bind({ $code: code, $updatedAt: updatedAt });
  statement.step();
  statement.free();

  const changes = ctx.db.getRowsModified();

  if (changes > 0) {
    await persistDatabase(ctx);
  }

  return changes > 0;
};

const clear = async (): Promise<void> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);

  ctx.db.exec(`DELETE FROM "Url";`);
  await persistDatabase(ctx);
};

const getConnection = async (): Promise<SqlJsDatabase> => {
  const ctx = await loadContext();
  await ensureSchema(ctx);
  return ctx.db;
};

export const createSqliteDriver = async (): Promise<DatabaseDriver> => {
  await ensure();

  return {
    ensure,
    insert,
    findByCode: find,
    incrementHits: increment,
    clear,
    getConnection
  };
};
