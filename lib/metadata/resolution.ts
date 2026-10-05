import type { Publication } from "@/lib/publication/publication";

// Provider-neutral outcome of resolving a DOI. Expected failures are values, never exceptions.

export type ResolutionFailure =
  | { readonly kind: "invalid-input" }
  | { readonly kind: "not-found" }
  | { readonly kind: "unsupported-type"; readonly type: string | null }
  | { readonly kind: "provider-unavailable" }
  | { readonly kind: "invalid-response" };

export type ResolutionOutcome =
  | { readonly ok: true; readonly publication: Publication }
  | { readonly ok: false; readonly failure: ResolutionFailure };
