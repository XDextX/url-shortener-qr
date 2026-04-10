import { Request, Response } from "express";
import { createShortUrl, findOriginalUrl, resolveOriginalUrl } from "../services/url.service.js";
import { validateUrl } from "../utils/url-validator.js";

export const createShortUrlHandler = async (req: Request, res: Response): Promise<void> => {
  const { originalUrl } = req.body as { originalUrl?: string };

  try {
    validateUrl(originalUrl);
    const payload = await createShortUrl(originalUrl);
    res.status(201).json(payload);
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ message });
  }
};

export const getUrlByCodeHandler = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;

  try {
    const result = await findOriginalUrl(code);

    if (!result) {
      res.status(404).json({ message: "Codigo no encontrado" });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "No fue posible recuperar la URL", error: (error as Error).message });
  }
};

export const redirectToOriginalHandler = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;

  try {
    const originalUrl = await resolveOriginalUrl(code);

    if (!originalUrl) {
      res.status(404).send("No existe un short URL con ese codigo");
      return;
    }

    res.redirect(302, originalUrl);
  } catch (error) {
    res.status(500).send(`Error al redirigir: ${(error as Error).message}`);
  }
};
