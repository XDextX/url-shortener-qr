import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createShortUrl } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { UrlForm } from "./UrlForm";

vi.mock("@api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@api/client")>()),
  createShortUrl: vi.fn()
}));

const sample = {
  code: "my-alias",
  shortUrl: "https://short.example/my-alias",
  originalUrl: "https://example.com",
  qrCodeDataUrl: "data:image/png;base64,",
  hits: 0,
  createdAt: "2026-10-29T12:00:00.000Z"
};

/**
 * Fills the form and submits it.
 * @param alias - typed into the alias field when given
 */
const submit = async (alias?: string) => {
  const user = userEvent.setup();
  renderWithI18n(<UrlForm onSuccess={vi.fn()} />);
  await user.type(screen.getByLabelText(/original url/i), "https://example.com");
  if (alias) {
    await user.type(screen.getByLabelText(/custom alias/i), alias);
  }
  await user.click(screen.getByRole("button", { name: /generate short url/i }));
};

describe("UrlForm", () => {
  beforeEach(() => {
    vi.mocked(createShortUrl).mockReset();
  });

  it("asks the visitor to wait when the API answers 429 (spec 004, RF-5)", async () => {
    vi.mocked(createShortUrl).mockRejectedValueOnce(new ApiError("Too many links created.", 429));
    await submit();

    expect(await screen.findByText(/too many links in a short time/i)).toBeInTheDocument();
  });

  it("sends the alias when one is typed, and none otherwise (spec 005, RF-5)", async () => {
    vi.mocked(createShortUrl).mockResolvedValue(sample);

    await submit("my-alias");
    expect(createShortUrl).toHaveBeenLastCalledWith("https://example.com", "my-alias");

    document.body.innerHTML = "";
    await submit();
    expect(createShortUrl).toHaveBeenLastCalledWith("https://example.com", undefined);
  });

  it("says the alias is taken when the API answers 409 (spec 005, RF-6)", async () => {
    vi.mocked(createShortUrl).mockRejectedValueOnce(new ApiError("taken", 409));
    await submit("taken");

    expect(await screen.findByText(/alias is already taken/i)).toBeInTheDocument();
  });

  it("rejects an alias that breaks the rule before calling the API (spec 005, RF-6)", async () => {
    await submit("my alias");

    expect(await screen.findByText(/the alias must be 3 to 32/i)).toBeInTheDocument();
    expect(createShortUrl).not.toHaveBeenCalled();
  });
});
