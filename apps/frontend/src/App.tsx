import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShortUrlResponse } from "@api/client";
import { UrlForm } from "@components/UrlForm";
import { ResultCard } from "@components/ResultCard";
import { LanguageSwitcher } from "@components/LanguageSwitcher";

const App = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<ShortUrlResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("app.title")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("app.description")}</p>
          </div>

          <LanguageSwitcher />
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

      <footer className="pb-6 text-center text-xs text-slate-500">{t("app.footer")}</footer>
    </div>
  );
};

export default App;
