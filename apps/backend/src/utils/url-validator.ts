const MAX_URL_LENGTH = 2048;

/**
 * The input is not an acceptable URL: the caller answers 400, unlike a store failure.
 */
export class InvalidUrlError extends Error {
  name = "InvalidUrlError";
}

/**
 * Checks a URL before it is stored: present, within the length limit, well formed, HTTP or HTTPS.
 * @param url - the URL to check
 * @throws InvalidUrlError when it is not acceptable
 */
export function validateUrl(url: string | undefined): asserts url is string {
  if (!url?.trim()) {
    throw new InvalidUrlError("URL must not be empty.");
  }

  if (url.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(`URL is too long (maximum ${MAX_URL_LENGTH} characters).`);
  }

  try {
    const urlObj = new URL(url);

    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new InvalidUrlError("Only HTTP and HTTPS URLs are accepted.");
    }
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      throw error;
    }
    throw new InvalidUrlError("Invalid URL format.");
  }
}
