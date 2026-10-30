import { InvalidUrlError } from "./url-validator.js";

// Repeated in apps/frontend/src/components/UrlForm.tsx: change both together (spec 005).
export const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const RESERVED_ALIASES = ["api", "health", "assets"];

/**
 * Checks a requested alias against the alias rule and the paths the app serves itself.
 * @param alias - the code the visitor asked for
 * @throws InvalidUrlError when the alias is not acceptable, so the API answers 400
 */
export function validateAlias(alias: string): void {
  if (!ALIAS_PATTERN.test(alias)) {
    throw new InvalidUrlError("Alias must be 3-32 letters, digits, - or _.");
  }
  if (RESERVED_ALIASES.includes(alias.toLowerCase())) {
    throw new InvalidUrlError(`"${alias}" is reserved.`);
  }
}
