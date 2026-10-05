# Feature review 02 — dstu-journal-formatter

- Slice: `dstu-journal-formatter` (OpenSpec change `openspec/changes/dstu-journal-formatter/`, not archived)
- Reviewed HEAD: `a188b234bed22a12b899d4855c53a920e08a86f4` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`)
- Checker: feature-reviewer
- Mode: fresh session, read-only apart from this report
- Tools: Read, Grep, Glob, Write (Write used once, for this file)
- Date: 2026-10-05
- Follow-up to: `evidence/reviews/dstu-journal-formatter-review-01.md` (at `82ce571`). That file and `evidence/reviews/dstu-journal-formatter-review.md` were read and not changed.
- File name: the caller named this file `…-review-02.md`; no file of that name existed.

Every statement is labelled **Verified** (the file or record is named), **Source limitation** or **Inference**.

## Verdict

Findings: none

Verdict: READY TO COMPLETE REVIEW

**READY** — the R01-1 repair matches the clarified spec and the wording of O18 and O21, a GREEN `pnpm check` is recorded on a clean tree at the repair commit, the open process tasks are shown as open, and I found no new defect, no change to either oracle and no change outside the slice.

Tasks 4.5 and 4.6 are still unchecked, as the human decided under R01-3. The change is therefore not yet complete as a whole; that is recorded state, not a new finding.

## The four findings of review 01

### R01-1 — terminal initial judged on the rendered name: repaired

- **Verified** (`lib/dstu/authors.ts:33`, `:38-44`): `TERMINAL_INITIAL` is `/(?:^|[ .\-])\p{L}\.$/u` and is tested against `headingName(last)`, the name as it is printed in the heading. It applies only when the last author is a person.
- **Verified** (hand trace of `authors.ts:16-20`, `:42`, `boundary.ts:20-22`, `format-journal-article.ts:105-108`, `:124-125`): for `{ kind: "person", family: "Petrenko O. V.", given: null }` the rendered name is `Petrenko O. V.`; ` V.` matches; `joinHeading` returns the heading, one space and the rest with `collision: false`. The text begins `Petrenko O. V. Base title`. `hasIncompleteName` is true because the given value is null, so the outcome carries `incomplete-personal-name` and no `full-stop-collision`.
- **Verified** (`spec.md:394-401`, `:412-416`): the requirement now says "whose name as rendered in the heading ends in a letter followed by `.`" and "wherever the initials are stored, in the given value or in the family name". The scenario "Initials stored in the family name" states the three expected results.
- **Verified** (`docs/dstu/rules.md:648`, `:664`): O18 says "the final rendered author name" and O21 says "If the rendered heading ends in such an initial". The spec, RD-6 (`design.md:116`) and the code now agree with these words.
- **Verified** (`lib/dstu/format-journal-article.test.ts:567-571`): the regression test compares the whole reference with `"Petrenko O. V. " + AFTER_HEADING`, which fails on a second full stop, and compares the sorted warnings with exactly `["incomplete-personal-name"]`, which fails if the warning is missing or if `full-stop-collision` is present. The expected value is written by hand.
- **Verified** (`evidence/runs/20261005T200927Z_dstu-formatter-r01-red.log`): the test failed against the unrepaired code by an assertion on the text (`Petrenko O. V.. Base title…` received), 1 failed and 354 passed, exit 1. The git status in the record lists the test file, `design.md` and `spec.md` as modified and no file of the implementation. The failing position `:569:33` is the position of that assertion at HEAD.
- **Verified** (`.agent-log/actions.jsonl`, lines 1647-1659): spec, design and test were edited at 20:09:24Z, the RED record starts at 20:09:27Z and ends at 20:09:30Z, and `lib/dstu/authors.ts` was first edited at 20:09:46Z. The order spec, test, RED, repair is what the records show.
- **Inference** (reasoning on the regular expression): for a person with both name parts the rendered name is `family, given`, so the end of the string and the character before the last letter are the same as for the given value alone, with the space after the comma standing in for the start of the value. The repair therefore changes behaviour only for a person without a given value. This agrees with the RED record, where all 354 earlier tests pass with the old code, and with the repair record, where they pass with the new code.
- **Verified** (`authors.ts:42`; tests at `:573-589`): an organisation name and a longer abbreviation such as `Yu.` still keep the heading full stop and warn. The rule is not generalised beyond a person's name.

### R01-2 — clean-tree GREEN for the repaired state: recorded

- **Verified** (`evidence/runs/20261005T201600Z_dstu-formatter-final-green.log`): command `pnpm check`; commit `3e341c46eaadfd6175a4be19563d210ede3e0b1d`; `tree: clean (excluding .agent-log/ and evidence/)`; the full git status lists only `.agent-log/actions.jsonl`; 7 test files, 355 tests passed; typecheck, lint and build passed; `# exit: 0`; `# result: GREEN`.
- **Verified** (`.git/logs/HEAD`, line 33): `3e341c4` is "fix(dstu): repair terminal-initial heading boundary", committed at 20:14:54Z; the record starts at 20:16:00Z.
- **Verified** (`evidence/runs/20261005T201010Z_dstu-formatter-r01-repair.log`): GREEN, exit 0, 355 tests, on a dirty tree at `82ce571`, with `lib/dstu/authors.ts` as the only implementation file in the git status. `tasks.md` task 6.3 describes it so.
- **Verified** (counts): 170 targeted tests in the RED record, 9 conformance tests and 176 earlier tests give 355.
- Stated plainly: the record names `3e341c4`, the commit of the repair, and not the present HEAD `a188b23`. A record cannot name the commit that contains it. See observation A for what separates the two.

