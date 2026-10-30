import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseDriver } from "../src/contracts.js";

// Set before the SQLite driver loads: it falls back to the tracked dev.db otherwise.
process.env.DATABASE_URL = ":memory:";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

/**
 * The behaviour every DatabaseDriver must share, run against one driver.
 * @param name - label shown in the test report
 * @param create - builds the driver under test
 */
const contract = (name: string, create: () => Promise<DatabaseDriver>, skip = false): void => {
  describe.skipIf(skip)(`${name} driver contract`, () => {
    let driver: DatabaseDriver;

    beforeAll(async () => {
      driver = await create();
      await driver.ensure();
    });

    beforeEach(async () => {
      await driver.clear();
    });

    afterAll(async () => {
      await driver?.clear();
    });

    it("inserts a record with no hits", async () => {
      const record = await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });

      expect(record).toMatchObject({
        code: "abc12345",
        originalUrl: "https://example.com/a",
        qrSvg: null,
        hits: 0
      });
      expect(record.createdAt).toBeInstanceOf(Date);
    });

    it("finds a record by code, and null for an unknown code", async () => {
      await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });

      expect((await driver.findByCode("abc12345"))?.originalUrl).toBe("https://example.com/a");
      expect(await driver.findByCode("missing0")).toBeNull();
    });

    it("finds a record by original URL, and null for an unknown one", async () => {
      await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });

      expect((await driver.findByOriginalUrl("https://example.com/a"))?.code).toBe("abc12345");
      expect(await driver.findByOriginalUrl("https://example.com/none")).toBeNull();
    });

    it("increments hits on a known code", async () => {
      await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });

      expect(await driver.incrementHits("abc12345")).toBe(true);
      expect((await driver.findByCode("abc12345"))?.hits).toBe(1);
    });

    it("reports false when incrementing an unknown code", async () => {
      expect(await driver.incrementHits("missing0")).toBe(false);
    });

    it("stores no expiry unless one is given (spec 007)", async () => {
      const record = await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });

      expect(record.expiresAt).toBeNull();
      expect((await driver.findByCode("abc12345"))?.expiresAt).toBeNull();
    });

    it("stores and renews an expiry (spec 007)", async () => {
      const first = new Date("2026-01-01T01:00:00.000Z");
      const renewed = new Date("2026-02-01T01:00:00.000Z");
      const record = await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a", expiresAt: first });

      expect(record.expiresAt?.toISOString()).toBe(first.toISOString());
      expect((await driver.findByCode("abc12345"))?.expiresAt?.toISOString()).toBe(first.toISOString());

      expect((await driver.renewExpiry("abc12345", renewed))?.expiresAt?.toISOString()).toBe(renewed.toISOString());
      expect((await driver.findByOriginalUrl("https://example.com/a"))?.expiresAt?.toISOString()).toBe(
        renewed.toISOString()
      );
      expect((await driver.renewExpiry("abc12345", null))?.expiresAt).toBeNull();
      expect(await driver.renewExpiry("missing0", renewed)).toBeNull();
    });

    it("counts per key and window, restarting in a new window (spec 004)", async () => {
      const first = new Date("2026-01-01T00:00:00.000Z");
      const next = new Date("2026-01-01T00:01:00.000Z");

      expect(await driver.consumeRateLimit("client-a", first)).toBe(1);
      expect(await driver.consumeRateLimit("client-a", first)).toBe(2);
      expect(await driver.consumeRateLimit("client-b", first)).toBe(1);
      expect(await driver.consumeRateLimit("client-a", next)).toBe(1);
    });

    it("clears the rate limit counts too", async () => {
      const window = new Date("2026-01-01T00:00:00.000Z");
      await driver.consumeRateLimit("client-a", window);
      await driver.clear();

      expect(await driver.consumeRateLimit("client-a", window)).toBe(1);
    });

    it("clears every record", async () => {
      await driver.insert({ code: "abc12345", originalUrl: "https://example.com/a" });
      await driver.clear();

      expect(await driver.findByCode("abc12345")).toBeNull();
    });
  });
};

contract("sqlite", async () => (await import("../src/sqlite-driver.js")).createSqliteDriver());

// Runs only against a real Postgres (a Neon development branch); skipped, never passed, without one.
contract(
  "prisma",
  async () => (await import("../src/prisma-driver.js")).createPrismaDriver(TEST_DATABASE_URL),
  !TEST_DATABASE_URL
);
