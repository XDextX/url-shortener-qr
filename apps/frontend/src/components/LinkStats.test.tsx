import "@testing-library/jest-dom/vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchLinkStats, type ShortUrlResponse } from "@api/client";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { codeFromInput, LinkStats } from "./LinkStats";

vi.mock("@api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@api/client")>()),
  fetchLinkStats: vi.fn()
}));

const stats = (hits: number): ShortUrlResponse => ({
  code: "abc12345",
  shortUrl: "https://short.example/abc12345",
  originalUrl: "https://example.com/talk",
  qrCodeDataUrl: "data:image/png;base64,",
  hits,
  createdAt: "2026-10-29T12:00:00.000Z"
});

/**
 * Types into the lookup and submits it.
 * @param input - what the visitor pastes
 */
const lookUp = async (input: string) => {
  const user = userEvent.setup();
  renderWithI18n(<LinkStats />);
  await user.type(screen.getByLabelText(/short link or code/i), input);
  await user.click(screen.getByRole("button", { name: /show statistics/i }));
};

describe("codeFromInput (spec 006)", () => {
  it.each([
    ["abc12345", "abc12345"],
    ["  abc12345  ", "abc12345"],
    ["https://short.example/abc12345", "abc12345"],
    ["https://short.example/abc12345/", "abc12345"]
  ])("reads %j as %j", (input, code) => {
    expect(codeFromInput(input)).toBe(code);
  });
});

describe("LinkStats (spec 006)", () => {
  beforeEach(() => {
    vi.mocked(fetchLinkStats).mockReset();
  });

  it("shows the original URL, hits and date for a pasted short link (RF-2, RF-4)", async () => {
    vi.mocked(fetchLinkStats).mockResolvedValue(stats(2));
    await lookUp("  https://short.example/abc12345  ");

    expect(fetchLinkStats).toHaveBeenCalledWith("abc12345");
    expect(await screen.findByText("2 visits")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/talk")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("uses the singular for one hit (RF-4)", async () => {
    vi.mocked(fetchLinkStats).mockResolvedValue(stats(1));
    await lookUp("abc12345");

    expect(await screen.findByText("1 visit")).toBeInTheDocument();
  });

  it("says when no link has that code (RF-3)", async () => {
    vi.mocked(fetchLinkStats).mockRejectedValue(new ApiError("not found", 404));
    await lookUp("missing0");

    expect(await screen.findByText(/no link has that code/i)).toBeInTheDocument();
  });
});
