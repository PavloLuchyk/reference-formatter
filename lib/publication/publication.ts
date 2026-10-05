import type { CanonicalDoi } from "@/lib/doi/normalize-doi";

// Provider-independent journal-article record. Every field other than the DOI may be missing:
// a missing scalar is null, missing authors are an empty list, and nothing is ever filled in for a missing value.

export type PublicationDate = {
  readonly year: number;
  readonly month: number | null;
  readonly day: number | null;
};

export type PublicationDates = {
  readonly print: PublicationDate | null;
  readonly online: PublicationDate | null;
  readonly published: PublicationDate | null;
  readonly issued: PublicationDate | null;
};

export type Person = {
  readonly kind: "person";
  readonly family: string | null;
  readonly given: string | null;
};

export type Organisation = {
  readonly kind: "organisation";
  readonly name: string;
};

export type Author = Person | Organisation;

export type Publication = {
  readonly doi: CanonicalDoi;
  readonly title: string | null;
  readonly subtitle: string | null;
  readonly authors: readonly Author[];
  readonly journalTitle: string | null;
  readonly dates: PublicationDates;
  readonly volume: string | null;
  readonly issue: string | null;
  readonly pages: string | null;
  readonly articleNumber: string | null;
  readonly language: string | null;
};

export type PublicationField = Exclude<keyof Publication, "doi">;

export type PublicationDateInput = {
  readonly year: number;
  readonly month?: number | null;
  readonly day?: number | null;
};

export type AuthorInput =
  | { readonly kind: "person"; readonly family?: string | null; readonly given?: string | null }
  | { readonly kind: "organisation"; readonly name: string };

export type PublicationInput = {
  readonly doi: CanonicalDoi;
  readonly title?: string | null;
  readonly subtitle?: string | null;
  readonly authors?: readonly AuthorInput[];
  readonly journalTitle?: string | null;
  readonly dates?: { readonly [kind in keyof PublicationDates]?: PublicationDateInput | null };
  readonly volume?: string | null;
  readonly issue?: string | null;
  readonly pages?: string | null;
  readonly articleNumber?: string | null;
  readonly language?: string | null;
};

const DATE_KINDS = ["print", "online", "published", "issued"] as const;

// A blank value is a missing value. A value that is not blank is kept exactly as supplied.
const valueOrMissing = (value: string | null | undefined): string | null =>
  value == null || value.trim() === "" ? null : value;

// Names keep their content but lose surrounding whitespace; a blank name is a missing name.
const nameOrMissing = (name: string | null | undefined): string | null => name?.trim() || null;

const toDate = (date: PublicationDateInput | null | undefined): PublicationDate | null => {
  if (date == null) return null;
  const month = date.month ?? null;
  return { year: date.year, month, day: month === null ? null : (date.day ?? null) };
};

// An entry that supplies no name at all cannot be represented without inventing one, so it is left out.
const toAuthor = (author: AuthorInput): Author | null => {
  if (author.kind === "organisation") {
    const name = nameOrMissing(author.name);
    return name === null ? null : { kind: "organisation", name };
  }
  const family = nameOrMissing(author.family);
  const given = nameOrMissing(author.given);
  return family === null && given === null ? null : { kind: "person", family, given };
};

// Builds the record field by field, so nothing beyond the defined fields can travel with it.
export function createPublication(input: PublicationInput): Publication {
  return {
    doi: input.doi,
    title: valueOrMissing(input.title),
    subtitle: valueOrMissing(input.subtitle),
    authors: (input.authors ?? []).map(toAuthor).filter((author) => author !== null),
    journalTitle: valueOrMissing(input.journalTitle),
    dates: {
      print: toDate(input.dates?.print),
      online: toDate(input.dates?.online),
      published: toDate(input.dates?.published),
      issued: toDate(input.dates?.issued),
    },
    volume: valueOrMissing(input.volume),
    issue: valueOrMissing(input.issue),
    pages: valueOrMissing(input.pages),
    articleNumber: valueOrMissing(input.articleNumber),
    language: valueOrMissing(input.language),
  };
}

const isMissing = (publication: Publication, field: PublicationField): boolean => {
  if (field === "authors") return publication.authors.length === 0;
  if (field === "dates") return DATE_KINDS.every((kind) => publication.dates[kind] === null);
  return publication[field] === null;
};

const OPTIONAL_FIELDS: readonly PublicationField[] = [
  "title",
  "subtitle",
  "authors",
  "journalTitle",
  "dates",
  "volume",
  "issue",
  "pages",
  "articleNumber",
  "language",
];

export function missingFields(publication: Publication): PublicationField[] {
  return OPTIONAL_FIELDS.filter((field) => isMissing(publication, field));
}

export function isSamePublication(a: Publication, b: Publication): boolean {
  return a.doi === b.doi;
}
