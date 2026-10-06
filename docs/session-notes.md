# Session notes — handoff

Updated 2026-10-06 with the `browser-e2e` change implemented, not yet
committed and not yet reviewed. Every statement was checked against the
repository at that time; nothing is reconstructed from memory. Read
`AGENTS.md` and `docs/intent.md` first.

## Repository state

- Branch `master`, HEAD `1d7976d` (`spec(e2e): define deterministic browser
  verification`), which holds the accepted plan of the `browser-e2e` change.
  No git remote is configured.
- Uncommitted when this file was written, all of it the implementation of
  `browser-e2e`:
  - new: `playwright.config.ts`, `e2e/primary-flow.e2e.ts`,
    `e2e/support/crossref-stub.mjs`, and eleven run records labelled
    `e2e-…` under `evidence/runs/`;
  - modified: `package.json`, `pnpm-lock.yaml`, `.gitignore`, `AGENTS.md`,
    `openspec/changes/browser-e2e/design.md` and `tasks.md`, this file;
  - modified: `.agent-log/actions.jsonl` (written by the logging hook; it is
    committed on purpose, see `.agent-log/README.md`).
- No product source, no existing test, no spec and no oracle file is
  modified: nothing under `app/`, `lib/`, `tests/`, `docs/dstu/` or
  `openspec/specs/`, and not `next.config.ts`.
- One OpenSpec change is active, `openspec/changes/browser-e2e/`, with 22 of
  24 tasks done. `openspec/specs/` holds seven main specs; the change adds an
  eighth, `browser-flow-verification`, when it is archived.

## Slices

| Slice | State | Archive | Main specs |
|---|---|---|---|
| DOI Resolution | done, archived | `openspec/changes/archive/2026-10-05-doi-resolution/` | `doi-normalization`, `publication-model`, `doi-resolution` |
| DSTU Journal Article Formatter | done, archived | `openspec/changes/archive/2026-10-05-dstu-journal-formatter/` | `dstu-journal-formatting` |
| Bibliography Workspace | done, archived | `openspec/changes/archive/2026-10-06-bibliography-workspace/` | `bibliography-workspace`, `metadata-correction`, `bibliography-copy` |

Each archived `design.md` holds that slice's decisions, readings, deferred
findings, known limitations and Verification history. They still hold.

All three feature slices of `docs/intent.md` are implemented, independently
reviewed and archived. **The MVP is not yet complete by the Definition of
Done of `docs/intent.md`:** see "What is left before the MVP is done" below.

## What the workspace is

- `lib/bibliography/` — pure domain code, no React, Next.js or network:
  `workspace.ts` (the ordered list; identity is the canonical DOI through
  `isSamePublication`), `correction.ts` (manual correction as a draft of
  strings), `metadata-gaps.ts` (the entry-level indication),
  `bibliography-text.ts` (the text for copying the whole list).
- `app/actions.ts` — the one Server Function, `resolveDoiAction`. It calls
  the existing `resolveDoi` with the application name `reference-formatter`
  and the optional contact address from the server-side environment variable
  `CROSSREF_CONTACT_EMAIL`. No `.env*` file exists in the repository.
- `app/_components/` — `workspace.tsx` (the only `'use client'` file; all
  page state in one reducer), `entry-card.tsx`, `correction-form.tsx`,
  `copy.ts` (every Ukrainian string).
- `app/page.tsx`, `app/layout.tsx` — the page hands the Server Function to
  the workspace; the document language is `uk`.
- The one touch on a completed slice: `lib/dstu/format-journal-article.ts`
  exports its existing `selectYear`. Nothing else under `lib/doi/`,
  `lib/metadata/`, `lib/publication/` or `lib/dstu/` changed.
- The list lives in the memory of the page and is gone on reload. The page
  says so.

## Browser E2E (change `browser-e2e`, implemented, not committed, not reviewed)

- **Command.** `pnpm e2e` makes the ordinary production build and then runs
  the Playwright tests of `e2e/primary-flow.e2e.ts` in Chromium. It is
  separate from `pnpm check`, which is unchanged and starts no browser. CI
  is not changed.
- **Once per machine.** `pnpm exec playwright install chromium` downloads the
  browser that Playwright manages to its own cache outside the repository.
  Without it `pnpm e2e` cannot run. `@playwright/test` is pinned to 1.63.0.
- **How Crossref is made deterministic.** Playwright starts the Next.js
  production server as one Node process,
  `node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p 3100`.
  The stub replaces `globalThis.fetch` in that process: a request for a DOI
  with a recorded answer gets the unmodified file from
  `lib/metadata/crossref/__fixtures__/`; any other request to Crossref is
  refused without being sent. If the stub cannot load, the server does not
  start. No product file knows about it, and `pnpm dev`, `pnpm start`,
  `pnpm build` and `pnpm check` never load it.
