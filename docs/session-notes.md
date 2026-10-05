# Session notes — handoff

Updated 2026-10-05 after the final independent review of the DOI Resolution
slice. Every statement below was checked against the repository at that time.
Nothing here is reconstructed from memory.

## Repository state

- Branch `master`, HEAD `1f87b50` (`docs(evidence): record final DOI
  verification gate`). No git remote is configured.
- Code, tests and fixtures at HEAD are identical to `efe01ac`; the commits
  after it changed only `design.md`, `tasks.md` and `evidence/runs/`.
- Working tree, not committed:
  - modified: `openspec/changes/doi-resolution/design.md`, `proposal.md` and
    `tasks.md` (the record of the final review, see below);
  - modified: `.agent-log/actions.jsonl` (written by the logging hook);
  - untracked: this file and `evidence/reviews/doi-resolution-final.md` (the
    standalone record of the final review).
- No source, test, spec or fixture file is modified.

## Active OpenSpec change

- `doi-resolution`, schema `spec-driven`, 28 of 28 tasks done, not archived.
- `openspec/specs/` is empty and nothing is archived: these are the project's
  first specs.
- Contract: `openspec/changes/doi-resolution/specs/{doi-normalization,publication-model,doi-resolution}/spec.md`.
- Decisions, mapping table, risks, verification history:
  `openspec/changes/doi-resolution/design.md`.
- The `openspec` binary is not on the shell PATH. Use `pnpm exec openspec …`
  and `pnpm spec:check`.

## Completed DOI Resolution work (all in HEAD)

- `lib/doi/normalize-doi.ts` — DOI normalization and canonical equivalence.
- `lib/publication/publication.ts` — `Publication` model, `missingFields`,
  `isSamePublication`.
- `lib/metadata/resolution.ts`, `lib/metadata/resolve-doi.ts` — outcome types and
  the single entry point `resolveDoi(input, { fetch, appName, contactEmail })`.
- `lib/metadata/crossref/lookup-work.ts`, `map-work.ts` — the Crossref request and
  the record → `Publication` mapping. Nothing outside `lib/metadata/` imports
  this folder; `app/` does not import `lib/`.
- `lib/metadata/crossref/__fixtures__/` — eight recorded Crossref answers,
  `provenance.json`, human-approved `expected.ts`, test helper `load.ts`.
- Tests: `*.test.ts` beside each module, plus `__tests__/harness.smoke.test.tsx`.

Commit sequence for the slice, oldest first: `50ecad3` spec, `1fd61a4` tests,
`e74c9c6` spec clarification, `299a132` implementation, `c658129` spec,
`3bb01b0` tests, `69b2006` fix, `251e890` spec, `1a23700` and `721257e` tests,
`efe01ac` fix, `008616a` evidence and verification history, `1f87b50` final
gate record.

## Reviews and dispositions

All dispositions are recorded in `design.md`, under Decisions.

- First review, F1–F7. Accepted: F1, F2, F3, F4, F5, F7. Deferred: F6.
  Spec `c658129`, regression tests `3bb01b0`, repair `69b2006`.
- Re-review, R1–R5, all accepted. Spec `251e890`, regression tests `1a23700` and
  `721257e`, repair `efe01ac`.
- Read-only review after the R repair, findings 1–5. Accepted: 1 to 4 (process
  and evidence items, all done). Deferred: 5.
- Final independent review at `1f87b50`, findings 1–4, no blocking findings,
  verdict READY TO ARCHIVE:
  - 1, deferred: four spec-stated behaviours are implemented but not pinned by
    a test. A test-hardening gap; no tests are added in this slice.
  - 2, accepted as an evidence limitation: task 8.4 was performed but has no
    durable recorded result and is not claimed as formal mutation evidence.
  - 3, accepted: `proposal.md` corrected (OpenSpec added as development and
    tooling infrastructure, `spec:check` introduced, no runtime dependency).
  - 4, accepted: this file brought up to date.

## Deferred findings and known limitations

Recorded in `design.md`, Risks. Do not fix any of them without a new decision.

