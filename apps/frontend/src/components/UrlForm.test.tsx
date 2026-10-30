import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError, createShortUrl } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { UrlForm } from "./UrlForm";

vi.mock("@api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@api/client")>()),
  createShortUrl: vi.fn()
}));

describe("UrlForm", () => {
  it("asks the visitor to wait when the API answers 429 (spec 004, RF-5)", async () => {
    vi.mocked(createShortUrl).mockRejectedValueOnce(new ApiError("Too many links created.", 429));
    const user = userEvent.setup();

    renderWithI18n(<UrlForm onSuccess={vi.fn()} />);
    await user.type(screen.getByRole("textbox"), "https://example.com");
    await user.click(screen.getByRole("button", { name: /generate short url/i }));

    expect(await screen.findByText(/too many links in a short time/i)).toBeInTheDocument();
  });
});