### R01-3 — open process work: still shown as open

- **Verified** (`tasks.md:33-34`): tasks 4.5 and 4.6 are unchecked.
- **Verified** (`docs/session-notes.md`): the file was not changed. It still describes the DOI slice at `1f87b50` and does not claim anything about this slice.
- **Verified** (`design.md:239`): "Tasks 4.5 and 4.6 stay open."
- **Verified** (`tasks.md`, `design.md`, `proposal.md`): no file of the change says that the change is complete or archived. The change is under `openspec/changes/`, not under `archive/`.

### R01-4 — reviewer harness change: recorded as authorised, no repair

- **Verified** (`evidence/reviews/dstu-journal-formatter-review-01.md:122`; `design.md:240-241`): the disposition is recorded as "DISMISS AS A DEFECT", with the statement that the human explicitly requested and approved the change and that no agent-setting repair is required.
- **Verified** (`.agent-log/actions.jsonl`; modification order of the files): no Edit or Write on anything under `.claude/` after 19:49:40Z. `.claude/agents/feature-reviewer.md` is older than every file of the repair; `.claude/settings.json` and `.claude/hooks/` are older than both oracles.
- **Verified** (`.claude/agents/feature-reviewer.md`): the definition at HEAD is the one this session runs under.
- Could not check: that the human gave this disposition. The section was written into the review file by the maker session (hook log, line 1665, 20:11:24Z), as the section itself says. The caller of this review states the same disposition.

## Other checks requested

- **Oracles unchanged.** Byte identity could not be checked; no git command can be run. What supports it:
  - **Verified** (the three new run records): none lists `docs/dstu/rules.md` or `tests/golden/` in its git status, and the clean-tree record lists nothing but the hook log.
  - **Verified** (`.agent-log/actions.jsonl`): no Edit or Write on either path after 18:00Z on 2026-10-05; after the baseline both paths appear only in Read and search calls.
  - **Verified** (modification order returned by Glob, corroboration only): both files are older than `20261005T185848Z_dstu-formatter-baseline.log`, the reference state of task 4.2.
  - **Verified** (`spec.md:58`, `:69`; `tests/golden/dstu-journal.ts:56`, `:195`): the full texts of GF01 and GF05 quoted in the spec equal the oracle at HEAD.
  - **Verified** (`docs/dstu/rules.md:648`, `:664`): the rows O18 and O21 read as review 01 quoted them.
