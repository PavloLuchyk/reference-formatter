# Feature review — dstu-journal-formatter

Record of the independent review requested by task 4.5 of the OpenSpec change
`dstu-journal-formatter`. The report below comes from a separate, fresh,
read-only `feature-reviewer` session. The human pasted it into the maker
session on 2026-10-05, and the maker session saved it here: the wording is
reproduced as received, only Markdown heading marks were added, and the three
metadata lines that appear twice under F2 are kept as they were received. The
dispositions at the end are the human's, given the same day.

## Checker report

- Slice: dstu-journal-formatter
- Reviewed HEAD: 2d6183b
- Checker: feature-reviewer
- Context: fresh session
- Mode: read-only
- Available tools: Read, Grep, Glob

### Verdict

READY — the implementation conforms to the accepted spec and the approved oracle, with GREEN recorded on a clean tree; the findings are test-pinning and evidence gaps, not incorrect behaviour.

No blocking or major findings. Three minor findings and one note. The reviewer could not run commands, so oracle byte-identity rests on the run records and the hook log.

### Findings

#### F1 — A person with neither name part is silently dropped

- Severity: minor
- Requirement or criterion: Warnings ("a person lacks the family name or the given value"); Statement of responsibility ("No author SHALL be dropped"); AGENTS.md "Missing bibliographic metadata stays explicit".
- File or area: lib/dstu/authors.ts:8-9, used at lib/dstu/format-journal-article.ts:90-93,124.
- Reasoning:
  - Verified: printableAuthors removes { kind: "person", family: null, given: null } before the author count and before hasIncompleteName.
  - Verified: with authors [A, B, C, nameless] the code produces a three-author heading and no warning, where the spec's count of four gives the title-first form.
  - Verified: with [nameless] alone the code produces no heading and no incomplete-personal-name warning, though the literal warning condition holds.
  - Verified: the spec has no requirement for this filtering and no test exercises it; printableAuthors appears only at its definition and call site.
  - Inference: this is unreachable through createPublication today (lib/publication/publication.ts:88-96), but the Publication type permits it for hand-built records.

#### F2 — Requirement text not pinned by any test

- Severity: minor
- Requirement or criterion: Blocking fields; Pages (with design reading RD-9).
- File or area: lib/dstu/format-journal-article.test.ts:82-110, 310-335.
- Severity: minor
- Requirement or criterion: Blocking fields; Pages (with design reading RD-9).
- File or area: lib/dstu/format-journal-article.test.ts:82-110, 310-335.
- Reasoning:
  - Verified: no test has only title missing or only journalTitle missing. The tests cover year alone, title and journal title together, and all three; GF06 covers year alone. For { ...base, title: null } the spec expects cannot-format naming title; the code does this (lib/dstu/format-journal-article.ts:82-87), but a regression would stay GREEN.
  - Verified: the only non-ordinary space in lib/dstu/ is the U+00A0 in the volume/issue table at test line 240. No pages test uses one, so widening PLAIN_PAGE_RANGE (lib/dstu/format-journal-article.ts:65) to any whitespace would stay GREEN.
  - Verified: line 240 looks identical to line 231 on screen and in the RED log; nothing marks the invisible character.

#### F3 — Several completed tasks lack the verification record they state

- Severity: minor
- Requirement or criterion: tasks 1.1, 2.1, 2.3, 3.6, 4.1–4.3; docs/intent.md "evidence points to actual repository states".
- File or area: openspec/changes/dstu-journal-formatter/tasks.md, evidence/runs/.
- Reasoning:
  - Verified: the RED state was never a commit; tests and implementation landed together in 6de412c. Task 3.6 says "no test changed" was checked by SHA-256 hashes taken at the RED run, and those hashes are in no committed record.
  - Verified: tasks 1.1, 2.1 and 4.1–4.3 have no record in evidence/runs/.
  - Verified: task 2.3 says "the task notes which do" pass against the stub, and it does not. The RED log shows them by omission: the two invariant tests, plus the fixture-ID test.
  - Verified (corroboration, not a substitute): every test line position in the RED log matches the committed test files.
  - Verified (corroboration): .agent-log/actions.jsonl shows lib/dstu/format-journal-article.test.ts written once at 19:00:42Z, before the first implementation write at 19:02:42Z. It shows no later Edit or Write on either test file, and none on the oracles after 17:54Z.
  - Inference: the hook log truncates Bash commands, so edits made through a shell script cannot be excluded.

