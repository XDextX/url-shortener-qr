import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ShortUrlResponse } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { ResultCard } from "./ResultCard";

const sampleResult: ShortUrlResponse = {
  code: "abc12345",
  shortUrl: "https://short.ly/abc12345",
  originalUrl: "https://example.com/very-long-url",
  qrCodeDataUrl: "data:image/svg+xml;base64,PHN2ZyB2ZXJ5IGZha2U+PC9zdmc+",
  hits: 0,
  createdAt: "2026-10-29T12:00:00.000Z",
  expiresAt: null
};

describe("ResultCard", () => {
  it("renders nothing when there is no result", () => {
    const { container } = renderWithI18n(<ResultCard result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("copies the short URL to the clipboard", async () => {
    const user = userEvent.setup();
    // setup() installs its own navigator.clipboard, so spy after it, not before.
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

    renderWithI18n(<ResultCard result={sampleResult} />);

    const copyButton = screen.getByRole("button", { name: /copy url/i });

    await user.click(copyButton);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(sampleResult.shortUrl));
    await waitFor(() => expect(copyButton).toHaveTextContent(/url copied/i));
    expect(screen.queryByText(/automatic copy failed/i)).not.toBeInTheDocument();
  });
});