- **GF01 to GF08.** **Inference** (my own hand trace of `lib/dstu/` at HEAD for each fixture): the eight outcomes equal the approved ones, text and warnings or blocking field. GF07 (`Okafor`, no full stop) does not match the terminal-initial pattern and keeps `Okafor. `; GF02 ends its heading in `J.-P.` and gets no second full stop. **Verified** (clean-tree record): the conformance test passes within the 355.
- **Oracle consumption.** **Verified** (`lib/dstu/golden.test.ts`; `tests/golden/dstu-journal.ts:25-26`): unchanged in kind since review 01. The conformance test imports the oracle and compares exactly; the oracle imports two types and no formatter code.
- **No acceptance criterion weakened.**
  - **Verified** (`spec.md`): 24 requirements, as review 01 counted. The requirement Full stop after the heading keeps its four earlier scenarios and gains one. Its exception is wider, which is what the human's disposition of R01-1 says.
  - **Verified** (hook log, lines 1647-1653): two Edits on `spec.md`, one on `design.md` and one on the test file before the RED run.
  - **Verified** (RED record; test file): 354 earlier tests still pass and one is added. The three tests that review 01 located at `:87-93` and `:344-351` are at the same lines. No `skip`, `only`, `todo` or snapshot under `lib/dstu/`.
  - **Verified** (`package.json`, `eslint.config.mjs`, `tsconfig.json`, `vitest.config.mts`, `.github/workflows/ci.yml`, `scripts/record-run.sh`, by modification order): all older than both oracles; none appears in a git status of the new records.
- **No unrelated scope change.**
  - **Verified** (git status of the three new records): the files touched by the repair are `lib/dstu/authors.ts`, `lib/dstu/format-journal-article.test.ts`, `design.md`, `spec.md`, the review file and run records. `tasks.md` was edited afterwards (hook log, 20:12Z and 20:16Z).
  - **Verified** (search): non-test code under `lib/dstu/` imports only `lib/dstu/` and types of `lib/publication/`; nothing outside `lib/dstu/` imports it; no `process.env`, network call, `react` or `next`.
  - **Verified** (modification order): `lib/dstu/boundary.ts`, `serial-number.ts`, `format-journal-article.ts` and `golden.test.ts` are older than the first green record of the slice; `lib/publication/`, `lib/doi/`, `lib/metadata/` and `app/` are older than the baseline.
- **No new defect.** I found none. The pattern is the one RD-6 describes and was already in the accepted spec; only the string it is applied to changed. A person without a given value whose family name ends in a letter and `.` after a space, a full stop or a hyphen now gets no second full stop, which is the accepted rule.
- **Limitations still presented as limitations.** **Verified** (`authors.ts:3-5`, `:15`, `:37`; `boundary.ts:18`; `format-journal-article.ts:8`, `:25`, `:92`; `design.md:123-138`; `spec.md:401`): P21, P22, P23, P25, P26, P43 and the `; ` convention (C12) are still called provisional or a human convention. The clarification of RD-6 is described as a restatement of the approved profile, accepted by the human, not as a new decision.
- **Source limitation**: the heading rows rest on ДСТУ ГОСТ 7.80:2007, whose text was not verified (G1), and the corrections to S1 are not available (G11). Both are carried, not resolved.
- **Record consistency.** **Verified** (`.git/logs/HEAD`, the three new records, `scripts/record-run.sh`, hook log): commits, tree states, exit codes, start and finish times and the record layout agree with each other. Nothing looks edited by hand; no run record is newer than its own finish time in the modification order.
- **Oracle doubts for the human**: none.

## Observations that I did not class as findings

These change no claim made in the repository. They are given so that the human sees them; I do not consider them actionable defects.

