import { Router } from "express";
import {
  createShortUrlHandler,
  getUrlByCodeHandler,
  limitCreationHandler
} from "../controllers/url.controller.js";

const router = Router();

router.post("/", limitCreationHandler, createShortUrlHandler);
router.get("/:code", getUrlByCodeHandler);

export default router;
