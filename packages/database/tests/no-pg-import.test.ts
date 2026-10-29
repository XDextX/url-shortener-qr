import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "src");

// Hand-written sources only: the generated Prisma client is not ours to police.
const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "generated" ? [] : sources(path);
    return path.endsWith(".ts") ? [path] : [];
  });

const stripComments = (code: string): string =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("database sources", () => {
  it("never import pg directly: Postgres goes through Prisma (spec 002, RF-5)", () => {
    const offenders = sources(SRC).filter((file) =>
      /from\s+["']pg["']|import\(\s*["']pg["']\s*\)|require\(\s*["']pg["']\s*\)/.test(
        stripComments(readFileSync(file, "utf8"))
      )
    );

    expect(offenders).toEqual([]);
  });
});
