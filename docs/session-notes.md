# Session notes — handoff

Updated 2026-10-06 after the README and documentation pass that followed the
archive of `browser-e2e`. Every statement was checked against the repository
at that time; nothing is reconstructed from memory. Read `AGENTS.md` and
`docs/intent.md` first; `README.md` is the entry point for setup and
verification.

## Repository state

- Branch `master`, HEAD `6465ef4` (`docs(spec): archive deterministic browser
  verification`). That commit holds the archive of `browser-e2e`, the main
  spec `browser-flow-verification` and the records of the archive. No git
  remote is configured.
- Uncommitted when this file was written, all of it the documentation pass:
  - rewritten: `README.md`, in Ukrainian by the human's decision, in place of
    the `create-next-app` text;
  - modified: this file;
  - new: the twelve run records of the pass. The last three, on the README
    as the human approved it, are `docs-final-check`, `e2e-docs-final` and
    `docs-final-spec-check`. The nine before them: three of the first text
    (`readme-check`, `e2e-readme`, `readme-spec-check`), three of the
    320-line text (`readme-final-check`, `e2e-readme-final`,
    `readme-final-spec-check`) and three of the short README that stands
    now (`readme-short-check`, `e2e-readme-short`,
    `readme-short-spec-check`). See "README and documentation pass" below;
  - modified: `.agent-log/actions.jsonl` (written by the logging hook; it is
    committed on purpose, see `.agent-log/README.md`).
- No source, test, harness, dependency, CI, spec or oracle file is modified,
  and no archived change.
- **No OpenSpec change is active**: `openspec/changes/` holds only
  `archive/`, with four archived changes. `openspec/specs/` holds **eight
  main specs**.

## Slices

| Slice | State | Archive | Main specs |
|---|---|---|---|
| DOI Resolution | done, independently reviewed, archived | `openspec/changes/archive/2026-10-05-doi-resolution/` | `doi-normalization`, `publication-model`, `doi-resolution` |
| DSTU Journal Article Formatter | done, independently reviewed, archived | `openspec/changes/archive/2026-10-05-dstu-journal-formatter/` | `dstu-journal-formatting` |
| Bibliography Workspace | done, independently reviewed, archived | `openspec/changes/archive/2026-10-06-bibliography-workspace/` | `bibliography-workspace`, `metadata-correction`, `bibliography-copy` |
| Browser E2E (the verification change that follows the three feature slices) | done, independently reviewed, archived | `openspec/changes/archive/2026-10-06-browser-e2e/` | `browser-flow-verification` |

Each archived `design.md` holds that change's decisions, readings, deferred
findings, known limitations and Verification history. They still hold.

All three feature slices of `docs/intent.md` and the browser E2E
verification are implemented, independently reviewed and archived. **The MVP
is not yet complete by the Definition of Done of `docs/intent.md`:** the
implementation is complete, the final product acceptance is not given. See
"What is left before the MVP is done" below.

## README and documentation pass (2026-10-06)

- **What stands now: a short README.** By a change of the human's decision
  the detailed README was replaced by a short one of 49 lines, in Ukrainian,
  with the parts the human named: short description, example, the
  capabilities of the MVP, how to run, verification, and a short note of
  limitations. It ends with a pointer to `docs/intent.md` and
  `docs/dstu/rules.md`; by the human's decision it does not link this file.
- **The README is complete and HUMAN-APPROVED as written** (2026-10-06).
  It is not to be rewritten further. This approves the documentation text.
  It is not the final product acceptance, which is the next human decision
  and is not given.
- **What it still says:** the formatting follows the DSTU 8302:2015 profile
  of this project, which has documented source limitations and is not a
  certification of conformity; only journal articles are supported and
  Crossref is the only metadata provider; duplicates are prevented by
  canonical DOI; the list is kept only until the page is reloaded.
- **Wording the human took out:** the README does not call the profile
  human-approved, in any form of the words; it names no course and does not
  call the project a capstone or an assignment; it does not link this file.
  That the profile is HUMAN-APPROVED FOR MVP stands in `docs/dstu/rules.md`
  and in "Human-approved oracles" below.
