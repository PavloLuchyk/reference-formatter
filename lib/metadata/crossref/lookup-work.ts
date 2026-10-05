import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import { isRecord, mapCrossrefWork } from "@/lib/metadata/crossref/map-work";
import type { ResolutionFailure, ResolutionOutcome } from "@/lib/metadata/resolution";

// Looks a DOI up in the Crossref REST API: one request, no retry, no other source.
// Everything Crossref-specific ends here; callers see only a Publication or a failure kind.

export type CrossrefLookupOptions = {
  readonly fetch: typeof fetch;
  readonly appName: string;
  readonly contactEmail?: string | null;
};

const WORKS_URL = "https://api.crossref.org/works/";
const TIMEOUT_MS = 10_000;

const failed = (failure: ResolutionFailure): ResolutionOutcome => ({ ok: false, failure });

// The slashes of a DOI stay path separators, as in the requests the fixtures were recorded with;
// every other reserved character is percent-encoded.
const workUrl = (doi: CanonicalDoi): string => WORKS_URL + doi.split("/").map(encodeURIComponent).join("/");

// The application always names itself; a contact address is added only when one has been configured.
const userAgent = ({ appName, contactEmail }: CrossrefLookupOptions): string => {
  const contact = contactEmail?.trim();
  return contact ? `${appName} (mailto:${contact})` : appName;
};

export async function lookupCrossrefWork(doi: CanonicalDoi, options: CrossrefLookupOptions): Promise<ResolutionOutcome> {
  let status: number;
  let body: string;
  try {
    const response = await options.fetch(workUrl(doi), {
      method: "GET",
      headers: { "User-Agent": userAgent(options) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = response.status;
    body = status === 200 ? await response.text() : "";
  } catch {
    // No answer in time, or no answer at all.
    return failed({ kind: "provider-unavailable" });
  }

  // Crossref answers 404 both for a DOI that does not exist and for one registered with another agency.
  if (status === 404) return failed({ kind: "not-found" });
  if (status === 429 || status >= 500) return failed({ kind: "provider-unavailable" });
  if (status !== 200) return failed({ kind: "invalid-response" });

  let answer: unknown;
  try {
    answer = JSON.parse(body);
  } catch {
    return failed({ kind: "invalid-response" });
  }
  if (!isRecord(answer) || answer["message-type"] !== "work" || !isRecord(answer.message)) {
    return failed({ kind: "invalid-response" });
  }

  const work = answer.message;
  if (work.type !== "journal-article") {
    return failed({ kind: "unsupported-type", type: typeof work.type === "string" ? work.type : null });
  }

  return { ok: true, publication: mapCrossrefWork(doi, work) };
}
