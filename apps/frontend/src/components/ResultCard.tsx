import { ShortUrlResponse } from "@api/client";

interface Props {
  result: ShortUrlResponse | null;
}

export const ResultCard = ({ result }: Props) => {
  if (!result) {
    return null;
  }

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
