// Tests for the text rules of openspec/changes/bibliography-workspace/specs/bibliography-copy/spec.md:
// Copying the whole list, and Copying the whole list is blocked by an unformatted entry (HD-2, HD-3, HD-8, AS-12).
// Expected texts are the approved texts of the golden oracle or are written by hand; none comes from the formatter.
import { describe, expect, test } from "vitest";
import { approvedText, EM_DASH, ES, goldenPublication, NUMERO, TE } from "@/lib/bibliography/__fixtures__/golden";
import { bibliographyText } from "@/lib/bibliography/bibliography-text";
import type { Workspace } from "@/lib/bibliography/workspace";
import { normalizeDoi } from "@/lib/doi/normalize-doi";
import type { Publication } from "@/lib/publication/publication";

const listOf = (...publications: Publication[]): Workspace => ({
  entries: publications.map((publication) => ({ publication })),
});

const GF01 = goldenPublication("GF01");
const GF03 = goldenPublication("GF03");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06"); // no date: cannot be formatted
const GF08 = goldenPublication("GF08");

// A second entry that cannot be formatted, with a DOI of its own: GF01 without its title.
const untitled = (): Publication => {
  const normalized = normalizeDoi("10.0000/workspace.untitled");
  if (!normalized.ok) throw new Error("unreachable");
  return { ...GF01, doi: normalized.doi, title: null };
};

describe("the text of the whole list", () => {
  test("two references are joined by exactly one line feed", () => {
    expect(bibliographyText(listOf(GF01, GF05))).toEqual({
      kind: "ready",
      text: `${approvedText("GF01")}\n${approvedText("GF05")}`,
    });
  });

  test("the order is the order of the list", () => {
    expect(bibliographyText(listOf(GF05, GF01))).toEqual({
      kind: "ready",
      text: `${approvedText("GF05")}\n${approvedText("GF01")}`,
    });
  });

  test("a single reference stands alone, with no line feed", () => {
    expect(bibliographyText(listOf(GF01))).toEqual({ kind: "ready", text: approvedText("GF01") });
  });

  test("there is no number, no blank line, no carriage return and no line feed at the end", () => {
    const outcome = bibliographyText(listOf(GF01, GF05, GF08));

    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready") return;
    expect(outcome.text.split("\n")).toEqual([approvedText("GF01"), approvedText("GF05"), approvedText("GF08")]);
    expect(outcome.text).not.toContain("\r");
    expect(outcome.text.endsWith("\n")).toBe(false);
  });

  test("a corrected entry gives the reference of the corrected publication", () => {
    // GF06 with the year 2021 stored as the print date (HD-1).
    const corrected: Publication = {
      ...GF06,
      dates: { ...GF06.dates, print: { year: 2021, month: null, day: null } },
    };

    expect(bibliographyText(listOf(corrected))).toEqual({
      kind: "ready",
      text: `Petrenko, Andrii; Lee, Sora. Citation habits of first-year doctoral students // Example Journal of Academic Writing. 2021. ${TE}. 3, ${NUMERO} 2. ${ES}. 210${EM_DASH}225. DOI: 10.0000/golden.gf06.`,
    });
  });
});

describe("what blocks the text of the whole list", () => {
  test("one entry that cannot be formatted blocks it and is counted", () => {
    expect(bibliographyText(listOf(GF01, GF06))).toEqual({ kind: "blocked", unformatted: 1 });
  });

  test("two such entries are counted as two", () => {
    expect(bibliographyText(listOf(GF06, GF01, untitled()))).toEqual({ kind: "blocked", unformatted: 2 });
  });

  test("a list of nothing but such an entry is blocked, not empty", () => {
    expect(bibliographyText(listOf(GF06))).toEqual({ kind: "blocked", unformatted: 1 });
  });

  test("an empty list has no text and nothing to correct", () => {
    expect(bibliographyText({ entries: [] })).toEqual({ kind: "empty" });
  });
});

describe("what does not block it", () => {
  test("warnings: the references are given as the formatter returns them", () => {
    // GF03 carries subtitle-capitalisation, GF08 full-stop-collision.
    expect(bibliographyText(listOf(GF03, GF08))).toEqual({
      kind: "ready",
      text: `${approvedText("GF03")}\n${approvedText("GF08")}`,
    });
  });

  test("gaps in optional metadata", () => {
    // GF05 has no authors, volume, issue, pages or article number.
    expect(bibliographyText(listOf(GF05))).toEqual({ kind: "ready", text: approvedText("GF05") });
  });
});
