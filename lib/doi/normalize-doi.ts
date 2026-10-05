// A DOI in canonical form. Only normalizeDoi produces one, so text typed by the user cannot be used as an identity.
export type CanonicalDoi = string & { readonly __brand: "CanonicalDoi" };

export type DoiNormalization =
  | { readonly ok: true; readonly doi: CanonicalDoi }
  | { readonly ok: false };

// The only accepted prefixes. Whitespace directly after `doi:` is ignored; nothing else about the DOI is repaired.
const DOI_PREFIX = /^doi:\s*/i;
const RESOLVER_PREFIX = /^https:\/\/doi\.org\//i;

// Structural check only: `10.`, a registrant code of 4 to 9 digits with optional further digit groups,
// `/`, and a non-empty suffix without whitespace or control characters.
const DOI_SHAPE = /^10\.\d{4,9}(?:\.\d+)*\/[^\s\p{Cc}]+$/u;

export function normalizeDoi(input: string): DoiNormalization {
  const trimmed = input.trim();
  const candidate = DOI_PREFIX.test(trimmed) ? trimmed.replace(DOI_PREFIX, "") : trimmed.replace(RESOLVER_PREFIX, "");

  if (!DOI_SHAPE.test(candidate)) return { ok: false };

  // Only Basic Latin letters are lower-cased; every other character stays as written.
  const canonical = candidate.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  return { ok: true, doi: canonical as CanonicalDoi };
}
