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

export function createPublication(input: PublicationInput): Publication {
  void input;
  throw new Error("Not implemented: createPublication");
}

export function missingFields(publication: Publication): PublicationField[] {
  void publication;
  throw new Error("Not implemented: missingFields");
}

export function isSamePublication(a: Publication, b: Publication): boolean {
  void a;
  void b;
  throw new Error("Not implemented: isSamePublication");
}
