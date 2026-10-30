import { describe, expect, it } from "vitest";
import en from "./resources/en/common.json";
import es from "./resources/es/common.json";

/**
 * Every leaf key of a nested translation object, as dotted paths.
 * @param node - the translation object
 * @param prefix - the path so far
 * @returns the sorted key paths
 */
const keys = (node: object, prefix = ""): string[] =>
  Object.entries(node)
    .flatMap(([key, value]) =>
      typeof value === "object" && value !== null ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`]
    )
    .sort();

describe("locales (constitution rule 7)", () => {
  it("has the same keys in English and Spanish", () => {
    expect(keys(es)).toEqual(keys(en));
  });
});