- F6: a malformed contact address (for example one containing a line break)
  makes the request fail and is reported as `provider-unavailable`.
  Application configuration is trusted input for this MVP.
- Literal no-break space (finding 5 of the read-only review): `5`, U+00A0,
  `<i></i> km` becomes `5 km` with an ordinary space.
- Unpinned behaviours (finding 1 of the final review): rejection of stacked
  prefixes such as `doi:https://doi.org/10.1038/x`; no space added by a
  matched tag pair after an empty-element tag; numeric references to
  U+007F–U+009F kept as supplied; the author rules of `createPublication`
  when it is called directly.

## Open tasks

None in `openspec/changes/doi-resolution/tasks.md`.

## Last verified commands

Run on `1f87b50` with the uncommitted record of the final review in place.
Neither run was recorded with `scripts/record-run.sh`.

| Command | Result |
|---|---|
| `pnpm check` | exit 0 — 5 test files, 176 tests passed; typecheck, lint and build passed |
| `pnpm spec:check` | exit 0 — 1 passed, 0 failed |

## Evidence (`evidence/runs/`)

All fifteen records are tracked in git. The four baseline records of
2026-10-04 predate the slice; the eleven below belong to it.

| Record | Commit | Tree | Result |
|---|---|---|---|
| `20261005T084211Z_doi-normalization-red.log` | `50ecad3` | dirty | RED, 23 failed |
| `20261005T084623Z_doi-resolution-red.log` | `50ecad3` | dirty | RED, 109 failed |
| `20261005T090742Z_doi-red.log` | `1fd61a4` | clean | RED, 109 failed |
| `20261005T093221Z_doi-resolution-green.log` | `299a132` | clean | GREEN, 121 passed |
| `20261005T101201Z_doi-checker-findings-red.log` | `299a132` | dirty | RED, 19 failed |
| `20261005T101726Z_doi-checker-findings-red.log` | `3bb01b0` | clean | RED, 19 failed |
| `20261005T102608Z_doi-resolution-green.log` | `69b2006` | dirty | GREEN, 152 passed |
| `20261005T104614Z_doi-resolution-green.log` | `efe01ac` | clean | GREEN, 176 passed (closes 7.2) |
| `20261005T105752Z_doi-live-check.log` | `efe01ac` | dirty | GREEN, pass count only |
| `20261005T105814Z_doi-live-check.log` | `efe01ac` | dirty | GREEN, one request and the outcome shown (closes 7.1) |
| `20261005T110119Z_doi-final-gate.log` | `008616a` | dirty | GREEN, 176 passed |

The three records marked dirty at `efe01ac` and `008616a` are dirty only
because of untracked files (the throwaway live-check test, this file).

Limits of this evidence, per `design.md`, Verification history: the first three
RED runs failed only on stubs throwing "Not implemented", not on assertions;
there is no recorded RED for the R1/R3/R4 regression tests, only a later
reconstruction; no mutation check has a run record.

## Next exact action

The human reviews the uncommitted diff (`design.md`, `proposal.md`, `tasks.md`,
`evidence/reviews/doi-resolution-final.md`, this file) and decides whether to
commit it and whether this file is committed at all. Then archive with `/opsx:archive doi-resolution`. Nothing has been
archived or committed by the agent.

## Do not change casually

- The three spec files and the decision tables and mapping table in `design.md`:
  accepted or approved by the human. Change the spec first, then tests, then code.
- `lib/metadata/crossref/__fixtures__/`: recorded answers and `provenance.json`
  are never edited (record a new one instead); `expected.ts` was approved by the
  human on 2026-10-05.
- Existing tests: never weaken an assertion to get GREEN.
- `evidence/runs/`: records are never edited by hand.
- `.claude/settings.json`, `.claude/hooks/`, `package.json` dependencies and
  scripts, `.github/workflows/ci.yml`: ask the human first (`AGENTS.md`).
- Out of this change: DSTU formatting, workspace UI, any entry point in `app/`,
  retries, caching, fallback providers. The choice of publication year is
  deferred (HD-6); the model keeps the four source dates.
- Standing rules from `AGENTS.md`: pnpm only; no commit unless asked; DSTU
  8302:2015 rules never from model memory.
