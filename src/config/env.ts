export interface EnvConfig {
  port: number;
  baseUrl: string;
}

const DEFAULT_PORT = 3000;

export const loadEnvConfig = (): EnvConfig => {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

  return {
    port,
    baseUrl
  };
};