#### F4 — RED says little about individual expected strings

- Severity: note
- Requirement or criterion: tasks 2.3–2.6 ("fail by assertion"); design TD-8.
- File or area: evidence/runs/20261005T190147Z_dstu-formatter-red.log; lib/dstu/format-journal-article.test.ts:46-50.
- Reasoning:
  - Verified: the stub returned cannot-format, so nearly all 164 targeted failures stop at the helper's kind check on line 48, before any text comparison.
  - Verified: the task wording is met — failures are assertions, with no import or module error.

### Checked without findings

- Golden outcomes — Inference (hand trace of the code): GF01–GF08 each produce the approved text, warnings or blocking fields.
- Golden outcomes — Verified: evidence/runs/20261005T192011Z_dstu-formatter-green.log shows 351 tests passing at 6de412c on a clean tree, exit 0.
- Oracle consumption — Verified: lib/dstu/golden.test.ts imports the oracle and compares text exactly and warnings as sets; tests/golden/dstu-journal.ts imports only two types and no formatter code.
- Spec behaviours — Verified in code, each with a hand-written expectation:
  - year order print, issued, published, online;
  - pages over article number, and a bare article number without pages;
  - Roman numerals and combined volume and issue per O15 and O20;
  - heading versus statement of responsibility, with organisations counting toward three;
  - terminal-initial, ?/!, ellipsis and DOI full-stop rules;
  - each warning at most once, and none on cannot-format.
- Limitations — Verified: P21, P22, P43, P23, P25, P26 and the ;  convention (C12) are named as provisional or human convention in code comments; none is presented as verified.
- Scope — Verified: non-test code under lib/dstu/ imports only itself and Publication types, and nothing outside imports it. The RED and check records list only lib/dstu/, tasks.md and evidence as changed.
- Evidence consistency — Verified: record commits, tree states, exit codes and times agree with .git/logs/HEAD.
- Source limitation: the heading rows rest on the unverified ДСТУ ГОСТ 7.80:2007 (G1), and the corrections to S1 are unavailable (G11). Both are carried, not resolved.
- Oracle doubts for the human: none.

### Reviewed but not checked

Reviewed:

- AGENTS.md, docs/intent.md, all of docs/dstu/rules.md, and tests/golden/dstu-journal.ts;
- the change's proposal.md, design.md, tasks.md and spec delta under openspec/changes/dstu-journal-formatter/;
- all six files in lib/dstu/ and lib/publication/publication.ts;
- the four formatter run records and the oracle-approval record in evidence/runs/;
- .agent-log/actions.jsonl, .git/logs/HEAD, package.json and .github/workflows/ci.yml.

Could not check:

- byte-identity of both oracles against dc76a2e (task 4.2);
- the exact diffs of 6de412c and 2d6183b, including whether package.json or CI changed;
- the stub's content;
- whether the commits were explicitly requested;
- any re-run of pnpm check.

Open at review time: tasks 4.5 and 4.6 are unchecked, and docs/session-notes.md still describes the DOI slice.

## Human dispositions

Given by the human on 2026-10-05. The reviewer proposed none of them.

| Finding | Disposition | Decision |
|---|---|---|
| F1 | **REJECT as a formatter defect** | The formatter accepts a normalized `Publication`. `createPublication` removes a personal author only when both the family name and the given value are absent, so that state is outside the supported normalized formatter input. The formatter code is not changed for F1 |
| F2 | **ACCEPT** | Add targeted regression tests for: only the title missing gives cannot-format blocked by `title`; only the journal title missing gives cannot-format blocked by `journalTitle`; a page range containing U+00A0 (no-break space) is not treated as a plain numeric page range. These are ordinary verification tests, not oracle data |
| F3 | **ACCEPT AS EVIDENCE LIMITATION** | Missing historical evidence is not fabricated. The verification history and the task notes of the change are updated to state accurately which historical claims were not durably recorded. A check repeated now proves only the current state |
| F4 | **ACKNOWLEDGE, NO REPAIR** | The RED was a genuine assertion-level RED, but most formatting assertions were not reached, because the stub failed first at the outcome-kind assertion |
