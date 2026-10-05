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

Not observed at that time, and therefore listed as assumptions: markup inside
titles, group authors given only as `name`, the `article-number` field, a record
whose `DOI` differs from the requested one, the HTTP 429 and 5xx answers, and how
a DOI with reserved URL characters must be encoded in the request path.

State of those assumptions on 2026-10-05, after the fixtures and the checker
review:

- Confirmed by recorded fixtures: title markup, group authors as `name`,
  `article-number`, and an article without volume, issue or page
  (`lib/metadata/crossref/__fixtures__/provenance.json`).
- Observed live during the review, not recorded as fixtures: Crossref answers
  `GET /works/10.1038/nature12373/` (trailing slash) with the record for
  `10.1038/nature12373`, so a record's DOI can differ from the requested one;
  Crossref accepts the whole DOI as one percent-encoded path segment
  (`/works/10.1038%2Fnature12373` and a DOI containing `:`, `<`, `>` and `;`
  both answered 200 with the matching record), and answers 404 for
  `10.1038%2Fnature12373%2F` and for DOIs containing `%2F..%2F`.
- Still not observed, tested only with constructed input: the HTTP 429 and 5xx
  answers, an author entry with both a personal name and `name`, and a date
  without a year.

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
function and its configuration (application name, optional contact address) as
arguments. The 10-second limit is fixed by the spec and is a constant of the
provider, not configuration. Tests pass a fake `fetch`. Alternative: call the
global `fetch` and read `process.env` in place. Rejected by the project rules
and because it would make the provider untestable offline.

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
`GET https://api.crossref.org/works/{DOI}`, where the whole canonical DOI is
percent-encoded as a single path segment (its slashes become `%2F`), so that no
DOI content can change the URL. The first implementation kept the slashes as
path separators; the checker review showed that this lets `.`/`..` segments and
a trailing slash reach another work's record (finding F1), so the repair in
task 8.3 replaces it.
The request carries an application-identifying `User-Agent`, and the contact
address is added only when configured. A browser cannot set `User-Agent`, so
this design expects the later entry point to run on the server.

**TD-8 A record is trusted only for its own DOI.** Before any mapping, the
provider compares the DOI stated by the record with the requested canonical DOI,
ignoring Basic Latin letter case. A different or absent DOI is an
`invalid-response`; the record is discarded whole. The check lives in the
provider, so the mapping function still receives the requested DOI and never
reads the record's.

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
  the Publication keeps the normalized requested DOI. (The second half is
  superseded by the clarification of 2026-10-05 below.)
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
- HD-7, clarified by the human on 2026-10-05 during implementation: entity
  decoding for this slice is limited to the five predefined XML entities and
  numeric character references; other named HTML entities are preserved as
  supplied. Markup removal is kept, and text in angle brackets that is not
  markup must not be stripped.
- HD-8: a person is kept if at least a family name or given names are present;
  an organisation is kept if it has a usable group name; only fully nameless
  entries are omitted.

Decisions by the human on 2026-10-05 after the checker review (findings F1–F7):

- Accepted: F1, F2, F3, F4, F5, F7. Deferred: F6, because application
  configuration is trusted input for this MVP and no new failure kind is to be
  introduced.
- HD-1, clarified for F1: Crossref metadata may be accepted only when the DOI
  returned by Crossref is canonically equivalent to the requested DOI. A
  different DOI must produce an invalid provider response; metadata from another
  identity is never adopted. The Crossref request is constructed so that DOI
  contents cannot alter the URL path structure.
