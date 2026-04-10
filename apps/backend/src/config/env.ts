export interface EnvConfig {
  port: number;
  baseUrl: string;
  frontendUrl: string;
  databaseUrl: string;
  databaseDriver: string;
}

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_DATABASE_URL = "file:./data/dev.db";
const DEFAULT_DATABASE_DRIVER = "sqlite";

export const loadEnvConfig = (): EnvConfig => {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  const frontendUrl = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  const databaseDriver = process.env.DATABASE_DRIVER || DEFAULT_DATABASE_DRIVER;

  return {
    port,
    baseUrl,
    frontendUrl,
    databaseUrl,
    databaseDriver
  };
};