- **What the three tests cover.** A canary (an unrecorded DOI is refused);
  the primary flow (add, add in another input form, duplicate refused,
  correct the journal title, reorder, copy one, copy all, remove); one
  recorded not-found failure. The expected reference texts R1, R2 and R4 are
  literals from the expectation table of the design, HUMAN-APPROVED on
  2026-10-06. They are never computed, and the table is not an oracle for
  the formatter. Changing one needs a new approval.
- **What it proves.** For the commit and platform a record names: the
  production build, driven through its page, takes a DOI through the Server
  Function, DOI resolution, the mapping and the formatter to the approved
  text; the listed steps behave as the accepted specs say; the application
  passes the specified text to the clipboard; no request left the server for
  Crossref.
- **What it does not prove.** Anything about the current state of live
  Crossref: the provider answers were recorded on 2026-10-05. The live
  browser check of 2026-10-06 stays the only evidence against live Crossref
  and is separate evidence; its three records are untouched. Nor does it
  show another browser or platform, or what a platform stores on its
  clipboard.
- **REQUIREMENT on a Next.js upgrade.** The deterministic stub is verified
  against `next` 16.3.8 only, where `next start` serves requests in the
  process it is started in. The fail-closed claim is not made for another
  version. Whenever `next` is upgraded, the two refusals to start (a missing
  preload module, a missing `E2E_CROSSREF_RECORD`), the canary and
  `pnpm e2e` must be run and recorded again before the claim is carried
  forward (HD-E20). The same requirement stands in the spec of the change.
- **Records.** Eleven, all of 2026-10-06 at `1d7976d`, the later ones with
  the change uncommitted: `e2e-spec-check`, `e2e-baseline`,
  `e2e-browser-install`, `e2e-preload-required`, `e2e-harness`,
  `e2e-first-run`, `e2e-repeat`, `e2e-untouched`,
  `e2e-tooling-untouched`, `e2e-boundaries`, `e2e-check`. Every test
  passed on its first run; none was ever seen to fail on product behaviour,
  and no RED was produced. The two failures in `e2e-preload-required` are
  the expected refusals of the server to start, not a product RED. What each
  record shows is in the Verification history of the design.
- **Human decisions.** HD-E1 to HD-E23, all in
  `openspec/changes/browser-e2e/design.md`.
- **Open in the change.** Task 4.5: after the human commits the change,
  `pnpm e2e` and `pnpm spec:check` recorded on the clean tree. Task 4.6: an
  independent review by the `feature-reviewer` agent in a fresh session,
  with the human's dispositions. Then the archive, on the human's word.

## Human-approved oracles (protected)

- `docs/dstu/rules.md` — the DSTU 8302:2015 journal-article profile,
  HUMAN-APPROVED FOR MVP on 2026-10-05 with documented source limitations.
  Product-profile decisions D1–D16 and O1–O21 are closed; the human asked for
  no new micro-decisions unless new source evidence exposes a concrete
  unresolved behaviour.
- `tests/golden/dstu-journal.ts` — fixtures GF01 to GF08 with approved
  outcomes; the sole human-approved golden formatter oracle.

Neither was changed by the workspace slice; the record
`evidence/runs/20261006T121947Z_workspace-final-oracles-untouched.log` shows
it for the committed state.

Rule from `AGENTS.md`, Verification: never modify either to make tests pass;
propose any change and get explicit human approval first. Formatter tests
consume the approved oracle and never derive expected values from the
formatter. Workspace tests read the golden fixtures as data and never build an
expected reference by calling the formatter. Documented provisional or source
limitations stay limitations and are not silently "resolved" in code.

## Human decisions of the workspace slice

All in `openspec/changes/archive/2026-10-06-bibliography-workspace/design.md`:

- HD-1 to HD-10, decided 2026-10-06: the corrected year is stored as the
  print date; copy-all is unnumbered lines; copy-all is blocked by an entry
  that cannot be formatted; browser E2E is a later change (HD-4); the nine
  editable fields; trimming of typed values; the year range 1000–9999 as a
  product constraint, with an unchanged year never validated; new entries are
  appended and nothing is sorted; which gaps are shown at an entry; the
  product terms «посилання», «Перелік посилань» and «запис».
- Assumptions kept by the human: AS-4, 6, 7, 8, 11, 12, 13, 14, 15.
- The Ukrainian copy table, rows 1 to 68, is HUMAN-APPROVED for this MVP.
  Changing a string needs a new approval. Row 68, `DOI: {doi}`, was approved
  after review 01.
- **Clipboard clarification.** The `bibliography-copy` contract governs the
  text the application passes to `navigator.clipboard.writeText()`: one LF
  (U+000A) between references and no trailing line break. A platform may then
  store its own line ending; Chrome on Windows stores CR LF. The human
  accepted this as a specification clarification, not a defect, after the
  first browser check ended RED on it. That RED record is preserved.

