import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";

const app = createApp();
const create = (originalUrl: string, alias?: string) =>
  request(app).post("/api/v1/urls").send(alias === undefined ? { originalUrl } : { originalUrl, alias });

beforeEach(async () => {
  await clearStore();
});

afterAll(async () => {
  await clearStore();
});

describe("POST /api/v1/urls with an alias (spec 005)", () => {
  it("creates the link under a valid, free alias (RF-1)", async () => {
    const response = await create("https://example.com/talk", "my-talk_2026").expect(201);

    expect(response.body.code).toBe("my-talk_2026");
    expect(response.body.shortUrl).toMatch(/\/my-talk_2026$/);
    await request(app).get("/my-talk_2026").expect(302).expect("Location", "https://example.com/talk");
  });

  it.each([
    ["too short", "ab"],
    ["too long", "a".repeat(33)],
    ["a bad character", "my talk"],
    ["a reserved word", "api"]
  ])("answers 400 for an alias that is %s (RF-2)", async (_case, alias) => {
    const response = await create("https://example.com/x", alias).expect(400);
    expect(response.body.message).toBeTruthy();
  });

  it("answers 409 when the alias is taken (RF-3)", async () => {
    await create("https://example.com/one", "taken").expect(201);

    const response = await create("https://example.com/two", "taken").expect(409);
    expect(response.body.message).toBeTruthy();
  });

  it("answers 409 naming the existing code when the URL already has one (RF-4)", async () => {
    const first = await create("https://example.com/same").expect(201);

    const response = await create("https://example.com/same", "other-alias").expect(409);
    expect(response.body.message).toContain(first.body.code);
  });

  it("returns the existing link when the URL already has that alias", async () => {
    await create("https://example.com/again", "again").expect(201);

    const response = await create("https://example.com/again", "again").expect(201);
    expect(response.body.code).toBe("again");
  });
});
