// Tests for the list rules of openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md:
// The list lives for one session, Adding an entry by DOI, Duplicate prevention, Removing an entry, Reordering entries,
// and the position rule of metadata-correction "Saving and cancelling".
// Every DOI is produced by the existing normalizeDoi or taken from a golden fixture; no test compares DOIs itself.
import { describe, expect, test } from "vitest";
import { goldenPublication } from "@/lib/bibliography/__fixtures__/golden";
import {
  addEntry,
  canMoveEntry,
  emptyWorkspace,
  hasEntry,
  moveEntry,
  removeEntry,
  replacePublication,
  type Workspace,
} from "@/lib/bibliography/workspace";
import { normalizeDoi, type CanonicalDoi } from "@/lib/doi/normalize-doi";
import { createPublication, type Publication } from "@/lib/publication/publication";

const canonical = (input: string): CanonicalDoi => {
  const normalized = normalizeDoi(input);
  if (!normalized.ok) throw new Error(`Not a DOI: ${input}`);
  return normalized.doi;
};

// A list written out by hand, so that the tests of one operation do not depend on another.
const listOf = (...publications: Publication[]): Workspace => ({
  entries: publications.map((publication) => ({ publication })),
});

const dois = (workspace: Workspace): string[] => workspace.entries.map((entry) => entry.publication.doi);

const added = (workspace: Workspace, publication: Publication): Workspace => {
  const outcome = addEntry(workspace, publication);
  expect(outcome.ok).toBe(true);
  if (!outcome.ok) throw new Error("unreachable");
  return outcome.workspace;
};

const GF01 = goldenPublication("GF01");
const GF05 = goldenPublication("GF05");
const GF08 = goldenPublication("GF08");

describe("the list", () => {
  test("is empty to begin with", () => {
    expect(emptyWorkspace.entries).toEqual([]);
  });
});

describe("adding an entry", () => {
  test("the first entry holds the resolved publication", () => {
    const workspace = added(emptyWorkspace, GF01);

    expect(workspace.entries).toEqual([{ publication: GF01 }]);
  });

  test("a later entry goes to the end", () => {
    const workspace = added(listOf(GF01), GF05);

    expect(dois(workspace)).toEqual(["10.0000/golden.gf01", "10.0000/golden.gf05"]);
  });

  test("nothing is sorted: an entry that would sort first is still last", () => {
    // GF01 begins with «Коваленко», GF08 with «Bondarenko».
    const workspace = added(listOf(GF01, GF05), GF08);

    expect(dois(workspace)).toEqual(["10.0000/golden.gf01", "10.0000/golden.gf05", "10.0000/golden.gf08."]);
  });

  test("the list it was added to is not changed", () => {
    const before = listOf(GF01);
    added(before, GF05);

    expect(dois(before)).toEqual(["10.0000/golden.gf01"]);
  });
});

describe("duplicate prevention", () => {
  test("a publication already in the list is refused", () => {
    expect(addEntry(listOf(GF01, GF05), GF01)).toEqual({ ok: false, reason: "duplicate" });
  });

  test("the same DOI typed in another form and letter case is the same publication", () => {
    const first = createPublication({ doi: canonical("10.1038/nature12373"), title: "First" });
    const again = createPublication({ doi: canonical("DOI: 10.1038/NATURE12373"), title: "Again" });

    expect(addEntry(listOf(first), again)).toEqual({ ok: false, reason: "duplicate" });
  });

  test("a corrected entry is still the same publication", () => {
    const corrected: Publication = { ...GF01, title: "A corrected title" };

    expect(addEntry(listOf(corrected), GF01)).toEqual({ ok: false, reason: "duplicate" });
  });

  test("a DOI that DOI normalization keeps different is another publication", () => {
    const plain = createPublication({ doi: canonical("10.1000/abc") });
    const withFullStop = createPublication({ doi: canonical("10.1000/abc.") });

    const workspace = added(listOf(plain), withFullStop);

    expect(dois(workspace)).toEqual(["10.1000/abc", "10.1000/abc."]);
  });

  test("a publication that is not in the list is accepted", () => {
    expect(addEntry(listOf(GF01), GF05).ok).toBe(true);
  });

  test("an entry that was removed can be added again", () => {
    const workspace = added(removeEntry(listOf(GF01, GF05), GF01.doi), GF01);

    expect(dois(workspace)).toEqual(["10.0000/golden.gf05", "10.0000/golden.gf01"]);
  });
});