## Source limitations that must not be silently resolved

Accepted by the human with the profile. Approved is not verified. The
workspace shows what the formatter returns and adds no rule of its own.

- Six provisional heading rows still used by the formatter: P21, P22 (entry
  under its title for four or more authors), P23 (comma after the family
  name), P25 (one uniform name form), P26 (full stop after the heading), P43
  (entry under its title without authors). The text of ДСТУ ГОСТ 7.80:2007
  was not verified (G1).
- Heading authors are separated by `; ` by human convention; the examples of
  S1 use commas (C12).
- The official corrections to S1 are not available (G11); the em dash of a
  page range comes from the uncorrected printing by human decision (O8).
- No place of publication for same-named journals (G10). Names are rendered
  from `family` and `given` only (C9).
- A full stop is doubled after a supplied value ending in `.` that is not a
  terminal initial, with a `full-stop-collision` warning (O17, O18). The
  workspace shows and copies the doubled full stop and shows the warning.
- The profile holds no approved rule on the numbering or order of entries.
  Printing no numbers and keeping the user's order are product decisions
  (HD-2, HD-8), not readings of the standard.
- `references/` (the source PDFs) is not in git.

## Final workspace verification state

- **GREEN, 688 tests.** `pnpm check` on the clean tree at `33871dd`, the last
  commit that changed tests: 18 test files, 688 tests, typecheck, lint and
  production build
  (`evidence/runs/20261006T121910Z_workspace-final-green.log`). No product
  file differs between the implementation commit `78a182e` and HEAD.
- `pnpm spec:check` exits 0 on the same commit
  (`…121922Z_workspace-final-spec-check.log`), with four main specs and the
  active change. It prints one informational hint that a requirement of
  `dstu-journal-formatting` is longer than 500 characters; that is not an
  error.
- Boundary, oracle and tooling checks on that commit:
  `…121934Z_workspace-final-boundaries.log`,
  `…121947Z_workspace-final-oracles-untouched.log`,
  `…121948Z_workspace-final-tooling-untouched.log`. No dependency, CI, hook
  or script changed in this slice.
- **Live browser check completed against live Crossref** on 2026-10-06, at
  `9c30af7` with the then uncommitted slice, on `next dev`: a throwaway
  script outside the repository drove headless Chrome over the DevTools
  protocol through the primary flow with the DOIs `10.1038/nature12373` and
  `10.1371/journal.pone.0000308`. Three records are kept:
  `…105455Z_workspace-manual-browser-check.log` (the driver crashed before
  its first step), `…105522Z_workspace-manual-browser-check.log` (RED: 97
  checks, 3 unexpected, all the CR LF of the Windows clipboard) and
  `…110108Z_workspace-manual-browser-check-repeat.log` (PASS with the
  clarified criterion: 112 checks, none unexpected). It was not repeated
  after the commits, by the human's decision; no product file has changed
  since.
- **After the archive:** `pnpm check` GREEN again, 18 files, 688 tests
  (`…123821Z_workspace-archive.log`), and `pnpm spec:check` exit 0 with seven
  main specs and no active change
  (`…123833Z_workspace-archive-spec-check.log`); both at `0e4c0f3` with the
  archive not yet committed. The three new main specs were created from the
  delta specs; they differ from them only in the title and in the heading of
  the requirements section.
- The slice has 30 run records in `evidence/runs/`, all labelled
  `workspace-…`. What each proves and does not prove is in the Verification
  history of the archived `design.md`, which ends with the closure of the
  review; the two archive records are named only here.

## Maker ≠ Checker review of the workspace: completed

- **Review 01** (`evidence/reviews/bibliography-workspace-review-01.md`), a
  fresh `feature-reviewer` session at `78a182e`: verdict READY, nine
  findings, three minor and six notes, all about evidence, test coverage and
  wording. The human's dispositions are appended below the report.
- **Hardening** for the accepted findings, commit `33871dd`: 15 tests
  (`app/page-shell.test.tsx`, `app/_components/workspace-duplicate-refusal.test.tsx`
  and one test of row 68 in `workspace-entries.test.tsx`), three comment
  corrections and documentation. No product code changed. Tracked as task
  group 5 of the change.
- **Review 02** (`evidence/reviews/bibliography-workspace-review-02.md`), a
  fresh session at `6c330e8`: verdict **READY**. One note, BW-R02-1, on the
  wording of a task note; accepted by the human as a documentation correction
  and corrected, with no test changed. The disposition is appended below the
  report.
- How the workflow runs: the slice is built in the maker session. A separate
  fresh session runs the `feature-reviewer` agent
  (`.claude/agents/feature-reviewer.md`): read-only for everything it
  reviews, it writes one new report per run under `evidence/reviews/` and
  nothing else. The human disposes of every finding. The maker session then
  appends a "Human dispositions" section below the report and never alters
  the report body.
