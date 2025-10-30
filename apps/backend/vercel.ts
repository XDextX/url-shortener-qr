import { config } from "dotenv";
import { ensureDatabase } from "@url-shortener/database";
import createApp from "./src/app.js";

config();

await ensureDatabase();

export default createApp();
