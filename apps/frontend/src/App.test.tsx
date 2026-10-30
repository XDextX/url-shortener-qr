import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createShortUrl, fetchLinkStats } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import App from "./App";

vi.mock("@api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@api/client")>()),
  createShortUrl: vi.fn(),
  fetchLinkStats: vi.fn()
}));

describe("App (spec 006)", () => {
  it("opens the new link's statistics from the result card (RF-5)", async () => {
    const link = {
      code: "abc12345",
      shortUrl: "https://short.example/abc12345",
      originalUrl: "https://example.com/talk",
      qrCodeDataUrl: "data:image/png;base64,",
      hits: 0,
      createdAt: "2026-10-29T12:00:00.000Z",
      expiresAt: null
    };
    vi.mocked(createShortUrl).mockResolvedValue(link);
    vi.mocked(fetchLinkStats).mockResolvedValue({ ...link, hits: 3 });
    const user = userEvent.setup();

    renderWithI18n(<App />);
    await user.type(screen.getByLabelText(/original url/i), "https://example.com/talk");
    await user.click(screen.getByRole("button", { name: /generate short url/i }));
    await user.click(await screen.findByRole("button", { name: /view statistics/i }));

    expect(fetchLinkStats).toHaveBeenCalledWith("abc12345");
    expect(await screen.findByText("3 visits")).toBeInTheDocument();
  });
});
