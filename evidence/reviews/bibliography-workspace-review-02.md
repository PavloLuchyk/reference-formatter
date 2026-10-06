# Feature review 02 — bibliography-workspace

- Slice: `bibliography-workspace` (OpenSpec change `openspec/changes/bibliography-workspace/`, not archived)
- Reviewed HEAD: `6c330e820630c4c66f05fa4787a884246348570e` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`)
- Working tree at the start of the session (git status given to this session, not re-run): only `.agent-log/actions.jsonl` modified.
- Checker: feature-reviewer
- Mode: fresh session, read-only apart from this report; follow-up to `evidence/reviews/bibliography-workspace-review-01.md` and its Human dispositions
- Tools: Read, Grep, Glob, Write (Write used once, for this file)
- Date: 2026-10-06
- File name: named by the caller; review-01 is not overwritten.

Every statement is labelled **Verified** (the file or record is named), **Source limitation** or **Inference**.

## Verdict

**READY** — every disposition of review 01 is carried out as the human decided, the hardening changed no product code, oracle, dependency or tooling, and the final GREEN (688 tests) is recorded on the clean tree of the hardening commit; one new finding of severity note remains, about the wording of a task note.

Because of that one note I do not write "Findings: none". Tasks 4.6 and 4.7 are open, as recorded. The disposition of the finding belongs to the human.

## Findings

| ID | Severity | Subject |
|---|---|---|
| BW-R02-1 | note | Task 5.7 describes an input that the row-68 test does not submit |

### BW-R02-1 — note — task 5.7 and the input of the row-68 test

- **Affected**: task 5.7 (follow-up to BW-R01-8); `docs/intent.md` ("Evidence must describe events that actually happened").
- **Area**: `openspec/changes/bibliography-workspace/tasks.md:57`; `app/_components/workspace-entries.test.tsx:119-123`; `app/_components/__fixtures__/workspace-driver.tsx:11-15`, `:63-76`.
- **Verified** (`tasks.md:57`): the test "expects exactly `DOI: 10.1038/nature12373` for a record requested as `https://doi.org/10.1038/NATURE12373`".
- **Verified** (the test and the driver): the test builds its record with `createPublication({ doi: canonical("https://doi.org/10.1038/NATURE12373") })`, where `canonical` is the driver's wrapper of `normalizeDoi`. `renderWith` then submits `publication.doi`, which is `10.1038/nature12373`. The URL spelling never reaches the workspace in this test.
- **Reasoning**: the test does what the human asked: it pins the line as `DOI: ` followed by the DOI of the Publication, and a different label, colon or space would fail it. It does not show the step from a non-canonical submission to that line. That step is tested in `workspace-adding.test.tsx:89-99`, which submits the URL form and asserts on the DOI with `toContain`. So no behaviour is left unpinned; only the task's description of the test is inexact. `design.md:692-695` describes the same test accurately.
- **Inference**: that "requested as" means "submitted to the workspace as" is my reading of the phrase.

## Dispositions of review 01

