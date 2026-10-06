// Tests for the requirement "Entry shows gaps in optional metadata" of
// openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md (decision HD-9, reading RD-1 as revised
// by the human). Expected lists are written by hand from that requirement.
import { describe, expect, test } from "vitest";
import { goldenPublication } from "@/lib/bibliography/__fixtures__/golden";
import { metadataGaps } from "@/lib/bibliography/metadata-gaps";
import type { Publication } from "@/lib/publication/publication";

// Authors, a volume, an issue and pages; no subtitle, no article number.
const GF01 = goldenPublication("GF01");

describe("gaps in optional metadata", () => {
  test.each(["GF01", "GF02", "GF03", "GF06", "GF08"])("%s has no gap", (id) => {
    expect(metadataGaps(goldenPublication(id))).toEqual([]);
  });

  test("the minimal record has all four gaps, in the approved order", () => {
    expect(metadataGaps(goldenPublication("GF05"))).toEqual(["authors", "volume", "issue", "pages-or-article-number"]);
  });

  test("an article number without pages is no gap: only the missing issue is one", () => {
    // GF04: volume 45, no issue, no pages, article number e0457.
    expect(metadataGaps(goldenPublication("GF04"))).toEqual(["issue"]);
  });

  test("pages with an article number are no gap: only the missing volume is one", () => {
    // GF07: no volume, issue 4, pages and an article number.
    expect(metadataGaps(goldenPublication("GF07"))).toEqual(["volume"]);
  });

  test("an entry that cannot be formatted reports its gaps like any other", () => {
    const withoutVolume: Publication = { ...goldenPublication("GF06"), volume: null };

    expect(metadataGaps(withoutVolume)).toEqual(["volume"]);
  });
});

describe("each gap on its own", () => {
  test("no authors", () => {
    expect(metadataGaps({ ...GF01, authors: [] })).toEqual(["authors"]);
  });

  test("no volume", () => {
    expect(metadataGaps({ ...GF01, volume: null })).toEqual(["volume"]);
  });

  test("no issue", () => {
    expect(metadataGaps({ ...GF01, issue: null })).toEqual(["issue"]);
  });

  test("neither pages nor an article number", () => {
    expect(metadataGaps({ ...GF01, pages: null, articleNumber: null })).toEqual(["pages-or-article-number"]);
  });
});

describe("what is never a gap", () => {
  test("pages without an article number", () => {
    expect(metadataGaps({ ...GF01, pages: "45-67", articleNumber: null })).toEqual([]);
  });

  test("an article number without pages", () => {
    expect(metadataGaps({ ...GF01, pages: null, articleNumber: "e0457" })).toEqual([]);
  });

  test("a missing subtitle", () => {
    expect(GF01.subtitle).toBeNull();
    expect(metadataGaps(GF01)).toEqual([]);
    // Supplying one changes nothing either.
    expect(metadataGaps({ ...GF01, subtitle: "a study" })).toEqual([]);
  });

  test("a missing language", () => {
    expect(metadataGaps({ ...GF01, language: null })).toEqual([]);
  });

  test("missing dates", () => {
    expect(metadataGaps({ ...GF01, dates: { print: null, online: null, published: null, issued: null } })).toEqual([]);
  });

  test("a missing title or journal title", () => {
    expect(metadataGaps({ ...GF01, title: null, journalTitle: null })).toEqual([]);
  });
});
