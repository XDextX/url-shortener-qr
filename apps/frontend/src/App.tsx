import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShortUrlResponse } from "@api/client";
import { UrlForm } from "@components/UrlForm";
import { ResultCard } from "@components/ResultCard";
import { LanguageSwitcher } from "@components/LanguageSwitcher";
import { ThemeSwitcher } from "@components/ThemeSwitcher";

const App = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<ShortUrlResponse | null>(null);

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      <header className="bg-surface shadow transition-colors duration-200">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t("app.title")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("app.description")}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors duration-200">
          <UrlForm onSuccess={setResult} />
        </div>

        <div className="mt-6">
          <ResultCard result={result} />
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-text-secondary transition-colors duration-200">
        {t("app.footer")}
      </footer>
    </div>
  );
};

export default App;
