import { readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Variant } from "./ModelTab";
import { VARIANTS as volcanoes } from "@/app/weeks/week05/Model";
import { VARIANTS as plates } from "@/app/weeks/week08/Model";
import { VARIANTS as faults } from "@/app/weeks/week09/Model";
import { VARIANTS as streams } from "@/app/weeks/week13/Model";
import { VARIANTS as groundwater } from "@/app/weeks/week14/Model";
import { VARIANTS as erosion } from "@/app/weeks/week15/Model";

/** Every topic with a Model tab, by folder. Grows as models land. */
const MODELS: [string, Variant[]][] = [
  ["week05", volcanoes],
  ["week08", plates],
  ["week09", faults],
  ["week13", streams],
  ["week14", groundwater],
  ["week15", erosion],
];

const FORBIDDEN =
  /\b(risk\w*|danger\w*|hazard\w*|threat\w*|warning\w*|unsafe|safe|deadly|disaster\w*|catastroph\w*)\b/i;
const SENTENCE = /^[A-Z].*\.$/;

describe.each(MODELS)("%s model", (_folder, variants) => {
  it("has at least one variant with a unique id", () => {
    expect(variants.length).toBeGreaterThan(0);
    expect(new Set(variants.map((v) => v.id)).size).toBe(variants.length);
  });
  for (const v of variants) {
    it(`${v.id}: labelled svg, parts match the drawing, plain captions`, () => {
      const html = renderToStaticMarkup(
        createElement(v.Scene, { selected: null }),
      );
      expect(html).toContain('viewBox="0 0 400 260"');
      expect(html).toContain('role="img"');
      expect(html).toContain(
        `aria-label="${v.caption.replaceAll('"', "&quot;").replaceAll("'", "&#x27;")}"`,
      );
      const drawn = new Set(
        [...html.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]),
      );
      expect([...drawn].sort()).toEqual(v.parts.map((p) => p.id).sort());
      expect(new Set(v.parts.map((p) => p.id)).size).toBe(v.parts.length);
      for (const text of [v.caption, ...v.parts.map((p) => p.text)]) {
        expect(text).toMatch(SENTENCE);
        expect(text.match(FORBIDDEN)).toBeNull();
      }
    });
  }
});

it("every topic folder with a Model.tsx exports it lazily from index.ts and is listed here", () => {
  const folders = readdirSync(new URL("../weeks", import.meta.url)).filter(
    (f) => {
      try {
        return readdirSync(new URL(`../weeks/${f}`, import.meta.url)).includes(
          "Model.tsx",
        );
      } catch {
        return false;
      }
    },
  );
  expect(folders.sort()).toEqual(MODELS.map(([f]) => f).sort());
});
