// Browser E2E of the primary flow: the production build, driven through its page in Chromium, with Crossref
// answered from recorded responses (e2e/support/crossref-stub.mjs). Run with `pnpm e2e`.
//
// What it shows is behaviour against provider answers recorded on 2026-10-05, not the current state of live
// Crossref. No request reaches live Crossref: the first test is the canary for that.
//
// EXPECTED VALUES. Every reference text below is a literal copied from the E2E expectation table of the design of
// the change browser-e2e, HUMAN-APPROVED on 2026-10-06 (rows E1 to E6, K1 and K2). It is never computed: this file
// imports no product module and calls no formatter. An expected value is not changed to make a test pass; a
// difference between the page and a row goes to the human. The Ukrainian UI strings come from the approved copy
// fixture, which is used for UI copy only.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { UI } from "../app/_components/__fixtures__/approved-copy";

// The canary runs first and a failure stops the rest: nothing is submitted unless the stub is seen to be active.
test.describe.configure({ mode: "serial" });

// ---- The record of the Crossref boundary: what the stub wrote, one event per line. Temporary instrumentation.

type BoundaryEvent =
  | { readonly event: "installed" }
  | { readonly event: "served" | "refused"; readonly method: string; readonly url: string };

const boundaryRecord = (): BoundaryEvent[] => {
  const file = process.env.E2E_CROSSREF_RECORD;
  if (!file) throw new Error("E2E_CROSSREF_RECORD is not set: run the browser tests with `pnpm e2e`.");
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as BoundaryEvent);
};

// The request the product makes for a DOI: the DOI as one percent-encoded segment.
const worksUrl = (encodedDoi: string): string => `https://api.crossref.org/works/${encodedDoi}`;

// ---- Approved expected values (see the note at the top). `Т` is U+0422 and `С` is U+0421, both Cyrillic; `№` is
// U+2116; the dash of the page range in R1 is the em dash U+2014. They stand as literal characters.

// Row E1: the recorded answer for 10.1038/nature12373.
const R1 =
  "Nanometre-scale thermometry in a living cell / G. Kucsko, P. C. Maurer, N. Y. Yao, M. Kubo, H. J. Noh, P. K. Lo, H. Park, M. D. Lukin // Nature. 2013. Т. 500, № 7460. С. 54—58. DOI: 10.1038/nature12373.";

// Row E2: the recorded answer for 10.1371/journal.pone.0000308.
const R2 =
  "Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLoS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.";

// Row E4: the entry of E2 after its journal title has been corrected to `PLOS ONE`.
const R4 =
  "Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLOS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.";

// Row K1: what the application passes to the clipboard for the first entry after the correction and the move.
const K1 =
  "Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLOS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.";

// Row K2: the whole list in its order. One line feed (U+000A) between the two references, none after the last, no
// carriage return, no number.
const K2 =
  "Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLOS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.\nNanometre-scale thermometry in a living cell / G. Kucsko, P. C. Maurer, N. Y. Yao, M. Kubo, H. J. Noh, P. K. Lo, H. Park, M. D. Lukin // Nature. 2013. Т. 500, № 7460. С. 54—58. DOI: 10.1038/nature12373.";

// ---- Driving the page, by role and accessible name.

// The page answers a click only once React has attached to it; a submission before that would be a plain form
// submission by the browser. React marks the elements it has attached to with its own keys.
const openPage = async (page: Page) => {
  await page.goto("/");
  await page.waitForFunction(() => {
    const field = document.querySelector("input");
    return field !== null && Object.keys(field).some((key) => key.startsWith("__reactProps"));
  });
};

const doiField = (page: Page) => page.getByLabel(UI.doiLabel, { exact: true });

const submitDoi = async (page: Page, text: string) => {
  await doiField(page).fill(text);
  await page.getByRole("button", { name: UI.add, exact: true }).click();
};

// The message of the form. Scoped to the main landmark: the framework keeps an announcer of its own outside it.
const alertMessage = (page: Page) => page.getByRole("main").getByRole("alert");

const entryButton = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

// What the list shows: for each entry, in order, every line of text it holds. An entry with a reference and
// nothing else, no warning and no indication of gaps, is one line.
const shownEntries = (page: Page): Promise<(string | null)[][]> =>
  page
    .getByRole("list", { name: UI.listHeading })
    .getByRole("listitem")
    .evaluateAll((items) =>
      items.map((item) => Array.from(item.querySelectorAll("p"), (line) => line.textContent)),
    );

// The clipboard is asserted at the boundary of the application: each value passed to
// navigator.clipboard.writeText is kept, and the browser's own method is then called as usual. The system
// clipboard is never read, so what a platform stores there plays no part.
type ClipboardProbe = { __clipboardWrites: string[] };

const watchClipboardWrites = (page: Page) =>
  page.addInitScript(() => {
    const writes: string[] = [];
    (window as unknown as ClipboardProbe).__clipboardWrites = writes;
    const writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = (text: string) => {
      writes.push(text);
      return writeText(text);
    };
  });

const clipboardWrites = (page: Page): Promise<string[]> =>
  page.evaluate(() => (window as unknown as ClipboardProbe).__clipboardWrites);

