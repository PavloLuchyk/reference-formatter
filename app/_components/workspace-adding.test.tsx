// @vitest-environment jsdom
// Component tests for openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md, requirements:
// The list lives for one session, Adding an entry by DOI, One DOI at a time, Input that is not a DOI is refused
// without a request, Duplicate prevention, Resolution failures add nothing, Resolution that could not be requested.
// The resolver is a fake. Expected reference texts are the approved texts of the golden oracle.
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import {
  addButton,
  addPublications,
  doiField,
  entries,
  entryTexts,
  press,
  renderWith,
  renderWorkspace,
  resolverFailingWith,
  resolverFor,
  resolverOfBareRecords,
  submitDoi,
  typeDoi,
} from "@/app/_components/__fixtures__/workspace-driver";
import { approvedText, goldenPublication } from "@/lib/bibliography/__fixtures__/golden";
import type { ResolutionFailure, ResolutionOutcome } from "@/lib/metadata/resolution";

const GF01 = goldenPublication("GF01");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06");

afterEach(cleanup);

describe("the page as it is opened", () => {
  test("has its heading, its introduction and an empty list", () => {
    renderWorkspace(resolverFor());

    expect(screen.getByRole("heading", { level: 1, name: UI.pageHeading })).toBeDefined();
    expect(screen.getByText(UI.introduction)).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: UI.listHeading })).toBeDefined();
    expect(entries()).toEqual([]);
    expect(screen.getByText(UI.emptyList)).toBeDefined();
  });

  test("says that the list is kept only until the page is reloaded", () => {
    renderWorkspace(resolverFor());

    expect(screen.getByText(UI.sessionNotice)).toBeDefined();
  });

  test("a page opened again starts with an empty list", async () => {
    await renderWith(GF01, GF05);
    expect(entries()).toHaveLength(2);

    // What a reload does to the page: the old one is gone and a new one is rendered.
    cleanup();
    renderWorkspace(resolverFor(GF01, GF05));

    expect(entries()).toEqual([]);
    expect(screen.getByText(UI.emptyList)).toBeDefined();
  });

  test("the DOI field has its label and its hint", () => {
    renderWorkspace(resolverFor());

    expect(doiField().value).toBe("");
    expect(screen.getByText(UI.doiHint)).toBeDefined();
  });
});

describe("adding an entry by DOI", () => {
  test("the first entry shows the approved reference of its publication", async () => {
    renderWorkspace(resolverFor(GF01));

    submitDoi("10.0000/golden.gf01");

    expect(await screen.findByText(approvedText("GF01"))).toBeDefined();
    expect(entries()).toHaveLength(1);
    expect(screen.queryByText(UI.emptyList)).toBeNull();
  });

  test("a later entry goes to the end", async () => {
    await renderWith(GF01, GF05);

    expect(entries()).toHaveLength(2);
    expect(entryTexts()[0]).toContain(approvedText("GF01"));
    expect(entryTexts()[1]).toContain(approvedText("GF05"));
  });

  test("an accepted input form is resolved by its canonical DOI, which the new entry has", async () => {
    const resolve = resolverOfBareRecords();
    renderWorkspace(resolve);

    submitDoi("https://doi.org/10.1038/NATURE12373");

    await waitFor(() => expect(entries()).toHaveLength(1));
    expect(resolve.mock.calls).toEqual([["10.1038/nature12373"]]);
    expect(entryTexts()[0]).toContain("10.1038/nature12373");
    expect(entryTexts()[0]).not.toContain("NATURE12373");
  });

  test("the DOI field is cleared after a success", async () => {
    await renderWith(GF01);

    expect(doiField().value).toBe("");
  });

  test("a publication that cannot be formatted is added like any other", async () => {
    await renderWith(GF01, GF06);

    expect(entries()).toHaveLength(2);
    expect(entryTexts()[1]).toContain("10.0000/golden.gf06");
  });

  test("the session notice stays while the list has entries", async () => {
    await renderWith(GF01);

    expect(screen.getByText(UI.sessionNotice)).toBeDefined();
  });
});

