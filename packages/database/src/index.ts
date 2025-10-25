import type { DatabaseDriver, InsertUrlInput, UrlRecord } from "./contracts.js";
import { createSqliteDriver } from "./sqlite-driver.js";

type DriverFactory = () => Promise<DatabaseDriver>;

const drivers = new Map<string, DriverFactory>();
let driverOverride: string | null = null;
let cachedDriver: Promise<DatabaseDriver> | null = null;

const normaliseName = (name: string): string => name.trim().toLowerCase();

export const registerDatabaseDriver = (name: string, factory: DriverFactory): void => {
  drivers.set(normaliseName(name), factory);
  cachedDriver = null;
};

export const setDatabaseDriver = (name: string): void => {
  driverOverride = normaliseName(name);
  cachedDriver = null;
};

export const getActiveDatabaseDriverName = (): string => {
  const resolved = driverOverride ?? process.env.DATABASE_DRIVER ?? "sqlite";
  return normaliseName(resolved);
};

const resolveDriver = async (): Promise<DatabaseDriver> => {
  if (!cachedDriver) {
    const name = getActiveDatabaseDriverName();
    const factory = drivers.get(name);

    if (!factory) {
      const available = Array.from(drivers.keys()).join(", ") || "none";
      throw new Error(`Unknown database driver "${name}". Registered drivers: ${available}.`);
    }

    cachedDriver = factory();
  }

  return cachedDriver;
};

registerDatabaseDriver("sqlite", createSqliteDriver);

export const ensureDatabase = async (): Promise<void> => {
  const driver = await resolveDriver();
  await driver.ensure();
};

export const insertUrl = async (input: InsertUrlInput): Promise<UrlRecord> => {
  const driver = await resolveDriver();
  return driver.insert(input);
};

export const findUrlByCode = async (code: string): Promise<UrlRecord | null> => {
  const driver = await resolveDriver();
  return driver.findByCode(code);
};

export const incrementUrlHits = async (code: string): Promise<boolean> => {
  const driver = await resolveDriver();
  return driver.incrementHits(code);
};

export const removeAllUrls = async (): Promise<void> => {
  const driver = await resolveDriver();
  await driver.clear();
};

export const getDatabase = async <T = unknown>(): Promise<T> => {
  const driver = await resolveDriver();

  if (!driver.getConnection) {
    throw new Error(
      `Active database driver "${getActiveDatabaseDriverName()}" does not expose a raw connection.`
    );
  }

  const connection = await driver.getConnection();
  return connection as T;
};

export type { InsertUrlInput, UrlRecord, DatabaseDriver } from "./contracts.js";
