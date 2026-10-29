import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "./client";

const ORIGIN = "https://app.vercel.app";

describe("resolveApiBaseUrl (spec 002, RF-1)", () => {
  it("prefers VITE_API_BASE_URL over everything", () => {
    expect(resolveApiBaseUrl({ VITE_API_BASE_URL: "https://api.example", PROD: true }, ORIGIN)).toBe(
      "https://api.example"
    );
  });

  it("uses the page's own origin in a production build", () => {
    expect(resolveApiBaseUrl({ PROD: true }, ORIGIN)).toBe(ORIGIN);
  });

  it("falls back to the local backend in development", () => {
    expect(resolveApiBaseUrl({ PROD: false }, ORIGIN)).toBe("http://localhost:3000");
  });
});
