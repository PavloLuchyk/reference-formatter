"use server";

import type { ResolutionOutcome } from "@/lib/metadata/resolution";
import { resolveDoi } from "@/lib/metadata/resolve-doi";

// The one Server Function of the workspace: it gives the page the existing DOI resolution, which has to run on the
// server because the request to Crossref identifies the application. Nothing about Crossref is written here.

const APP_NAME = "reference-formatter";

// Server-only configuration: the optional contact address sent to Crossref. It is read here, on the server, and is
// never part of what the function returns.
const contactEmail = (): string | undefined => process.env.CROSSREF_CONTACT_EMAIL;

// A Server Function is reachable by a direct POST, so the argument is not trusted to be a string. A string is
// validated by DOI normalization inside resolveDoi before any request is made.
export async function resolveDoiAction(input: string): Promise<ResolutionOutcome> {
  if (typeof input !== "string") return { ok: false, failure: { kind: "invalid-input" } };

  return resolveDoi(input, { fetch, appName: APP_NAME, contactEmail: contactEmail() });
}
