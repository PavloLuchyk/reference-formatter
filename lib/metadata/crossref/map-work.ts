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

// Text has the shape of a tag when it has the syntax of an XML start, end or empty-element tag: a name,
// then only attributes that have a quoted value. `a<b and c>d` and `<111>` do not have that shape.
const TAG_NAME = "[A-Za-z_][\\w.:-]*";
const TAG_ATTRIBUTE = `\\s+${TAG_NAME}\\s*=\\s*(?:"[^"<]*"|'[^'<]*')`;
const TAG_SHAPE = new RegExp(
  `<(?:(?<opening>${TAG_NAME})(?:${TAG_ATTRIBUTE})*\\s*(?<empty>/)?|/(?<closing>${TAG_NAME})\\s*)>`,
  "g",
);

type Range = readonly [start: number, end: number];

// Tag-shaped text is markup only as an empty-element tag, or as an opening tag that a later closing tag
// of the same name closes. An opening tag that is never closed, or a closing tag that was never opened,
// is ordinary text and stays in the title.
const markupRanges = (text: string): Range[] => {
  const markup: Range[] = [];
  const unclosed = new Map<string, Range[]>();
  for (const tag of text.matchAll(TAG_SHAPE)) {
    const range: Range = [tag.index, tag.index + tag[0].length];
    const { opening, empty, closing } = tag.groups ?? {};
    if (empty !== undefined) {
      markup.push(range);
    } else if (opening !== undefined) {
      unclosed.set(opening, [...(unclosed.get(opening) ?? []), range]);
    } else {
      const opened = unclosed.get(closing)?.pop();
      if (opened !== undefined) markup.push(opened, range);
    }
  }
  return markup.sort((a, b) => a[0] - b[0]);
};

// Removing a tag between two stretches of whitespace would leave a double gap; only that gap is closed.
const withoutMarkup = (text: string): string => {
  const kept: string[] = [];
  let from = 0;
  for (const [start, end] of markupRanges(text)) {
    kept.push(text.slice(from, start));
    from = end;
  }
  kept.push(text.slice(from));
  return kept.reduce((joined, part) =>
    /\s$/.test(joined) && /^\s/.test(part) ? `${joined.trimEnd()} ${part.trimStart()}` : joined + part,
  );
};

// Only the five predefined XML entities and numeric character references are decoded;
// any other named entity is kept as supplied.
const ENTITY = /&(#\d+|#[xX][0-9a-fA-F]+|amp|lt|gt|quot|apos);/g;
const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

const TAB = 0x09;
const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;

// A numeric reference is decoded only to a real character: not a surrogate, not beyond Unicode,
// and not a control character other than tab, line feed and carriage return.
const isUsableCharacter = (codePoint: number): boolean => {
  if (codePoint === TAB || codePoint === LINE_FEED || codePoint === CARRIAGE_RETURN) return true;
  const isControl = codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f);
  const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
  return !isControl && !isSurrogate && codePoint <= 0x10ffff;
};

// The character an entity stands for, or null when the entity is to be kept as supplied.
const decodedCharacter = (body: string): string | null => {
  if (!body.startsWith("#")) return NAMED_ENTITIES[body] ?? null;
  const codePoint = /^#[xX]/.test(body) ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
  return isUsableCharacter(codePoint) ? String.fromCodePoint(codePoint) : null;
};

// A private-use character that does not occur in the text, to mark where decoding produced whitespace.
const unusedCharacter = (text: string): string => {
  let code = 0xe000;
  while (text.includes(String.fromCharCode(code))) code++;
  return String.fromCharCode(code);
};

// A run of spaces, tabs and line breaks that contains decoded whitespace becomes one space.
// A decoded no-break space is not in that set and stays; whitespace that touches nothing decoded stays too.
const decodeEntities = (text: string): string => {
  const mark = unusedCharacter(text);
  const decoded = text.replace(ENTITY, (entity, body: string) => {
    const character = decodedCharacter(body);
    if (character === null) return entity;
    return /^[ \t\n\r]$/.test(character) ? mark : character;
  });
  return decoded.replace(new RegExp(`[ \\t\\n\\r]*${mark}[ \\t\\n\\r${mark}]*`, "g"), " ");
};

// Title, subtitle and journal title: markup removed, then entities decoded, then surrounding whitespace trimmed.
// Letter case, wording, punctuation and other whitespace stay as supplied.
const cleanedTitle = (value: unknown): string | null =>
  typeof value === "string" ? decodeEntities(withoutMarkup(value)).trim() || null : null;

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
