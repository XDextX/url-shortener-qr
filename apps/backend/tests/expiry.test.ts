import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";

const app = createApp();
const HOUR = 3_600_000;
const create = (originalUrl: string, expiresIn?: string) =>
  request(app).post("/api/v1/urls").send(expiresIn === undefined ? { originalUrl } : { originalUrl, expiresIn });

beforeEach(async () => {
  // Only Date is faked: supertest still needs real timers.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-29T12:00:00.000Z"));
  await clearStore();
});

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  await clearStore();
});

describe("link expiry (spec 007)", () => {
  it("stores the expiry as creation plus the lifetime (RF-1)", async () => {
    const response = await create("https://example.com/hour", "1h").expect(201);

    expect(Date.parse(response.body.expiresAt) - Date.parse(response.body.createdAt)).toBe(HOUR);
  });

  it("has no expiry without a lifetime", async () => {
    const response = await create("https://example.com/forever").expect(201);

    expect(response.body.expiresAt).toBeNull();
  });

  it("answers 400 for an unknown lifetime (RF-2)", async () => {
    const response = await create("https://example.com/bad", "2h").expect(400);

    expect(response.body.message).toBeTruthy();
  });

  it("redirects while the link is live (RF-3)", async () => {
    const { body } = await create("https://example.com/live", "1h").expect(201);

    await request(app).get(`/${body.code}`).expect(302);
  });

  it("answers 410 once the link expired, without counting a hit (RF-4)", async () => {
    const { body } = await create("https://example.com/gone", "1h").expect(201);

    vi.setSystemTime(new Date("2026-10-29T13:00:01.000Z"));
    await request(app).get(`/${body.code}`).expect(410);

    const lookup = await request(app).get(`/api/v1/urls/${body.code}`).expect(200);
    expect(lookup.body.hits).toBe(0);
  });

  it("renews an expired link with its code when the URL is shortened again (RF-5)", async () => {
    const first = await create("https://example.com/renew", "1h").expect(201);

    vi.setSystemTime(new Date("2026-10-29T14:00:00.000Z"));
    const again = await create("https://example.com/renew", "1d").expect(201);

    expect(again.body.code).toBe(first.body.code);
    expect(Date.parse(again.body.expiresAt)).toBe(Date.parse("2026-10-30T14:00:00.000Z"));
    await request(app).get(`/${first.body.code}`).expect(302);
  });

  it("returns a live link unchanged whatever lifetime is asked", async () => {
    const first = await create("https://example.com/keep").expect(201);

    const again = await create("https://example.com/keep", "1h").expect(201);
    expect(again.body.expiresAt).toBeNull();
    expect(again.body.code).toBe(first.body.code);
  });
});
