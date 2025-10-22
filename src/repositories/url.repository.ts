import { nanoid } from "nanoid";

interface UrlEntity {
  code: string;
  originalUrl: string;
}

const memoryStore = new Map<string, UrlEntity>();

export const createShortCode = (): string => {
  return nanoid(8);
};

export const saveUrl = async (entity: UrlEntity): Promise<void> => {
  memoryStore.set(entity.code, entity);
};

export const findByCode = async (code: string): Promise<UrlEntity | undefined> => {
  return memoryStore.get(code);
};
