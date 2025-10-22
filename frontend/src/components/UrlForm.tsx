import { FormEvent, useState } from "react";
import { createShortUrl, ShortUrlResponse } from "../api/client";

interface Props {
  onSuccess: (payload: ShortUrlResponse) => void;
}

export const UrlForm = ({ onSuccess }: Props) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      setError("Ingresa una URL válida");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createShortUrl(url.trim());
      onSuccess(result);
      setUrl("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-slate-700">
        URL original
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://ejemplo.com"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        disabled={loading}
      >
        {loading ? "Generando..." : "Generar short URL"}
      </button>
    </form>
  );
};
