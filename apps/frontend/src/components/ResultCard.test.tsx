import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShortUrlResponse } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { ResultCard } from "./ResultCard";

const sampleResult: ShortUrlResponse = {
  code: "abc12345",
  shortUrl: "https://short.ly/abc12345",
  originalUrl: "https://example.com/very-long-url",
  qrCodeDataUrl: "data:image/svg+xml;base64,PHN2ZyB2ZXJ5IGZha2U+PC9zdmc+"
};

describe("ResultCard", () => {
  let clipboardMock: { writeText: ReturnType<typeof vi.fn> };
  const originalClipboard = navigator.clipboard;
  const originalNavigator = navigator;

  beforeEach(() => {
    clipboardMock = {
      writeText: vi.fn(async () => {})
    };

    Object.defineProperty(window.navigator, "clipboard", {
      value: clipboardMock,
      configurable: true
    });
    Object.defineProperty(globalThis, "navigator", {
      value: window.navigator,
      configurable: true
    });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(window.navigator, "clipboard", {
        value: originalClipboard,
        configurable: true
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).clipboard;
    }

    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true
    });
  });

  it("renders nothing when there is no result", () => {
    const { container } = renderWithI18n(<ResultCard result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("copies the short URL to the clipboard", async () => {
    const user = userEvent.setup();

    renderWithI18n(<ResultCard result={sampleResult} />);

    const copyButton = screen.getByRole("button", { name: /copy url/i });

    await user.click(copyButton);

    await waitFor(() => expect(copyButton).toHaveTextContent(/url copied/i));
    expect(screen.queryByText(/automatic copy failed/i)).not.toBeInTheDocument();
  });
});
