import { describe, expect, it } from "vitest";
import css from "../index.css?raw";

// Grows task by task as each component is redesigned; every component by the last one.
const REDESIGNED = ["Button"];
const SOURCES = import.meta.glob<string>("../components/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true
});
const source = (name: string): string => SOURCES[`../components/${name}.tsx`];

// The palette the spec fixes, read from the Portfolio's theme files (spec 009).
const PALETTE = {
  light: {
    background: "#FBFCFD",
    surface: "#FFFFFF",
    border: "#DCE2E9",
    "control-border": "#848F9F",
    "text-primary": "#16202C",
    "text-secondary": "#566274",
    accent: "#7A5D10",
    "accent-contrast": "#FFFFFF",
    error: "#B3261E",
    focus: "#243972"
  },
  dark: {
    background: "#243972",
    surface: "#2B4372",
    border: "#3A578F",
    "control-border": "#7D93C2",
    "text-primary": "#F5F7FA",
    "text-secondary": "#A9B6CD",
    accent: "#E3C770",
    "accent-contrast": "#243972",
    error: "#F2B8B5",
    focus: "#F5F7FA"
  }
};

type Theme = keyof typeof PALETTE;

/**
 * The `--color-*` tokens of one theme, as hex.
 * @param theme - the theme to read from index.css
 * @returns token name to uppercase hex colour
 */
const tokens = (theme: Theme): Record<string, string> => {
  const selector = theme === "light" ? ":root" : '[data-theme="dark"]';
  const block = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
  return Object.fromEntries(
    [...block.matchAll(/--color-([\w-]+):\s*(\d+) (\d+) (\d+);/g)].map((m) => [
      m[1],
      `#${[m[2], m[3], m[4]].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase()}`
    ])
  );
};

/**
 * The WCAG contrast ratio of two colours.
 * @param a - a hex colour
 * @param b - another hex colour
 * @returns the ratio, from 1 to 21
 */
const contrast = (a: string, b: string): number => {
  const luminance = (hex: string): number => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

describe("design tokens (spec 009)", () => {
  it("computes WCAG contrast correctly", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
    expect(contrast("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 2);
    expect(contrast("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });

  describe.each(["light", "dark"] as const)("%s theme", (theme) => {
    const palette = tokens(theme);

    it("holds the Portfolio palette (RF-1)", () => {
      expect(palette).toMatchObject(PALETTE[theme]);
    });

    it.each([
      ["text-primary", "background"],
      ["text-primary", "surface"],
      ["text-secondary", "background"],
      ["text-secondary", "surface"],
      ["accent", "surface"],
      ["accent-contrast", "accent"],
      ["error", "surface"]
    ])("%s on %s reaches 4.5:1 (RF-2)", (foreground, ground) => {
      expect(contrast(palette[foreground], palette[ground])).toBeGreaterThanOrEqual(4.5);
    });

    it.each(["background", "surface"])("control-border on %s reaches 3:1 (RF-2)", (ground) => {
      expect(contrast(palette["control-border"], palette[ground])).toBeGreaterThanOrEqual(3);
    });
  });

  it.each(REDESIGNED)("%s draws no shadow and nothing lifts (RF-3, RF-4)", (name) => {
    expect(source(name)).not.toMatch(/\bshadow\b|shadow-|translate-/);
  });

  it("loads the self-hosted IBM Plex Sans", () => {
    expect(css).toMatch(/font-family:\s*"IBM Plex Sans"/);
    expect(css).toContain("/fonts/IBMPlexSans-latin.woff2");
  });
});
