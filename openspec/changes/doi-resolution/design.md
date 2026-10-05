# Design

## Context

See `proposal.md` for motivation. Current state of the repo:

- Only the `create-next-app` shell exists under `app/`. There is no `lib/` and no
  domain code.
- `AGENTS.md` requires that pure domain code lives in `lib/`, does not depend on
  React, Next.js or network access, that Crossref data stays behind the
  metadata/provider boundary, and that missing metadata is never invented.
- Verification is `pnpm check`; tests are Vitest in the `node` environment.
- Adding dependencies and normative policy choices need human approval.

What was observed from the live Crossref REST API on 2026-10-04 (unauthenticated
`GET https://api.crossref.org/works/{doi}`), so the specs do not rest on memory:

| Request | Result |
|---|---|
| `10.1038/nature12373` | 200 JSON, `status: "ok"`, `message-type: "work"`, `type: "journal-article"` |
| `10.1038/NATURE12373` | same record; `DOI` returned as `10.1038/nature12373` |
| `10.1371/journal.pone.0000308` | journal article; `page: "e308"`, no `article-number`, no `published-print` |
| `10.1007/978-3-319-24277-4` | 200 JSON, `type: "book"` |
| `10.5281/zenodo.3233118` (DataCite) | 404, `text/plain`, body `Resource not found.` |
| `10.1234/this-doi-does-not-exist-xyz` | 404, `text/plain`, body `Resource not found.` |

Observed shapes: `title`, `subtitle`, `container-title` are lists of strings
(`subtitle` was `[]`); `volume`, `issue`, `page`, `language` are strings and may
be absent; `author` entries have `given`, `family`, `sequence`; dates are
`date-parts` lists with one to three numbers, and print and online dates can
differ (`2013-08` versus `2013-07-31` for the Nature article).

Not observed, and therefore assumptions to confirm with a fixture before the
matching code is written: markup inside titles, group authors given only as
`name`, the `article-number` field, a record whose `DOI` differs from the
requested one, the HTTP 429 and 5xx answers, and how a DOI with reserved URL
characters must be encoded in the request path.

## Goals / Non-Goals

**Goals:**

- One call that takes raw user input and returns either a `Publication` or a
  typed failure, usable from any later entry point.
- Normalization and mapping as pure, deterministic functions that can be tested
  without the network.
- Crossref shapes confined to one folder.

**Non-Goals:**

- No entry point. This change adds no route handler, server action or UI; the
  bibliography workspace slice decides where resolution is called from.
- No reading of environment variables inside `lib/`. Configuration is passed in.
- No user-facing wording for failures. Failure kinds are data; Ukrainian messages
  belong to the UI slice.

## Decisions

### Technical decisions (agent's, within the approved architecture)

**TD-1 Module layout.** `lib/doi/` (normalization), `lib/publication/` (the
model), `lib/metadata/` (the provider-neutral resolve operation and failure
kinds) and `lib/metadata/crossref/` (HTTP request, response narrowing, mapping).
Only `lib/metadata/` composes the Crossref folder; nothing else imports it.
Alternative: one flat `lib/` folder. Rejected because the provider boundary would
then be a naming convention instead of a folder that can be checked.

**TD-2 Outcomes are values.** Resolution returns a discriminated union (success
with a `Publication`, or failure with a kind), and does not throw for the five
specified failures. Alternative: exceptions. Rejected because callers would have
to know which errors exist, and the type checker could not enforce handling.

**TD-3 Missing is `null`.** Every optional scalar field is always present and is
either a value or `null`; authors is a list that may be empty. Never `undefined`,
never an empty string. Alternative: omit absent keys. Rejected because "missing"
must be enumerable for the later correction UI.

**TD-4 Network is injected.** The Crossref provider receives the `fetch`
function and its configuration (application name, optional contact address, time
limit) as arguments. Tests pass a fake `fetch`. Alternative: call the global
`fetch` and read `process.env` in place. Rejected by the project rules and
because it would make the provider untestable offline.

**TD-5 Hand-written response narrowing.** The Crossref body is treated as
unknown and narrowed field by field. Alternative: a schema library. Rejected for
now: it is a new dependency for about a dozen fields.

