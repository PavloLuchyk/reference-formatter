// A DOI in canonical form. Only normalizeDoi produces one, so text typed by the user cannot be used as an identity.
export type CanonicalDoi = string & { readonly __brand: "CanonicalDoi" };

export type DoiNormalization =
  | { readonly ok: true; readonly doi: CanonicalDoi }
  | { readonly ok: false };

// The only accepted prefixes. Whitespace directly after `doi:` is ignored; nothing else about the DOI is repaired.
const DOI_PREFIX = /^doi:\s*/i;
const RESOLVER_PREFIX = /^https:\/\/doi\.org\//i;

// Structural check only: `10.`, a registrant code of 4 to 9 digits with optional further digit groups,
// `/`, and a non-empty suffix without whitespace, control characters or unpaired surrogates.
// With the `u` flag a properly paired surrogate is one character outside `\p{Cs}`; only a lone one is in it.
const DOI_SHAPE = /^10\.\d{4,9}(?:\.\d+)*\/[^\s\p{Cc}\p{Cs}]+$/u;

// Only Basic Latin letters are lower-cased; every other character stays as written.
const lowerCaseBasicLatin = (text: string): string => text.replace(/[A-Z]/g, (letter) => letter.toLowerCase());

export function normalizeDoi(input: string): DoiNormalization {
  const trimmed = input.trim();
  const candidate = DOI_PREFIX.test(trimmed) ? trimmed.replace(DOI_PREFIX, "") : trimmed.replace(RESOLVER_PREFIX, "");

  if (!DOI_SHAPE.test(candidate)) return { ok: false };

  return { ok: true, doi: lowerCaseBasicLatin(candidate) as CanonicalDoi };
}

// Canonical equivalence: the same DOI once Basic Latin letter case is ignored. Nothing else is forgiven.
export function isEquivalentDoi(stated: string, doi: CanonicalDoi): boolean {
  return lowerCaseBasicLatin(stated) === doi;
}
