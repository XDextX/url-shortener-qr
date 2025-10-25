import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { clearStore } from "../src/repositories/url.repository.js";
import { createShortUrl } from "../src/services/url.service.js";

describe("createShortUrl", () => {
  beforeEach(async () => {
    await clearStore();
  });

  afterAll(async () => {
    await clearStore();
  });

  it("genera el payload base con URL corta y QR", async () => {
    const result = await createShortUrl("https://example.com");

    expect(result.originalUrl).toBe("https://example.com");
    expect(result.shortUrl).toContain(result.code);
    expect(result.qrCodeDataUrl).toContain("data:image/png");
  });
});
