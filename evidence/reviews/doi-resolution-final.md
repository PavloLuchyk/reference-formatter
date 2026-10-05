# DOI Resolution — final independent review

Record of the review that closes task 7.3 of the OpenSpec change
`doi-resolution`. Written on 2026-10-05 by the reviewing agent; the
dispositions are the human's, given the same day.

## Scope

- Reviewed HEAD: `1f87b50` (`docs(evidence): record final DOI verification
  gate`), branch `master`. Its code, tests and fixtures are identical to
  `efe01ac`.
- Reviewer: a fresh agent session (`b5066360` in `.agent-log/actions.jsonl`)
  that had written none of the code, tests, specs or evidence. The review
  itself was read-only.
- Read: `AGENTS.md`, `docs/intent.md`, the change (`proposal.md`, `design.md`,
  `tasks.md`, three specs), the implementation and tests under `lib/`, the
  fixtures with `provenance.json` and `expected.ts`, every record in
  `evidence/runs/`, the git history of the slice, the agent log, and the
  earlier findings (F1–F7, R1–R5, read-only review 1–5) with their
  dispositions.

## Reviewer verdict

No blocking findings. Four non-blocking findings, listed below. READY TO
ARCHIVE once the human has recorded dispositions and closed task 7.3.

What was confirmed:

- `pnpm check` exits 0 with 176 tests passed, and `pnpm spec:check` exits 0.
- The accepted findings F1–F5, F7, R1–R5 and 1–4 of the read-only review are
  resolved in the specs, tests, code and committed evidence.
- Task 7.1 is evidenced by `evidence/runs/20261005T105814Z_doi-live-check.log`
  (one request, HTTP 200, outcome equal to the approved `Publication`), and
  task 7.2 by `evidence/runs/20261005T104614Z_doi-resolution-green.log` (clean
  tree at `efe01ac`, exit 0, GREEN). The agent log timestamps match both.
- Fixtures and `expected.ts` are unchanged since `1fd61a4`. Every run record
  was added once and never modified. The only reversed test expectation and
  the only removed spec text are the F1 reversal decided by the human.
- No scope expansion: no change to `app/`, CI, hooks or lint and TypeScript
  settings, no entry point, and the provider boundary holds.

## Findings and human dispositions

### 1. Low (tests) — four spec-stated behaviours are not pinned by a test

Each behaviour is correct at `1f87b50`, but a single-line change that breaks
it passes the whole suite.

- A stacked prefix such as `doi:https://doi.org/10.1038/x` is rejected
  (`lib/doi/normalize-doi.ts:22`).
- A matched tag pair after an empty-element tag adds no space:
  `A<br/>B<sub>2</sub>O` gives `A B2O` (`lib/metadata/crossref/map-work.ts:74`).
- Numeric references to U+007F–U+009F are kept as supplied
  (`lib/metadata/crossref/map-work.ts:98`); the tests cover only U+0000 and
  U+0007.
- `createPublication` trims author names and drops a nameless person
  (`lib/publication/publication.ts:79` and `:95`); the tests reach these rules
  only through the Crossref mapper, which applies them first.

**Disposition: DEFER.** Accepted as a test-hardening gap. No tests are added
in this slice.

### 2. Low (evidence) — task 8.4 has no recorded result

`tasks.md` ticks task 8.4, the repeat mutation check after the F1–F5 repair.
The agent log shows a mutation script written and run seconds before the tick,
but its output was not kept and `design.md` did not mention it.

**Disposition: ACCEPT AS EVIDENCE LIMITATION.** The check was performed but
has no durable recorded result, so it is not claimed as formal mutation
evidence.

### 3. Low (docs) — `proposal.md` understated the tooling change

`proposal.md` said "Dependencies: none added" and "no change to scripts, CI or
hooks". Commit `1fd61a4` added the devDependency `@fission-ai/openspec`, the
script `spec:check`, `.claude/commands/opsx/` and six `.claude/skills/openspec-*`
skills.

**Disposition: ACCEPT.** `proposal.md` is corrected: OpenSpec was added as
development and tooling infrastructure and `spec:check` was introduced; no
runtime product dependency was added.

### 4. Info — `docs/session-notes.md` was stale

The untracked handoff file still described HEAD `efe01ac`, task 7.1 without a
record and six untracked run records.

**Disposition: ACCEPT.** The file is updated to the current verified state.

## Still deferred from earlier reviews

Both are recorded in `design.md`, Risks, and neither is changed by this review.

- **F6.** A malformed contact address, for example one containing a line
  break, makes the request fail and is reported as `provider-unavailable`.
  Application configuration is trusted input for this MVP and no new failure
  kind is introduced.
- **Literal no-break space** (finding 5 of the read-only review). A literal
  U+00A0 is lost when removed markup leaves whitespace on both sides of the
  gap: `5`, U+00A0, `<i></i> km` becomes `5 km` with an ordinary space.

## Limits of this review

- The reviewer's probes are not recorded in `evidence/runs/`. They ran outside
  the repository: the R1/R3/R4 reconstruction (tests of `1f87b50` against the
  modules of `69b2006`: 14 failed, 161 passed, all assertion failures) and 78
  single-line changes to copies of the source files, of which the tests caught
  69 and missed 9. Four of the nine are finding 1; the other five are
  equivalent changes or lie outside the specs. This is a reviewer's probe, not
  formal mutation evidence.
- The reviewer's first report gave those counts as 75 and 66. That was a
  miscount; 78 and 69 are the counts of the run.
- After the review, at the human's instruction, the same session wrote the
  dispositions into `design.md`, `proposal.md`, `tasks.md` and
  `docs/session-notes.md`. It changed no code, test, fixture, spec requirement
  or run record.

## Final verdict

Every finding has a human disposition and task 7.3 is closed (28 of 28 tasks).

**READY TO ARCHIVE.**
