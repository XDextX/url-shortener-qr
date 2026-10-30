import request from "supertest";
import {
  getActiveDatabaseDriverName,
  registerDatabaseDriver,
  setDatabaseDriver
} from "@url-shortener/database";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import createApp from "../src/app.js";
import { clearStore } from "../src/repositories/url.repository.js";

process.env.FRONTEND_URL = "https://frontend.example";

const app = createApp();

beforeEach(async () => {
  await clearStore();
});

afterAll(async () => {
  await clearStore();
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

  it("GET / redirige al frontend configurado", async () => {
    await request(app).get("/").expect(302).expect("Location", "https://frontend.example");
  });
});

const unreachable = async (): Promise<never> => {
  throw new Error("connect ECONNREFUSED internal-host:5432");
};

registerDatabaseDriver("unreachable", async () => ({
  ensure: unreachable,
  insert: unreachable,
  findByCode: unreachable,
  findByOriginalUrl: unreachable,
  incrementHits: unreachable,
  consumeRateLimit: unreachable,
  clear: unreachable
}));

/**
 * Runs a request with every store call failing, then restores the previous driver.
 * @param run - the request to make while the store is down
 */
const withUnreachableStore = async (run: () => Promise<unknown>): Promise<void> => {
  const previous = getActiveDatabaseDriverName();
  setDatabaseDriver("unreachable");
  try {
    await run();
  } finally {
    setDatabaseDriver(previous);
  }
};

describe("URL creation errors (spec 002, RF-8)", () => {
  it("POST /api/v1/urls answers 500 with only a message when the store fails", async () => {
    await withUnreachableStore(async () => {
      const response = await request(app)
        .post("/api/v1/urls")
        .send({ originalUrl: "https://example.com/down" })
        .expect(500);

      expect(Object.keys(response.body)).toEqual(["message"]);
      expect(response.body.message).not.toContain("ECONNREFUSED");
    });
  });

  it("POST /api/v1/urls still answers 400 for an invalid URL", async () => {
    const response = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "ftp://example.com" })
      .expect(400);

    expect(response.body.message).toBeTruthy();
  });
});

describe("Lookup and redirect errors (spec 003, RF-4)", () => {
  it("GET /:code answers 404 for an unknown code", async () => {
    await request(app).get("/unknown0").expect(404);
  });

  it("GET /api/v1/urls/:code answers 500 when the store fails", async () => {
    await withUnreachableStore(() => request(app).get("/api/v1/urls/abc12345").expect(500));
  });

  it("GET /:code answers 500 when the store fails", async () => {
    await withUnreachableStore(() => request(app).get("/abc12345").expect(500));
  });
});
