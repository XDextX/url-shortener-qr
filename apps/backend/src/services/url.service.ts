import {
  createShortCode,
  saveUrl,
  findByCode,
  findByOriginalUrl,
  incrementHits
} from "../repositories/url.repository.js";
import { generateQrCode } from "../utils/qr-generator.js";
import { loadEnvConfig } from "../config/env.js";

const { baseUrl } = loadEnvConfig();

/**
 * Shape returned by service methods when dealing with short URLs.
 */
export interface ShortUrlPayload {
  code: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Creates a short URL for the provided original address. If the URL already
 * exists, the stored record is reused to avoid generating duplicate codes.
 */
export const createShortUrl = async (originalUrl: string): Promise<ShortUrlPayload> => {
  const existing = await findByOriginalUrl(originalUrl);
  const record =
    existing ??
    (await saveUrl({
      code: createShortCode(),
      originalUrl
    }));

  const shortUrl = `${baseUrl}/${record.code}`;
  const qrCodeDataUrl = record.qrSvg ?? (await generateQrCode(shortUrl));

  return {
    code: record.code,
    shortUrl,
    originalUrl: record.originalUrl,
    qrCodeDataUrl
  };
};

/**
 * Retrieves a previously stored URL by its short code, including the QR code.
 */
export const findOriginalUrl = async (code: string): Promise<ShortUrlPayload | null> => {
  const stored = await findByCode(code);

  if (!stored) {
    return null;
  }

  const shortUrl = `${baseUrl}/${code}`;
  const qrCodeDataUrl = await generateQrCode(shortUrl);

  return {
    code,
    shortUrl,
    originalUrl: stored.originalUrl,
    qrCodeDataUrl
  };
};

/**
 * Resolves and registers a hit for the requested short code.
 */
export const resolveOriginalUrl = async (code: string): Promise<string | null> => {
  const stored = await findByCode(code);

  if (!stored) {
    return null;
  }

  await incrementHits(code);

  return stored.originalUrl;
};
