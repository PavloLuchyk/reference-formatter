# Feature review 01 — bibliography-workspace

- Slice: `bibliography-workspace` (OpenSpec change `openspec/changes/bibliography-workspace/`, not archived)
- Reviewed HEAD: `78a182ea598ddc6d6b7e2e05c0f9fa5bf2114d32` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`)
- Working tree at the start of the session (git status given to this session, not re-run): modified `.agent-log/actions.jsonl` and `openspec/changes/bibliography-workspace/tasks.md`; untracked `evidence/runs/20261006T111327Z_workspace-green.log` and `…111349Z_workspace-spec-check-final.log`. No implementation, test, spec-delta or oracle file differs from HEAD.
- Checker: feature-reviewer
- Mode: fresh session, read-only apart from this report
- Tools: Read, Grep, Glob, Write (Write used once, for this file)
- Date: 2026-10-06
- File name: the caller named this file; no review of this slice existed before it.

Every statement is labelled **Verified** (the file or record is named), **Source limitation** or **Inference**.

## Verdict

**READY** — every requirement and scenario of the three spec deltas is implemented as written, the code agrees with both oracles and with HD-1 to HD-10, RD-1 to RD-3 and the kept assumptions, and I found no blocking or major defect; the nine findings below are three minor and six notes, all about evidence, test coverage and wording.

Tasks 4.6 and 4.7 are open, as recorded. The disposition of every finding belongs to the human.

## Findings

| ID | Severity | Subject |
|---|---|---|
| BW-R01-1 | minor | The commit was run by the maker session; task 4.5 says the human committed |
| BW-R01-2 | minor | The UI RED run shows no component test failing on its own behaviour |
| BW-R01-3 | minor | Scenario "Page language" has no automated test, and the check of task 3.12 has no record |
| BW-R01-4 | note | Integration evidence of tasks 4.1 to 4.4 predates the commit and is not repeated at HEAD |
| BW-R01-5 | note | The final GREEN record and the closing of task 4.5 are not committed |
| BW-R01-6 | note | A refused duplicate is not tested with two or more entries, nor for the kept text |
| BW-R01-7 | note | Two test-support files say their look-alike characters are escapes; they are literals |
| BW-R01-8 | note | The line `DOI: …` at an unformatted entry is not a row of the approved copy table |
| BW-R01-9 | note | `design.md` says the session notes state the missing E2E evidence; they do not yet |

### BW-R01-1 — minor — who committed the slice

- **Affected**: task 4.5 ("After the human has committed the slice…"); `AGENTS.md`, Repository workflow ("Do not commit … unless explicitly asked"); `docs/intent.md` ("Evidence must describe events that actually happened").
- **Area**: commit `78a182e`; `tasks.md:45`.
- **Verified** (`.agent-log/actions.jsonl`, session `b9af7e2a`): a Bash call at 11:11:55Z runs `git add -- lib/bibliography app/_components app/actions.ts …`, and one at 11:12:00Z runs `git commit -q -F -` with the message `feat(workspace): implement bibliography workspace MVP` and a `Co-Authored-By: Claude Opus 5.5` trailer.
- **Verified** (`.git/logs/HEAD:40`): `78a182e` was created at 1791285119 +0300, which is 11:11:59Z, under the git identity of Pavlo Luchyk.
- **Reasoning**: the record shows the maker session executed the commit. I could not check whether the human asked for it; if so, the rule of `AGENTS.md` was kept and only the wording of task 4.5 is inexact. `docs/session-notes.md:148` still says "The human has written every commit message", written before this slice.

### BW-R01-2 — minor — the UI RED run does not discriminate

- **Affected**: design TD-12 (RED by assertion or query); review criterion "assertions that could pass with incorrect behaviour"; tasks 3.3 to 3.7.
- **Area**: `evidence/runs/20261006T103643Z_workspace-ui-red.log`; `app/_components/__fixtures__/workspace-driver.tsx:43`.
- **Verified** (the record): 154 `FAIL app/_components/…` lines. The log holds 139 `TestingLibraryElementError` blocks, all "Unable to find…": 135 are "Unable to find a label with the text of: DOI статті", raised in `doiField` of the shared driver; the other four are the introduction, the session notice, the «Додати» button and the «Копіювати весь перелік» button. The five `AssertionError` and two `TypeError` blocks are all in `app/actions.test.ts`.
- **Reasoning**: every component test failed at its first query against a stub that renders only a heading, before reaching the behaviour it names. Tests with negative assertions (no copy for GF06, no indication of gaps, resolver not called, no warning) were therefore never seen to fail. `design.md` says "Most are Testing Library query failures"; the record shows all, and nearly all at one line. The domain RED (126 `AssertionError` failures in four files) does not have this weakness.
- **Inference** (from reading the four component test files): the assertions themselves are specific — exact approved strings, exact `writeText.mock.calls`, exact resolver calls — so I expect them to detect a wrong implementation. That is my reading, not recorded evidence.

### BW-R01-3 — minor — "Page language" and the page wiring

- **Affected**: `bibliography-workspace`, requirement Ukrainian interface, scenario Page language; copy rows 1 and 2; task 3.12.
- **Area**: `app/layout.tsx`, `app/page.tsx`.
- **Verified**: `layout.tsx:25` has `lang="uk"`, and `:18-19` take the title and description from `copy.ts`. `page.tsx:6` passes `resolveDoiAction` to `Workspace`.
- **Verified** (all test files under `app/` and `lib/bibliography/`): none imports `layout.tsx` or `page.tsx`. Task 3.4 excludes Page language by name.
- **Verified** (`tasks.md:36`): task 3.12 states that `.next/server/app/index.html` has `lang="uk"`, the title and the description, and names no run record. No record in `evidence/runs/` shows that inspection. The only recorded observation is the manual check (`…110108Z_workspace-manual-browser-check-repeat.log:45-46`), on `next dev`.
- **Reasoning**: changing `lang`, the title or the resolver prop would leave `pnpm check` GREEN. `design.md` (Risks) already says the wiring has no automated evidence until the E2E change of HD-4; the missing record of task 3.12 is not mentioned there.

### BW-R01-4 — note — integration evidence predates the commit

- **Affected**: tasks 4.1, 4.2, 4.3, 4.4; `AGENTS.md` (oracles untouched; no tooling change).
- **Area**: `…104021Z_workspace-boundaries.log`, `…104032Z_workspace-oracles-untouched.log`, `…104034Z_workspace-tooling-untouched.log`, the three manual-browser records.
- **Verified**: each names commit `9c30af7` and a dirty tree, between 10:40Z and 11:01Z. The commit is at 11:11:59Z. The only record at `78a182e` is `pnpm check` (and `pnpm spec:check`).
- **Verified** (`.agent-log/actions.jsonl`): on 2026-10-06 no Edit or Write touched `docs/dstu/`, `tests/`, `lib/doi/`, `lib/metadata/`, `lib/publication/`, `package.json`, configuration, `scripts/` or `.claude/`; the one Edit under `lib/dstu/` is the `export` at 10:23:36Z; the last Edit or Write under `app/` or `lib/` is at 10:39:00Z.
- **Reasoning**: the log truncates Bash commands and does not see edits made outside the tools, and `tasks.md` was changed after 11:03Z without any Edit entry. So "the commit holds exactly what was checked" is an **Inference**, supported by the log and by the equal test count (673). I could not run `git diff 9c30af7 78a182e`.

### BW-R01-5 — note — final records not committed

- **Affected**: `AGENTS.md` ("records in `evidence/runs/` are committed"); task 4.5.
- **Verified** (git status given to this session): `…111327Z_workspace-green.log` and `…111349Z_workspace-spec-check-final.log` are untracked and `tasks.md` is modified. The caller described the final clean-tree GREEN record as committed.
- **Reasoning**: a record cannot be part of the commit it names, so this is the expected order; it is still open work. I read the working-tree `tasks.md` and could not compare it with the committed one.

### BW-R01-6 — note — regression gaps around a refused duplicate

- **Affected**: Duplicate prevention ("SHALL leave the list unchanged"); AS-7 (not moved, replaced or refreshed); AS-8 (typed text stays).
- **Area**: `app/_components/workspace-adding.test.tsx:187-251`, `workspace-correction.test.tsx:231-243`.
- **Verified**: every UI duplicate test holds one entry, and none reads the DOI field afterwards. `lib/bibliography/workspace.test.ts:80` refuses a duplicate in a list of two, where the refusal carries no list.
- **Verified** (`workspace.tsx:144-147`, `:75`, `:84-85`): both refusals change only the notice; the list and the field are untouched. No defect; an order change or a cleared field on refusal would not fail a test.

### BW-R01-7 — note — "written as escapes" is not true

- **Area**: `lib/bibliography/__fixtures__/golden.ts:20-25`; `app/_components/__fixtures__/approved-copy.ts:1-4`.
- **Verified** (Grep for `\uXXXX`): neither file holds an escape; both comments say the characters are written as escapes so that a look-alike cannot slip in.
- **Verified** (Grep by code point): `TE`, `ES`, `NUMERO`, `EM_DASH` are U+0422, U+0421, U+2116, U+2014; the apostrophes, ellipses and dashes of `approved-copy.ts` and `copy.ts` are U+2019, U+2026, U+2014. The values are right; the safeguard the comments describe is absent. Both files are among those hashed at RED and GREEN.

### BW-R01-8 — note — `DOI:` at an entry

- **Affected**: design, Ukrainian copy ("Changing a string needs a new approval"); row 44 is "Field label: DOI (read-only)".
- **Verified** (`entry-card.tsx:59-61`): an entry that cannot be formatted shows `{copy.doi}: {publication.doi}`. No row of the table covers this place or the colon. The spec requires the DOI to be shown and does not give its form. The text is not Ukrainian wording; whether it needed a row is the human's call.

### BW-R01-9 — note — a sentence of `design.md` ahead of the facts

- **Verified** (`design.md:536-537`): "Until then the primary browser flow has no automated evidence, and the session notes say so."
- **Verified** (`docs/session-notes.md:26`, `:31-32`): the notes are dated 2026-10-05, call the workspace "next, not started" and say nothing of browser evidence. Task 4.7, which would make the sentence true, is open by decision.

## Checked without findings

1. **Contract.** **Verified**: each requirement of `bibliography-workspace`, `metadata-correction` and `bibliography-copy` against `lib/bibliography/*.ts`, `app/actions.ts` and `app/_components/*.tsx`. HD-1 to HD-10, RD-1 to RD-3, AS-4, 6, 7, 8, 11 to 15 are implemented as recorded; nothing outside the change was added.
2. **DOI add and duplicates.** **Verified** (`workspace.tsx:139-158`): `normalizeDoi` decides; `hasEntry` refuses before the resolver is called; `addEntry` (`isSamePublication`) refuses again in the reducer. Canonical DOIs are compared by equality only (`workspace.ts:23`, `:47`), as design TD-2 says. The canonical DOI is what is sent.
3. **Workspace state.** **Verified** (`workspace.ts`): append, immediate removal, neighbour exchange, no move at the ends, new values on every operation. No storage, cookie or URL state under `app/` (Grep).
4. **Correction.** **Verified** (`correction.ts`, `correction-form.tsx`): nine draft fields; DOI read-only; language and DOI passed through; scalars trimmed, names trimmed and nameless authors dropped by `createPublication`; only the names of the selected kind saved; a new row is a person. A no-change save is equal for all eight fixtures (`correction.test.ts:141-148`); resolved scalars are already trimmed (`map-work.ts:18`, `:150-151`).
5. **Year.** **Verified** (`correction.ts:48-51`, `:74-85`): shown and compared through `selectYear`; unchanged returns the dates untouched; blank clears all four; otherwise `/^[1-9][0-9]{3}$/` and `print: { year }`. No order of dates is written in `lib/bibliography/`. `selectYear` gained only `export` (`…104032Z…:48-55`; file read at HEAD).
6. **Missing metadata.** **Verified**: blocking fields come from `outcome.blockedBy` (`entry-card.tsx:62`); gaps from `missingFields` in the order authors, volume, issue, pages-or-article-number (`metadata-gaps.ts:11-19`); the subtitle is never reported.
7. **Copy.** **Verified**: copy-one only for a formatted entry; `references.join("\n")` with no trailing break (`bibliography-text.ts:26`); copy-all disabled when blocked or empty; one call of `navigator.clipboard.writeText` and no other mechanism (`workspace.tsx:162-171`).
8. **Ukrainian copy.** **Verified**: `copy.ts` read against all 65 rows; `…103926Z_workspace-copy-table-check.log` finds every fragment; `copy.ts` was written once (hook log, 10:31:43Z). Messages map to the right states (`workspace.tsx:120-123`); «запис» names items, «посилання» only references.
9. **Server/client boundary.** **Verified**: `'use server'` only in `app/actions.ts`, `'use client'` only in `workspace.tsx`; client files import `lib/metadata/resolution` as types only; `process.env` is read once (`actions.ts:13`); `lib/bibliography/` imports no React, Next.js, provider or network code.
10. **Tests and evidence.** **Verified**: expected references are approved texts read as data or hand-written single-value substitutions into them; no test computes an expected value with the formatter; no skipped test, no snapshot. Counts agree with the records: 355, 506 (126 failed, 25 new tests passing against stubs) and 673 (165 failed, two new tests passing against the stub, two `TypeError`). The RED and GREEN hashes are identical. The hook log shows stubs, then tests, then RED, then implementation, with no test edited after RED. Final GREEN: `78a182e`, clean tree, exit 0, 673 tests.
11. **Live-browser check.** **Verified** (`…110108Z…repeat.log`): 112 checks, none unexpected, exit 0; the browser POSTed three times to `localhost:3100` and the dev-server lines show `resolveDoiAction(…)`; input went through DevTools mouse and key events; the argument of `writeText` held one U+000A and no carriage return. The first record shows 97 checks with 3 unexpected, and the earlier one a driver crash; both are kept. **Inference**: Crossref was contacted live — no request to it is observed directly; the latency and the absence of any fixture path in `app/actions.ts` support it.
12. **Scope and limitations.** **Verified**: no dependency added (`package.json`); no batch input, persistence, authentication, fallback, other type or style. **Source limitation**: the provisional rows, the missing rule on numbering and order, and the product nature of HD-2, HD-7, HD-8 and HD-10 are still stated as limitations (`design.md:484-506`) and not resolved in code. Deterministic E2E is described as later work everywhere it is mentioned; the README is still the scaffold text and claims nothing.

## Checks not performed

- I cannot run commands: no `pnpm check`, no `git diff`, `git show` or `git status`, no hash of any file at HEAD.
- That the human gave the approvals, the go-ahead for the browser check and the disposition of the clipboard finding: recorded by the maker session and stated by the caller.
- Whether Crossref was really reached, and the dev-server logs, which are outside the repository.
- The built output under `.next/`; the page in a real browser; the production build served by `next start`.
- A live failure outcome (`not-found`, `unsupported-type`, an unavailable provider) through the real Server Function, and a real value of `CROSSREF_CONTACT_EMAIL` in a live request: neither was part of the manual check.
- Read in part only: `docs/dstu/rules.md` (rows N3, D1 and section 11), the driver source printed in the records, `…105522Z…` (section results), the Bash commands of the hook log (truncated there). Not read: the tests and helper modules of the two archived slices, `node_modules/next/dist/docs/`.

## Oracle doubts for the human

None.

---

## Human dispositions

This section was added by the maker session on 2026-10-06, after the human
gave the dispositions that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

| Finding | Disposition | Decision |
|---|---|---|
| BW-R01-1 | **DISMISS AS A DEFECT** | The maker executed the commit because the human explicitly instructed it to do so. The task wording is updated only as necessary, so that it states that the slice was committed with explicit human authorization rather than claiming that the human personally executed `git commit`. No repository-workflow repair is required |
| BW-R01-2 | **ACKNOWLEDGE AS EVIDENCE LIMITATION, NO REPAIR** | The UI RED was a genuine query-level RED allowed by TD-12, but most component tests failed at the shared first query and therefore did not independently demonstrate every named behaviour. No stronger historical RED is fabricated and the old record is not altered. The limitation is documented accurately |
| BW-R01-3 | **ACCEPT** | Targeted automated coverage is added for the already-correct page shell and wiring: the root page language is `uk`; the approved document title and description remain wired from the approved copy; the page wiring uses the real workspace boundary and `resolveDoiAction` as specified, to the extent this can be pinned with the existing test stack. No browser E2E framework is introduced. These tests may start GREEN because the behaviour is already implemented. No RED evidence is manufactured |
| BW-R01-4 | **ACKNOWLEDGE** | The live Crossref browser run is not repeated merely to move its timestamp after the implementation commit. After the hardening is committed, the cheap boundary, oracle and tooling checks are repeated on the final committed state where appropriate. The original integration and browser records are preserved as historical evidence |
| BW-R01-5 | **ACCEPT AS PENDING EVIDENCE WORK** | The existing clean-GREEN and spec-check records are preserved. They are historical evidence and are not rewritten. After the review hardening is committed, a fresh final clean-tree GREEN record is produced for the hardened committed HEAD |
| BW-R01-6 | **ACCEPT** | Regression coverage is added for duplicate refusal with at least two existing entries. It verifies in the UI behaviour that the list remains byte-for-byte and order-equivalent from the user's perspective; that no entry is moved, refreshed or replaced; that the typed DOI text remains in the DOI field after the duplicate refusal; and that the resolver is not called when the canonical duplicate is detected locally. Product behaviour is not changed unless the new test unexpectedly exposes a real defect |
| BW-R01-7 | **ACCEPT** | Only the inaccurate comments that say the look-alike Unicode characters are written as escapes are corrected. The actual literal code points are correct and do not change |
| BW-R01-8 | **HUMAN APPROVAL** | The entry identity rendering `DOI: {doi}` is approved. It is recorded in the HUMAN-APPROVED Ukrainian copy table as the entry-level DOI identity line. This does not authorize any other copy change |
| BW-R01-9 | **ACCEPT AS PENDING PROCESS WORK** | Task 4.7 remains intentionally open. `design.md` is revised only if necessary so that it does not claim that the session notes already record the missing deterministic-E2E limitation; it may say that task 4.7 will record it. `docs/session-notes.md` is not updated yet |

Boundaries the human set for this work: `docs/dstu/rules.md` and
`tests/golden/` are not changed; DOI-resolution and formatter semantics are not
changed; no dependency, CI, hook or E2E tooling is introduced; no other
approved Ukrainian wording is changed.

The work that follows is tracked as task group 5 of the change, and its runs
are named in the Verification history of `design.md`.
