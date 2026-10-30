import {
  findUrlByCode,
  findUrlByOriginalUrl,
  incrementUrlHits,
  insertUrl,
  removeAllUrls,
  renewUrlExpiry
} from "@url-shortener/database";
import type { UrlRecord } from "@url-shortener/database";
import { nanoid } from "nanoid";

/**
 * Represents the data required to persist a short URL.
 */
export interface UrlEntity {
  code: string;
  originalUrl: string;
  expiresAt?: Date | null;
}

/**
 * Generates a random short code using nanoid.
 */
export const createShortCode = (): string => {
  return nanoid(8);
};

/**
 * Persists a new URL entity.
 */
export const saveUrl = async (entity: UrlEntity): Promise<UrlRecord> => {
  return insertUrl({
    code: entity.code,
    originalUrl: entity.originalUrl,
    expiresAt: entity.expiresAt ?? null
  });
};

/**
 * Finds a stored URL by its short code.
 */
export const findByCode = async (code: string): Promise<UrlRecord | null> => {
  return findUrlByCode(code);
};

/**
 * Finds a stored URL by its original URL.
 */
export const findByOriginalUrl = async (originalUrl: string): Promise<UrlRecord | null> => {
  return findUrlByOriginalUrl(originalUrl);
};

/**
 * Sets a stored URL's expiry (spec 007).
 */
export const renewExpiry = async (code: string, expiresAt: Date | null): Promise<UrlRecord | null> => {
  return renewUrlExpiry(code, expiresAt);
};

/**
 * Increments the hit counter for the given short code.
 */
export const incrementHits = async (code: string): Promise<void> => {
  await incrementUrlHits(code);
};

/**
 * Deletes every stored URL. Intended for test utilities only.
 */
export const clearStore = async (): Promise<void> => {
  await removeAllUrls();
};
