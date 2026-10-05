# Session notes — handoff

Updated 2026-10-05 after the second independent review of the DSTU Journal
Article Formatter slice. Every statement below was checked against the
repository at that time. Nothing here is reconstructed from memory.

## Repository state

- Branch `master`, HEAD `a188b23` (`docs(evidence): record formatter repair
  green`). No git remote is configured.
- Source and tests at HEAD are those of `3e341c4`; the commit after it changed
  only `tasks.md`, one run record and the hook log.
- Working tree when this file was written, not committed:
  - modified: this file and
    `openspec/changes/dstu-journal-formatter/tasks.md` (tasks 4.5 and 4.6
    closed);
  - modified: `.agent-log/actions.jsonl` (written by the logging hook);
  - untracked: `evidence/reviews/dstu-journal-formatter-review-02.md` (the
    reviewer's report, with the human's dispositions appended).
- No source, test, spec or oracle file is modified.

## Slices

- **DOI Resolution** — done and archived as
  `openspec/changes/archive/2026-10-05-doi-resolution/`. Its specs are in
  `openspec/specs/` (`doi-normalization`, `publication-model`,
  `doi-resolution`). Its deferred findings and known limitations are in the
  archived `design.md`, under Risks, and still hold.
- **DSTU Journal Article Formatter** — implementation complete, reviewed, not
  archived. Details below.
- **Bibliography Workspace** — not started.

## Active OpenSpec change

- `dstu-journal-formatter`, schema `spec-driven`, 27 of 27 tasks done, not
  archived.
- Contract: `openspec/changes/dstu-journal-formatter/specs/dstu-journal-formatting/spec.md`
  (24 requirements). It is a delta; `openspec/specs/dstu-journal-formatting/`
  does not exist until the change is archived.
- Technical decisions, readings RD-1 to RD-11, source limitations and the
  Verification history: `openspec/changes/dstu-journal-formatter/design.md`.
- The `openspec` binary is not on the shell PATH. Use `pnpm exec openspec …`
  and `pnpm spec:check`.

## The two human-approved oracles

`AGENTS.md` forbids changing either to make a test pass; any change needs the
human's approval first.

- `docs/dstu/rules.md` — the DSTU 8302:2015 journal-article profile,
  HUMAN-APPROVED FOR MVP on 2026-10-05 with documented source limitations.
  Product-profile decisions D1–D16 and O1–O21 are closed.
- `tests/golden/dstu-journal.ts` — fixtures GF01 to GF08 with their approved
  outcomes; the sole human-approved golden formatter oracle.

Both are unchanged since the baseline of the slice:
`git diff --stat dc76a2e -- docs/dstu/rules.md tests/golden/` printed nothing
when this file was written.

## Completed formatter work (all in HEAD)

- `lib/dstu/format-journal-article.ts` — the entry point
  `formatJournalArticle(publication)` and its outcome types: formatted text
  with warnings, or cannot-format with the blocking fields `title`,
  `journalTitle`, `year`.
- `lib/dstu/serial-number.ts` — Roman numerals and pairs in volume and issue.
- `lib/dstu/authors.ts` — heading, statement of responsibility, terminal
  initial.
- `lib/dstu/boundary.ts` — every full-stop decision between parts.
- `lib/dstu/golden.test.ts` — conformance with the golden oracle.
- `lib/dstu/format-journal-article.test.ts` — targeted verification tests,
  written by hand from the spec; they are not an oracle.
- Nothing outside `lib/dstu/` imports it, and `app/` does not use it yet.

Commit sequence, oldest first: `a961c20` profile approved, `a928230` golden
oracle, `0945a68` oracle rule in `AGENTS.md`, `b5a6008` spec, `dc76a2e`
reviewer agent, `6de412c` implementation and tests, `2d6183b` clean GREEN,
`8ff913e` regression tests after the first review, `82ce571` reviewer may
write its report, `3e341c4` repair of the terminal initial, `a188b23` clean
GREEN after the repair.

## Reviews and dispositions

The maker session and the checker were different sessions in every review.
The checker was the read-only `feature-reviewer` agent
(`.claude/agents/feature-reviewer.md`); every disposition is the human's.

- First review at `2d6183b`, `evidence/reviews/dstu-journal-formatter-review.md`,
  verdict READY, findings F1–F4:
  - F1 rejected as a formatter defect: a person without any name part is
    outside the normalized `Publication` the formatter accepts.
  - F2 accepted: three regression tests added in `8ff913e`.
  - F3 accepted as an evidence limitation, recorded in `design.md`,
    Verification history.
  - F4 acknowledged, no repair.
- Feature review 01 at `82ce571`,
  `evidence/reviews/dstu-journal-formatter-review-01.md`, verdict READY,
  findings R01-1 to R01-4:
  - R01-1 accepted and repaired: a terminal initial is judged on the person's
    name as rendered in the heading, as O18 and O21 say. Spec and RD-6
    clarified, one regression test recorded RED against the unchanged code,
    then `lib/dstu/authors.ts` repaired, all in `3e341c4`.
  - R01-2 accepted: a fresh clean-tree GREEN was recorded after the repair.
  - R01-3 accepted as pending process work; closed with this file.
  - R01-4 dismissed as a defect: the human requested the reviewer change.
