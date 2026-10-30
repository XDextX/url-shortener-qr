import { NextFunction, Request, Response } from "express";
import {
  AliasConflictError,
  createShortUrl,
  findOriginalUrl,
  resolveOriginalUrl
} from "../services/url.service.js";
import { validateAlias } from "../utils/alias-validator.js";
import { InvalidUrlError, validateUrl } from "../utils/url-validator.js";
import { checkCreationQuota } from "../services/rate-limit.service.js";
import { loadEnvConfig } from "../config/env.js";

const CREATE_FAILED_MESSAGE = "Could not create the short link.";
const NOT_FOUND_MESSAGE = "No short link has that code.";

/**
 * Lets a link creation through while its client is under the limit (spec 004).
 * Answers 429 with Retry-After over the limit, and 500 when the count cannot be read.
 */
export const limitCreationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exceeded = await checkCreationQuota(req.ip ?? "unknown", Date.now(), loadEnvConfig().rateLimitMax);
    if (exceeded) {
      res.setHeader("Retry-After", String(exceeded.retryAfter));
      res.status(429).json({ message: `Too many links created. Try again in ${exceeded.retryAfter} seconds.` });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: CREATE_FAILED_MESSAGE });
    return;
  }
  next();
};

export const createShortUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { originalUrl, alias, expiresIn } = req.body as {
    originalUrl?: string;
    alias?: string;
    expiresIn?: string;
  };

  try {
    validateUrl(originalUrl);
    if (alias !== undefined) {
      validateAlias(String(alias));
    }
    const payload = await createShortUrl(originalUrl, alias, expiresIn === undefined ? undefined : String(expiresIn));
    res.status(201).json(payload);
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof AliasConflictError) {
      res.status(409).json({ message: error.message });
      return;
    }
    // A store failure: the internal error text stays in the server log, never in the response.
    console.error(error);
    res.status(500).json({ message: CREATE_FAILED_MESSAGE });
  }
};

export const getUrlByCodeHandler = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;

  try {
    const result = await findOriginalUrl(code);

    if (!result) {
      res.status(404).json({ message: NOT_FOUND_MESSAGE });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not look up the short link." });
  }
};

export const redirectToOriginalHandler = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;

  try {
    const resolved = await resolveOriginalUrl(code);

    if (!resolved) {
      res.status(404).send(NOT_FOUND_MESSAGE);
      return;
    }
    if (resolved === "expired") {
      res.status(410).send("This short link has expired.");
      return;
    }

    res.redirect(302, resolved.url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not follow the short link.");
  }
};
