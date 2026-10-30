import { FormEvent, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ApiError, createShortUrl, ShortUrlResponse } from "@api/client";
import { Button } from "@components/Button";

// Repeated in apps/backend/src/utils/alias-validator.ts: change both together (spec 005).
const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
// The lifetimes the API accepts (spec 007); an empty value means the link never expires.
const LIFETIMES = ["1h", "1d", "7d", "30d"];

interface Props {
  onSuccess: (payload: ShortUrlResponse) => void;
}

/**
 * Checks a URL before calling the API, so these errors are in the visitor's language.
 * @returns Error message if invalid, null if valid
 */
const validateUrl = (url: string, t: TFunction): string | null => {
  const trimmed = url.trim();

  // Check if empty
  if (!trimmed) {
    return t("form.error.empty");
  }

  // Check length
  if (trimmed.length > 2048) {
    return t("form.error.tooLong");
  }

  // Check format
  try {
    const urlObj = new URL(trimmed);

    // Only HTTP/HTTPS
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return t("form.error.protocol");
    }

    return null; // Valid
  } catch {
    return t("form.error.invalid");
  }
};

export const UrlForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate on client side
    const validationError = validateUrl(url, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    const chosenAlias = alias.trim() || undefined;
    if (chosenAlias && !ALIAS_PATTERN.test(chosenAlias)) {
      setError(t("form.error.aliasInvalid"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createShortUrl(url.trim(), chosenAlias, expiresIn || undefined);
      onSuccess(result);
      setUrl("");
      setAlias("");
      setExpiresIn("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("form.error.rateLimited"));
        return;
      }
      if (err instanceof ApiError && err.status === 409) {
        setError(t("form.error.aliasTaken"));
        return;
      }
      setError(t("form.error.server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-text-primary">
        {t("form.label")}
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={t("form.placeholder")}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          required
        />
      </label>
      <label className="block text-sm font-semibold text-text-primary">
        {t("form.aliasLabel")}
        <input
          type="text"
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          placeholder={t("form.aliasPlaceholder")}
          aria-describedby="alias-hint"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <span id="alias-hint" className="mt-1 block text-xs font-normal text-text-secondary">
          {t("form.aliasHint")}
        </span>
      </label>
      <label className="block text-sm font-semibold text-text-primary">
        {t("form.expiresLabel")}
        <select
          value={expiresIn}
          onChange={(event) => setExpiresIn(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">{t("form.expires.never")}</option>
          {LIFETIMES.map((lifetime) => (
            <option key={lifetime} value={lifetime}>
              {t(`form.expires.${lifetime}`)}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <Button type="submit" loading={loading} loadingText={t("form.loading")}>
        {t("form.submit")}
      </Button>
    </form>
  );
};
