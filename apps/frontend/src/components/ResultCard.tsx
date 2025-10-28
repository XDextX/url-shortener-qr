import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShortUrlResponse } from "@api/client";
import { Button } from "@components/Button";

interface Props {
  result: ShortUrlResponse | null;
}

export const ResultCard = ({ result }: Props) => {
  const { t } = useTranslation();
  const [copying, setCopying] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  
  if (!result) {
    return null;
  }

  const handleCopy = async () => {
    if (copying) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("error");
      return;
    }

    try {
      setCopying(true);
      await navigator.clipboard.writeText(result.shortUrl);
      setCopyState("success");
    } catch (error) {
      setCopyState("error");
    } finally {
      setCopying(false);
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const getCopyLabel = (): string => {
    if (copyState === "success") {
      return t("result.copy.success");
    }

    if (copyState === "error") {
      return t("result.copy.error");
    }

    return t("result.copy.action");
  };

  const copyLabel = getCopyLabel();

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors duration-200">
      <h2 className="text-lg font-semibold text-text-primary">{t("result.title")}</h2>
      <p className="mt-2 text-sm text-text-secondary">{result.originalUrl}</p>

      <div className="mt-4">
        <span className="text-sm font-semibold text-text-primary">{t("result.shortUrl")}</span>
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-accent hover:text-accent-hover hover:underline"
        >
          {result.shortUrl}
        </a>
        <Button
          type="button"
          onClick={handleCopy}
          loading={copying}
          loadingText={t("result.copy.loading")}
          className="mt-3 w-full sm:w-auto"
        >
          {copyLabel}
        </Button>
        {copyState === "error" ? (
          <p className="mt-1 text-xs text-accent">{t("result.copy.errorHelper")}</p>
        ) : null}
      </div>

      <div className="mt-6">
        <span className="text-sm font-semibold text-text-primary">{t("result.qr")}</span>
        <div className="mt-2 flex justify-center">
          <img
            src={result.qrCodeDataUrl}
            alt={t("result.qr")}
            className="h-48 w-48 rounded-md border border-border bg-surface p-2"
          />
        </div>
      </div>
    </div>
  );
};