- **A. One commit lies between the record and HEAD.** **Verified** (`.git/logs/HEAD`, line 34): `a188b23` "docs(evidence): record formatter repair green" follows `3e341c4`. **Inference**: it holds the clean-tree record and the closing note of task 6.4 and no source file. Reasons: the hook log shows only two Edits, both on `tasks.md`, between the end of that run (20:16:14Z) and the commit (20:19:25Z); `tasks.md` is the only reviewed file newer than the record; the working tree at the start of this session differs from HEAD only in the hook log. The diff of `a188b23` could not be read.
- **B. `design.md` does not name the final record.** **Verified** (`design.md:234-238`): the Verification history says that a fresh record replaces the stale one "once the repair is committed (task 6.4)" and gives no file name. **Verified** (`tasks.md:46`): task 6.4 names `20261005T201600Z_dstu-formatter-final-green.log`. The record is reachable through the task; the sentence added to review 01 that the runs "are named in the Verification history" holds for the RED and repair records and, for the final one, only by that reference.
- **C. Task group 6 was written after its first three steps were done.** **Verified** (RED and repair records): neither lists `tasks.md` as modified. **Verified** (hook log, lines 1669-1670): the script that adds group 6 was written at 20:11:24Z and run at 20:12:07Z. The tasks describe what the records show and do not say that they were written beforehand.

## Checks not performed

- No command was run: no `pnpm check`, `pnpm spec:check`, `git diff`, `git show` or `git status`.
- Byte identity of both oracles against `dc76a2e`.
- The diffs of `3e341c4` and `a188b23`, and the wording of the spec, `design.md` and `authors.ts` before the repair. The earlier wording is known only from the quotations in review 01.
- Whether the report part of `dstu-journal-formatter-review-01.md` is unchanged since the reviewer wrote it; the maker session edited that file once afterwards to add the dispositions.
- Whether the dispositions and the commits were given or asked for by the human.
- The output of `pnpm spec:check` for task 6.1. The hook log shows the command at 20:09:24Z; its output was not kept, as the task says.
- The run records of the slice before 19:20Z were not read again in full; their headers and the account in review 01 were used.
- The documents in `references/`; `docs/dstu/rules.md` was taken as given and read in part (sections 1, 8.6 to 8.9).
- Any CI result.
- Limits of the corroboration used: the hook log keeps the first 200 characters of a shell command and does not show edits made through the shell; file modification order can be changed by tools and is not proof of content.

Reviewed: `AGENTS.md`; `docs/intent.md`; `docs/dstu/rules.md` in part; `tests/golden/dstu-journal.ts`; `proposal.md`, `design.md`, `tasks.md` and the spec delta of the change; the six files of `lib/dstu/`; `lib/publication/publication.ts`; the run records `…r01-red`, `…r01-repair` and `…final-green` in full and the headers of `…baseline`, `…green` and `…review-followup`; both earlier review files; `docs/session-notes.md`; `.agent-log/actions.jsonl` by search; `.git/logs/HEAD`; `scripts/record-run.sh`; `.claude/agents/feature-reviewer.md`.

## Verdict

Findings: none

Verdict: READY TO COMPLETE REVIEW

**READY** — the accepted findings R01-1 and R01-2 are repaired and evidenced, R01-3 is honestly open, R01-4 is recorded as authorised, and nothing new was found against the spec, the oracles or the scope of the slice.

The disposition of every finding, and of the three observations above, belongs to the human.

---

## Human dispositions

This section was added by the maker session on 2026-10-05, after the human
gave the dispositions that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

The review returned `Findings: none` and the verdict READY TO COMPLETE REVIEW,
so there is no finding to dispose of. The human disposed of the three
observations:

| Observation | Disposition | Decision |
|---|---|---|
| A | **ACKNOWLEDGE, NO ACTION** | The evidence-only commit after the clean GREEN source commit is acceptable. The run is not presented as made against the later evidence commit |
| B | **ACKNOWLEDGE, NO ACTION** | `design.md` may point through task 6.4 to the named final GREEN record |
| C | **ACKNOWLEDGE, NO ACTION** | Task group 6 was added after the repair work began. It accurately records the observed repair cycle and must not be presented as a pre-existing plan |

With this review the human closed task 4.5 of the change.