- **What it no longer says, and where that stands instead:** the status of
  the product and the dated counts (this file); the source limitations of
  the profile (`docs/dstu/rules.md`, section 1.1, and "Source limitations"
  below); the bound of the fail-closed guarantee to Next.js 16.3.8, and that
  recorded Crossref answers do not mean an offline build, taken out of the
  README by the human's decision
  (`AGENTS.md`, the spec `browser-flow-verification`, "Browser E2E" below);
  that no CI run was ever made (below); the architecture, the non-goals, the
  optional `CROSSREF_CONTACT_EMAIL` and the clipboard contract (`docs/intent.md`
  and the main specs).
- **The example** for `10.1038/nature12373` is the literal of row E1 of the
  HUMAN-APPROVED E2E expectation table, character for character as in
  `e2e/primary-flow.e2e.ts`. By the human's decision the README gives the DOI
  and the reference and nothing under them: no provenance, no date of the
  recorded answer, no qualification.
- **History of the day.** A first text of 454 lines; an editorial pass on the
  human's dispositions to 320 lines; that 320-line text was approved by the
  human and then replaced by the short one. The detailed texts were never
  committed. Neither a clone URL, a licence, a deployment nor an
  `.env.example` was ever named or added.
- **Final verification of the documentation state**, run on the human's
  instruction after the approval, at `6465ef4` with the approved README and
  this file uncommitted; every record names the commit and the tree:
  - `pnpm check`: GREEN, 18 test files, 688 tests, typecheck, lint and the
    production build (`evidence/runs/…_docs-final-check.log`);
  - `pnpm e2e`: GREEN, 3 Playwright tests
    (`evidence/runs/…_e2e-docs-final.log`);
  - `pnpm spec:check`: GREEN, eight main specs, no active change, with the
    one informational hint on `dstu-journal-formatting`
    (`evidence/runs/…_docs-final-spec-check.log`).
  All three passed on their first run.
- **The nine earlier records of the pass are kept**, all at `6465ef4`, all
  GREEN on their first run. The rewrites changed `README.md` and this file
  and nothing that runs.
  - On the same 49-line README, before the human approved it as written:
    `…195444Z_readme-short-check.log`, `…195456Z_e2e-readme-short.log`,
    `…195504Z_readme-short-spec-check.log`, with the same results.
  - On the first text: `…183812Z_readme-check.log`,
    `…183831Z_e2e-readme.log`, `…183844Z_readme-spec-check.log`.
  - On the 320-line text: `…191155Z_readme-final-check.log` (`pnpm check`:
    18 test files, 688 tests, typecheck, lint, production build),
    `…191210Z_e2e-readme-final.log` (`pnpm e2e`: 3 Playwright tests),
    `…191219Z_readme-final-spec-check.log` (`pnpm spec:check`: eight main
    specs, no active change, one informational hint).
  No RED was produced for the record.
- `evidence/runs/` holds 109 records with these twelve.
- **No CI run exists.** `.github/workflows/ci.yml` runs `pnpm check` on
  `ubuntu-latest` with Node 24, but no git remote is configured.

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

## Browser E2E (change `browser-e2e`: done, independently reviewed, archived)

- **State.** Done. Implemented, hardened after review 01, independently
  reviewed twice, both times READY, and archived on 2026-10-06 at
  `openspec/changes/archive/2026-10-06-browser-e2e/`, with all 40 of its
  tasks done. The human accepted the archive as performed.
- **The Definition of Done item "the primary browser flow has deterministic
  E2E verification" is HUMAN-ACCEPTED and CLOSED** (2026-10-06).
- **Canonical spec.** `browser-flow-verification` is now a main spec,
  `openspec/specs/browser-flow-verification/spec.md`, with 16 requirements
  and 41 scenarios. It differs from the delta spec of the change only in its
  title and in the heading of the requirements section.
- **Final verification state.** Nothing that runs has changed since the
  hardening commit `a268ad4`; the later commits and the archive change
  documents, specs, evidence and the agent log only.
  - Browser E2E: **3 Playwright tests, GREEN.** On the clean tree at
    `a268ad4`: `evidence/runs/20261006T163716Z_e2e-review01-final-green.log`.
    After the archive, at `b22af1a` with the archive uncommitted:
    `evidence/runs/20261006T180105Z_e2e-post-archive-green.log`.
  - `pnpm check`: **GREEN, the baseline stays 688 tests** in 18 files, with
    typecheck, lint and the production build. On the clean tree at
    `a268ad4`: `…163724Z_e2e-review01-final-check.log`. After the archive:
    `evidence/runs/20261006T175513Z_e2e-archive.log`.
  - `pnpm spec:check`: **GREEN.** After the archive, with eight main specs
    and no active change:
    `evidence/runs/20261006T175511Z_e2e-archive-spec-check.log`.
  - Whitespace of the uncommitted archive and handoff. `git diff --check`
    printed no finding
    (`evidence/runs/20261006T180225Z_e2e-post-archive-diff-check.log`). It
    looks at tracked files only, so the same test was applied to each
    untracked file
    (`evidence/runs/20261006T180250Z_e2e-post-archive-diff-check-untracked-2.log`):
    the five files of the archive and the new main spec are clean. Two run
    records each hold three lines that end in a space, printed by
    `next build`; they are left as they are, because records are never
    edited. A last `git diff --check`, over this file as it now stands, was
    recorded after it was written, under the label
    `e2e-post-archive-diff-check-final`.
