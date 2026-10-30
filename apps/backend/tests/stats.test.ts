import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";

const app = createApp();

beforeEach(async () => {
  await clearStore();
});

afterAll(async () => {
  await clearStore();
});

describe("link statistics (spec 006)", () => {
  it("carries hits and the creation date in the lookup (RF-1)", async () => {
    const created = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "https://example.com/stats" })
      .expect(201);
    const code = created.body.code as string;

    expect(created.body.hits).toBe(0);

    await request(app).get(`/${code}`).expect(302);
    await request(app).get(`/${code}`).expect(302);

    const lookup = await request(app).get(`/api/v1/urls/${code}`).expect(200);
    expect(lookup.body.hits).toBe(2);
    expect(Number.isNaN(Date.parse(lookup.body.createdAt))).toBe(false);
    expect(lookup.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
