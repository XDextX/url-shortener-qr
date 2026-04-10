/**
 * Valida que una URL sea válida, segura y en formato correcto.
 * Se ejecuta antes de guardar en la BD para prevenir URLs maliciosas.
 */

const MAX_URL_LENGTH = 2048;

/**
 * Valida que una URL sea válida, segura y en formato correcto.
 * @param url - URL a validar
 * @throws Error si la URL no es válida
 */
export const validateUrl = (url: string): void => {
  // 1. No vacío
  if (!url?.trim()) {
    throw new Error("URL no puede estar vacío");
  }

  // 2. Longitud máxima (URLs muy largas pueden ser maliciosas o problemáticas)
  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL demasiado larga (máximo ${MAX_URL_LENGTH} caracteres)`);
  }

  // 3. Formato válido usando URL API
  try {
    const urlObj = new URL(url);

    // 4. Solo HTTP/HTTPS permitidos
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error("Solo se aceptan URLs HTTP/HTTPS");
    }
  } catch (error) {
    // Si el error es uno que elegimos lanzar, re-lazarlo
    if (error instanceof Error && error.message.startsWith("Solo")) {
      throw error;
    }
    // Si es error de URL() constructor, significa formato inválido
    throw new Error("URL inválida. Verifica el formato.");
  }
};
