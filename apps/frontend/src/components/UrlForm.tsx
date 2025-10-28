import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { createShortUrl, ShortUrlResponse } from "@api/client";
import { Button } from "@components/Button";

interface Props {
  onSuccess: (payload: ShortUrlResponse) => void;
}

export const UrlForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      setError(t("form.error"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createShortUrl(url.trim());
      onSuccess(result);
      setUrl("");
    } catch (err) {
      const message = (err as Error).message?.trim();
      setError(message && message.length > 0 ? message : t("form.error"));
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
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <Button type="submit" loading={loading} loadingText={t("form.loading")}>
        {t("form.submit")}
      </Button>
    </form>
  );
};
