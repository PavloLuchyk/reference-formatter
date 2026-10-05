import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import {
  createPublication,
  type AuthorInput,
  type Publication,
  type PublicationDateInput,
} from "@/lib/publication/publication";

// Maps the work record of a Crossref journal article to a Publication,
// following the mapping table in openspec/changes/doi-resolution/design.md.
// The record is untrusted JSON: every field is narrowed before use, and anything unusable counts as missing.

type CrossrefRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is CrossrefRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const trimmedText = (value: unknown): string | null => (typeof value === "string" ? value.trim() || null : null);

// When a list has several entries, only the first is used.
const firstOf = (value: unknown): unknown => (Array.isArray(value) ? value[0] : undefined);

// Markup is text with the syntax of an XML start, end or empty-element tag: a name, then only attributes
// that have a quoted value. Other text in angle brackets, such as `a<b and c>d` or `<111>`, is not markup.
const TAG_NAME = "[A-Za-z_][\\w.:-]*";
const TAG_ATTRIBUTE = `\\s+${TAG_NAME}\\s*=\\s*(?:"[^"<]*"|'[^'<]*')`;
const MARKUP_TAG = new RegExp(`<(?:${TAG_NAME}(?:${TAG_ATTRIBUTE})*\\s*/?|/${TAG_NAME}\\s*)>`, "g");

// Only the five predefined XML entities and numeric character references are decoded;
// any other named entity is kept as supplied.
const ENTITY = /&(#\d+|#[xX][0-9a-fA-F]+|amp|lt|gt|quot|apos);/g;
const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

// Removing a tag between two stretches of whitespace would leave a double gap; only that gap is closed.
const withoutMarkup = (text: string): string =>
  text
    .split(MARKUP_TAG)
    .reduce((joined, part) =>
      /\s$/.test(joined) && /^\s/.test(part) ? `${joined.trimEnd()} ${part.trimStart()}` : joined + part,
    );

const decodeEntity = (entity: string, body: string): string => {
  if (!body.startsWith("#")) return NAMED_ENTITIES[body] ?? entity;
  const codePoint = /^#[xX]/.test(body) ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
  return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
};

// Title, subtitle and journal title: markup removed, entities decoded, surrounding whitespace trimmed.
// Letter case, wording, punctuation and other whitespace stay as supplied.
const cleanedTitle = (value: unknown): string | null =>
  typeof value === "string" ? withoutMarkup(value).replace(ENTITY, decodeEntity).trim() || null : null;

// A Crossref date is { "date-parts": [[year, month?, day?]] }. The precision supplied is kept;
// a date without a year is no date.
const sourceDate = (value: unknown): PublicationDateInput | null => {
  const parts = isRecord(value) ? firstOf(value["date-parts"]) : undefined;
  if (!Array.isArray(parts)) return null;
  const [year, month, day] = parts.map((part) => (Number.isInteger(part) ? (part as number) : null));
  return year == null ? null : { year, month: month ?? null, day: day ?? null };
};

// A personal name wins over a group name on the same entry; an entry without any name is left out.
const author = (entry: unknown): AuthorInput | null => {
  if (!isRecord(entry)) return null;
  const family = trimmedText(entry.family);
  const given = trimmedText(entry.given);
  if (family !== null || given !== null) return { kind: "person", family, given };
  const name = trimmedText(entry.name);
  return name === null ? null : { kind: "organisation", name };
};

export function mapCrossrefWork(doi: CanonicalDoi, work: unknown): Publication {
  const record = isRecord(work) ? work : {};
  const authors = Array.isArray(record.author) ? record.author.map(author).filter((entry) => entry !== null) : [];

  return createPublication({
    doi,
    title: cleanedTitle(firstOf(record.title)),
    subtitle: cleanedTitle(firstOf(record.subtitle)),
    authors,
    journalTitle: cleanedTitle(firstOf(record["container-title"])),
    dates: {
      print: sourceDate(record["published-print"]),
      online: sourceDate(record["published-online"]),
      published: sourceDate(record.published),
      issued: sourceDate(record.issued),
    },
    volume: trimmedText(record.volume),
    issue: trimmedText(record.issue),
    pages: trimmedText(record.page),
    articleNumber: trimmedText(record["article-number"]),
    language: trimmedText(record.language),
  });
}
