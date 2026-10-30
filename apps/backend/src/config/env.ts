export interface EnvConfig {
  port: number;
  baseUrl: string;
  frontendUrl: string;
  databaseUrl: string;
  databaseDriver: string;
  rateLimitMax: number;
}

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_DATABASE_URL = "file:./data/dev.db";
const DEFAULT_DATABASE_DRIVER = "sqlite";
const DEFAULT_RATE_LIMIT_MAX = 10;

/**
 * Decides the public origin short URLs are built on.
 * @param env - the environment to read, `process.env` in production
 * @param port - the local port, used only when nothing else is set
 * @returns `BASE_URL`, else Vercel's production origin, else localhost
 */
export const resolveBaseUrl = (env: Record<string, string | undefined>, port: number): string =>
  env.BASE_URL ||
  (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  `http://localhost:${port}`;

export const loadEnvConfig = (): EnvConfig => {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const baseUrl = resolveBaseUrl(process.env, port);
  const frontendUrl = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  const databaseDriver = process.env.DATABASE_DRIVER || DEFAULT_DATABASE_DRIVER;
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || DEFAULT_RATE_LIMIT_MAX;

  return {
    port,
    baseUrl,
    frontendUrl,
    databaseUrl,
    databaseDriver,
    rateLimitMax
  };
};
