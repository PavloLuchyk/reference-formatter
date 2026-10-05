import { hasIncompleteName, printableAuthors, renderHeading, renderResponsibility } from "@/lib/dstu/authors";
import { endReference, joinHeading, joinWithFullStop, type Joined } from "@/lib/dstu/boundary";
import { normaliseSerialNumber } from "@/lib/dstu/serial-number";
import type { Publication, PublicationDates } from "@/lib/publication/publication";

// Formats a journal article as a full, primary endnote reference under the approved DSTU 8302:2015 profile
// (docs/dstu/rules.md, HUMAN-APPROVED FOR MVP with documented source limitations). IDs in comments (D…, O…, R…, N…,
// P…, C…) name rows of that profile. Rows called provisional there stay provisional: approved, not verified.
// Expected outcomes are values, never exceptions. Nothing is invented for a missing value.

export type FormatWarning = "subtitle-capitalisation" | "incomplete-personal-name" | "full-stop-collision";

export type BlockingField = "title" | "journalTitle" | "year";

export type FormatOutcome =
  | { readonly kind: "formatted"; readonly text: string; readonly warnings: readonly FormatWarning[] }
  | { readonly kind: "cannot-format"; readonly blockedBy: readonly BlockingField[] };

// D13: the designations are Ukrainian for every reference. The letters are Cyrillic, not Latin T and C.
const VOLUME_DESIGNATION = "Т."; // Т.
const ISSUE_DESIGNATION = "№"; // №
const PAGES_DESIGNATION = "С."; // С.
const EM_DASH = "—";

// N7: the heading holds at most three authors. P21, P22 (PROVISIONAL): with more, the entry goes under its title.
const MAX_HEADING_AUTHORS = 3;

// D11: the year comes from the first date present in this order; month and day are not used.
const YEAR_SOURCES = ["print", "issued", "published", "online"] as const satisfies readonly (keyof PublicationDates)[];

const selectYear = (dates: PublicationDates): number | null => {
  for (const source of YEAR_SOURCES) {
    const date = dates[source];
    if (date !== null) return date.year;
  }
  return null;
};

// O13: the subtitle is never lower-cased; the warning is raised when its first cased letter is not lower case.
const FIRST_CASED_LETTER = /[\p{Lu}\p{Ll}\p{Lt}]/u;
const LOWER_CASE_LETTER = /^\p{Ll}$/u;

const subtitleBeginsUpperCase = (subtitle: string): boolean => {
  const first = FIRST_CASED_LETTER.exec(subtitle)?.[0];
  return first !== undefined && !LOWER_CASE_LETTER.test(first);
};

// R2: the volume always takes its designation, whether or not its value was normalised.
const renderVolume = (volume: string): string => `${VOLUME_DESIGNATION} ${normaliseSerialNumber(volume) ?? volume}`;

// D10, O3, O14: only a number or a pair of numbers takes the designation; any other value is printed as supplied.
const renderIssue = (issue: string): string => {
  const number = normaliseSerialNumber(issue);
  return number === null ? issue : `${ISSUE_DESIGNATION} ${number}`;
};

// D9: one zone, the volume first; null when neither is present.
const renderSerialZone = (volume: string | null, issue: string | null): string | null => {
  const parts = [volume === null ? null : renderVolume(volume), issue === null ? null : renderIssue(issue)];
  const present = parts.filter((part) => part !== null);
  return present.length === 0 ? null : present.join(", ");
};

// O8: digits, one hyphen, en dash or em dash, digits, with optional ordinary spaces around the separator.
const PLAIN_PAGE_RANGE = /^([0-9]+) *[-–—] *([0-9]+)$/;

// D12, O6, R4: the designation and one space, then the value; only a plain numeric range is rewritten, with an em dash.
const renderPages = (pages: string): string => {
  const range = PLAIN_PAGE_RANGE.exec(pages);
  return `${PAGES_DESIGNATION} ${range === null ? pages : `${range[1]}${EM_DASH}${range[2]}`}`;
};

// O4: pages win. D12c: without pages the article number is the locator, bare. Null when both are missing.
const renderLocator = (pages: string | null, articleNumber: string | null): string | null =>
  pages === null ? articleNumber : renderPages(pages);

export function formatJournalArticle(publication: Publication): FormatOutcome {
  const { title, subtitle, journalTitle } = publication;
  const year = selectYear(publication.dates);

  // D16: only these three block formatting, and every missing one is named.
  if (title === null || journalTitle === null || year === null) {
    const blockedBy: BlockingField[] = [];
    if (title === null) blockedBy.push("title");
    if (journalTitle === null) blockedBy.push("journalTitle");
    if (year === null) blockedBy.push("year");
    return { kind: "cannot-format", blockedBy };
  }

  const authors = printableAuthors(publication.authors);
  const inHeading = authors.length >= 1 && authors.length <= MAX_HEADING_AUTHORS;
  // D3a: four or more authors all follow the slash. P43 (PROVISIONAL): without authors the entry begins with its title.
  const responsibility = authors.length > MAX_HEADING_AUTHORS ? ` / ${renderResponsibility(authors)}` : "";

  // D6: the subtitle follows a spaced colon, as supplied. D7: two slashes, spaced, join the article and the journal (D8: as supplied).
  const article = `${title}${subtitle === null ? "" : ` : ${subtitle}`}${responsibility} // ${journalTitle}`;

  let collision = false;
  const noteCollision = (joined: Joined): string => {
    collision ||= joined.collision;
    return joined.text;
  };

  let text = article;
  if (inHeading) {
    const heading = renderHeading(authors);
    text = noteCollision(joinHeading(heading.text, heading.endsInInitial, article));
  }

  // P2: a zone that is not given leaves no punctuation behind. D14: the DOI is the last zone; no address, date of access
  // or material designation is printed.
  const zones = [
    String(year),
    renderSerialZone(publication.volume, publication.issue),
    renderLocator(publication.pages, publication.articleNumber),
    `DOI: ${publication.doi}`,
  ];
  for (const zone of zones) {
    if (zone !== null) text = noteCollision(joinWithFullStop(text, zone));
  }

  const warnings: FormatWarning[] = [];
  if (subtitle !== null && subtitleBeginsUpperCase(subtitle)) warnings.push("subtitle-capitalisation");
  if (hasIncompleteName(authors)) warnings.push("incomplete-personal-name");
  if (collision) warnings.push("full-stop-collision");

  return { kind: "formatted", text: endReference(text), warnings };
}