- Run evidence: `evidence/runs/`, written only by
  `bash scripts/record-run.sh <label>`, committed and never edited by hand.

## Evidence limits to keep in mind

Stated in full in the archived `design.md` of the workspace; the ones that
matter most:

- **The primary browser flow now has automated evidence, with limits.** See
  "Browser E2E" above: recorded provider answers of 2026-10-05, one machine
  (Windows, Chromium), runs made on the uncommitted tree, not yet reviewed.
  The component tests still run in jsdom with a fake resolver and a stubbed
  clipboard. The live browser check is one unrepeatable pass in one browser
  on one platform, depends on live Crossref and is not E2E evidence.
- **The E2E tests were born GREEN.** The product already behaved as
  accepted, so none of them was seen to fail on the behaviour it names.
- The UI RED run did not discriminate: nearly every component test failed at
  the same first query, so none was seen to fail on the behaviour it names
  (BW-R01-2, acknowledged). 27 tests passed against the stubs, and the 15
  hardening tests started GREEN; none of those was ever seen to fail.
- The RED states are not commits; the run records and the recorded hashes of
  the test files are what remains. Three of the hashed files changed
  afterwards, by comments and one added test.
- `CROSSREF_CONTACT_EMAIL` was never set in a live run; a stubbed value is
  covered by `app/actions.test.ts`.

## Other open items

- `README.md` is still the `create-next-app` text. The Definition of Done
  asks that the repository can be set up and verified from its README and
  that the limitations are documented there, including the session-only
  list and the `CROSSREF_CONTACT_EMAIL` variable.
- The scaffold images in `public/` are no longer referenced and were left in
  place.
- Known stale references, left as they are: the header comments of
  `lib/dstu/golden.test.ts` and `lib/dstu/format-journal-article.test.ts`
  name the spec at its path before the archive. So do the header comments of
  the workspace tests under `app/` and `lib/bibliography/`, which name
  `openspec/changes/bibliography-workspace/`, and the comments in `copy.ts`,
  `workspace.ts`, `correction.ts` and the test support that speak of "the
  design of the change bibliography-workspace". The archived tasks and design
  also name files and records by the paths they had before the archive.

## What is left before the MVP is done

No feature slice is in progress. The `browser-e2e` change is implemented and
waits for its commit and its review. Against the Definition of Done of
`docs/intent.md`:

| Item of the Definition of Done | State |
|---|---|
| All three feature slices implemented | done |
| Project verification GREEN | done: 688 tests, typecheck, lint, build |
| DSTU expected values have source or human-decision provenance | done: the approved profile and golden oracle |
| Completed slices independently reviewed, findings disposed by the human | done for all three |
| Evidence points to real repository states and runs | done; its limits are written down |
| **Primary browser flow has deterministic E2E verification** | **open until closed by the human**: implemented and recorded GREEN on the uncommitted tree; the commit, the records on the clean tree (task 4.5) and the independent review (task 4.6) remain |
| **Known limitations documented; repository can be set up and verified from its README** | **open**: the README is still the scaffold text |
| **Final product acceptance** | **open**: the human's |

Next actions, in the order that seems natural; each needs the human's
decision first:

1. Finish the `browser-e2e` change: the human commits it; task 4.5 records
   `pnpm e2e` and `pnpm spec:check` on the clean tree; a fresh session runs
   the `feature-reviewer` agent (task 4.6) and the human disposes of its
   findings; then `/opsx:archive` on the human's word.
2. The README and product documentation: setup with pnpm, `pnpm check`,
   `pnpm exec playwright install chromium` and `pnpm e2e`, the optional
   `CROSSREF_CONTACT_EMAIL`, the session-only list, the source limitations
   of the profile, the missing rule on numbering and order.
3. The human's final acceptance of the product.

Explicitly after the MVP, not built: batch paste of several DOIs, partial
failures inside a batch, a clipboard fallback, persistence across a reload,
a reset of a corrected entry, a confirmation before removal.

## Working rules worth repeating

- pnpm only. Use `pnpm exec openspec …`; the binary is not on PATH.
- `pnpm check` must be GREEN before work is reported as done. `pnpm e2e` is
  separate; never weaken the fail-closed stub or its canary to obtain GREEN.
- Do not commit unless asked. In this slice the maker session ran each
  `git commit` on the human's explicit instruction, with the message the
  human gave.
- Ask before changing scope, dependencies, tooling, hooks, agent settings,
  CI, or anything under `.claude/`.
- Policy on metadata, validation, visibility of missing data, ordering and
  terminology is the human's: ask for it as an explicit decision instead of
  filing it as an assumption. Ukrainian copy needs the human's approval of
  the exact wording.
- Never invent a value for missing metadata. DSTU rules never from model
  memory.
