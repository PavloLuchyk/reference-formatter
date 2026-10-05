# Session notes — handoff

Updated 2026-10-05 after the `dstu-journal-formatter` change was archived.
Every statement was checked against the repository at that time; nothing is
reconstructed from memory. Read `AGENTS.md` and `docs/intent.md` first.

## Repository state

- Branch `master`, HEAD `e01d436` (`docs(spec): archive DSTU journal
  formatter`). No git remote is configured.
- Uncommitted when this file was written:
  - modified: this file;
  - modified: `.agent-log/actions.jsonl` (written by the logging hook; it is
    committed on purpose, see `.agent-log/README.md`);
  - untracked: `evidence/runs/20261005T205145Z_dstu-formatter-archive.log`
    (GREEN `pnpm check` taken during the archive, tree not committed).
- No source, test, spec or oracle file is modified. No OpenSpec change is
  active: `openspec/changes/` holds only `archive/`.

## Slices

| Slice | State | Archive | Main specs |
|---|---|---|---|
| DOI Resolution | done, archived | `openspec/changes/archive/2026-10-05-doi-resolution/` | `doi-normalization`, `publication-model`, `doi-resolution` |
| DSTU Journal Article Formatter | done, archived | `openspec/changes/archive/2026-10-05-dstu-journal-formatter/` | `dstu-journal-formatting` |
| Bibliography Workspace | **next, not started** | — | — |

Each archived `design.md` holds that slice's decisions, readings, deferred
findings, known limitations and Verification history. They still hold.

What the workspace can build on (all pure, under `lib/`; `app/` is still the
`create-next-app` shell and imports nothing from `lib/`):

- `lib/doi/normalize-doi.ts` — `normalizeDoi`, canonical DOI as identity.
- `lib/metadata/resolve-doi.ts` — `resolveDoi(input, options)` returns a
  `Publication` or a typed failure; `fetch` and configuration are passed in.
- `lib/publication/publication.ts` — `Publication`, `createPublication`,
  `missingFields`, `isSamePublication`.
- `lib/dstu/format-journal-article.ts` — `formatJournalArticle(publication)`
  returns `{ kind: "formatted", text, warnings }` or
  `{ kind: "cannot-format", blockedBy }`. Warnings:
  `subtitle-capitalisation`, `incomplete-personal-name`,
  `full-stop-collision`. Blocking fields: `title`, `journalTitle`, `year`.
  Their Ukrainian wording was left to the workspace.

## Human-approved oracles (protected)

- `docs/dstu/rules.md` — the DSTU 8302:2015 journal-article profile,
  HUMAN-APPROVED FOR MVP on 2026-10-05 with documented source limitations.
  Product-profile decisions D1–D16 and O1–O21 are closed; the human asked for
  no new micro-decisions unless new source evidence exposes a concrete
  unresolved behaviour.
- `tests/golden/dstu-journal.ts` — fixtures GF01 to GF08 with approved
  outcomes; the sole human-approved golden formatter oracle.

Rule from `AGENTS.md`, Verification: never modify either to make tests pass;
propose any change and get explicit human approval first. Formatter tests
consume the approved oracle and never derive expected values from the
formatter. Documented provisional or source limitations stay limitations and
are not silently "resolved" in code.

## Source limitations that must not be silently resolved

Accepted by the human with the profile. Approved is not verified.

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
- Approved behaviour that can look wrong: a full stop is doubled after a
  supplied value ending in `.` that is not a terminal initial, with a
  `full-stop-collision` warning (O17, O18). The workspace should show the
  warning, not hide the full stop.
- `references/` (the source PDFs) is not in git.

## Maker ≠ Checker workflow

- The slice is built in the maker session. A separate fresh session runs the
  `feature-reviewer` agent (`.claude/agents/feature-reviewer.md`): read-only
  for everything it reviews, it writes one new report per run under
  `evidence/reviews/` and nothing else.
- The human disposes of every finding. The maker session then appends a
  "Human dispositions" section below the report and never alters the report
  body. An accepted defect gets a repair cycle: clarify the spec, add a
  regression test, record it RED, repair, record GREEN.
- Review evidence: `evidence/reviews/doi-resolution-final.md`,
  `dstu-journal-formatter-review.md`, `…-review-01.md`, `…-review-02.md`.
  Review 02 of the formatter: `Findings: none`, READY TO COMPLETE REVIEW.
- Run evidence: `evidence/runs/`, written only by
  `bash scripts/record-run.sh <label>`, committed and never edited by hand.

## Final formatter verification state

- `pnpm check` GREEN on a clean tree at `3e341c4`, the last commit that
  changed source or tests: 7 test files, 355 tests, typecheck, lint and build
  (`evidence/runs/20261005T201600Z_dstu-formatter-final-green.log`).
- `pnpm check` GREEN again during the archive at `6b63b16`, tree not
  committed, 355 tests (the untracked record named above).
- `pnpm spec:check` exits 0 with four main specs. It prints one informational
  hint that a requirement of `dstu-journal-formatting` is longer than 500
  characters; that is not an error.
- Evidence limits of the formatter slice are listed in its archived
  `design.md`, Verification history.

Known stale references, left as they are: the header comments of
`lib/dstu/golden.test.ts` and `lib/dstu/format-journal-article.test.ts` name
the spec at its path before the archive.

## Next slice: Bibliography Workspace MVP

Recommended next command: `/opsx:propose bibliography-workspace`

Agreed MVP scope:

- add one DOI at a time;
- duplicate prevention (same canonical DOI);
- manual metadata correction, with the reference recomputed from the
  corrected `Publication`;
- remove an entry;
- reorder entries;
- copy one reference, and copy the whole bibliography.

Explicitly after the MVP, not in this slice:

- batch paste of several DOIs;
- partial failures inside a batch;
- a clipboard fallback;
- other advanced cases.

Constraints already fixed elsewhere: UI copy is Ukrainian; the bibliography
may live in browser memory only (`docs/intent.md`); no auth, database,
scraping, other providers, other publication types or styles (`AGENTS.md`);
read `node_modules/next/dist/docs/` before writing Next.js code; UI, route
and action layers stay thin over `lib/`.

## Working rules worth repeating

- pnpm only. Use `pnpm exec openspec …`; the binary is not on PATH.
- `pnpm check` must be GREEN before work is reported as done.
- Do not commit unless asked. The human has written every commit message.
- Ask before changing scope, dependencies, tooling, hooks, agent settings,
  CI, or anything under `.claude/`.
- Never invent a value for missing metadata. DSTU rules never from model
  memory.