- Feature review 02 at `a188b23`,
  `evidence/reviews/dstu-journal-formatter-review-02.md`: `Findings: none`,
  verdict READY TO COMPLETE REVIEW. Its three observations A, B and C were
  acknowledged by the human with no action.

## Source limitations and known limits

Accepted by the human with the profile. They stay limitations; none is
resolved in code, and none may be presented as a verified normative fact.

- **Six provisional heading rows** still used by the formatter: P21 and P22
  (entry under its title for four or more authors), P23 (comma after the
  family name), P25 (one uniform name form), P26 (full stop after the
  heading), P43 (entry under its title without authors). They rest on
  ДСТУ ГОСТ 7.80:2007, whose text was not verified (G1).
- Heading authors are separated by `; ` by human convention, although the
  examples of S1 use commas (C12).
- The official corrections to S1 are not available (G11); the em dash of a
  page range is taken from the uncorrected printing by human decision (O8).
- No place of publication for same-named journals (G10).
- Names are rendered from the `family` and `given` fields only (C9).
- Approved behaviour that can look wrong: a full stop is doubled after a
  supplied value ending in `.` that is not a terminal initial, with a
  `full-stop-collision` warning (O17, O18).
- Evidence limits of the slice, per `design.md`, Verification history: the
  first RED state was never a commit, and several early checks left no run
  record.

## Open tasks

None in `openspec/changes/dstu-journal-formatter/tasks.md`.

## Last verified commands

| Command | Result |
|---|---|
| `pnpm check` | recorded GREEN on a clean tree at `3e341c4`: 7 test files, 355 tests passed; typecheck, lint and build passed (`20261005T201600Z_dstu-formatter-final-green.log`). Not run again for `a188b23` or for this file; only `tasks.md`, evidence and this file changed since |
| `pnpm spec:check` | exit 0 when this file was written — 4 passed, 0 failed; not recorded with `scripts/record-run.sh` |

## Evidence (`evidence/runs/`)

Records of the formatter slice, all tracked in git.

| Record | Commit | Tree | Result |
|---|---|---|---|
| `20261005T155205Z_dstu-profile-approved.log` | `4ad64d5` | dirty | GREEN, 176 passed |
| `20261005T174601Z_golden-inputs.log` | `a961c20` | dirty | GREEN, 176 passed |
| `20261005T175351Z_golden-oracle-approved.log` | `a961c20` | dirty | GREEN, 176 passed |
| `20261005T185848Z_dstu-formatter-baseline.log` | `dc76a2e` | clean | GREEN, 176 passed |
| `20261005T190147Z_dstu-formatter-red.log` | `dc76a2e` | dirty | RED, 172 failed, 179 passed |
| `20261005T190516Z_dstu-formatter-check.log` | `dc76a2e` | dirty | GREEN, 351 passed |
| `20261005T192011Z_dstu-formatter-green.log` | `6de412c` | clean | GREEN, 351 passed (closes 4.4; stale for the final state) |
| `20261005T194353Z_dstu-formatter-review-followup.log` | `2d6183b` | dirty | GREEN, 354 passed |
| `20261005T200927Z_dstu-formatter-r01-red.log` | `82ce571` | dirty | RED, 1 failed, 354 passed |
| `20261005T201010Z_dstu-formatter-r01-repair.log` | `82ce571` | dirty | GREEN, 355 passed |
| `20261005T201600Z_dstu-formatter-final-green.log` | `3e341c4` | clean | GREEN, 355 passed (closes 6.4; the evidence for the final state) |

The final record names `3e341c4`, the commit of the repair. The commit after
it, `a188b23`, holds only that record, the note of task 6.4 and the hook log;
no run was made against `a188b23`.

## Next exact action

The human reviews and commits the uncommitted files listed above. Then archive
the change with `/opsx:archive dstu-journal-formatter`, which syncs the spec
to `openspec/specs/dstu-journal-formatting/`. Nothing has been archived by the
agent.

## Do not change casually

- `docs/dstu/rules.md` and `tests/golden/`: human-approved oracles. Propose a
  change and get approval first; never edit them to get GREEN.
- The spec of the change and the readings in `design.md`: accepted by the
  human. Change the spec first, then tests, then code.
- Existing tests: never weaken an assertion to get GREEN. Formatter tests
  consume the approved oracle and never take expected values from the
  formatter.
- `evidence/runs/` and `evidence/reviews/`: run records are never edited by
  hand; a reviewer's report body is never altered, only a dispositions
  section is appended.
- `lib/metadata/crossref/__fixtures__/`: recorded answers and
  `provenance.json` are never edited; `expected.ts` was approved by the human.
- `.claude/settings.json`, `.claude/hooks/`, `.claude/agents/`, `package.json`
  dependencies and scripts, `.github/workflows/ci.yml`: ask the human first
  (`AGENTS.md`).
- Out of the formatter change: the bibliography workspace, any entry point in
  `app/`, wording of warnings in Ukrainian, rich text, other publication
  types or styles, any change to `Publication`.
- Standing rules from `AGENTS.md`: pnpm only; no commit unless asked; DSTU
  8302:2015 rules never from model memory.
