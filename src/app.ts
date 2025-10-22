import express, { Application } from "express";
import cors from "cors";
import urlRoutes from "./routes/url.routes.js";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/v1/urls", urlRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
};

export default createApp;
