import express, { Application } from "express";
import cors from "cors";
import urlRoutes from "./routes/url.routes.js";
import { redirectToOriginalHandler } from "./controllers/url.controller.js";
import { loadEnvConfig } from "./config/env.js";

export const createApp = (): Application => {
  const app = express();
  // One proxy hop (Vercel's edge), so req.ip is the client it reports, not an address the client chose.
  app.set("trust proxy", 1);
  const { frontendUrl } = loadEnvConfig();

  // Configure CORS to only allow requests from the configured frontend URL
  const corsOptions = {
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  };
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use("/api/v1/urls", urlRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (_req, res) => {
    res.redirect(frontendUrl);
  });

  app.get("/:code", redirectToOriginalHandler);

  return app;
};

export default createApp;
