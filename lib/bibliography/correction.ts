import { selectYear } from "@/lib/dstu/format-journal-article";
import {
  createPublication,
  type Author,
  type AuthorInput,
  type Publication,
  type PublicationInput,
} from "@/lib/publication/publication";

// Manual correction of the metadata of an entry. The form works on a draft of strings; applying the draft gives a new
// Publication, built by createPublication, so that a blank value is missing and a nameless author is left out by the
// rules of the Publication model. Nothing is invented, completed or repaired. HD…, AS… name decisions and assumptions
// of the design of the change bibliography-workspace.

export type AuthorDraft = {
  readonly kind: "person" | "organisation";
  readonly family: string;
  readonly given: string;
  readonly name: string;
};

// HD-5: the nine correctable fields. The DOI, the language, the four source dates on their own and their month and
// day are not here: a date changes only through `year`.
export type CorrectionDraft = {
  readonly title: string;
  readonly subtitle: string;
  readonly authors: readonly AuthorDraft[];
  readonly journalTitle: string;
  readonly year: string;
  readonly volume: string;
  readonly issue: string;
  readonly pages: string;
  readonly articleNumber: string;
};

export type CorrectionError = { readonly field: "year"; readonly kind: "invalid-year" };

export type CorrectionOutcome =
  | { readonly ok: true; readonly publication: Publication }
  | { readonly ok: false; readonly errors: readonly CorrectionError[] };

export type AuthorMove = "up" | "down";

// A value is shown as stored; a missing one is an empty field.
const shown = (value: string | null): string => value ?? "";

// HD-1: the year shown is the year the formatter prints, taken from the formatter's own selection.
const shownYear = (publication: Publication): string => {
  const year = selectYear(publication.dates);
  return year === null ? "" : String(year);
};

const toAuthorDraft = (author: Author): AuthorDraft =>
  author.kind === "organisation"
    ? { kind: "organisation", family: "", given: "", name: author.name }
    : { kind: "person", family: shown(author.family), given: shown(author.given), name: "" };

export function draftFromPublication(publication: Publication): CorrectionDraft {
  return {
    title: shown(publication.title),
    subtitle: shown(publication.subtitle),
    authors: publication.authors.map(toAuthorDraft),
    journalTitle: shown(publication.journalTitle),
    year: shownYear(publication),
    volume: shown(publication.volume),
    issue: shown(publication.issue),
    pages: shown(publication.pages),
    articleNumber: shown(publication.articleNumber),
  };
}

// HD-7: a changed year is exactly four ASCII digits that denote 1000 to 9999. A product constraint on typed input,
// not a rule of DSTU 8302:2015.
const TYPED_YEAR = /^[1-9][0-9]{3}$/;

// HD-1, HD-7. The typed year is compared with the year that was shown, both without surrounding whitespace.
// Unchanged: the dates are passed through, whatever the year is, and nothing is validated.
// Emptied: no date is left. Changed: the year alone becomes the print date, which the formatter prints first.
const correctedDates = (publication: Publication, typedYear: string): PublicationInput["dates"] | null => {
  const year = typedYear.trim();
  if (year === shownYear(publication)) return publication.dates;
  if (year === "") return {};
  if (!TYPED_YEAR.test(year)) return null;
  return { ...publication.dates, print: { year: Number(year) } };
};

// AS-15: only the names of the selected kind are saved. Trimming names and leaving out an author without any name
// (HD-6, AS-4) is done by createPublication.
const toAuthorInput = (author: AuthorDraft): AuthorInput =>
  author.kind === "organisation"
    ? { kind: "organisation", name: author.name }
    : { kind: "person", family: author.family, given: author.given };

export function applyCorrection(publication: Publication, draft: CorrectionDraft): CorrectionOutcome {
  const dates = correctedDates(publication, draft.year);
  if (dates === null) return { ok: false, errors: [{ field: "year", kind: "invalid-year" }] };

  return {
    ok: true,
    // HD-6: surrounding whitespace of a typed value is ignored; createPublication then treats a blank value as missing.
    publication: createPublication({
      doi: publication.doi,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      authors: draft.authors.map(toAuthorInput),
      journalTitle: draft.journalTitle.trim(),
      dates,
      volume: draft.volume.trim(),
      issue: draft.issue.trim(),
      pages: draft.pages.trim(),
      articleNumber: draft.articleNumber.trim(),
      language: publication.language,
    }),
  };
}

const NEW_AUTHOR: AuthorDraft = { kind: "person", family: "", given: "", name: "" };

// An added author goes to the end and starts as a person without names.
export function addAuthor(draft: CorrectionDraft): CorrectionDraft {
  return { ...draft, authors: [...draft.authors, NEW_AUTHOR] };
}

export function removeAuthor(draft: CorrectionDraft, index: number): CorrectionDraft {
  return { ...draft, authors: draft.authors.filter((_, position) => position !== index) };
}

// The first author cannot move up and the last cannot move down.
export function canMoveAuthor(draft: CorrectionDraft, index: number, direction: AuthorMove): boolean {
  const to = direction === "up" ? index - 1 : index + 1;
  return index >= 0 && index < draft.authors.length && to >= 0 && to < draft.authors.length;
}

export function moveAuthor(draft: CorrectionDraft, index: number, direction: AuthorMove): CorrectionDraft {
  if (!canMoveAuthor(draft, index, direction)) return draft;
  const to = direction === "up" ? index - 1 : index + 1;
  const authors = [...draft.authors];
  [authors[index], authors[to]] = [authors[to], authors[index]];
  return { ...draft, authors };
}
