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
  hits: number;
  createdAt: string;
}

/**
 * The requested alias cannot be used: another link has it, or the URL already has another code.
 */
export class AliasConflictError extends Error {
  name = "AliasConflictError";
}

/**
 * Creates a short URL for the provided original address. If the URL already
 * exists, the stored record is reused to avoid generating duplicate codes.
 * @param originalUrl - the validated URL to shorten
 * @param alias - a validated code chosen by the visitor (spec 005), or none for a random one
 * @throws AliasConflictError when the alias is taken or the URL already has another code
 */
export const createShortUrl = async (originalUrl: string, alias?: string): Promise<ShortUrlPayload> => {
  const existing = await findByOriginalUrl(originalUrl);

  if (alias && existing && existing.code !== alias) {
    throw new AliasConflictError(`This URL already has a short link: ${existing.code}`);
  }
  if (alias && !existing && (await findByCode(alias))) {
    throw new AliasConflictError(`The alias "${alias}" is already taken.`);
  }

  const record =
    existing ??
    (await saveUrl({
      code: alias ?? createShortCode(),
      originalUrl
    }));

  const shortUrl = `${baseUrl}/${record.code}`;
  const qrCodeDataUrl = record.qrSvg ?? (await generateQrCode(shortUrl));

  return {
    code: record.code,
    shortUrl,
    originalUrl: record.originalUrl,
    qrCodeDataUrl,
    hits: record.hits,
    createdAt: record.createdAt.toISOString()
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
    qrCodeDataUrl,
    hits: stored.hits,
    createdAt: stored.createdAt.toISOString()
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
