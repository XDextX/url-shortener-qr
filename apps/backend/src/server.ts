import { config } from "dotenv";
import { ensureDatabase } from "@url-shortener/database";
import createApp from "./app.js";
import { loadEnvConfig } from "./config/env.js";

config();

const { port } = loadEnvConfig();
const app = createApp();

await ensureDatabase();

app.listen(port, () => {
  console.log(`URL Shortener API listening on http://localhost:${port}`);
});
