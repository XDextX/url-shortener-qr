import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import createApp from "../src/app.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const README = readFileSync(join(ROOT, "README.md"), "utf8").replace(/\r\n/g, "\n");
const DEMO = "https://url-shortener-qr-three.vercel.app";
const SECTIONS = [
  "Overview",
  "Architecture",
  "API",
  "Running locally",
  "Testing",
  "Deploying",
  "Roadmap",
  "License and contact"
];
const WORKSPACES = ["package.json", "apps/backend/package.json", "apps/frontend/package.json", "packages/database/package.json"];

/**
 * The `## ` headings of a Markdown document, in order.
 * @param md - the document
 * @returns each heading's text
 */
const headings = (md: string): string[] => [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

/**
 * The text under one `## ` heading, up to the next one.
 * @param md - the document
 * @param title - the heading's text
 * @returns the section's body, empty when the heading is missing
 */
const section = (md: string, title: string): string =>
  md.split(/^## /m).find((part) => part.startsWith(`${title}\n`))?.slice(title.length) ?? "";

/**
 * The routes the API section documents, from its `**METHOD** \`path\`` lines.
 * @param md - the README
 * @returns `METHOD path` pairs
 */
const documentedRoutes = (md: string): string[] =>
  [...section(md, "API").matchAll(/\*\*(GET|POST|PUT|PATCH|DELETE)\*\* `([^`]+)`/g)].map((m) => `${m[1]} ${m[2]}`);

type Layer = {
  name: string;
  regexp: RegExp;
  route?: { path: string; methods: Record<string, boolean> };
  handle: { stack?: Layer[] };
};

/**
 * The routes an Express 4 app registers, mounted routers included.
 * @param app - the app built by createApp
 * @returns `METHOD path` pairs
 */
const registeredRoutes = (app: unknown): string[] => {
  const walk = (stack: Layer[], prefix: string): string[] =>
    stack.flatMap((layer) => {
      if (layer.route) {
        const path = `${prefix}${layer.route.path === "/" && prefix ? "" : layer.route.path}`;
        return Object.keys(layer.route.methods).map((method) => `${method.toUpperCase()} ${path}`);
      }
      if (layer.name === "router" && layer.handle.stack) {
        // Express 4 keeps a mount path only as its regexp: ^\/api\/v1\/urls\/?(?=\/|$)
        const mount = layer.regexp.source.replace(/^\^/, "").replace("\\/?(?=\\/|$)", "").replace(/\\\//g, "/");
        return walk(layer.handle.stack, `${prefix}${mount}`);
      }
      return [];
    });
  return walk((app as { _router: { stack: Layer[] } })._router.stack, "");
};

const npmScripts = (md: string): string[] => [...md.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);

/**
 * Backticked repository paths: a `/` inside, no space, not a route, URL or placeholder.
 * @param md - the README
 * @returns the paths, relative to the repository root
 */
const repoPaths = (md: string): string[] =>
  [...md.matchAll(/`([^`\s]+)`/g)]
    .map((m) => m[1])
    .filter((token) => token.includes("/") && !/^\/|^[a-z]+:|^@|[<>*]/.test(token));

describe("README (spec 003)", () => {
  const opening = README.split(/^## /m)[0];

  it("opens with the demo link and a screenshot with alt text (RF-2)", () => {
    expect(opening).toContain(DEMO);
    const image = opening.match(/!\[([^\]]+)\]\(([^)]+)\)/);
    expect(image?.[1].trim().length).toBeGreaterThan(10);
    const file = join(ROOT, image?.[2] ?? "missing");
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThan(300 * 1024);
  });

  it("has its sections in order (RF-3)", () => {
    expect(headings(README)).toEqual(SECTIONS);
  });

  it("documents exactly the routes the backend registers (RF-4)", () => {
    expect(documentedRoutes(README).sort()).toEqual(registeredRoutes(createApp()).sort());
  });

  it("names only npm scripts that exist (RF-5)", () => {
    const scripts = new Set(
      WORKSPACES.flatMap((file) => Object.keys(JSON.parse(readFileSync(join(ROOT, file), "utf8")).scripts ?? {}))
    );
    expect(npmScripts(README).filter((name) => !scripts.has(name))).toEqual([]);
  });

  it("names only paths that exist (RF-5)", () => {
    expect(repoPaths(README).filter((path) => !existsSync(join(ROOT, path)))).toEqual([]);
  });

  it("has no generic sections and no decorative emoji (RF-6)", () => {
    expect(README).not.toMatch(/^#+ .*(contribut|troubleshoot)/im);
    expect(README).not.toMatch(/^\s*(#+\s+|[-*]\s+)\p{Extended_Pictographic}/mu);
  });

  it("keeps a contact email and the licence (RF-7)", () => {
    const contact = section(README, "License and contact");
    expect(contact).toMatch(/[\w.+-]+@[\w-]+\.\w+/);
    expect(contact).toMatch(/\bMIT\b/);
  });

  it("lists at most four roadmap items (RF-8)", () => {
    const items = section(README, "Roadmap").match(/^[-*] /gm) ?? [];
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(4);
  });

  it("ships the licence it claims (spec 008, RF-5)", () => {
    const licence = join(ROOT, "LICENSE");
    expect(existsSync(licence)).toBe(true);
    expect(readFileSync(licence, "utf8")).toMatch(/^MIT License/);
  });

  it("names only paths that exist in the architecture document (spec 008, RF-6)", () => {
    const architecture = readFileSync(join(ROOT, "docs", "architecture.md"), "utf8");
    expect(repoPaths(architecture).filter((path) => !existsSync(join(ROOT, path)))).toEqual([]);
  });

  it("stays short enough to skim (NFR: at most 250 lines)", () => {
    expect(README.split("\n").length).toBeLessThanOrEqual(250);
  });
});
