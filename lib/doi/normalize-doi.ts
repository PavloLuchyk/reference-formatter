// A DOI in canonical form. Only normalizeDoi produces one, so text typed by the user cannot be used as an identity.
export type CanonicalDoi = string & { readonly __brand: "CanonicalDoi" };

export type DoiNormalization =
  | { readonly ok: true; readonly doi: CanonicalDoi }
  | { readonly ok: false };

export function normalizeDoi(input: string): DoiNormalization {
  void input;
  throw new Error("Not implemented: normalizeDoi");
}
