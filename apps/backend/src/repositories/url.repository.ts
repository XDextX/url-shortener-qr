import { prisma, Prisma, Url, ensureDatabase } from "@url-shortener/database";
import { nanoid } from "nanoid";

export interface UrlEntity {
  code: string;
  originalUrl: string;
}

export const createShortCode = (): string => {
  return nanoid(8);
};

export const saveUrl = async (entity: UrlEntity): Promise<Url> => {
  await ensureDatabase();

  return prisma.url.create({
    data: {
      code: entity.code,
      originalUrl: entity.originalUrl
    }
  });
};

export const findByCode = async (code: string): Promise<Url | null> => {
  await ensureDatabase();

  return prisma.url.findUnique({
    where: { code }
  });
};

export const incrementHits = async (code: string): Promise<void> => {
  await ensureDatabase();

  try {
    await prisma.url.update({
      where: { code },
      data: {
        hits: {
          increment: 1
        },
        updatedAt: new Date()
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return;
    }
    throw error;
  }
};

export const clearStore = async (): Promise<void> => {
  await ensureDatabase();

  await prisma.url.deleteMany();
};
