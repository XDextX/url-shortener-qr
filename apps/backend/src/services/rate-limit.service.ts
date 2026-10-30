import { createHash } from "node:crypto";
import { countCreation } from "../repositories/rate-limit.repository.js";

export const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * The start of the fixed window holding a moment.
 * @param now - the moment, in milliseconds since the epoch
 * @param windowMs - the window's length
 * @returns the window's start
 */
export const windowStart = (now: number, windowMs: number): Date => new Date(now - (now % windowMs));

/**
 * Whole seconds until the next window, at least one.
 * @param now - the moment, in milliseconds since the epoch
 * @param windowMs - the window's length
 * @returns the seconds a client must wait
 */
export const retryAfterSeconds = (now: number, windowMs: number): number =>
  Math.max(1, Math.ceil((windowMs - (now % windowMs)) / 1000));

/**
 * The key a client is counted under: a SHA-256 of its IP, so no raw address is stored.
 * @param ip - the client's IP
 * @returns 64 hex characters
 */
export const rateLimitKey = (ip: string): string => createHash("sha256").update(ip).digest("hex");

/**
 * Counts a link creation for a client and decides whether it may go ahead.
 * @param ip - the client's IP
 * @param now - the moment, in milliseconds since the epoch
 * @param max - the creations allowed per window
 * @returns `retryAfter` seconds when over the limit, otherwise null
 */
export const checkCreationQuota = async (
  ip: string,
  now: number,
  max: number
): Promise<{ retryAfter: number } | null> => {
  const count = await countCreation(rateLimitKey(ip), windowStart(now, RATE_LIMIT_WINDOW_MS));
  return count > max ? { retryAfter: retryAfterSeconds(now, RATE_LIMIT_WINDOW_MS) } : null;
};
