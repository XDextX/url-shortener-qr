/**
 * Valida que una URL sea válida, segura y en formato correcto.
 * Se ejecuta antes de guardar en la BD para prevenir URLs maliciosas.
 */

const MAX_URL_LENGTH = 2048;

/**
 * The input is not an acceptable URL: the caller answers 400, unlike a store failure.
 */
export class InvalidUrlError extends Error {
  name = "InvalidUrlError";
}

/**
 * Valida que una URL sea válida, segura y en formato correcto.
 * @param url - URL a validar
 * @throws InvalidUrlError si la URL no es válida
 */
export function validateUrl(url: string | undefined): asserts url is string {
  // 1. No vacío
  if (!url?.trim()) {
    throw new InvalidUrlError("URL no puede estar vacío");
  }

  // 2. Longitud máxima (URLs muy largas pueden ser maliciosas o problemáticas)
  if (url.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(`URL demasiado larga (máximo ${MAX_URL_LENGTH} caracteres)`);
  }

  // 3. Formato válido usando URL API
  try {
    const urlObj = new URL(url);

    // 4. Solo HTTP/HTTPS permitidos
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new InvalidUrlError("Solo se aceptan URLs HTTP/HTTPS");
    }
  } catch (error) {
    // Si el error es uno que elegimos lanzar, re-lazarlo
    if (error instanceof InvalidUrlError) {
      throw error;
    }
    // Si es error de URL() constructor, significa formato inválido
    throw new InvalidUrlError("URL inválida. Verifica el formato.");
  }
}
