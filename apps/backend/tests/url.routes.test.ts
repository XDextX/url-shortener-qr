import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@url-shortener/database";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";

const app = createApp();

beforeEach(async () => {
  await clearStore();
});

afterAll(async () => {
  await clearStore();
  await prisma.$disconnect();
});

describe("URL routes", () => {
  it("POST /api/v1/urls crea un short URL con QR", async () => {
    const response = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "https://example.com" })
      .expect(201);

    expect(response.body.originalUrl).toBe("https://example.com");
    expect(response.body.shortUrl).toContain(response.body.code);
    expect(response.body.qrCodeDataUrl).toContain("data:image/png");
  });

  it("GET /api/v1/urls/:code retorna la URL original y el QR", async () => {
    const createResponse = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "https://example.com/test" })
      .expect(201);

    const code = createResponse.body.code as string;

    const fetchResponse = await request(app).get(`/api/v1/urls/${code}`).expect(200);

    expect(fetchResponse.body.originalUrl).toBe("https://example.com/test");
    expect(fetchResponse.body.shortUrl).toContain(code);
    expect(fetchResponse.body.qrCodeDataUrl).toContain("data:image/png");
  });

  it("GET /api/v1/urls/:code devuelve 404 si no existe", async () => {
    await request(app).get("/api/v1/urls/not-found").expect(404);
  });

  it("GET /:code redirige a la URL original", async () => {
    const createResponse = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "https://example.com/redirect" })
      .expect(201);

    const code = createResponse.body.code as string;

    await request(app).get(`/${code}`).expect(302).expect("Location", "https://example.com/redirect");
  });
});
