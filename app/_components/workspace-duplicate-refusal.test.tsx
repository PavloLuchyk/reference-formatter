// @vitest-environment jsdom
// Regression tests for a refused duplicate in a list of several entries: requirement Duplicate prevention of
// openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md ("SHALL leave the list unchanged") with
// assumptions AS-7 (the existing entry is not moved, replaced or refreshed) and AS-8 (the typed text stays).
// Added after feature review 01 (finding BW-R01-6, accepted by the human on 2026-10-06) for behaviour that was
// already implemented, so these tests were never seen to fail.
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import {
  addPublications,
  correction,
  doiField,
  entries,
  entryTexts,
  press,
  renderWith,
  renderWorkspace,
  save,
  submitDoi,
  typeInto,
} from "@/app/_components/__fixtures__/workspace-driver";
import { approvedText, goldenPublication } from "@/lib/bibliography/__fixtures__/golden";
import type { ResolutionOutcome } from "@/lib/metadata/resolution";

const GF01 = goldenPublication("GF01"); // 10.0000/golden.gf01
const GF05 = goldenPublication("GF05"); // 10.0000/golden.gf05
const GF08 = goldenPublication("GF08"); // 10.0000/golden.gf08. (the DOI ends in a full stop)

afterEach(cleanup);

describe("a duplicate refused before any lookup, in a list of three entries", () => {
  test.each([
    ["the first entry", "DOI: 10.0000/GOLDEN.GF01"],
    ["the entry in the middle", "https://doi.org/10.0000/Golden.GF05"],
    ["the last entry", "  10.0000/golden.gf08.  "],
  ])("%s submitted again in another spelling", async (_which, typed) => {
    const resolve = await renderWith(GF01, GF05, GF08);
    const before = entryTexts();
    expect(before).toHaveLength(3);
    expect(before[0]).toContain(approvedText("GF01"));
    expect(before[1]).toContain(approvedText("GF05"));
    expect(before[2]).toContain(approvedText("GF08"));

    submitDoi(typed);

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    // The same entries with the same text in the same order: nothing was moved, replaced or added.
    expect(entryTexts()).toEqual(before);
    // The typed text stays in the field exactly as it was typed.
    expect(doiField().value).toBe(typed);
    // The duplicate was found from the canonical DOI in the browser: no fourth request.
    expect(resolve).toHaveBeenCalledTimes(3);
  });

  test("the controls of every entry still stand at the same entry", async () => {
    await renderWith(GF01, GF05, GF08);

    submitDoi("10.0000/golden.gf05");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    [approvedText("GF01"), approvedText("GF05"), approvedText("GF08")].forEach((reference, index) => {
      const entry = within(entries()[index]);
      expect(entry.getByText(reference)).toBeDefined();
      expect(entry.getByRole("button", { name: UI.remove(index + 1) })).toBeDefined();
    });
  });
});

describe("a duplicate of a corrected entry", () => {
  test("the corrected entry is not refreshed or replaced with resolved metadata", async () => {
    const resolve = await renderWith(GF01, GF05);
    press(UI.correct(2));
    typeInto(UI.title, "A corrected editorial note");
    save();
    const before = entryTexts();
    expect(before[1]).toContain(
      "A corrected editorial note // Example Bulletin of Research Practice. 2024. DOI: 10.0000/golden.gf05.",
    );

    submitDoi("doi:10.0000/golden.gf05");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    expect(entryTexts()).toEqual(before);
    expect(entryTexts()[1]).not.toContain("Editorial note on data availability statements");
    expect(doiField().value).toBe("doi:10.0000/golden.gf05");
    expect(resolve).toHaveBeenCalledTimes(2);
  });

  test("a correction that is open stays open with what was typed in it", async () => {
    await renderWith(GF01, GF05);
    press(UI.correct(1));
    typeInto(UI.title, "A title being typed");

    submitDoi("10.0000/golden.gf05");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    expect((within(correction()).getByLabelText(UI.title) as HTMLInputElement).value).toBe("A title being typed");
    expect(entryTexts()[0]).toContain(approvedText("GF01"));
  });
});

describe("a duplicate refused when the outcome arrives, in a list of two entries", () => {
  test("the list and the typed text stay as they were", async () => {
    // Not reachable through DOI resolution, which answers for the requested DOI only: a resolver that answers a DOI
    // it does not know with a publication that is already in the list.
    const resolve = vi.fn(async (doi: string): Promise<ResolutionOutcome> => {
      const known = [GF01, GF05].find((publication) => publication.doi === doi);
      return { ok: true, publication: known ?? GF01 };
    });
    renderWorkspace(resolve);
    await addPublications(GF01, GF05);
    const before = entryTexts();

    submitDoi("10.0000/golden.gf08.");

    expect((await screen.findByRole("alert")).textContent).toBe(UI.duplicate);
    expect(resolve.mock.calls).toEqual([["10.0000/golden.gf01"], ["10.0000/golden.gf05"], ["10.0000/golden.gf08."]]);
    expect(entryTexts()).toEqual(before);
    expect(before).toHaveLength(2);
    expect(doiField().value).toBe("10.0000/golden.gf08.");
  });
});