describe("one DOI at a time", () => {
  test("two DOIs in one input are not a DOI, and nothing is requested", () => {
    const resolve = resolverOfBareRecords();
    renderWorkspace(resolve);

    submitDoi("10.1038/nature12373 10.1371/journal.pone.0000308");

    expect(screen.getByText(UI.invalidInput)).toBeDefined();
    expect(entries()).toEqual([]);
    expect(resolve).not.toHaveBeenCalled();
  });

  test("while a lookup is in progress the page says so and accepts no other submission", async () => {
    const lookup = Promise.withResolvers<ResolutionOutcome>();
    const resolve = vi.fn((doi: string) => {
      void doi;
      return lookup.promise;
    });
    renderWorkspace(resolve);

    submitDoi("10.0000/golden.gf01");

    expect(screen.getByText(UI.lookupInProgress)).toBeDefined();
    expect(addButton().disabled).toBe(true);

    // A second submission by the Enter key, which a disabled button does not stop.
    typeDoi("10.0000/golden.gf05");
    fireEvent.submit(doiField().form as HTMLFormElement);
    expect(resolve).toHaveBeenCalledTimes(1);

    lookup.resolve({ ok: true, publication: GF01 });

    expect(await screen.findByText(approvedText("GF01"))).toBeDefined();
    expect(screen.queryByText(UI.lookupInProgress)).toBeNull();
    expect(addButton().disabled).toBe(false);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  test("no lookup is shown as in progress before a DOI is submitted", () => {
    renderWorkspace(resolverFor());

    expect(screen.queryByText(UI.lookupInProgress)).toBeNull();
    expect(addButton().disabled).toBe(false);
  });
});

describe("input that is not a DOI is refused without a request", () => {
  test.each([
    ["text that is not a DOI", "nature thermometry 2013"],
    ["an input form that DOI normalization does not accept", "http://dx.doi.org/10.1038/nature12373"],
    ["a resolver URL without a scheme", "doi.org/10.1038/nature12373"],
    ["empty input", ""],
    ["only whitespace", "   "],
  ])("%s", (_name, typed) => {
    const resolve = resolverOfBareRecords();
    renderWorkspace(resolve);

    submitDoi(typed);

    expect(screen.getByRole("alert").textContent).toBe(UI.invalidInput);
    expect(resolve).not.toHaveBeenCalled();
    expect(entries()).toEqual([]);
    expect(doiField().value).toBe(typed);
  });
});

describe("duplicate prevention", () => {
  test("the same DOI submitted again is not added and not requested again", async () => {
    const resolve = await renderWith(GF01);

    submitDoi("10.0000/golden.gf01");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    expect(entries()).toHaveLength(1);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  test("the same DOI in another form and letter case is the same publication", async () => {
    const resolve = resolverOfBareRecords();
    renderWorkspace(resolve);
    submitDoi("10.1038/nature12373");
    await waitFor(() => expect(entries()).toHaveLength(1));

    submitDoi("DOI: 10.1038/NATURE12373");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    expect(entries()).toHaveLength(1);
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  test("a DOI that DOI normalization keeps different is requested and added", async () => {
    const resolve = resolverOfBareRecords();
    renderWorkspace(resolve);
    submitDoi("10.1000/abc");
    await waitFor(() => expect(entries()).toHaveLength(1));

    submitDoi("10.1000/abc.");

    await waitFor(() => expect(entries()).toHaveLength(2));
    expect(resolve.mock.calls).toEqual([["10.1000/abc"], ["10.1000/abc."]]);
    expect(screen.queryByText(UI.duplicate)).toBeNull();
  });

  test("an entry that was removed can be added again", async () => {
    const resolve = await renderWith(GF01);
    press(UI.remove(1));
    expect(entries()).toEqual([]);

    await addPublications(GF01);

    expect(entries()).toHaveLength(1);
    expect(resolve).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(UI.duplicate)).toBeNull();
  });

  test("a resolver that answers with a publication already in the list adds nothing", async () => {
    // Not reachable through DOI resolution, which answers for the requested DOI only; the list still refuses it.
    const resolve = vi.fn(async (doi: string): Promise<ResolutionOutcome> => {
      void doi;
      return { ok: true, publication: GF01 };
    });
    renderWorkspace(resolve);
    await addPublications(GF01);

    submitDoi("10.0000/golden.gf05");

    expect((await screen.findByRole("alert")).textContent).toBe(UI.duplicate);
    expect(entries()).toHaveLength(1);
    expect(entryTexts()[0]).toContain(approvedText("GF01"));
  });
});

describe("resolution failures add nothing", () => {
  const FAILURES: [string, ResolutionFailure, string][] = [
    ["invalid-input", { kind: "invalid-input" }, UI.invalidInput],
    ["not-found", { kind: "not-found" }, UI.notFound],
    ["unsupported-type", { kind: "unsupported-type", type: "book" }, UI.unsupportedType],
    ["provider-unavailable", { kind: "provider-unavailable" }, UI.providerUnavailable],
    ["invalid-response", { kind: "invalid-response" }, UI.invalidResponse],
  ];

  test.each(FAILURES)("%s has its message, keeps the typed text and adds nothing", async (_kind, failure, message) => {
    renderWorkspace(resolverFailingWith(failure));

    submitDoi("10.1038/nature12373");

    expect((await screen.findByRole("alert")).textContent).toBe(message);
    expect(entries()).toEqual([]);
    expect(doiField().value).toBe("10.1038/nature12373");
    expect(addButton().disabled).toBe(false);
  });

  test("a record without a type has the same message as any other unsupported type", async () => {
    renderWorkspace(resolverFailingWith({ kind: "unsupported-type", type: null }));

    submitDoi("10.1038/nature12373");

    expect((await screen.findByRole("alert")).textContent).toBe(UI.unsupportedType);
  });

  test("no two failure kinds show the same message", async () => {
    const shown: string[] = [];
    for (const [, failure] of FAILURES) {
      renderWorkspace(resolverFailingWith(failure));
      submitDoi("10.1038/nature12373");
      shown.push((await screen.findByRole("alert")).textContent ?? "");
      cleanup();
    }

    expect(new Set(shown).size).toBe(5);
  });

  test("the message for a DOI without a record does not say that the DOI does not exist", async () => {
    renderWorkspace(resolverFailingWith({ kind: "not-found" }));

    submitDoi("10.1038/nature12373");

    const message = (await screen.findByRole("alert")).textContent ?? "";
    expect(message).toContain("Crossref");
    expect(message).not.toContain("не існує");
  });

  test("a failure message is gone after a later success", async () => {
    renderWorkspace(resolverFor(GF01));
    submitDoi("10.1038/nature12373");
    expect((await screen.findByRole("alert")).textContent).toBe(UI.notFound);

    await addPublications(GF01);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(UI.notFound)).toBeNull();
  });

  test("a message does not outlive the next submission", async () => {
    renderWorkspace(resolverFor(GF01));
    submitDoi("10.1038/nature12373");
    expect((await screen.findByRole("alert")).textContent).toBe(UI.notFound);

    submitDoi("not a doi");

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert").textContent).toBe(UI.invalidInput);
  });
});

describe("resolution that could not be requested", () => {
  test("the page says that the request failed, keeps the text and accepts a new submission", async () => {
    const resolve = vi
      .fn<(doi: string) => Promise<ResolutionOutcome>>()
      .mockRejectedValueOnce(new Error("connection closed"))
      .mockResolvedValueOnce({ ok: true, publication: GF01 });
    renderWorkspace(resolve);

    submitDoi("10.0000/golden.gf01");

    expect((await screen.findByRole("alert")).textContent).toBe(UI.requestFailed);
    expect(entries()).toEqual([]);
    expect(doiField().value).toBe("10.0000/golden.gf01");
    expect(screen.queryByText(UI.lookupInProgress)).toBeNull();
    expect(addButton().disabled).toBe(false);

    fireEvent.click(addButton());

    expect(await screen.findByText(approvedText("GF01"))).toBeDefined();
    expect(resolve).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("the message blames neither Crossref, nor the DOI, nor the connection", async () => {
    renderWorkspace(vi.fn<(doi: string) => Promise<ResolutionOutcome>>().mockRejectedValue(new Error("offline")));

    submitDoi("10.0000/golden.gf01");

    const message = (await screen.findByRole("alert")).textContent ?? "";
    expect(message).not.toContain("Crossref");
    expect(message).not.toContain("DOI");
    expect(message).not.toMatch(/з.єднання|мереж|інтернет/i);
  });
});
