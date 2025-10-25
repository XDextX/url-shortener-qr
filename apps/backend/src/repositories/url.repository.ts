import { findUrlByCode, incrementUrlHits, insertUrl, removeAllUrls } from "@url-shortener/database";
import type { UrlRecord } from "@url-shortener/database";
import { nanoid } from "nanoid";

export interface UrlEntity {
  code: string;
  originalUrl: string;
}

export const createShortCode = (): string => {
  return nanoid(8);
};

export const saveUrl = async (entity: UrlEntity): Promise<UrlRecord> => {
  return insertUrl({
    code: entity.code,
    originalUrl: entity.originalUrl
  });
};

export const findByCode = async (code: string): Promise<UrlRecord | null> => {
  return findUrlByCode(code);
};

export const incrementHits = async (code: string): Promise<void> => {
  await incrementUrlHits(code);
};

export const clearStore = async (): Promise<void> => {
  await removeAllUrls();
};
