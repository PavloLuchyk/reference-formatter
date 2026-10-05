# Feature review 01 — dstu-journal-formatter

- Slice: `dstu-journal-formatter` (OpenSpec change `openspec/changes/dstu-journal-formatter/`, not archived)
- Reviewed HEAD: `82ce571d6e037d0c52b5a60d9d7440bae434bc61` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`)
- Checker: feature-reviewer
- Mode: fresh session, read-only apart from this report
- Tools: Read, Grep, Glob, Write (Write used once, for this file)
- Date: 2026-10-05
- Earlier report on this slice: `evidence/reviews/dstu-journal-formatter-review.md`, at HEAD `2d6183b`. It was read and not changed. The caller named this file `…-review-01.md`; no file of that name existed.

Every statement is labelled **Verified** (the file or record is named), **Source limitation** or **Inference**.

## Verdict

**READY** — the formatter agrees with the accepted spec and with the approved golden oracle, and GREEN is recorded; the four findings are one point of interpretation for the human, two evidence and housekeeping gaps and one note, and none shows behaviour that contradicts the accepted spec.

No blocking or major finding. Three minor findings and one note. Tasks 4.5 and 4.6 of the change are still open, so the change cannot be archived as complete yet (finding R01-3).

## Findings

### R01-1 — The terminal-initial rule is narrower in the spec than in the wording of O18 and O21

- **Severity**: minor
- **Requirement or criterion**: spec requirement "Full stop after the heading"; design reading RD-6; profile rows O18 and O21; `AGENTS.md`, Authority (a normative DSTU interpretation is the human's).
- **File or area**: `lib/dstu/authors.ts:32` and `:41`; `openspec/changes/dstu-journal-formatter/specs/dstu-journal-formatting/spec.md:394-400`; `design.md:116` (RD-6); `docs/dstu/rules.md:648` (O18) and `:664` (O21). No test covers the case.
- **Reasoning**:
  - Input: the base record of the targeted tests with the single author `{ kind: "person", family: "Petrenko O. V.", given: null }`.
  - **Verified** (`lib/dstu/authors.ts:41`, `lib/dstu/boundary.ts:13-22`): `endsInInitial` needs a given value, so the heading is joined by the zone rule. The text begins `Petrenko O. V.. Base title` and the outcome carries `full-stop-collision` and `incomplete-personal-name`.
  - **Verified** (`spec.md:394-400`): this is what the accepted spec says. It ties the exception to "a person whose given value ends in a letter followed by `.`". The code follows the spec.
  - **Verified** (`docs/dstu/rules.md:648`, `:664`): O18 says "If the final rendered author name ends in one or more ordinary initials whose final token is a single alphabetic character followed by `.`, no second heading full stop is appended". O21 says "If the rendered heading ends in such an initial, no second heading full stop is appended". Read by these words alone, the same input gives `Petrenko O. V. Base title` and no collision warning.
  - **Verified** (same rows): the agent's reading that the human answered in O21 speaks of the given value, every example in both rows has the initials in the given value, and both rows exclude organisation names and arbitrary dotted strings.
  - **Inference**: the profile can therefore be read either way for a person whose initials stand in the family field. RD-6 is presented in `design.md` as the O21 reading and does not say that it narrows "rendered author name" to "given value". Which reading stands is not for the reviewer to settle.
  - **Verified** (`lib/metadata/crossref/map-work.ts:165-167`): a provider record with a family name and no given name reaches the formatter as such a person, so the input is inside the normalized `Publication`.
  - **Verified** (`tests/golden/dstu-journal.ts`, `lib/dstu/format-journal-article.test.ts`): neither behaviour is pinned. GF07 is a family-only name without a full stop (`Okafor`), and no targeted test has a family-only or given-less name ending in `.`.
  - **Inference**: how often Crossref records carry initials in the family field is not shown anywhere in the repository; no recorded fixture under `lib/metadata/crossref/__fixtures__/` has one.
  - This is not a doubt about the oracle. It is a question about whether the accepted reading RD-6 restates it in full.

### R01-2 — No run record on a clean tree for the state under review

- **Severity**: minor
- **Requirement or criterion**: `AGENTS.md`, Verification; task 4.4 (clean-tree GREEN); `docs/intent.md`, Definition of Done ("evidence points to actual repository states and verification runs").
- **File or area**: `evidence/runs/`.
- **Reasoning**:
  - **Verified** (`evidence/runs/20261005T192011Z_dstu-formatter-green.log`): the last record on a clean tree is at `6de412c`, with 351 tests.
  - **Verified** (`.git/logs/HEAD`, `lib/dstu/format-journal-article.test.ts:87-93`, `:344-351`): the test file changed after that, in `8ff913e`; the suite now has 354 tests.
  - **Verified** (`evidence/runs/20261005T194353Z_dstu-formatter-review-followup.log`): the only record with 354 tests was taken at `2d6183b` on a dirty tree, with the test file, `design.md` and `tasks.md` modified and the earlier review file untracked. No record names `8ff913e` or `82ce571`.
  - **Inference**: the committed state very probably equals the recorded one. `.agent-log/actions.jsonl` shows no Edit or Write under `lib/` between 19:43:03Z and the commit at 19:46:00Z, and only `.claude/agents/feature-reviewer.md` edited before `82ce571`. The log does not show edits made through the shell, so this is corroboration and not a record.
  - **Verified** (`tasks.md`, task 5.1): task 5.1 asks for a recorded run and does not ask for a clean tree, so it is met as worded. The gap is against task 4.4, whose record predates the final test file.

### R01-3 — Task 4.6 is not done and the session notes describe the previous slice

- **Severity**: minor
- **Requirement or criterion**: task 4.6 of the change.
- **File or area**: `openspec/changes/dstu-journal-formatter/tasks.md:34`; `docs/session-notes.md`.
- **Reasoning**:
  - **Verified** (`tasks.md:33-34`): tasks 4.5 and 4.6 are unchecked. An open 4.5 is expected while a review has no dispositions yet.
  - **Verified** (`docs/session-notes.md`): the file is dated after the DOI review and gives HEAD `1f87b50`. It says `doi-resolution` is not archived and `openspec/specs/` is empty; both are untrue at HEAD (`openspec/changes/archive/2026-10-05-doi-resolution/`, three specs under `openspec/specs/`). It lists DSTU formatting as out of the change. It names neither oracle and none of the six provisional rows, which is what task 4.6 asks to verify.
  - The task is honestly left unchecked. The finding is that the slice was handed over as completed with it open.

### R01-4 — The reviewer's definition was changed by the maker session

- **Severity**: note
- **Requirement or criterion**: `AGENTS.md`, Authority ("Stop and ask before … changing framework, tooling, hooks, agent settings or CI"); scope and collateral effects.
- **File or area**: `.claude/agents/feature-reviewer.md`; commit `82ce571`.
- **Reasoning**:
  - **Verified** (`.agent-log/actions.jsonl`): session `b5066360`, which wrote every file under `lib/dstu/`, edited `.claude/agents/feature-reviewer.md` three times between 19:49:31Z and 19:49:40Z. `.git/logs/HEAD` has `82ce571` "chore(agent): let feature reviewer persist review evidence" at 19:50:36Z.
  - **Verified** (`.claude/agents/feature-reviewer.md:4`, `:13-16`): the reviewer now has Write, limited to `evidence/reviews/` by instruction.
  - **Verified** (`.claude/settings.json`): no permission rule or hook enforces that limit; it holds by instruction only. The log shows no write to `.claude/settings.json` or `.claude/hooks/` on 2026-10-05.
  - Could not check: whether the human asked for this change, and its exact diff. The commit is outside the file set the proposal names for the slice.

## Checked without findings

- **Golden outcomes.** **Inference** (hand trace of `lib/dstu/` for each fixture): GF01 to GF08 give the approved text and warnings, or the approved blocking field. **Verified** (`20261005T194353Z_dstu-formatter-review-followup.log`): 354 tests pass, exit 0, with no non-test file of `lib/dstu/` in the list of changed files.
- **Oracle consumption.** **Verified** (`lib/dstu/golden.test.ts`): the conformance test imports the oracle, compares the text exactly and the warnings and blocking fields as sets, and checks that the eight fixture IDs are present. **Verified** (`tests/golden/dstu-journal.ts:25-26`): the oracle imports two types and no formatter code.
- **Oracles unchanged, as far as it can be seen without git.** **Verified**: the spec quotes the full text of GF01 and GF05 and fragments of GF02, GF03, GF04, GF07 and GF08; all agree with the oracle file at HEAD. **Verified**: no run record of the slice lists `docs/dstu/rules.md` or `tests/golden/` as changed. **Verified** (hook log, corroboration only): the last logged write to `tests/golden/dstu-journal.ts` is at 17:53:36Z and to `docs/dstu/rules.md` at 15:51:55Z, both before the baseline.
- **Contract.** **Verified** (`spec.md`, `lib/dstu/format-journal-article.test.ts`): every scenario of the 24 requirements has a test with a hand-written expected value; none is derived from formatter output, and there are no snapshots, skips or `only`. Checked in code against the spec and the profile rows it cites: blocking fields; year order; title, subtitle and journal title as supplied; heading for one to three authors and statement of responsibility for four or more, organisations counted; Roman numerals and pairs (O15, O20); `Т.` always and `№` only for a normalised value; plain page range with an em dash; pages over article number; DOI note and terminal full stop; zone, heading and ellipsis rules; each warning at most once and none with cannot-format.
- **Follow-up to the earlier review.** **Verified**: the three tests of task 5.1 exist (`format-journal-article.test.ts:87-93`, `:344-351`). **Verified** (search for U+00A0 under `lib/dstu/`): the only literal no-break space is in the table row at line 248; the pages test builds it from its code point. **Verified** (`design.md`, `tasks.md`): the Verification history section and the task notes of task 5.2 are present and agree with the records. **Verified** (`lib/dstu/authors.ts:8-9`): the code behind the earlier finding F1 is unchanged, as the recorded disposition in the earlier review file says; it is not raised again here.
- **RED record.** **Verified** (`20261005T190147Z_dstu-formatter-red.log`): 172 failed and 179 passed, exit 1, every failure an `AssertionError`, no import or module error. **Verified**: all 76 stack positions of the targeted tests in that record map onto the current test file after the shifts of 8 and 17 lines that the three added tests cause. This shows position, not content.
- **Counts.** **Verified**: 169 targeted and 9 conformance tests at HEAD, plus the 176 earlier ones, give the 354 of the follow-up record.
- **Record consistency.** **Verified** (`.git/logs/HEAD`, the five formatter records, `scripts/record-run.sh`): commits, tree states, exit codes, start and finish times and the record layout agree with each other and with the hook log. Nothing looks edited by hand.
- **Corroboration of two tasks without a record.** **Verified** (hook log): `pnpm spec:check` appears in a command at 18:58:36Z (task 1.1) and `pnpm typecheck` with `pnpm lint` at 19:01:05Z (task 2.1). Their output is not kept, as `design.md` already says.
- **Scope and boundaries.** **Verified** (search): non-test code under `lib/dstu/` imports only `lib/dstu/` and types of `lib/publication/`; nothing outside `lib/dstu/` imports it; no `react`, `next`, `lib/metadata/`, `process.env` or network use. **Verified** (run records): no record lists `package.json`, `.github/`, `scripts/`, `app/`, `lib/publication/`, `lib/doi/` or `lib/metadata/` as changed.
- **Limitations.** **Verified** (`lib/dstu/format-journal-article.ts:8`, `:25`, `:92`; `authors.ts:3-5`, `:15`, `:36`; `boundary.ts:18`): P21, P22, P23, P25, P26, P43 and the `; ` convention (C12) are called provisional or a human convention. No comment, spec line or design line presents one as verified.
- **Source limitation**: the heading rows rest on ДСТУ ГОСТ 7.80:2007, whose text was not verified (G1), and the corrections to S1 are not available (G11). Both are carried, not resolved.
- **Tree at review time.** **Verified** (git status supplied at session start): only `.agent-log/actions.jsonl` is modified, so the files read are the committed HEAD.
- **Oracle doubts for the human**: none.

## Checks not performed

- No command was run: no `pnpm check`, `pnpm spec:check`, `git diff` or `git show`.
- Byte identity of both oracles against `dc76a2e` (task 4.2).
- The diffs of `6de412c`, `2d6183b`, `8ff913e` and `82ce571`.
- Whether the content of the tests is the same as at the RED run; only their positions were compared.
- The content of the stub and the SHA-256 hashes that task 3.6 mentions.
- Whether the commits and the change of the reviewer's definition were asked for by the human.
- Whether the earlier review file reproduces the first report and the human's dispositions as they were given.
- The documents in `references/`; `docs/dstu/rules.md` was taken as given.
- Any CI result.
- Limit of the hook log as evidence: it stores the first 200 characters of a shell command, and `tasks.md` was edited through the shell in the maker session (`sed -i` at 18:59:06Z, `node -e` at 19:05:45Z), so edits made that way do not appear as file edits.

Reviewed: `AGENTS.md`; `docs/intent.md`; all of `docs/dstu/rules.md`; `tests/golden/dstu-journal.ts`; `proposal.md`, `design.md`, `tasks.md`, `.openspec.yaml` and the spec delta of the change; the six files of `lib/dstu/`; `lib/publication/publication.ts`; part of `lib/metadata/crossref/map-work.ts`; the baseline, RED, check, green and follow-up records and the golden-oracle approval record in `evidence/runs/`; the earlier review file; `docs/session-notes.md`; `.agent-log/actions.jsonl` by search; `.git/logs/HEAD`; `package.json`, `tsconfig.json`, `vitest.config.mts`, `scripts/record-run.sh`, `.github/workflows/ci.yml`, `.claude/settings.json`, `.claude/hooks/log-action.mjs` and `.claude/agents/feature-reviewer.md`.

## Verdict

**READY** — the formatter agrees with the accepted spec and the approved golden oracle with GREEN recorded, and the findings concern one reading of the profile, the evidence for the final state, an open documentation task and a change to the agent harness.

The disposition of every finding belongs to the human.

---

## Human dispositions

This section was added by the maker session on 2026-10-05, after the human
gave the dispositions that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

| Finding | Disposition | Decision |
|---|---|---|
| R01-1 | **ACCEPT** | The accepted human profile decisions O18 and O21 govern. Their intended rule is based on the final rendered personal-author name, not only on `Publication.given`. A rendered personal heading such as `Petrenko O. V.` already ends in a terminal initial and must not receive a second heading full stop, even when the initials are inside the family field and the given value is missing. A proper repair cycle follows: clarify the requirement and the design of the change to match the approved wording of O18 and O21 (a clarification of the accepted profile, not a new product decision); add a targeted regression test for `{ kind: "person", family: "Petrenko O. V.", given: null }` that checks there is no duplicate heading full stop, that the incomplete-personal-name warning is still raised and that no full-stop-collision warning is raised for that boundary; record that test RED against the current implementation; repair only the terminal-initial detection. `docs/dstu/rules.md`, `tests/golden/` and unrelated formatter behaviour are not modified |
| R01-2 | **ACCEPT** | After the repair is committed, a fresh `pnpm check` is recorded on the committed clean source state. It replaces the stale final-state evidence; historical records are not rewritten |
| R01-3 | **ACCEPT AS PENDING PROCESS WORK** | Tasks 4.5 and 4.6 stay open for now. `docs/session-notes.md` is not updated yet |
| R01-4 | **DISMISS AS A DEFECT** | The change of the `feature-reviewer` harness was explicitly requested and approved by the human. No agent-setting repair is required |

The work that follows from R01-1 and R01-2 is tracked as task group 6 of the
change, and its runs are named in the Verification history of `design.md`.