**TD-6 Tests and fixtures.** Tests sit beside the modules as `*.test.ts` and run
in the `node` environment. Crossref answers are recorded once into
`lib/metadata/crossref/__fixtures__/` with a provenance note per file (DOI,
request URL, retrieval time, HTTP status). `pnpm check` never touches the
network. Fixtures are test inputs, not the authority for the mapping: their
expected `Publication` values are derived from the approved mapping table below.

**TD-7 One request, server-side identification.** The request is
`GET https://api.crossref.org/works/{DOI}` with the DOI percent-encoded, an
application-identifying `User-Agent`, and the contact address added only when
configured. A browser cannot set `User-Agent`, so this design expects the later
entry point to run on the server.

### Human decisions (decided 2026-10-05)

These are policies reserved for the human by `docs/intent.md`. The "Decision"
column records the human's answer; the specs implement it.

| ID | Question | Decision | Spec requirement |
|---|---|---|---|
| HD-1 | What is the identity of a DOI? | The normalized DOI is the Publication identity. DOI comparison is case-insensitive for Basic Latin characters. Raw user input is not retained in the Publication. | Canonical DOI is the identity; Canonical DOI is the Publication identity; Publication DOI is the normalized requested DOI |
| HD-2 | Which input forms are accepted? | Only the three approved forms: bare DOI, `doi:`, `https://doi.org/`. Surrounding whitespace is trimmed; prefix and host are case-insensitive. No `http`, no `dx.doi.org`, no punctuation repair, no other input forms. | Accepted DOI input forms; Surrounding whitespace and prefix letter case; Other input forms are rejected; No repair of the DOI |
| HD-3 | How strict is DOI validity? | Structural validation only. | Rejection of input that is not a DOI |
| HD-4 | Which failures exist? | Five are distinguished: invalid input, not found, unsupported publication type, provider unavailable, invalid provider response. Non-journal records are rejected. | Resolution has exactly one outcome; Invalid input is rejected before lookup; Unknown DOI; Only journal articles are resolved; Unusable response |
| HD-5 | Which fields are required? | DOI is the only required field. Other metadata may be missing. The field set is not final and may be extended by the later DSTU profile. | Publication fields |
| HD-6 | Which date gives the publication year? | No precedence is chosen yet. The relevant source date information is preserved for a later human decision. | Source publication dates are preserved; Publication dates are preserved from the record |
| HD-7 | How is title text treated? | Title casing is preserved. Markup and entities are cleaned only when present. The subtitle is kept separate when supplied. | Title text |
| HD-8 | How are authors represented? | Source order is preserved. Persons and organisations are represented explicitly. Missing author data is never invented. | Author representation; Author mapping |
| HD-9 | Is a contact address sent to Crossref? | The Crossref contact email is optional and configurable, never hard-coded. | Identification to Crossref |
| HD-10 | Time limit and retries? | 10-second timeout, one request, no automatic retry for the MVP. | Provider unavailability |

Follow-up decisions by the human on the details the first answers left open
(task 1.5, decided 2026-10-05):

- HD-1: confirmed. The canonical form has Basic Latin letters in lower case and
  other characters unchanged; when the Crossref record states a different DOI,
  the Publication keeps the normalized requested DOI.
- HD-2: both `doi:10.…` and `doi: 10.…` are accepted. Percent-encoding is not
  decoded and no other URL forms are added.
- HD-4: the failure kind name `invalid-input` is accepted.
- HD-5: fixtures are not the authority for field mapping. An explicit
  Crossref-field → Publication-field mapping is reviewed by the human before any
  RED test is written (table below, task 1.6).
- HD-6: confirmed. Source dates are kept with their precision; there is no
  canonical year yet.
- HD-7: title case is preserved; markup is removed and entities are decoded;
  surrounding whitespace is trimmed; whitespace introduced by the cleaning is
  collapsed.
- HD-8: a person is kept if at least a family name or given names are present;
  an organisation is kept if it has a usable group name; only fully nameless
  entries are omitted.

### Crossref field → Publication field mapping (approved by the human on 2026-10-05, task 1.6)

This table is the authority for the mapping. Fixtures and their expected values
are derived from it, never the other way round. Crossref
field names are those observed in the live records listed in Context, except
where marked "not observed".

