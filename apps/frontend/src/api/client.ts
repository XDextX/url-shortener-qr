export interface ShortUrlResponse {
  code: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeDataUrl: string;
  hits: number;
  createdAt: string;
  /** When the link stops redirecting (spec 007); null when it never does. */
  expiresAt: string | null;
}

/**
 * An API answer that was not 2xx, carrying its HTTP status so callers can tell causes apart.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
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

/**
 * Asks the API for a short link.
 * @param originalUrl - the URL to shorten
 * @param alias - a chosen code (spec 005); omitted from the request when undefined
 * @param expiresIn - a lifetime such as "1d" (spec 007); omitted when undefined
 * @returns the short link and its QR
 * @throws ApiError with the HTTP status on a non-2xx answer
 */
export const createShortUrl = async (
  originalUrl: string,
  alias?: string,
  expiresIn?: string
): Promise<ShortUrlResponse> => {
  const response = await fetch(`${getBaseApiUrl()}/api/v1/urls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ originalUrl, alias, expiresIn })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(errorBody.message ?? "Could not create the short link.", response.status);
  }

  return response.json();
};

/**
 * Asks the API for a link's statistics (spec 006).
 * @param code - the short link's code
 * @returns the link, with its hits and creation date
 * @throws ApiError with the HTTP status on a non-2xx answer, 404 when no link has that code
 */
export const fetchLinkStats = async (code: string): Promise<ShortUrlResponse> => {
  const response = await fetch(`${getBaseApiUrl()}/api/v1/urls/${encodeURIComponent(code)}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(errorBody.message ?? "Lookup failed", response.status);
  }

  return response.json();
};