- The human wrote the failure as `invalid-provider-response`. It is recorded
  here as the existing kind `invalid-response` (HD-4's "invalid provider
  response"), so that no failure kind is added or renamed. To be corrected if a
  rename was intended.

Cleaning rules written by the agent to close the accepted findings F3–F5. They
are in the specs for the human's review and are not separate human decisions:

- F3: text is markup only as an empty-element tag or as an opening tag with a
  later closing tag of the same name; unmatched tag-shaped text is kept.
- F4: a numeric reference is decoded only when it denotes a Unicode character
  that is neither a surrogate nor a control character other than tab, line feed
  and carriage return.
- F5: a run of spaces, tabs and line breaks that contains a decoded character
  collapses to one space; a decoded no-break space is kept.

Decisions by the human on 2026-10-05 after the re-review (findings R1–R5), all
five accepted:

- R1: a numeric reference to a private-use character was turned into a space by
  the F5 repair. The repair must not rely on a sentinel character that can
  collide with valid title text.
- R3: an input containing an unpaired surrogate is `invalid-input` before any
  provider request.
- R4: removing self-closing markup must not concatenate the adjacent text.
- R2 and R5 are process and evidence items (tasks 7.1 to 7.3 and the untracked
  run records). They are completed after the repair is committed.

How R4 is written in the spec (agent's wording of the human's rule): one or more
empty-element tags standing between two stretches of text with no whitespace on
either side leave exactly one space; matched opening and closing tags still add
none, so `H<sub>2</sub>O` stays `H2O`.

Decisions by the human on 2026-10-05 after the read-only review of the repaired
slice (findings 1–5):

- Accepted: 1 (no recorded live check for task 7.1), 2 (run records not in
  git), 3 (tasks 7.2 and 7.3 open) and 4 (the verification history stopped at
  the F1–F7 cycle). All four are process and evidence items; none changes
  code, tests, fixtures or spec behaviour.
- Deferred: 5, a literal no-break space lost when markup is removed next to it.
  It is recorded under Risks as a known low-severity limitation, and product
  code is not changed for it in this slice.
- Task 7.2 is closed by the existing clean GREEN record at `efe01ac`. Task 7.3
  stays open: it still requires a genuinely fresh independent review.

Final independent review of 2026-10-05 (findings 1–4, numbered separately from
the read-only review above). Reviewed HEAD: `1f87b50`, whose code, tests and
fixtures are identical to `efe01ac`. Reviewer verdict: no blocking findings;
READY TO ARCHIVE once the human has recorded dispositions and closed task 7.3.
Decisions by the human on 2026-10-05:

- 1, deferred. Four behaviours stated in the specs are correct at `1f87b50`
  but no test pins them: a stacked prefix such as
  `doi:https://doi.org/10.1038/x` is rejected; a matched tag pair after an
  empty-element tag adds no space (`A<br/>B<sub>2</sub>O` gives `A B2O`);
  numeric references to U+007F–U+009F are kept as supplied; and
  `createPublication` itself trims author names and drops a nameless person,
  which the tests reach only through the Crossref mapper. Accepted as a
  test-hardening gap; no tests are added in this slice.
- 2, accepted as an evidence limitation. Task 8.4 was performed, but no
  durable record of its result exists, so it is not claimed as formal mutation
  evidence.
- 3, accepted. `proposal.md` said that no dependency was added and no script
  changed. It is corrected: OpenSpec was added as development and tooling
  infrastructure and `spec:check` was introduced; no runtime product dependency
  was added.
- 4, accepted. `docs/session-notes.md` was stale and is brought up to the
  current verified state.
- Still deferred from the earlier reviews, unchanged: F6 (a malformed contact
  address is reported as `provider-unavailable`) and finding 5 of the read-only
  review (a literal no-break space lost next to removed markup). Both are under
  Risks.
- Task 7.3 is closed by this review. Verdict: READY TO ARCHIVE.

### Crossref field → Publication field mapping (approved by the human on 2026-10-05, task 1.6)

This table is the authority for the mapping. Fixtures and their expected values
are derived from it, never the other way round. Crossref
field names are those observed in the live records listed in Context, except
where marked "not observed".

| Crossref field | Publication field | Rule |
|---|---|---|
| — (the requested DOI, normalized) | DOI | Not taken from the record's `DOI`. The record's `DOI` must be canonically equivalent to the requested DOI, otherwise the whole record is rejected as `invalid-response` (HD-1 as clarified on 2026-10-05). |
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
- [A malformed contact address, for example one containing a line break, makes
  the request fail and is reported as `provider-unavailable`] → Finding F6,
  deferred by the human on 2026-10-05: application configuration is trusted
  input for this MVP and no new failure kind is introduced.
- [Matched-tag detection keeps malformed markup, such as an unclosed `<i>`, in
  the title] → Accepted consequence of the F3 rule: visible leftover markup is
  preferred to silently deleted text, and the user can correct it manually in
  the workspace slice.
- [A literal no-break space is lost when removed markup leaves whitespace on
  both sides of the gap: `5`, U+00A0, `<i></i> km` becomes `5 km` with an
  ordinary space. Joining the text around removed markup treats every
  whitespace character as collapsible, while entity decoding keeps a decoded
  no-break space, and the specs do not say what happens to a literal one in
  such a run] → Finding 5 of the review of 2026-10-05, deferred by the human
  as a known low-severity limitation: product code is not changed in this
  slice, no test covers the case, and the user can correct the title manually
  in the workspace slice.
- [Four spec-stated behaviours are implemented but not pinned by a test:
  rejection of stacked prefixes, no space added by a matched tag pair after an
  empty-element tag, numeric references to U+007F–U+009F kept as supplied, and
  the author rules of `createPublication` when it is called directly] →
  Finding 1 of the final independent review of 2026-10-05, deferred by the
  human as a test-hardening gap: a later change to that code could break these
  behaviours without a failing test.

## Verification history

What the recorded evidence does and does not prove, stated plainly.

- **First RED was stub-error-driven, not assertion-level.** The three recorded
  RED runs (`evidence/runs/20261005T084211Z_doi-normalization-red.log`,
  `…T084623Z_doi-resolution-red.log`, and the clean-tree
  `…T090742Z_doi-red.log`) contain no assertion failure at all. Every failing
  test failed because a stub threw `Error: Not implemented: <function>`. Those
  runs prove that the tests loaded, ran and reached unimplemented code; they do
  not prove that any of those 109 assertions can fail for a wrong result.
- **First assertion-level RED was not recorded.** Three angle-bracket regression
  tests failed on assertions before the markup rule was tightened. That run
  happened in the working session and was never written to `evidence/runs/`.
- **GREEN** is recorded in `…T093221Z_doi-resolution-green.log` (121 passed, clean
  tree at `299a132`).
- **Checker review (2026-10-05).** It was carried out by the same agent that
  wrote the tests and the code, so it is not the independent review of task 7.3.
  It applied 54 single-line changes to a copy of the code outside the repository:
  the tests caught 48 and missed 6 (finding F2). That check and the live Crossref
  probes it used are not recorded in `evidence/runs/`.
- **Live check of task 7.1.** It was run once from a throwaway file and passed,
  but its output was not kept, so the repository holds no evidence of it. The
  task is reopened and must be recorded when it is repeated after the repair.
- **Second RED (tasks 8.1–8.2)** is assertion-level and is recorded with
  `bash scripts/record-run.sh doi-checker-findings-red -- pnpm test`.
  The records are `…T101201Z_doi-checker-findings-red.log` (dirty tree at
  `299a132`, before the spec and tests were committed) and
  `…T101726Z_doi-checker-findings-red.log` (clean tree at `3bb01b0`). Each
  shows 19 failed and 133 passed, and every failure is an assertion failure.
- **GREEN after the F1–F5 repair** is recorded in
  `…T102608Z_doi-resolution-green.log` (152 passed at `69b2006`). Its tree was
  dirty: `tasks.md` was modified and not yet committed.
- **Re-review (findings R1–R5, 2026-10-05).** Spec `251e890`, regression tests
  `1a23700` (normalization and resolution) and `721257e` (title cleaning),
  repair `efe01ac`. The agent log shows the re-review in the same agent
  session that wrote the tests and the code, so it is not the independent
  review of task 7.3 either.
- **The R1/R3/R4 assertion RED was not recorded at the time.** No run was
  written to `evidence/runs/` between adding those tests and repairing the
  code, and the title-cleaning tests were committed seconds before the repair,
  although the agent log shows the test files edited before the implementation.
  The RED was reconstructed later, after the repair, during the read-only
  review of 2026-10-05: in a copy outside the repository, the tests of
  `efe01ac` were run against `map-work.ts` and `normalize-doi.ts` of `69b2006`
  and gave 14 failed and 161 passed (the `lib/` tests only), every failure an
  assertion failure in a test added for R1, R3 or R4. That reconstruction
  shows that the tests can fail for the old behaviour. It is not a record that
  the RED was observed before the repair, and no run record was created for it.
- **GREEN after the R1/R3/R4 repair** is recorded in
  `…T104614Z_doi-resolution-green.log`: `pnpm check`, exit 0, 176 passed, clean
  tree at `efe01ac`. This record closes task 7.2.
- **Live check of task 7.1, repeated and recorded on 2026-10-05** at `efe01ac`,
  from a throwaway test file that was deleted after each run. There are two
  records. `…T105752Z_doi-live-check.log` passed, but it shows only the pass
  count, because the default reporter printed no test output; on its own it
  does not show the request or the outcome. `…T105814Z_doi-live-check.log`
  repeats the run with the verbose reporter and prints the throwaway source:
  one request, `GET https://api.crossref.org/works/10.1038%2Fnature12373`,
  answered HTTP 200, and an outcome equal to the approved `Publication` for
  `nature12373.json`. No contact address was sent. Both records report a dirty
  tree only because of two untracked files, the throwaway test and
  `docs/session-notes.md`; no tracked file differed from `efe01ac`.
- **Read-only review after the R repair (2026-10-05).** It was done in a
  separate agent session that had not written the tests or the code, and it
  returned five findings; their dispositions are under Decisions. Its probes
  ran in a copy outside the repository and are not recorded in
  `evidence/runs/`. The human keeps task 7.3 open: a genuinely fresh
  independent review is still required.
- **Repeat mutation check of task 8.4.** The agent log shows a mutation script
  written and run on 2026-10-05 after the F1–F5 repair, seconds before the
  task was ticked. Its output was not kept and no run record exists, so it is
  not formal mutation evidence (finding 2 of the final review).
- **Final gate** is recorded in `…T110119Z_doi-final-gate.log`: `pnpm check`,
  exit 0, 176 passed at `008616a`. The record says the tree is dirty only
  because `docs/session-notes.md` was untracked.
- **Final independent review (2026-10-05)** at `1f87b50`, in a fresh agent
  session that had written none of the tests, code, specs or evidence. It
  returned no blocking findings and four non-blocking ones; their dispositions
  are under Decisions, and it closes task 7.3. What it ran, none of it recorded
  in `evidence/runs/`: `pnpm check` (exit 0, 176 passed) and `pnpm spec:check`
  (exit 0) in the repository; the R1/R3/R4 reconstruction again, with the same
  result of 14 failed and 161 passed; and 78 single-line changes applied to
  copies of the source files outside the repository, of which the tests caught
  69 and missed 9. Four of the nine are finding 1; the other five are
  equivalent changes or lie outside the specs. Like the earlier mutation
  checks, that run is a reviewer's probe, not formal mutation evidence.

## Open Questions

- Which source date gives the year printed in a citation is deferred by HD-6 to
  a later human decision, expected with the DSTU formatter change. It does not
  change this slice, which preserves all candidate dates.
- Where the contact address is read from (environment variable name) is decided
  by the slice that adds the entry point; this change only accepts it as
  configuration.
- User-facing wording for each failure kind belongs to the UI slice.
