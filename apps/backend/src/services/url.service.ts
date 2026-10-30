import {
  createShortCode,
  saveUrl,
  findByCode,
  findByOriginalUrl,
  incrementHits,
  renewExpiry
} from "../repositories/url.repository.js";
import type { UrlRecord } from "@url-shortener/database";
import { InvalidUrlError } from "../utils/url-validator.js";
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
  expiresAt: string | null;
}

/** The lifetimes a link may be given (spec 007), in milliseconds. */
export const LIFETIMES: Record<string, number> = {
  "1h": 3_600_000,
  "1d": 86_400_000,
  "7d": 604_800_000,
  "30d": 2_592_000_000
};

/**
 * The expiry a new link gets.
 * @param now - the creation moment, in milliseconds since the epoch
 * @param expiresIn - one of LIFETIMES' keys, or undefined for no expiry
 * @returns the expiry, or null for none
 * @throws InvalidUrlError for a lifetime that is not allowed, so the API answers 400
 */
export const expiresAtFrom = (now: number, expiresIn: string | undefined): Date | null => {
  if (expiresIn === undefined) {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(LIFETIMES, expiresIn)) {
    throw new InvalidUrlError(`expiresIn must be one of ${Object.keys(LIFETIMES).join(", ")}.`);
  }
  return new Date(now + LIFETIMES[expiresIn]);
};

/**
 * Whether a link has stopped redirecting.
 * @param record - the link, with its expiry
 * @param now - the moment to check, in milliseconds since the epoch
 * @returns true once the expiry is in the past
 */
export const isExpired = (record: Pick<UrlRecord, "expiresAt">, now: number): boolean =>
  record.expiresAt !== null && record.expiresAt.getTime() <= now;

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
 * @param expiresIn - a lifetime from LIFETIMES (spec 007), or none for a link that never expires
 * @param now - the creation moment, in milliseconds since the epoch
 * @throws AliasConflictError when the alias is taken or the URL already has another code
 * @throws InvalidUrlError when the lifetime is not allowed
 */
export const createShortUrl = async (
  originalUrl: string,
  alias?: string,
  expiresIn?: string,
  now: number = Date.now()
): Promise<ShortUrlPayload> => {
  const expiresAt = expiresAtFrom(now, expiresIn);
  const existing = await findByOriginalUrl(originalUrl);

  if (alias && existing && existing.code !== alias) {
    throw new AliasConflictError(`This URL already has a short link: ${existing.code}`);
  }
  if (alias && !existing && (await findByCode(alias))) {
    throw new AliasConflictError(`The alias "${alias}" is already taken.`);
  }

  // A live link keeps its expiry, or anyone could cut another person's link short; an expired one is renewed.
  const renewed = existing && isExpired(existing, now) ? await renewExpiry(existing.code, expiresAt) : null;
  const record =
    renewed ??
    existing ??
    (await saveUrl({
      code: alias ?? createShortCode(),
      originalUrl,
      expiresAt
    }));

  const shortUrl = `${baseUrl}/${record.code}`;
  const qrCodeDataUrl = record.qrSvg ?? (await generateQrCode(shortUrl));

  return {
    code: record.code,
    shortUrl,
    originalUrl: record.originalUrl,
    qrCodeDataUrl,
    hits: record.hits,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt?.toISOString() ?? null
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
    createdAt: stored.createdAt.toISOString(),
    expiresAt: stored.expiresAt?.toISOString() ?? null
  };
};

/**
 * Resolves and registers a hit for the requested short code.
 * @param code - the short code
 * @param now - the moment of the request, in milliseconds since the epoch
 * @returns the URL to redirect to, "expired" for an expired link (no hit counted), or null when unknown
 */
export const resolveOriginalUrl = async (
  code: string,
  now: number = Date.now()
): Promise<{ url: string } | "expired" | null> => {
  const stored = await findByCode(code);

  if (!stored) {
    return null;
  }
  if (isExpired(stored, now)) {
    return "expired";
  }

  await incrementHits(code);

  return { url: stored.originalUrl };
};