- **Command.** `pnpm e2e` makes the ordinary production build and then runs
  the Playwright tests of `e2e/primary-flow.e2e.ts`. It is separate from
  `pnpm check`, which is unchanged and starts no browser. CI is not changed.
- **Setup.** `@playwright/test` 1.63.0, an exact devDependency. Chromium
  only, the build Playwright manages. One worker, zero retries.
  `pnpm exec playwright install chromium` once per machine downloads the
  browser to the cache of Playwright outside the repository; without it
  `pnpm e2e` cannot run.
- **How Crossref is made deterministic.** Playwright hands one command to a
  shell, which starts the Next.js production server as one Node process:
  `node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p 3100`.
  The stub is preloaded by an option of that process and replaces
  `globalThis.fetch` in it. A request for a DOI with a recorded answer gets
  the unmodified recorded response from
  `lib/metadata/crossref/__fixtures__/`. Any other request to Crossref
  fails closed: it is refused without being sent. If the stub cannot load,
  the server does not start; a server that is already running is never
  reused. No product file knows about the stub, and `pnpm dev`,
  `pnpm start`, `pnpm build` and `pnpm check` never load it.
- **The request record.** The stub writes one line per event, with the
  event, the method and the URL only, to a file that each run allocates for
  itself under the temporary folder of the system. A location pre-set by the
  caller is not used. Every test checks, before its first DOI, that the
  record shows the stub installed exactly once. The file is instrumentation
  and is not evidence.
- **BOUND of the fail-closed guarantee, and a REQUIREMENT.** The guarantee is
  bounded to the pinned Next.js 16.3.8 and the verified `next start`
  process model, in which the server serves requests in the process it is
  started in. It is not claimed for another version. A future Next.js
  upgrade requires re-verifying the server start, the preload refusals (a
  missing preload module, a missing `E2E_CROSSREF_RECORD`) and the canary,
  with `pnpm e2e`, recorded, before the claim is carried forward (HD-E20).
  The same stands in `AGENTS.md` and in the main spec.
- **What the three tests cover.** A canary (an unrecorded DOI is refused);
  the primary flow (add, add in another input form, duplicate refused,
  correct the journal title, reorder, copy one, copy all, remove); one
  recorded not-found failure. The expected reference texts R1, R2 and R4 are
  literals from the expectation table of the archived design,
  HUMAN-APPROVED on 2026-10-06. They are never computed, and the table is
  not an oracle for the formatter. Changing one needs a new approval.
- **What it proves.** For the commit and platform a record names: the
  production build, driven through its page, takes a DOI through the Server
  Function, DOI resolution, the mapping and the formatter to the approved
  text; the listed steps behave as the accepted specs say; the application
  passes the specified text to the clipboard; no Crossref request left the
  server.
- **What it does not prove or claim.** Nothing about the current state of
  live Crossref: the provider answers were recorded on 2026-10-05. Nothing
  about another browser or platform, or about what a platform stores on its
  clipboard. **No claim is made that the whole build pipeline is offline.**
  The claim is about the Crossref requests of the server the run starts and
  nothing wider; the build stage was not examined, and `app/layout.tsx`
  takes its fonts through `next/font/google`.
- **The live-Crossref browser evidence remains separate.** The manual
  browser check of 2026-10-06 against live Crossref stays the only evidence
  against the live provider. It is not E2E evidence, and its three records
  are untouched.
- **Review 01** (`evidence/reviews/browser-e2e-review-01.md`), a fresh
  `feature-reviewer` session at `a6c46f8`: READY, one minor finding and six
  notes. The human accepted all seven, and they were hardened in `a268ad4`:
  the record that each run allocates, the stub check in every test, executed
  checks of an occupied port and of a configured contact address, and
  corrections of wording. No product code, no expectation and no oracle
  changed.
