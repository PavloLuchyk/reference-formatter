import type { ResolutionOutcome } from "@/lib/metadata/resolution";

// The network and the configuration are passed in; nothing here reads the environment.
export type ResolveDoiOptions = {
  readonly fetch: typeof fetch;
  readonly appName: string;
  readonly contactEmail?: string | null;
};

export async function resolveDoi(input: string, options: ResolveDoiOptions): Promise<ResolutionOutcome> {
  void input;
  void options;
  throw new Error("Not implemented: resolveDoi");
}
