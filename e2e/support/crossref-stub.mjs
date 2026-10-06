// Makes Crossref deterministic for the browser E2E. Node preloads this module into the one process that
// playwright.config.ts starts as the production server, and into no other: `pnpm dev`, `pnpm start`, `pnpm build`
// and `pnpm check` never load it. Nothing of the product knows about it.
//
// It replaces globalThis.fetch and nothing else. A request to Crossref is answered from the answers recorded in
// lib/metadata/crossref/__fixtures__ (see provenance.json there) or refused; it is never sent. A request to any
// other host goes to the original fetch untouched.
//
// If this module cannot load, Node exits before Next.js starts, so there is no server without it.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const RECORDED = new URL("../../lib/metadata/crossref/__fixtures__/", import.meta.url);
const WORKS_URL = "https://api.crossref.org/works/";

// Where the record of the Crossref boundary is written: a file outside the repository, new for every run, named by
// playwright.config.ts. Without it the stub refuses to load.
const recordFile = process.env.E2E_CROSSREF_RECORD;
if (!recordFile) throw new Error("crossref-stub: E2E_CROSSREF_RECORD is not set; the server is not started.");

// The recorded answers, keyed by the URL the resolver requests for their DOI: the DOI as one percent-encoded segment.
// The list comes from provenance.json alone, so exactly what was recorded is served and nothing else.
const { fixtures } = JSON.parse(readFileSync(new URL("provenance.json", RECORDED), "utf8"));
const recordedByUrl = new Map(fixtures.map((fixture) => [WORKS_URL + encodeURIComponent(fixture.doi), fixture]));

// One line per event, in the record and in the output of the server: the event and, for a request, its method and
// URL. Never a header, the contact address or a body.
const note = (entry) => {
  appendFileSync(recordFile, `${JSON.stringify(entry)}\n`);
  console.log(`[crossref-stub] ${Object.values(entry).join(" ")}`);
};

const isCrossref = (hostname) => hostname === "crossref.org" || hostname.endsWith(".crossref.org");

const originalFetch = globalThis.fetch;

globalThis.fetch = async function crossrefStubFetch(input, init) {
  const requested = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!URL.canParse(requested) || !isCrossref(new URL(requested).hostname)) return originalFetch(input, init);

  const method = String(init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const recorded = method === "GET" ? recordedByUrl.get(requested) : undefined;

  // Fail closed: a Crossref request without a recorded answer is not passed on. The resolver sees no answer.
  if (recorded === undefined) {
    note({ event: "refused", method, url: requested });
    throw new TypeError("crossref-stub: no recorded answer for this request; it was refused and not sent.");
  }

  note({ event: "served", method, url: requested });
  return new Response(readFileSync(new URL(recorded.file, RECORDED)), {
    status: recorded.status,
    headers: { "content-type": recorded.contentType },
  });
};

mkdirSync(dirname(recordFile), { recursive: true });
note({ event: "installed" });