// ---- C1. Canary: an unrecorded DOI is refused by the stub and never reaches live Crossref (row E6).

test("an unrecorded DOI is refused at the Crossref boundary", async ({ page }) => {
  // Before anything is submitted: the stub is active, and exactly one process loaded it.
  expect(boundaryRecord().filter((entry) => entry.event === "installed")).toHaveLength(1);
  const before = boundaryRecord().length;

  await openPage(page);
  await submitDoi(page, "10.9999/unrecorded.e2e");

  await expect(alertMessage(page)).toHaveText(UI.providerUnavailable);
  await expect(page.getByText(UI.emptyList, { exact: true })).toBeVisible();
  expect(boundaryRecord().slice(before)).toEqual([
    { event: "refused", method: "GET", url: worksUrl("10.9999%2Funrecorded.e2e") },
  ]);
});

// ---- P0 to P8. The primary flow (rows E1 to E4, K1 and K2).

test("the primary flow: add, refuse a duplicate, correct, reorder, copy, remove", async ({ page }) => {
  const before = boundaryRecord().length;
  await watchClipboardWrites(page);

  // P0. The page as it opens.
  await openPage(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { name: UI.listHeading, exact: true })).toBeVisible();
  await expect(page.getByText(UI.emptyList, { exact: true })).toBeVisible();
  await expect(page.getByText(UI.sessionNotice, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: UI.copyAll, exact: true })).toBeDisabled();

  // P1. A recorded DOI, as a bare DOI (E1).
  await submitDoi(page, "10.1038/nature12373");
  await expect.poll(() => shownEntries(page)).toEqual([[R1]]);
  await expect(doiField(page)).toHaveValue("");

  // P2. A second recorded DOI, as an address with upper-case letters (E2). It goes to the end.
  await submitDoi(page, "https://doi.org/10.1371/JOURNAL.PONE.0000308");
  await expect.poll(() => shownEntries(page)).toEqual([[R1], [R2]]);

  // The two DOIs were requested from Crossref as the resolver specifies, once each, and answered from the record.
  const requested: BoundaryEvent[] = [
    { event: "served", method: "GET", url: worksUrl("10.1038%2Fnature12373") },
    { event: "served", method: "GET", url: worksUrl("10.1371%2Fjournal.pone.0000308") },
  ];
  expect(boundaryRecord().slice(before)).toEqual(requested);

  // P3. The DOI of the first entry in another form and letter case (E3): refused, and nothing is requested.
  await submitDoi(page, "DOI: 10.1038/NATURE12373");
  await expect(alertMessage(page)).toHaveText(UI.duplicate);
  await expect.poll(() => shownEntries(page)).toEqual([[R1], [R2]]);
  expect(boundaryRecord().slice(before)).toEqual(requested);

  // P4. Correct the journal title of the second entry (E4). The reference is recomputed; the first is unchanged.
  await entryButton(page, UI.correct(2)).click();
  const correction = page.getByRole("form", { name: UI.correctionHeading });
  const journalTitle = correction.getByLabel(UI.journalTitle, { exact: true });
  await expect(journalTitle).toHaveValue("PLoS ONE");
  await journalTitle.fill("PLOS ONE");
  await correction.getByRole("button", { name: UI.save, exact: true }).click();
  await expect(correction).toBeHidden();
  await expect.poll(() => shownEntries(page)).toEqual([[R1], [R4]]);

  // P5. Move the second entry up.
  await entryButton(page, UI.moveUp(2)).click();
  await expect.poll(() => shownEntries(page)).toEqual([[R4], [R1]]);

  // P6. Copy the reference of the first entry (K1).
  await entryButton(page, UI.copyOne(1)).click();
  await expect.poll(() => clipboardWrites(page)).toEqual([K1]);
  await expect(page.getByRole("main").getByRole("status")).toHaveText(UI.copied);

  // P7. Copy the whole list, in the order of the list (K2).
  await page.getByRole("button", { name: UI.copyAll, exact: true }).click();
  await expect.poll(() => clipboardWrites(page)).toEqual([K1, K2]);
  await expect(page.getByRole("main").getByRole("status")).toHaveText(UI.copied);

  // P8. Remove the first entry.
  await entryButton(page, UI.remove(1)).click();
  await expect.poll(() => shownEntries(page)).toEqual([[R1]]);

  // Nothing else reached the Crossref boundary during the flow.
  expect(boundaryRecord().slice(before)).toEqual(requested);
});

// ---- F1. A recorded not-found answer (row E5).

test("a DOI that Crossref has no record of adds nothing", async ({ page }) => {
  const before = boundaryRecord().length;

  await openPage(page);
  await submitDoi(page, "10.1234/this-doi-does-not-exist-xyz");

  await expect(alertMessage(page)).toHaveText(UI.notFound);
  await expect(page.getByText(UI.emptyList, { exact: true })).toBeVisible();
  await expect(doiField(page)).toHaveValue("10.1234/this-doi-does-not-exist-xyz");
  expect(boundaryRecord().slice(before)).toEqual([
    { event: "served", method: "GET", url: worksUrl("10.1234%2Fthis-doi-does-not-exist-xyz") },
  ]);
});
