import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError, fetchLinkStats, type ShortUrlResponse } from "@api/client";
import { Button } from "@components/Button";

interface Props {
  /** A code to look up as soon as it changes, such as the link just created. */
  requestedCode?: string | null;
}

type State =
  | { status: "idle" | "loading" | "notFound" | "error" }
  | { status: "found"; link: ShortUrlResponse };

/**
 * The code a lookup input names: the last path segment of a short URL, or the trimmed input.
 * @param input - a bare code or a full short URL
 * @returns the code, empty when the input is
 */
export const codeFromInput = (input: string): string => {
  const trimmed = input.trim();
  try {
    return new URL(trimmed).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return trimmed;
  }
};

/**
 * Looks up a short link and shows its original URL, hits and creation date (spec 006).
 */
export const LinkStats = ({ requestedCode }: Props) => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const lookUp = async (code: string) => {
    if (!code) {
      return;
    }
    setState({ status: "loading" });
    try {
      setState({ status: "found", link: await fetchLinkStats(code) });
    } catch (error) {
      setState({ status: error instanceof ApiError && error.status === 404 ? "notFound" : "error" });
    }
  };

  useEffect(() => {
    if (requestedCode) {
      setInput(requestedCode);
      void lookUp(requestedCode);
    }
  }, [requestedCode]);

  const formatDate = (iso: string): string =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookUp(codeFromInput(input));
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-6 transition-colors duration-200">
      <h2 className="text-lg font-semibold text-text-primary">{t("stats.title")}</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-text-primary">
          {t("stats.inputLabel")}
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("stats.placeholder")}
            className="field"
          />
        </label>
        <Button type="submit" loading={state.status === "loading"} loadingText={t("stats.loading")}>
          {t("stats.submit")}
        </Button>
      </form>

      {state.status === "found" ? (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-semibold text-text-primary">{t("stats.originalUrl")}</dt>
          <dd className="break-all text-text-secondary">{state.link.originalUrl}</dd>
          <dt className="font-semibold text-text-primary">{t("stats.hitsLabel")}</dt>
          <dd className="text-text-secondary">{t("stats.hits", { count: state.link.hits })}</dd>
          <dt className="font-semibold text-text-primary">{t("stats.createdAt")}</dt>
          <dd className="text-text-secondary">{formatDate(state.link.createdAt)}</dd>
          <dt className="font-semibold text-text-primary">{t("stats.expiresLabel")}</dt>
          <dd className="text-text-secondary">
            {state.link.expiresAt === null
              ? t("stats.never")
              : Date.parse(state.link.expiresAt) <= Date.now()
                ? t("stats.expiredOn", { date: formatDate(state.link.expiresAt) })
                : formatDate(state.link.expiresAt)}
          </dd>
        </dl>
      ) : null}
      {state.status === "notFound" ? <p className="mt-4 text-sm text-error">{t("stats.notFound")}</p> : null}
      {state.status === "error" ? <p className="mt-4 text-sm text-error">{t("stats.error")}</p> : null}
    </section>
  );
};
