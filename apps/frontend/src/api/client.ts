export interface ShortUrlResponse {
  code: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeDataUrl: string;
}

const DEFAULT_BASE_URL = "http://localhost:3000";

/**
 * Decides the origin the API is called on.
 * @param env - `VITE_API_BASE_URL` and whether this is a production build
 * @param origin - the page's own origin
 * @returns the variable, else the page's origin in production (same-origin on Vercel), else localhost
 */
export const resolveApiBaseUrl = (
  env: { VITE_API_BASE_URL?: string; PROD: boolean },
  origin: string
): string => env.VITE_API_BASE_URL || (env.PROD ? origin : DEFAULT_BASE_URL);

const getBaseApiUrl = (): string => resolveApiBaseUrl(import.meta.env, window.location.origin);

export const createShortUrl = async (originalUrl: string): Promise<ShortUrlResponse> => {
  const response = await fetch(`${getBaseApiUrl()}/api/v1/urls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ originalUrl })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Error al crear el short URL");
  }

  return response.json();
};
