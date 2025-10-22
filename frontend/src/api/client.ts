export interface ShortUrlResponse {
  code: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeDataUrl: string;
}

const DEFAULT_BASE_URL = "http://localhost:3000";

const getBaseApiUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
};

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
