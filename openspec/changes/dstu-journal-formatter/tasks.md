# Tasks

## 1. Baseline

- [x] 1.1 Run `pnpm spec:check`; verify it exits 0 with this change valid
- [x] 1.2 Record the state before any code with `bash scripts/record-run.sh dstu-formatter-baseline`; verify the record says GREEN; the commit on its `# commit:` line is the reference state of `docs/dstu/rules.md` and `tests/golden/dstu-journal.ts` for task 4.2

## 2. Behavioural RED

- [x] 2.1 Add the outcome types and a stub `formatJournalArticle` in `lib/dstu/` that returns one fixed outcome for every input (design TD-2, TD-8); verify `pnpm typecheck` and `pnpm lint` exit 0 and the stub contains no formatting logic
- [x] 2.2 Write the conformance test in `lib/dstu/` that formats the `Publication` of every fixture in `tests/golden/dstu-journal.ts` and compares the outcome with the approved one, text character for character and warnings and blocking fields as sets; verify it fails for all eight fixtures with assertion failures and that `tests/golden/` is unchanged
- [x] 2.3 Write targeted tests in `lib/dstu/` for the requirements Formatting outcome, Blocking fields, Missing optional elements are omitted, Year selection, and DOI note and end of the reference, with expected values written by hand from the spec scenarios; verify they fail only by assertion (the two invariant tests of Formatting outcome may pass against a stub, and the task notes which do)
- [x] 2.4 Write targeted tests for Qualifying Roman numeral, Numbers in volume and issue, Volume, Issue, Volume and issue zone, Pages and Article number; verify each scenario of those requirements has a test and that they fail by assertion
- [x] 2.5 Write targeted tests for Heading for one to three authors, Incomplete personal name, Statement of responsibility for four or more authors, Reference without authors, Title and subtitle, Journal title and Designations do not depend on language; verify each scenario has a test and that they fail by assertion
- [x] 2.6 Write targeted tests for Full stop before a zone, Full stop after the heading and Warnings; verify each scenario has a test and that they fail by assertion
- [x] 2.7 Record the RED run with `bash scripts/record-run.sh dstu-formatter-red -- pnpm test`; verify the record shows failures only in the new test files, no import or module error, and the 176 existing tests still passing

## 3. Implementation

- [x] 3.1 Implement blocking fields, year selection, title, journal title, the DOI note and the terminal full stop; verify GF05 and GF06 pass in the conformance test and the tests of 2.3 pass, with no test changed (GF05 and GF06 passed right after this step, with the Blocking fields and Missing optional elements tests; the tests of 2.3 that format a complete record need the other zones and the heading, and passed after 3.5)
- [x] 3.2 Implement the number normaliser and the volume and issue zone (design TD-5); verify the tests of 2.4 for Roman numerals, numbers, volume, issue and their zone pass unchanged (implemented in this order; these tests assert whole references that include the heading and the pages, so they passed after 3.5)
- [x] 3.3 Implement the locator: pages, plain numeric range, article number precedence; verify the remaining tests of 2.4 pass unchanged (as 3.2: passed after 3.5)
- [x] 3.4 Implement the subtitle, the heading for one to three authors, incomplete names and the statement of responsibility for four or more authors; verify the tests of 2.5 pass unchanged (as 3.2: passed after 3.5)
- [x] 3.5 Implement the boundary joiner with the zone, heading and DOI collision rules and the three warnings (design TD-4); verify the tests of 2.6 pass unchanged and GF01 to GF08 all pass in the conformance test (all 351 tests pass: 175 new and the 176 existing; GF01 to GF08 pass)
- [x] 3.6 Run `pnpm check`; verify it exits 0 and that `git diff` against the RED state shows no change in any test file, in `tests/golden/` or in `docs/dstu/rules.md` (`evidence/runs/20261005T190516Z_dstu-formatter-check.log`: GREEN, exit 0, tree not yet committed. The RED state was not a commit, so both test files and both oracles were compared by SHA-256 with the hashes taken at the RED run: identical)

## 4. Integration checks

- [x] 4.1 Check the boundary by search: verify nothing under `lib/dstu/` imports `react`, `next`, `lib/metadata/` or reads `process.env` or the network, that non-test code under `lib/dstu/` does not import from `tests/`, and that `tests/golden/dstu-journal.ts` imports no formatter code (checked by search on 2026-10-05: non-test code under `lib/dstu/` imports only `lib/dstu/` and types of `lib/publication/`; only `lib/dstu/golden.test.ts` imports `tests/golden/`; the oracle imports two types and no formatter code; nothing outside `lib/dstu/` imports it)
- [x] 4.2 Prove the oracles are untouched: verify `git diff --stat <baseline commit of 1.2> -- docs/dstu/rules.md tests/golden/` prints nothing (baseline commit `dc76a2e`; the command printed nothing)
- [x] 4.3 Check that every provisional row used (P21, P22, P23, P25, P26, P43) and the `; ` convention are named as limitations in a comment at the code that implements them; verify by search that each ID appears under `lib/dstu/` and that no comment presents one as verified (P21, P22 and P43 in `format-journal-article.ts`; P23, P25, P26 and the `; ` convention (C12) in `authors.ts`; P26 also in `boundary.ts`; each is called provisional or a human convention)
- [ ] 4.4 On a clean tree, run `bash scripts/record-run.sh dstu-formatter-green`; verify the record says `# exit: 0` and GREEN
- [ ] 4.5 Request an independent review of the slice against the spec, the profile and the golden oracle; verify every finding has a disposition recorded by the human
- [ ] 4.6 Update `docs/session-notes.md` with the state of the slice, the files that must not change casually and the known limitations; verify it names both oracles and the six provisional rows
