import { missingFields, type Publication } from "@/lib/publication/publication";

// Gaps in the optional metadata of an entry, shown at the entry (HD-9, with the gaps the human listed for RD-1).
// A gap says what the available metadata does not give. It is not a claim that the value is required: the formatter
// omits a missing optional element. What "missing" means is decided by the Publication model alone.

export type MetadataGap = "authors" | "volume" | "issue" | "pages-or-article-number";

// In the approved order. Pages and article number are one gap, and only when both are missing.
// A missing subtitle, language or date is never a gap; a missing year is a blocking field of the formatter instead.
export function metadataGaps(publication: Publication): MetadataGap[] {
  const missing = new Set(missingFields(publication));
  const gaps: MetadataGap[] = [];
  if (missing.has("authors")) gaps.push("authors");
  if (missing.has("volume")) gaps.push("volume");
  if (missing.has("issue")) gaps.push("issue");
  if (missing.has("pages") && missing.has("articleNumber")) gaps.push("pages-or-article-number");
  return gaps;
}