describe("asking whether a DOI is in the list", () => {
  test("a canonical DOI of an entry is in the list", () => {
    const workspace = listOf(createPublication({ doi: canonical("10.1038/nature12373") }));

    expect(hasEntry(workspace, canonical("https://doi.org/10.1038/Nature12373"))).toBe(true);
  });

  test("another DOI is not", () => {
    expect(hasEntry(listOf(GF01), canonical("10.1038/nature12373"))).toBe(false);
  });

  test("nothing is in an empty list", () => {
    expect(hasEntry(emptyWorkspace, GF01.doi)).toBe(false);
  });
});

describe("removing an entry", () => {
  test("the entry in the middle goes and the others keep their order", () => {
    expect(dois(removeEntry(listOf(GF01, GF05, GF08), GF05.doi))).toEqual([
      "10.0000/golden.gf01",
      "10.0000/golden.gf08.",
    ]);
  });

  test("removing the only entry leaves an empty list", () => {
    expect(removeEntry(listOf(GF01), GF01.doi).entries).toEqual([]);
  });

  test("a DOI that is not in the list removes nothing", () => {
    expect(dois(removeEntry(listOf(GF01, GF05), GF08.doi))).toEqual(["10.0000/golden.gf01", "10.0000/golden.gf05"]);
  });

  test("the entries that stay are not changed", () => {
    expect(removeEntry(listOf(GF01, GF05, GF08), GF05.doi).entries).toEqual([
      { publication: GF01 },
      { publication: GF08 },
    ]);
  });
});

describe("reordering entries", () => {
  const list = listOf(GF01, GF05, GF08);

  test("moving up exchanges the entry with the one before it", () => {
    expect(dois(moveEntry(list, GF05.doi, "up"))).toEqual([
      "10.0000/golden.gf05",
      "10.0000/golden.gf01",
      "10.0000/golden.gf08.",
    ]);
  });

  test("moving down exchanges the entry with the one after it", () => {
    expect(dois(moveEntry(list, GF05.doi, "down"))).toEqual([
      "10.0000/golden.gf01",
      "10.0000/golden.gf08.",
      "10.0000/golden.gf05",
    ]);
  });

  test("a move changes nothing but the order", () => {
    expect(moveEntry(list, GF05.doi, "up").entries).toEqual([
      { publication: GF05 },
      { publication: GF01 },
      { publication: GF08 },
    ]);
  });

  test("the first entry cannot move up and the last cannot move down", () => {
    expect(canMoveEntry(list, GF01.doi, "up")).toBe(false);
    expect(canMoveEntry(list, GF08.doi, "down")).toBe(false);
  });

  test("every other move is available", () => {
    expect(canMoveEntry(list, GF01.doi, "down")).toBe(true);
    expect(canMoveEntry(list, GF05.doi, "up")).toBe(true);
    expect(canMoveEntry(list, GF05.doi, "down")).toBe(true);
    expect(canMoveEntry(list, GF08.doi, "up")).toBe(true);
  });

  test("a move that is not available leaves the order as it was", () => {
    expect(dois(moveEntry(list, GF01.doi, "up"))).toEqual(dois(list));
    expect(dois(moveEntry(list, GF08.doi, "down"))).toEqual(dois(list));
  });

  test("a single entry cannot move either way", () => {
    const single = listOf(GF01);

    expect(canMoveEntry(single, GF01.doi, "up")).toBe(false);
    expect(canMoveEntry(single, GF01.doi, "down")).toBe(false);
    expect(dois(moveEntry(single, GF01.doi, "down"))).toEqual(["10.0000/golden.gf01"]);
  });

  test("the list that was reordered is not changed", () => {
    const before = listOf(GF01, GF05);
    moveEntry(before, GF05.doi, "up");

    expect(dois(before)).toEqual(["10.0000/golden.gf01", "10.0000/golden.gf05"]);
  });
});

describe("replacing the publication of an entry", () => {
  const corrected: Publication = { ...GF05, title: "A corrected title" };

  test("the entry keeps its position", () => {
    const workspace = replacePublication(listOf(GF01, GF05, GF08), corrected);

    expect(dois(workspace)).toEqual(["10.0000/golden.gf01", "10.0000/golden.gf05", "10.0000/golden.gf08."]);
  });

  test("the entry holds the corrected publication and the others are untouched", () => {
    const workspace = replacePublication(listOf(GF01, GF05, GF08), corrected);

    expect(workspace.entries).toEqual([{ publication: GF01 }, { publication: corrected }, { publication: GF08 }]);
  });

  test("a publication that is not in the list changes nothing", () => {
    expect(replacePublication(listOf(GF01, GF08), corrected).entries).toEqual([
      { publication: GF01 },
      { publication: GF08 },
    ]);
  });
});
