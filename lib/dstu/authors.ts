import type { Author } from "@/lib/publication/publication";

// Author names under the approved profile (docs/dstu/rules.md). Several rules here rest on rows that are still
// PROVISIONAL in the profile, because the heading standard ДСТУ ГОСТ 7.80:2007 was not verified: P23 (comma after the
// family name), P25 (one uniform name form) and P26 (full stop after the heading). They are approved, not verified.

// The model leaves out an entry without any name; a record built by hand could still hold one. It has nothing to print.
export const printableAuthors = (authors: readonly Author[]): readonly Author[] =>
  authors.filter((author) => author.kind === "organisation" || author.family !== null || author.given !== null);

// D5: a person who lacks one part of the name is printed with the part that is present, and the outcome warns.
export const hasIncompleteName = (authors: readonly Author[]): boolean =>
  authors.some((author) => author.kind === "person" && (author.family === null || author.given === null));

// D2a, D2b, P23 and P25 (both provisional): family name, comma, given value as supplied. D4: an organisation as supplied.
const headingName = (author: Author): string => {
  if (author.kind === "organisation") return author.name;
  const { family, given } = author;
  return family !== null && given !== null ? `${family}, ${given}` : (family ?? given ?? "");
};

// O9: after the slash a person stands in direct order, because the comma separates the authors there (R5).
const directName = (author: Author): string => {
  if (author.kind === "organisation") return author.name;
  const { family, given } = author;
  return family !== null && given !== null ? `${given} ${family}` : (family ?? given ?? "");
};

// O18, O21: a terminal personal-name initial is a letter and a full stop at the end of the last person's name as
// rendered in the heading, the letter standing at its start or after a space, a full stop or a hyphen: `K.`, `K. J.`,
// `K.J.`, `J.-P.`. The rendered name decides, so initials stored in the family name count as well (`Petrenko O. V.`).
// Not generalised: an organisation name or a longer abbreviation such as `Yu.` is not one.
const TERMINAL_INITIAL = /(?:^|[ .\-])\p{L}\.$/u;

export type Heading = { readonly text: string; readonly endsInInitial: boolean };

// N7, D4: one to three authors in source order. D2d: joined by `; `, a human convention; the examples of S1 use commas (C12).
export function renderHeading(authors: readonly Author[]): Heading {
  const last = authors[authors.length - 1];
  return {
    text: authors.map(headingName).join("; "),
    endsInInitial: last?.kind === "person" && TERMINAL_INITIAL.test(headingName(last)),
  };
}

// D3, R5: every author after the slash, in source order, joined by a comma; none is dropped.
export const renderResponsibility = (authors: readonly Author[]): string => authors.map(directName).join(", ");
