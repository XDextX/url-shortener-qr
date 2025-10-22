import { Router } from "express";
import { createShortUrlHandler, getUrlByCodeHandler } from "../controllers/url.controller.js";

const router = Router();

router.post("/", createShortUrlHandler);
router.get("/:code", getUrlByCodeHandler);

export default router;
