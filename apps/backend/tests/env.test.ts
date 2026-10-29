import { describe, expect, it } from "vitest";
import { resolveBaseUrl } from "../src/config/env.js";

describe("resolveBaseUrl (spec 002, RF-2)", () => {
  it("prefers BASE_URL over everything", () => {
    expect(
      resolveBaseUrl({ BASE_URL: "https://short.example", VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" }, 3000)
    ).toBe("https://short.example");
  });

  it("falls back to Vercel's production origin", () => {
    expect(resolveBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" }, 3000)).toBe(
      "https://app.vercel.app"
    );
  });

  it("falls back to localhost on the given port", () => {
    expect(resolveBaseUrl({}, 4000)).toBe("http://localhost:4000");
  });
});
