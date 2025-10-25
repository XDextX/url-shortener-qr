export interface UrlRecord {
  id: string;
  code: string;
  originalUrl: string;
  qrSvg: string | null;
  hits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUrlInput {
  code: string;
  originalUrl: string;
  qrSvg?: string | null;
}

export interface DatabaseDriver {
  ensure(): Promise<void>;
  insert(input: InsertUrlInput): Promise<UrlRecord>;
  findByCode(code: string): Promise<UrlRecord | null>;
  incrementHits(code: string): Promise<boolean>;
  clear(): Promise<void>;
  getConnection?(): Promise<unknown> | unknown;
}