| Crossref field | Publication field | Rule |
|---|---|---|
| — (the requested DOI, normalized) | DOI | Not taken from the record's `DOI` (HD-1). |
| `type` | — | Must be `journal-article`; otherwise `unsupported-type` (HD-4). Not stored. |
| `title[0]` | title | Cleaned per HD-7. |
| `subtitle[0]` | subtitle | Cleaned per HD-7; kept separate. |
| `container-title[0]` | journal title | Cleaned per HD-7, with the same rules as the title. |
| `author[]`, in order | authors | One author per entry, order kept (HD-8). |
| `author[].family` | person: family name | Surrounding whitespace trimmed; internal content preserved. |
| `author[].given` | person: given names | Surrounding whitespace trimmed; internal content preserved. |
| `author[].name` | organisation: name | Surrounding whitespace trimmed; internal content preserved. Used only when the entry has no usable `family` or `given`; ignored when either is present. Not observed. |
| `published-print.date-parts[0]` | print publication date | Year, year-month or full date, as supplied (HD-6). |
| `published-online.date-parts[0]` | online publication date | Same. |
| `published.date-parts[0]` | published date | Same. |
| `issued.date-parts[0]` | issued date | Same. |
| `volume` | volume | Surrounding whitespace trimmed; internal content preserved. |
| `issue` | issue | Surrounding whitespace trimmed; internal content preserved. |
| `page` | pages | Surrounding whitespace trimmed; internal content preserved, including values such as `e308`. |
| `article-number` | article number | Surrounding whitespace trimmed; internal content preserved. Not observed. |
| `language` | language | Surrounding whitespace trimmed; internal content preserved. |

Rules that apply to every row: an absent field, an empty list, or a string that
is blank after trimming gives a missing Publication field; when a list has more
than one entry only the first is used; a date whose parts contain no year counts
as missing.

Present in the observed records and deliberately not mapped:
`short-container-title`, `short-title`, `original-title`, `ISSN`, `issn-type`,
`publisher`, `URL`, `journal-issue`, `subject`, `created`, `deposited`,
`indexed`, and inside `author[]`: `sequence`, `affiliation`, `role`.

Three points of the table were settled by the human on 2026-10-05: the approved
title-cleaning rules also apply to the journal title; volume, issue, pages,
article number and language have surrounding whitespace trimmed, keep their
internal content, and are missing when blank after trimming; an author entry
with both personal-name fields and `name` is a person and `name` is ignored, the
group name being used only when no usable personal name is present. A fourth
point was settled the same day: author names (`family`, `given`, `name`) also
have surrounding whitespace trimmed, and a name that is blank after trimming is
not usable and counts as not supplied.

## Risks / Trade-offs

- [Strict input forms reject things users commonly paste, such as
  `http://dx.doi.org/…` or a percent-encoded URL] →
  Accepted under HD-2; each is a clear `invalid-input` failure, and a form can be
  added later by a spec update.
- [No publication year exists in the model] → Accepted under HD-6; the formatter
  cannot print a year until the human chooses a precedence, and all four source
  dates are kept so that no choice is closed off.
- [Field set fixed before the DSTU profile exists] → Fields are additive; under
  HD-5 the formatter change can extend `publication-model` through a MODIFIED
  delta.
- [Crossref shape assumptions that were not observed] → Each is listed in
  Context and gets a recorded fixture before its code; if reality differs, the
  spec scenario is corrected first.
- [`not-found` hides "this DOI belongs to another registry"] → Accepted for the
  MVP, where no second provider is allowed; the failure does not claim the DOI is
  nonexistent.
- [Removing markup can lose meaning, such as subscripts in formulas] → Accepted
  under HD-7; the user can correct the title manually in the workspace slice.
- [No retry makes transient Crossref errors visible to the user] → Accepted under
  HD-10; the user can resolve again.
- [Recorded fixtures go stale as Crossref metadata changes] → Fixtures are
  evidence of a dated answer, not a claim about today's record; provenance is
  stored with each.

## Open Questions

- Which source date gives the year printed in a citation is deferred by HD-6 to
  a later human decision, expected with the DSTU formatter change. It does not
  change this slice, which preserves all candidate dates.
- Where the contact address is read from (environment variable name) is decided
  by the slice that adds the entry point; this change only accepts it as
  configuration.
- User-facing wording for each failure kind belongs to the UI slice.
