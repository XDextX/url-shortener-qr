import { useState } from "react";
import { ShortUrlResponse } from "./api/client";
import { UrlForm } from "./components/UrlForm";
import { ResultCard } from "./components/ResultCard";

const App = () => {
  const [result, setResult] = useState<ShortUrlResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-800">URL Shortener + QR</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa una URL larga y obtén un link corto con su QR listo para descargar o compartir.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <UrlForm onSuccess={setResult} />
        </div>

        <div className="mt-6">
          <ResultCard result={result} />
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-slate-500">
        Construido con React + Vite · API base en Node.js
      </footer>
    </div>
  );
};

export default App;
