import { createShortCode, saveUrl, findByCode } from "../repositories/url.repository.js";
import { generateQrCode } from "../utils/qr-generator.js";
import { loadEnvConfig } from "../config/env.js";

const { baseUrl } = loadEnvConfig();

export interface ShortUrlPayload {
  code: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeDataUrl: string;
}

export const createShortUrl = async (originalUrl: string): Promise<ShortUrlPayload> => {
  const code = createShortCode();
  await saveUrl({ code, originalUrl });

  const shortUrl = `${baseUrl}/${code}`;
  const qrCodeDataUrl = await generateQrCode(shortUrl);

  return {
    code,
    shortUrl,
    originalUrl,
    qrCodeDataUrl
  };
};

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
