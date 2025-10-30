import express, { Application } from "express";
import cors from "cors";
import urlRoutes from "./routes/url.routes.js";
import { redirectToOriginalHandler } from "./controllers/url.controller.js";
import { loadEnvConfig } from "./config/env.js";

export const createApp = (): Application => {
  const app = express();
  const { frontendUrl } = loadEnvConfig();

  app.use(cors());
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
