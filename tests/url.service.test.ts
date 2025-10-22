import { describe, expect, it } from "vitest";
import { createShortUrl } from "../src/services/url.service.js";

describe("createShortUrl", () => {
  it("genera el payload base con URL corta y QR", async () => {
    const result = await createShortUrl("https://example.com");

    expect(result.originalUrl).toBe("https://example.com");
    expect(result.shortUrl).toContain(result.code);
    expect(result.qrCodeDataUrl).toContain("data:image/png");
  });
});