| Finding | Result | Evidence |
|---|---|---|
| BW-R01-1 | carried out | **Verified** (`tasks.md:45`): task 4.5 now reads "After the slice has been committed with the human's explicit authorization" and says the maker session ran `git commit` on the human's explicit instruction. **Verified** (`design.md:675-676`, `:717-719`; `tasks.md:59`): the same is recorded for `78a182e` and `33871dd`. No other task wording was changed for it that I can see |
| BW-R01-2 | carried out | **Verified** (`design.md:585-599`): the limitation is stated with the counts of the record (139 query failures, 135 the same one) and says no stronger RED was produced. **Verified** (`…103643Z_workspace-ui-red.log`): 135 lines "Unable to find a label with the text of: DOI статті", exit 1, RED, commit `9c30af7`. No later RED record exists in `evidence/runs/`. No spec delta is in the diff of the hardening (below) |
| BW-R01-3 | carried out | **Verified** (`app/page-shell.test.tsx`): 7 tests. `lang` is `uk` on the element and once in the markup (`:34-47`); the title and description equal rows 1 and 2 written by hand, and the copy module (`:51-62`); `Home()` returns `Workspace` with `resolve` being `resolveDoiAction` and no other prop (`:66-73`); the two directives and the Server Components (`:75-84`). **Verified** (`package.json`): no browser test tool |
| BW-R01-4 | carried out | **Verified**: `…121934Z_workspace-final-boundaries.log`, `…121947Z_workspace-final-oracles-untouched.log`, `…121948Z_workspace-final-tooling-untouched.log`, all at `33871dd`, clean tree, exit 0. The thirteen searches give the same output, line for line, as `…104021Z_workspace-boundaries.log`. **Verified** (Glob): the browser records are still the three of 10:54Z to 11:01Z, each naming `9c30af7`; none was added |
| BW-R01-5 | carried out | **Verified**: `…121910Z_workspace-final-green.log` and `…121922Z_workspace-final-spec-check.log` name `33871dd`, clean tree, exit 0. The five final records exist and the git status given to this session lists nothing untracked, so they are committed. `design.md:717-733` describes the order as it was |
| BW-R01-6 | carried out | **Verified** (`app/_components/workspace-duplicate-refusal.test.tsx`): 7 tests. Lists of three and two entries; `entryTexts()` equal before and after (`:49`, `:84`, `:119`); a corrected entry keeps its corrected text (`:71-88`); the typed text stays, including surrounding spaces (`:51`, `:86`, `:121`); the resolver is not called again (`:53`, `:87`); the controls stay at their entries (`:56-67`) |
| BW-R01-7 | carried out | **Verified** (`lib/bibliography/__fixtures__/golden.ts:20-23`, `app/_components/__fixtures__/approved-copy.ts:3-4`, `workspace-entries.test.tsx:40`): the comments now say the characters are literals. **Verified** (Grep by code point): `TE`, `ES`, `NUMERO`, `EM_DASH` are U+0422, U+0421, U+2116, U+2014; `copy.ts` and `approved-copy.ts` each hold the same nine occurrences of U+2019, U+2026 and U+2014 and no look-alike |
| BW-R01-8 | carried out | **Verified** (`design.md:414-418`, `:487`): row 68, `DOI: {doi}`, with the date and the limit of the approval. **Verified** (`workspace-entries.test.tsx:117-123`): one test expects exactly `DOI: 10.1038/nature12373`. See BW-R02-1 for the wording of task 5.7 |
| BW-R01-9 | carried out | **Verified** (`design.md:544-546`): "task 4.7 will record that in the session notes, which do not say it yet". **Verified** (`tasks.md:47`; `docs/session-notes.md:3`, `:26`): task 4.7 is open and the notes are still those of 2026-10-05 |

## Checked without findings

1. **Product code during the hardening.** **Verified** (`…121947Z…:20-35`): between `78a182e` and `33871dd` the files that differ are two new test files, `workspace-entries.test.tsx`, the two test-support files, `design.md`, `tasks.md`, the review report, four run records and the hook log; under `app/` and `lib/` none is product code. **Verified** (`.agent-log/actions.jsonl`, lines 2583-2664): after the implementation commit the only Edit or Write calls inside the repository touch those same files.
2. **Oracles and completed slices.** **Verified** (`…121947Z…:13-19`): between `9c30af7` and `33871dd` only `lib/dstu/format-journal-article.ts` differs under `docs/dstu/rules.md`, `tests/golden/`, `lib/doi/`, `lib/metadata/`, `lib/publication/` and `lib/dstu/`, by the word `export`; the 179 tests of `lib/dstu/` pass. **Verified** (`lib/dstu/format-journal-article.ts:31`, `:79`): `selectYear` is exported and still used by the formatter.
3. **Ukrainian copy.** **Verified**: `copy.ts` and `entry-card.tsx` are not in the diff of the hardening and have no Edit in the log; `entry-card.tsx:59-61` renders the line of row 68 from the label of row 44. I read `copy.ts`, `approved-copy.ts` and the table of `design.md` against each other and found no difference in rows 1 to 67.
4. **Final GREEN.** **Verified** (`…121910Z…`): `pnpm check` at `33871dd`, clean tree, exit 0, GREEN, 18 files, 688 tests; type check, lint and production build pass. **Verified** (my count of the test declarations): 7 in `page-shell.test.tsx`, 7 in `workspace-duplicate-refusal.test.tsx`, 41 in `workspace-entries.test.tsx` (40 before); 673 + 15 = 688.
5. **Chronology.** **Verified** (`.git/logs/HEAD:41-42`; the log): `33871dd` at 12:18:24Z, the five records between 12:19:10Z and 12:19:49Z, `6c330e8` at 12:21:52Z. The earlier hardening records (`…115606Z…`, 687 tests; `…120227Z…`, 688 tests) name `78a182e` with a dirty tree, as `tasks.md:58` and `design.md:696-701` say.
6. **Honest reporting of GREEN starts.** **Verified** (`design.md:685-695`; `tasks.md:54-57`; the header comments of both new test files): the 15 hardening tests are reported as passing on their first run and never seen to fail. No RED record was produced for them.
7. **Scope.** **Verified**: `package.json` has no new dependency or script; `.github/workflows/ci.yml` runs `pnpm check` only; `…121948Z…` shows no tooling, hook or CI difference from `9c30af7`; Grep of `app/` and `lib/` finds no storage, cookie or URL state and no `execCommand`; the only clipboard call is `navigator.clipboard.writeText` (`workspace.tsx:166`). No batch input, authentication, other provider, type or style.
8. **Contract, re-read at HEAD.** **Verified** (`workspace.tsx`, `entry-card.tsx`, `correction-form.tsx`, `actions.ts`, `page.tsx`, `layout.tsx`, the four modules of `lib/bibliography/`): the implementation is as review 01 described it; the line numbers in the final boundary record match these files.
9. **Limitations.** **Source limitation**: the provisional rows, the missing rule on numbering and order, and the product nature of HD-2, HD-7, HD-8 and HD-10 are still stated as limitations (`design.md:489-511`). Deterministic browser E2E stays deferred by HD-4 and is not reported as a defect; `design.md` still says the primary browser flow has no automated evidence.

