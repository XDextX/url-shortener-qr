import { consumeRateLimit } from "@url-shortener/database";

/**
 * Counts one link creation for a client key in a window.
 * @param key - the hashed client key
 * @param windowStart - the start of the current window
 * @returns the key's creations in that window, this one included
 */
export const countCreation = (key: string, windowStart: Date): Promise<number> =>
  consumeRateLimit(key, windowStart);
