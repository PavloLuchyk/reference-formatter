import { normalizeDoi } from "@/lib/doi/normalize-doi";
import { lookupCrossrefWork } from "@/lib/metadata/crossref/lookup-work";
import type { ResolutionOutcome } from "@/lib/metadata/resolution";

// The network and the configuration are passed in; nothing here reads the environment.
export type ResolveDoiOptions = {
  readonly fetch: typeof fetch;
  readonly appName: string;
  readonly contactEmail?: string | null;
};

// Input that is not a DOI never reaches the network.
export async function resolveDoi(input: string, options: ResolveDoiOptions): Promise<ResolutionOutcome> {
  const normalized = normalizeDoi(input);
  if (!normalized.ok) return { ok: false, failure: { kind: "invalid-input" } };

  return lookupCrossrefWork(normalized.doi, options);
}
