import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";
import { rateLimitKey, retryAfterSeconds, windowStart } from "../src/services/rate-limit.service.js";

const app = createApp();
const create = (ip: string, path: string) =>
  request(app)
    .post("/api/v1/urls")
    .set("X-Forwarded-For", ip)
    .send({ originalUrl: `https://example.com/${path}` });

describe("rate limit helpers (spec 004)", () => {
  it("starts the window at the whole minute", () => {
    expect(windowStart(Date.parse("2026-01-01T00:00:42.500Z"), 60_000).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z"
    );
  });

  it("waits until the next window, at least one second", () => {
    expect(retryAfterSeconds(Date.parse("2026-01-01T00:00:42.500Z"), 60_000)).toBe(18);
    expect(retryAfterSeconds(Date.parse("2026-01-01T00:00:59.999Z"), 60_000)).toBe(1);
  });

  it("keys a client by a hash, never the raw IP (RF-6)", () => {
    const key = rateLimitKey("203.0.113.7");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain("203.0.113.7");
  });
});

describe("POST /api/v1/urls rate limit (spec 004)", () => {
  beforeAll(() => {
    process.env.RATE_LIMIT_MAX = "3";
  });

  afterAll(async () => {
    delete process.env.RATE_LIMIT_MAX;
    await clearStore();
  });

  beforeEach(async () => {
    await clearStore();
  });

  it("accepts creations up to the limit, then answers 429 with Retry-After (RF-1, RF-2)", async () => {
    for (const path of ["a", "b", "c"]) {
      await create("203.0.113.7", path).expect(201);
    }

    const response = await create("203.0.113.7", "d").expect(429);
    const retryAfter = Number(response.headers["retry-after"]);

    expect(response.body.message).toBeTruthy();
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it("counts each client separately (RF-3)", async () => {
    for (const path of ["a", "b", "c", "d"]) {
      await create("203.0.113.7", path);
    }

    await create("198.51.100.9", "e").expect(201);
  });
});
