import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Set before any module loads, and dotenv never overrides: no local .env can point tests at a file.
    env: { DATABASE_DRIVER: "sqlite", DATABASE_URL: ":memory:" }
  }
});
