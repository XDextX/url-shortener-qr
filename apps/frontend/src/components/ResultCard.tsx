import { useState } from "react";
import { ShortUrlResponse } from "@api/client";
import { Button } from "@components/Button";

interface Props {
  result: ShortUrlResponse | null;
}

export const ResultCard = ({ result }: Props) => {
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

  const copyLabel =
    copyState === "success" ? "URL copiada" : copyState === "error" ? "Error al copiar" : "Copiar URL";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Tu enlace está listo</h2>
      <p className="mt-2 text-sm text-slate-600">{result.originalUrl}</p>

      <div className="mt-4">
        <span className="text-sm font-semibold text-slate-700">URL corta</span>
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-indigo-600 hover:underline"
        >
          {result.shortUrl}
        </a>
        <Button
          type="button"
          onClick={handleCopy}
          loading={copying}
          loadingText="Copiando..."
          className="mt-3 w-full sm:w-auto"
        >
          {copyLabel}
        </Button>
        {copyState === "error" ? (
          <p className="mt-1 text-xs text-red-600">No se pudo copiar automáticamente. Inténtalo manualmente.</p>
        ) : null}
      </div>

      <div className="mt-6">
        <span className="text-sm font-semibold text-slate-700">Código QR</span>
        <div className="mt-2 flex justify-center">
          <img
            src={result.qrCodeDataUrl}
            alt="Código QR de la URL acortada"
            className="h-48 w-48 rounded-md border border-slate-200 bg-white p-2"
          />
        </div>
      </div>
    </div>
  );
};
