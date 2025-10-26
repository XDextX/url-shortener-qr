/**
 * Represents a stored short URL entry inside the database.
 */
export interface UrlRecord {
  id: string;
  code: string;
  originalUrl: string;
  qrSvg: string | null;
  hits: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload required to create a new short URL entry.
 */
export interface InsertUrlInput {
  code: string;
  originalUrl: string;
  qrSvg?: string | null;
}

/**
 * Contract every database driver must fulfill so the application can
 * manage short URLs without being coupled to a specific engine.
 */
export interface DatabaseDriver {
  /**
   * Ensures the underlying schema exists before the driver is used.
   */
  ensure(): Promise<void>;

  /**
   * Persists a new short URL entry.
   */
  insert(input: InsertUrlInput): Promise<UrlRecord>;

  /**
   * Retrieves a record matched by its short code.
   */
  findByCode(code: string): Promise<UrlRecord | null>;

  /**
   * Retrieves a record matched by the original URL.
   */
  findByOriginalUrl(originalUrl: string): Promise<UrlRecord | null>;

  /**
   * Increments the number of hits for a stored URL.
   */
  incrementHits(code: string): Promise<boolean>;

  /**
   * Removes all records from the underlying store.
   */
  clear(): Promise<void>;

  /**
   * Returns the raw database connection when the driver exposes it.
   */
  getConnection?(): Promise<unknown> | unknown;
}
