export interface EnvConfig {
  port: number;
  baseUrl: string;
  frontendUrl: string;
}

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";

export const loadEnvConfig = (): EnvConfig => {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  const frontendUrl = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

  return {
    port,
    baseUrl,
    frontendUrl
  };
};
