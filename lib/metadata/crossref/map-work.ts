import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import type { Publication } from "@/lib/publication/publication";

// Maps the work record of a Crossref journal article to a Publication,
// following the mapping table in openspec/changes/doi-resolution/design.md.
export function mapCrossrefWork(doi: CanonicalDoi, work: unknown): Publication {
  void doi;
  void work;
  throw new Error("Not implemented: mapCrossrefWork");
}