- **Review 02** (`evidence/reviews/browser-e2e-review-02.md`), a fresh
  session at `c731798`: verdict **READY**. One documentation note,
  BE-R02-1, on the Verification history; accepted by the human and
  corrected. The human's dispositions are appended below each report. The
  human asked for no further reviewer.
- **Records.** 40 run records labelled `e2e-…` from the change and its
  archive, all of 2026-10-06; the documentation pass adds four,
  `e2e-readme`, `e2e-readme-final`, `e2e-readme-short` and
  `e2e-docs-final`.
  Every browser test passed on its first run; none was
  ever seen to fail on product behaviour, and no RED was produced for the
  record. The failures the records hold: the two expected refusals of the
  server to start (`e2e-preload-required`) and the expected refusal of a
  run on an occupied port (`e2e-review01-port-in-use`), both in GREEN
  records because the checks passed; and one RED record,
  `evidence/runs/20261006T162914Z_e2e-review01-filtered-run.log`. **That
  RED was a defect of the check script**, whose filter word also matched the
  name of the test file. It was not a product RED and not a defect of the
  harness; the corrected check is GREEN (`e2e-review01-filtered-run-2`).
  A second RED record,
  `evidence/runs/20261006T180226Z_e2e-post-archive-diff-check-untracked.log`,
  is also a defect of a check script: the whitespace check of the untracked
  files took the notice git prints about line endings for a finding. No file
  was at fault; the corrected check is GREEN.
  What each record up to the review shows is in the Verification history of
  the archived design; the records of the archive are named only here.
- **Human decisions.** HD-E1 to HD-E23 and the dispositions of both reviews,
  all in `openspec/changes/archive/2026-10-06-browser-e2e/design.md`.

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

- **The primary browser flow has automated evidence, with limits.** See
  "Browser E2E" above: recorded provider answers of 2026-10-05, one machine
  (Windows, Chromium), a fail-closed guarantee bounded to Next.js 16.3.8, no
  claim of an offline build. The component tests still run in jsdom with a
  fake resolver and a stubbed clipboard. The live browser check is one
  unrepeatable pass in one browser on one platform, depends on live Crossref
  and is not E2E evidence.
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
  covered by `app/actions.test.ts`. One deterministic E2E run was made with
  a synthetic address; it shows that the address reaches neither the request
  record nor the output, not what the product sent.

## Other open items

- `README.md` is complete and HUMAN-APPROVED as written (see "README and
  documentation pass" above).
- No `LICENSE` file, no git remote and no deployment exist; the README names
  none of them.
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
  The same holds for `browser-e2e`: its archived design and tasks name
  `openspec/changes/browser-e2e/`, and the header comment of
  `e2e/primary-flow.e2e.ts` speaks of "the design of the change
  browser-e2e", which is now in the archive.

## What is left before the MVP is done

No feature slice and no OpenSpec change is in progress, and nothing is
half-built. Against the Definition of Done of `docs/intent.md`:

| Item of the Definition of Done | State |
|---|---|
| All three feature slices implemented | done |
| Project verification GREEN | done: 688 tests, typecheck, lint, build |
| DSTU expected values have source or human-decision provenance | done: the approved profile and golden oracle |
| Completed slices independently reviewed, findings disposed by the human | done for all three slices and for the browser E2E change |
| Evidence points to real repository states and runs | done; its limits are written down |
| Primary browser flow has deterministic E2E verification | done: **HUMAN-ACCEPTED and CLOSED** on 2026-10-06; 3 Playwright tests GREEN, independently reviewed (READY twice), archived |
| Known limitations documented; repository can be set up and verified from its README | done: the short README holds the setup, the three verification commands and a short note of limitations, and its text is **HUMAN-APPROVED** on 2026-10-06; the limitations in full are documented in this file, in `docs/dstu/rules.md` and in the main specs |
| **Final product acceptance** | **open**: the human's |

Next actions, in the order that seems natural; each needs the human's
decision first:

1. The human's final acceptance of the product. It is the next human
   decision and is not given.
2. The final audit of the rubric and of the evidence, after the product
   acceptance.

The README, this handoff and the twelve records of the documentation pass are
uncommitted when this is written; the human gives the commit.

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
