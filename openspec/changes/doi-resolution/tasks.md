# Tasks

## 1. Human decisions (blocks every later group)

- [x] 1.1 Human records an answer for HD-1, HD-2 and HD-3 in `design.md`; verify each row shows the approved answer and `specs/doi-normalization/spec.md` no longer contains "Pending HD-" (requirement text updated where the answer differs from the proposal)
- [x] 1.2 Human records an answer for HD-5 and HD-8 in `design.md`; verify `specs/publication-model/spec.md` no longer contains "Pending HD-" and its field list matches the answer
- [x] 1.3 Human records an answer for HD-4, HD-6, HD-7, HD-9 and HD-10 in `design.md`; verify `specs/doi-resolution/spec.md` no longer contains "Pending HD-" and its scenarios match the answers
- [x] 1.4 Run `pnpm exec openspec validate doi-resolution --strict` after the answers are folded in; verify it reports the change as valid
- [x] 1.5 Human confirms or corrects the agent's readings listed under the decision table in `design.md` (canonical lower case, `doi: ` with a space, no percent-decoding, field mapping, four preserved dates, nameless author entries); verify each reading is marked confirmed or the spec is updated
- [x] 1.6 Human reviews the Crossref field → Publication field mapping table in `design.md`, including the three points listed under it, before any RED test is written; verify the table heading records the approval and date, the "Pending human review" note is removed from the Field mapping requirement in `specs/doi-resolution/spec.md`, and `pnpm exec openspec validate doi-resolution --strict` still passes

## 2. DOI normalization

- [x] 2.1 Write one Vitest test per scenario of `specs/doi-normalization/spec.md` under `lib/doi/`, before any implementation; verify `pnpm test` fails only in these new tests and record the run with `bash scripts/record-run.sh doi-normalization-red -- pnpm test`
- [x] 2.2 Implement normalization in `lib/doi/` as a pure function returning the canonical DOI or an invalid-DOI rejection (design TD-2); verify the tests from 2.1 pass unchanged and `pnpm check` exits 0

## 3. Publication model

- [x] 3.1 Write Vitest tests under `lib/publication/` for the scenarios of `specs/publication-model/spec.md` (field presence, canonical DOI as identity with no typed text kept, source dates preserved with their precision, explicit missing values, blank treated as missing, author kinds and order), before any implementation; verify `pnpm test` fails only in these new tests
- [x] 3.2 Implement the `Publication` model in `lib/publication/` with every optional field present as a value or `null` (design TD-3); verify the tests from 3.1 pass unchanged and `pnpm check` exits 0

## 4. Crossref fixtures

- [x] 4.1 Record the Crossref answers for `10.1038/nature12373`, `10.1371/journal.pone.0000308`, `10.1007/978-3-319-24277-4`, `10.5281/zenodo.3233118` and `10.1234/this-doi-does-not-exist-xyz` into `lib/metadata/crossref/__fixtures__/`; verify each file has a provenance note with DOI, request URL, retrieval time and HTTP status
- [x] 4.2 Record one real Crossref record for each assumption listed as "not observed" in `design.md` (title with markup, group author, `article-number`, article without volume and issue); verify each has a fixture with provenance, and stop and report to the human if a record contradicts a spec scenario
- [x] 4.3 Derive the expected `Publication` for every fixture by applying the approved mapping table from `design.md`, and have the human approve any expected value that still depends on interpretation; verify each expected value file names the mapping table as its source and records the approval and date

## 5. Crossref mapping

- [x] 5.1 Write Vitest tests under `lib/metadata/crossref/` that map each fixture to its approved `Publication`, covering the requirements Field mapping, Publication dates, Title text, Author mapping and Absent metadata, before any implementation; verify `pnpm test` fails only in these new tests
- [x] 5.2 Implement response narrowing and mapping in `lib/metadata/crossref/` as pure functions with no dependency added (design TD-5); verify the tests from 5.1 pass unchanged and `pnpm check` exits 0

## 6. Crossref lookup and resolution

- [x] 6.1 Write Vitest tests with a fake `fetch` under `lib/metadata/` for: lookup by canonical DOI, `invalid-input` without any request (for text that is not a DOI and for an input form that is not accepted), `not-found` on 404, `unsupported-type` for the book fixture, `provider-unavailable` on network error, timeout, 429 and 503 with exactly one request, `invalid-response` on non-JSON, on JSON without a work record and on 400, requested DOI kept, and identification with and without a contact address; verify `pnpm test` fails only in these new tests and record the run with `bash scripts/record-run.sh doi-resolution-red -- pnpm test`
- [x] 6.2 Implement the Crossref provider and the resolve operation with `fetch` and configuration injected (design TD-4, TD-7); verify the tests from 6.1 pass unchanged and `pnpm check` exits 0
- [x] 6.3 Check the boundary: verify by search that nothing outside `lib/metadata/` imports `lib/metadata/crossref/`, and that nothing under `lib/` imports `react`, `next` or reads `process.env`

## 7. Integration checks (run after group 8)

- [ ] 7.1 Resolve `10.1038/nature12373` once against the live Crossref API through the real provider, from a throwaway script that is not committed, and run it through `bash scripts/record-run.sh doi-live-check -- <command>` so that its output is kept; verify the record shows one request and an outcome equal to the approved `Publication` for that fixture, and report any difference instead of adjusting the fixture (reopened on 2026-10-05: the first run passed but left no evidence, and the request construction changes in 8.3)
- [ ] 7.2 On a clean tree, run `bash scripts/record-run.sh doi-resolution-green`; verify the record says `# exit: 0` and `GREEN`
- [ ] 7.3 Request an independent review of the slice against the three specs; verify every finding has a disposition recorded by the human

## 8. Repair after the checker review of 2026-10-05

- [x] 8.1 Update the specs and `design.md` for the human's F1 clarification (record accepted only for a canonically equivalent DOI; DOI cannot alter the request URL) and for the cleaning rules that close F3, F4 and F5, and correct the documentation and evidence drift of F7; verify `pnpm spec:check` exits 0 and `design.md` has a "Verification history" section that describes the first RED as stub-error-driven
- [x] 8.2 Add regression tests for the accepted findings F1 to F5 without changing the implementation, changing an existing test only where the F1 clarification reverses its expectation; verify `pnpm test` fails only in new or reversed tests, that the failures are assertion failures, and record the run with `bash scripts/record-run.sh doi-checker-findings-red -- pnpm test`
- [x] 8.3 Repair the implementation until the tests from 8.2 pass unchanged; verify `pnpm check` exits 0 and that no test, fixture or expected value changed
- [x] 8.4 Repeat the single-line mutation check on the repaired code for the six changes that survived in finding F2; verify each is now caught by a test

## 9. Repair after the re-review of 2026-10-05

- [x] 9.1 Update the specs and `design.md` for the accepted findings R1, R3 and R4 (private-use reference is decoded; unpaired surrogate is invalid input; removing an empty-element tag does not join text); verify `pnpm spec:check` exits 0
- [x] 9.2 Add regression tests for R1, R3 and R4 without changing the implementation, any fixture expectation or any existing test; verify `pnpm test` fails only in the new tests and that every failure is an assertion failure
- [ ] 9.3 Repair the implementation until the tests from 9.2 pass unchanged, with no sentinel character in title cleaning that could collide with valid title text; verify `pnpm check` exits 0 and that no spec, test, fixture or expected value changed
