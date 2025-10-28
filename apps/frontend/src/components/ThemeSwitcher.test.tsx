import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderWithI18n } from "@/tests/render-with-i18n";
import { ThemeSwitcher } from "./ThemeSwitcher";

const THEME_STORAGE_KEY = "app_theme";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("renders translated label and options", () => {
    renderWithI18n(<ThemeSwitcher />);

    expect(screen.getByText("Theme")).toBeInTheDocument();

    const select = screen.getByRole("combobox");

    expect(select).toHaveValue("light");
    expect(screen.getByRole("option", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dark" })).toBeInTheDocument();
  });

  it("updates theme when selecting a new option", async () => {
    const user = userEvent.setup();

    renderWithI18n(<ThemeSwitcher />);

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "dark");

    expect(select).toHaveValue("dark");

    await waitFor(() => {
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    });

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });
});