## Checks not performed

- I cannot run commands: no `pnpm check`, no `git diff`, `git show` or `git status`, no hash of any file.
- The difference between `33871dd` and HEAD `6c330e8`. No record shows it. **Inference**: it holds the five final records, `design.md`, `tasks.md` and the hook log only. The commit message, the `git add` of 12:21:52Z in the log and the single Edit of `design.md` in that interval support this; `tasks.md` was changed by a script run through Bash, which the log does not show in full.
- No `pnpm check` or `pnpm spec:check` is recorded at `6c330e8`. A record cannot be part of the commit it names, so this is the expected order; `design.md` and `tasks.md` changed after the spec check at `33871dd`.
- That every changed line in the two test-support files is a comment, and that `workspace-entries.test.tsx` changed only by one comment and one test: I could not diff. The test count, the code points and the identical search output support it.
- That the reviewer's text of review 01 above the rule is unchanged: the file was untracked when the dispositions were appended.
- That the earlier run records are unchanged byte for byte: I checked headers, exit lines and one count only.
- That the human authorized each commit and gave each disposition: stated by the maker session and the caller. For `6c330e8` the repository says nothing; the log shows a question to the user seven seconds before it.
- Not read: `docs/dstu/rules.md`; the archived changes and main specs of the two earlier slices; `lib/metadata/`, `lib/publication/`; the tests of `lib/bibliography/`; `app/actions.test.ts`; `workspace-correction.test.tsx` and `workspace-copy.test.tsx`; the bodies of the browser records. Read in part: `workspace-adding.test.tsx`, the hook log.

## Oracle doubts for the human

None. `tests/golden/dstu-journal.ts` was read in full as an input; `docs/dstu/rules.md` was not read in this review.

## Final verdict

**READY** — the nine dispositions are carried out, the committed hardened state is GREEN with 688 tests, and the one remaining finding is a note on wording that changes no behaviour and no test.

The disposition of BW-R02-1 belongs to the human.

---

## Human dispositions

This section was added by the maker session on 2026-10-06, after the human
gave the disposition that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

| Finding | Disposition | Decision |
|---|---|---|
| BW-R02-1 | **ACCEPT AS DOCUMENTATION CORRECTION** | The row-68 test correctly pins the human-approved rendering `DOI: {canonicalDoi}`. Task 5.7, however, inaccurately says that this same test submits `https://doi.org/10.1038/NATURE12373`. The task note is corrected so that it states what actually happened: `workspace-entries.test.tsx` pins the exact entry-level rendering `DOI: 10.1038/nature12373` from the canonical DOI already present on the Publication; the separate `workspace-adding` test covers the submission of the URL-form DOI and its normalization to the canonical DOI; together they cover the behaviour, and the note does not claim that one test performs both steps. Neither test is changed. Product code is not changed. Specs and approved oracles are not changed |

With this disposition the human closed the independent review of the slice:
task 4.6 is completed on the basis of review 01, its dispositions and the
hardening, the final committed GREEN, and the READY verdict of this review.
