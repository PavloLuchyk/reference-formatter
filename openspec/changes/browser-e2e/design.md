# Design

## Context

See `proposal.md` for the motivation. What shapes the approach:

- The request to Crossref is made **on the server**. The page calls the
  Server Function `resolveDoiAction` (`app/actions.ts`), which calls
  `resolveDoi` with the global `fetch`; `lookupCrossrefWork` sends one `GET`
  to `https://api.crossref.org/works/` followed by the DOI as one
  percent-encoded segment. A browser-side interception never sees this
  request, so Crossref has to be made deterministic inside the server
  process.
- The repository already holds eight answers of the public Crossref REST API,
  recorded on 2026-10-05 and stored unmodified under
  `lib/metadata/crossref/__fixtures__/`, with their provenance in
  `provenance.json`. The Publications expected from the five journal-article
  files (`expected.ts`) were approved by the human on 2026-10-05.
- The formatter has one human-approved golden oracle,
  `tests/golden/dstu-journal.ts`, whose fixtures are synthetic Publications,
  not Crossref records. Before this change no approved expected reference
  text existed for a recorded Crossref record.
- The contract of `bibliography-copy` governs the text the application passes
  to `navigator.clipboard.writeText()`. What a platform then stores is
  outside the product; Chrome on Windows stores CR LF.
- Tests run under Vitest, whose default include matches `*.test.*` and
  `*.spec.*`. `tsconfig.json` includes every `.ts` file, and ESLint lints the
  whole tree.
- `next` is pinned to the exact version 16.3.8. Its published entry point is
  `./node_modules/next/dist/bin/next`; `next start` serves from the process
  it is started in.
- The repository path contains a space (`AI engineering`).
- No git remote is configured; the CI workflow has never run.

## Goals / Non-Goals

**Goals:**

- Repeatable browser evidence of the accepted primary flow against the
  production build, with no dependency on the network.
- The product's own path from the page to the formatted reference is the one
  exercised; nothing in the product is replaced except the answer of Crossref.
- A run cannot use live Crossref, by construction and by a canary, on the
  pinned version of Next.js this is verified against.
- Expected values whose provenance is the approved profile and a human
  approval, not the code under test.

**Non-Goals:**

- Evidence about the current state of live Crossref.
- Evidence on another browser or another platform than the one a run names.
- Coverage of every scenario of the workspace specs; the component tests keep
  that.
- Any change to CI, to the README or to product documentation.

## Decisions

### Human decisions (decided 2026-10-06, before the proposal was written)

| ID | Decision |
|---|---|
| HD-E1 | The tool is `@playwright/test`. Chromium only, and the Chromium binary managed by Playwright, not an arbitrary installed system Chrome. The binary may be installed with `pnpm exec playwright install chromium`. No Cypress, MSW, other browser framework or other runtime dependency is added. |
| HD-E2 | E2E stays separate from the canonical `pnpm check`. A dedicated `pnpm e2e` script is added. CI is not modified in this change. |
| HD-E3 | Crossref is made deterministic by an E2E-only stub preloaded into the server that Playwright starts. Its requirements: (1) the ordinary production build runs; (2) production `app/`, `lib/`, Next.js behaviour and the semantics of DOI resolution are not changed to enable testing; (3) the stub is preloaded only into the E2E `pnpm start` server; (4) `NODE_OPTIONS` is set through the `webServer` environment of Playwright, not through a shell-specific assignment; (5) only the Crossref requests the existing resolver needs are intercepted; (6) the existing recorded, unmodified Crossref answers are served read-only; (7) no answer is derived from formatter output; (8) an unrecorded DOI or request fails closed and never falls through to live Crossref; (9) a canary proves that an unrecorded DOI cannot reach the live provider; (10) the existing evidence of the live-Crossref manual browser check stays separate and unchanged. **Items 3 and 4 are superseded by HD-E13:** the server is not started through `pnpm start` and `NODE_OPTIONS` is not used. |
| HD-E4 | The deterministic E2E proves behaviour against recorded provider responses, not the current state of live Crossref. This is stated explicitly. |
| HD-E5 | Expected bibliography strings are not computed by calling the formatter in the test. Expected visible and reference strings are independent test expectations based on the already approved profile and oracle. Before implementation the human is shown an expectation table with the input DOI, the recorded provider outcome, the expected normalized publication identity where relevant, the expected visible formatted reference or error state, and the primary-flow step that uses it. No second golden oracle is created. |
| HD-E6 | The primary E2E covers the accepted MVP flow: add a recorded DOI; add another DOI in another supported input form; duplicate refusal; metadata correction and recomputation; reorder; copy one; copy all in the order of the list; remove; one deterministic provider or not-found failure; the fail-closed canary. It stays focused and is not a browser rewrite of the jsdom tests. |
| HD-E7 | Clipboard assertions verify the value the application passes to `navigator.clipboard.writeText`, under the approved line-feed contract. The Windows CR LF ambiguity is not reintroduced. |
| HD-E8 | No behavioural RED is manufactured. The product already implements the accepted behaviour. If the new tests pass on their first meaningful run, that is recorded as it happened. A failure caused only by the missing browser or harness is infrastructure setup, not evidence that product behaviour was RED. |
| HD-E9 | Once the E2E mechanism exists, one concise durable verification rule for `pnpm e2e` is added to `AGENTS.md`. No speculative rule is added before the mechanism exists. |
| HD-E10 | The README and product documentation stay outside this change. The three archived MVP slices are not reopened except for a concrete test-harness dependency, and their semantics and approved oracles are not modified. |

### Final human decisions (decided 2026-10-06, after the review of the plan)

| ID | Decision |
|---|---|
| HD-E11 | **The expectation table is approved**: rows E1 to E6, K1 and K2 and the sequence of the primary flow, as presented. R1, R2 and R4, the reference texts of E1, E2 and E4, are approved E2E expected reference strings for this change. They remain independent literal expectations derived from the already approved profile and Publications and are never generated by calling the formatter. The approval of R2 explicitly approves applying the existing terminal-initial rule O18 to the rendered ending `Douglas B.`; this is an application of an existing approved rule, not a new formatter decision. |
| HD-E12 | **The request record is approved, within a boundary.** The stub may write a unique per-run request record outside the repository, used to prove that the stub is active, that the expected Crossref requests occurred, that a locally refused duplicate made no request, and that an unrecorded DOI was refused by the stub. It records only the minimum this proof needs, such as the method and URL of a request; no request headers, no `CROSSREF_CONTACT_EMAIL`, no other unnecessary value. It is temporary test instrumentation, not repository evidence by itself; the recorded E2E run may summarize and assert what it proved. |
| HD-E13 | **The residual live-request risk is removed.** The E2E production server is not launched by putting `NODE_OPTIONS` on `pnpm start`, which left a wrapper and a child process. Playwright starts the actual Next.js production server Node process directly with the preload module, conceptually `node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p 3100`, through a portable `webServer` command. Requirements: the ordinary `pnpm build` still happens first with no stub loaded; the stub is loaded only into the actual Node process serving the E2E production build; if the preload module cannot load, the server fails to start; there is no state in which the canary can silently fall through to live Crossref because the preload was applied only to a wrapper process. The fail-closed invariant remains: an unrecorded Crossref request during deterministic E2E never calls the real Crossref provider. Supersedes items 3 and 4 of HD-E3. |
| HD-E14 | **Reuse of approved UI copy is approved, with a limit.** The E2E tests may read the already approved Ukrainian UI strings from `app/_components/__fixtures__/approved-copy.ts`, to avoid a third copy of those strings. The reuse applies to approved UI copy only. R1, R2 and R4 are not obtained from production formatter code or from a helper that computes them. |
| HD-E15 | **The correction is approved**: `PLoS ONE` set to `PLOS ONE` for the step of metadata correction and recomputation. |
| HD-E16 | **The Playwright setup is approved**: `@playwright/test` as an exact devDependency; Chromium managed by Playwright only; one worker; zero retries; a dedicated `pnpm e2e`; no CI change in this slice; no change to the canonical `pnpm check`. The browser is installed with `pnpm exec playwright install chromium`. |
| HD-E17 | **RED and GREEN history.** No product RED is manufactured. The first meaningful E2E run is recorded as it happened, GREEN or failing. A failure is classified as infrastructure or harness, as a defect of the test, or as product behaviour that differs from an approved expectation. In the last case the work stops for the human's disposition before product code or the expectation is changed. |
| HD-E18 | **`AGENTS.md`, just in time.** The concise verification rule for `pnpm e2e` is added only after the mechanism exists and has been demonstrated. |

### Final acceptance (decided 2026-10-06)

| ID | Decision |
|---|---|
| HD-E19 | **The `browser-e2e` change is approved as designed.** |
| HD-E20 | **The Next.js process-model limitation is approved and documented.** The fail-closed guarantee is accepted for the currently pinned Next.js version and the verified process model of `next start`. No unconditional guarantee is stated for every future Next.js version. To be recorded explicitly: the deterministic stub is verified against the currently pinned Next.js version; a Next.js upgrade requires the server, preload and canary verification to be run again before the fail-closed claim is carried forward; task 4.7 or the appropriate handoff or checklist preserves that requirement. This is a documented limitation of the harness, not a blocker for the current MVP. |
| HD-E21 | **The broken-preload verification is approved.** Task 2.6 stays: with the preload module missing the server must refuse to start, and with the location of the request record, the required configuration of the stub, missing the server must refuse to start. Both are recorded as expected harness behaviour, not as a product RED. |
| HD-E22 | **`AGENTS.md` wording, just in time.** The rule is not added during planning. After `pnpm e2e` exists and has been demonstrated successfully, the concise durable rule is added exactly as planned; the final wording is shown to the human immediately before writing only if it materially differs. |
| HD-E23 | **Confirmed as recorded.** The expectation table, with E1 to E6, K1, K2, R1, R2 and R4, is human-approved for this slice; R1, R2 and R4 remain literal expectations never computed through the production formatter, and the approved-copy fixture is reused only for already approved UI strings (HD-E11, HD-E14). The per-run request record stays outside the repository and restricted to event, method and URL, with no headers, contact email or unrelated request data (HD-E12). The correction stays `PLoS ONE` set to `PLOS ONE` (HD-E15). The scope stays: `@playwright/test` only; Chromium only; the browser managed by Playwright; one worker; zero retries; a dedicated `pnpm e2e`; no CI change; no change to `pnpm check`; no README or product-documentation work; no production `app/` or `lib/` change; no modification of the semantics of an archived slice or of the approved oracles (HD-E10, HD-E16). |

### Technical decisions (agent's, within the approved strategy)

**TD-E1. Files.** `playwright.config.ts` at the repository root;
`e2e/primary-flow.e2e.ts` with every browser test; `e2e/support/crossref-stub.mjs`
with the stub. No other file is added. Alternative considered: a separate
module holding the expected values; rejected, because a module of expected
references would look like, and could be reused as, a second oracle (HD-E5).
The expected reference texts are literals inside the test file, under a
comment that names the approved table of this design.

**TD-E2. Test file name.** Browser tests are named `*.e2e.ts` and Playwright
is told to match that pattern. The default include of Vitest
(`**/*.{test,spec}.?(c|m)[jt]s?(x)`) does not match it, so `pnpm test` does
not pick them up and `vitest.config.mts` stays untouched. `tsconfig.json`
already includes them, so `pnpm typecheck` and `pnpm build` type-check them,
and `pnpm lint` lints them. No setting is added or weakened.

**TD-E3. The command.** `"e2e": "pnpm build && playwright test"`. The build
runs first, as its own process and in the ordinary environment; no stub
exists in it. Only after it has ended does Playwright start the server.
Alternative considered: letting the `webServer` command build and start;
rejected, because the build would then not be separate from the process that
carries the stub (HD-E13).

**TD-E4. The server under test.** The `webServer` entry of
`playwright.config.ts` holds one command (HD-E13):

```
node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p 3100
```

with `reuseExistingServer: false`. It starts the Next.js production server as
one Node process and gives that process the preload as a command-line option
of Node itself.

- No `pnpm start`, so no wrapper process stands between Playwright and the
  server. The `start` script of `package.json` is neither used nor changed.
- No `NODE_OPTIONS`, anywhere. The preload is not an inherited environment
  value that some other process could pick up or lose.
- Both paths are relative to the repository root, which is where Playwright
  runs the command, and `./node_modules/next/dist/bin/next` is the entry
  point that the `bin` field of the `next` package names. Relative paths
  keep the space of the repository path out of the command; forward slashes
  work in the shells of Windows and of POSIX systems alike.
- The port is an argument of the command. The only value passed through the
  `env` of `webServer` is the location of the record of TD-E7.
- A server that is already running is never reused, and a taken port fails
  the run.

Alternative considered: starting the server from a setup script with
`child_process.spawn`, which would give its process id; rejected, because it
replaces the `webServer` mechanism of Playwright with lifecycle code of our
own, and the human asked for the `webServer` configuration.

**TD-E5. The stub.** A plain ECMAScript module with no dependency. Node loads
it before the entry point of Next.js. When it loads it reads
`provenance.json` and the location of the record; if either is missing or
unreadable it throws, and Node exits before Next.js starts. It then replaces
`globalThis.fetch` with a function that looks only at the method and the URL:

- a request whose host is not `crossref.org` or a subdomain of it is passed
  to the original `fetch` unchanged;
- a `GET` whose URL equals `https://api.crossref.org/works/` followed by the
  percent-encoded DOI of an entry of `provenance.json` is answered with a
  response built from that entry: its `status`, its `contentType` and the
  bytes of its `file`, read at that moment and not altered;
- every other request to Crossref is refused: the function rejects without
  calling the original `fetch`. The existing resolver reports a rejected
  request as `provider-unavailable`.

The stub maps answers to requests through `provenance.json` and holds no list
of DOIs of its own, so it serves exactly what was recorded and nothing else.
It opens the recorded files for reading only. It never reads the headers of a
request or `CROSSREF_CONTACT_EMAIL`. It does not import and cannot reach the
formatter.

**TD-E6. What the stub intercepts.** Only requests to Crossref. Requests to
any other host behave as without the stub, and no other function of Node or
of Next.js is replaced or observed (HD-E3, 2 and 5).

**TD-E7. Record of the Crossref boundary (HD-E12).** The stub appends one
line of JSON to a record file for each event, and prints the same to the
output of the server:

| Event | Fields |
|---|---|
| the stub has loaded | `event: "installed"` |
| a request was answered from a recorded file | `event: "served"`, `method`, `url` |
| a request was refused | `event: "refused"`, `method`, `url` |

Nothing else is written: no header, no contact address, no body. The file
lies in the temporary folder of the system, outside the repository, and has a
new name for every run; `playwright.config.ts` chooses the name once and both
the server and the tests receive it through one environment variable. The
file is instrumentation: it is not committed, not copied into `evidence/` and
not cited as evidence. What it proved is asserted by the tests, and the run
record keeps the output of those tests and of the server.

The tests read the file to assert what the page cannot show:

- before any DOI is submitted, that it holds exactly one `installed` line:
  the stub is active, and one process loaded it;
- for each DOI the flow adds, that one `served` line with the expected
  method and URL appeared;
- for the duplicate, that no line appeared;
- for the canary, that its request appears as `refused`;
- for every test, that the lines appended while it ran are exactly the ones
  it expects.

Why a record at all: the message of `provider-unavailable` cannot by itself
tell a refusal by the stub from a live Crossref that happens to be
unavailable. The record can.

**TD-E8. Order of the tests.** One worker, the tests of the file run in
series, and a failure stops the rest: first the canary, which starts by
reading the record of TD-E7; then the primary flow; then the `not-found`
failure. Nothing is submitted before the first assertion on the record has
passed.

**TD-E9. Runner settings (HD-E16).** One project, Chromium. One worker. No
retries, because a retry would hide a result that differs between runs.
`forbidOnly` on. The `list` reporter, so the run record holds plain text. The
browser context is granted `clipboard-write` and nothing else;
`clipboard-read` is neither granted nor used.

**TD-E10. Clipboard.** Before the page loads, an init script wraps
`navigator.clipboard.writeText`: it keeps each argument in a list on the page
and then calls the original method. The tests assert on that list (HD-E7).
The real write still happens, so the confirmation the page shows follows from
the browser accepting the text. The system clipboard is never read.

**TD-E11. Driving the page.** By role and accessible name, as a user would
find a control. The Ukrainian strings come from the existing test fixture
`app/_components/__fixtures__/approved-copy.ts`, which was written by hand
from the approved copy table and imports nothing (HD-E14). It is read, not
changed, and it supplies UI copy only. The browser tests import nothing else
from `app/` and nothing from `lib/`.

**TD-E12. Version.** `@playwright/test` is added with an exact version, the
current one at the time of installation, so that the lockfile fixes the
Chromium build Playwright manages (HD-E16).

**TD-E13. Evidence.** Every run is recorded with `scripts/record-run.sh`
under a label that begins `e2e-`. The first run of each test is recorded
whatever its result (HD-E8, HD-E17).

### Deterministic Crossref boundary

```
pnpm e2e
 ├─ 1. pnpm build ............................ ordinary build, no stub in this process
 └─ 2. playwright test
        ├─ starts ONE Node process:
        │    node --import ./e2e/support/crossref-stub.mjs \
        │         ./node_modules/next/dist/bin/next start -p 3100
        │       │  the stub loads first; if it cannot, the process exits
        │       ▼
        │    Next.js production server, product code unchanged
        │       │  Server Function → resolveDoi → lookupCrossrefWork → fetch
        │       ▼
        │    globalThis.fetch, replaced by the stub in this process
        │       ├─ host is not Crossref ........ original fetch, unchanged
        │       ├─ GET of a recorded DOI ....... recorded status, content type, body
        │       └─ any other Crossref request .. refused, no network → provider-unavailable
        └─ drives the page in Chromium (managed by Playwright)
```

The boundary sits exactly where the product leaves the process. Everything on
the product's side of it is the product. The stub exists only in the one
process that the command above starts; `pnpm dev`, `pnpm start`, `pnpm build`
and `pnpm check` never load it.

### How fail-closed is guaranteed

The invariant (HD-E13): an unrecorded Crossref request during deterministic
E2E never calls the real Crossref provider. It rests on five points, each of
which fails the run instead of letting a request out:

1. **The stub is part of how the serving process is started.** `--import` is
   an option of the very Node process that becomes the server. There is no
   wrapper process that could receive the preload in its place. If the module
   is missing or throws while it loads, Node exits with an error before
   Next.js starts, nothing listens on the port, Playwright reports that the
   server did not start, and no test runs.
2. **A server without the stub cannot be used.** `reuseExistingServer` is
   off, so a server started in any other way is never driven; if one holds
   the port, the run fails.
3. **Inside that process no Crossref request reaches the network unless it
   was recorded.** The stub decides by host. For a Crossref host it either
   answers from a recorded file or rejects; in neither branch does it call
   the original `fetch`. A request it does not recognise is refused, not
   passed on.
4. **Nothing is submitted before the stub is seen to be active.** The first
   assertion of the run requires exactly one `installed` line in the record.
5. **The canary and the record check it on every run.** An unrecorded DOI
   must show the `provider-unavailable` message and a `refused` line; every
   added DOI must show a `served` line. A request that bypassed the stub
   would leave no line, and the test would fail.

**Limit of the guarantee (HD-E20, accepted by the human on 2026-10-06).** The
guarantee is claimed for the currently pinned `next` 16.3.8 and its process
model, in which `next start` serves requests in the process it is started
in. It is not a guarantee for every future version of Next.js. Points 1 and
3 depend on that process model: a version that handled requests in another
process would not carry the stub there, and point 5 would then fail the run
at the canary, after one request for a DOI that does not exist.

- The deterministic stub is verified against the pinned version by the
  recorded runs of tasks 2.6 (the two refusals to start), 2.8 (the canary)
  and 3.3 and 3.4 (the complete file).
- A Next.js upgrade requires those to be run and recorded again before the
  fail-closed claim is carried forward: the two refusals to start, the
  canary and `pnpm e2e`.
- The requirement is preserved in the spec (requirement "Fail-closed claim is
  tied to the verified Next.js version"), which outlives this change, and in
  the handoff of `docs/session-notes.md` (task 4.7).

This is a documented limitation of the harness, not a blocker for the MVP.

Recorded answers the browser tests use, as listed in `provenance.json`:

| File | DOI | Recorded on | Status | Used for |
|---|---|---|---|---|
| `nature12373.json` | `10.1038/nature12373` | 2026-10-05T08:43:12Z | 200 | E1 |
| `pone-0000308.json` | `10.1371/journal.pone.0000308` | 2026-10-05T08:43:13Z | 200 | E2 |
| `not-found-unknown.txt` | `10.1234/this-doi-does-not-exist-xyz` | 2026-10-05T08:43:14Z | 404 | E5 |

The other five recorded answers are served by the same rule and are not used
by a browser test.

### E2E expectation table (APPROVED by the human on 2026-10-06, HD-E11)

Proposed by the agent on 2026-10-06 and approved by the human the same day
without a change: rows E1 to E6, K1 and K2 and the sequence of the steps. R1,
R2 and R4 name the reference texts of E1, E2 and E4. Changing an expected
value needs a new human approval.

Each reference text was written by hand from the rows of `docs/dstu/rules.md`
and the requirements of `dstu-journal-formatting` named in the derivation,
applied to the Publication that the human approved for the recorded file in
`lib/metadata/crossref/__fixtures__/expected.ts`. No code produced them, and
no test may produce them by calling the formatter or a helper that computes
them. The table is not an oracle for the formatter: the formatter tests keep
`tests/golden/dstu-journal.ts` as their only one.

Characters with a look-alike: `Т` is U+0422 and `С` is U+0421 (Cyrillic, not
Latin T and C); `№` is U+2116; the dash of a page range is the em dash U+2014.

| Row | Input typed into the DOI field | Recorded provider outcome | Canonical DOI | Expected result on the page | Step |
|---|---|---|---|---|---|
| E1 | `10.1038/nature12373` | `nature12373.json`: 200, `journal-article` | `10.1038/nature12373` | One entry whose only line is R1: `Nanometre-scale thermometry in a living cell / G. Kucsko, P. C. Maurer, N. Y. Yao, M. Kubo, H. J. Noh, P. K. Lo, H. Park, M. D. Lukin // Nature. 2013. Т. 500, № 7460. С. 54—58. DOI: 10.1038/nature12373.` No warning and no indication of gaps. The DOI field is empty | P1; then P4 to P8 |
| E2 | `https://doi.org/10.1371/JOURNAL.PONE.0000308` | `pone-0000308.json`: 200, `journal-article` | `10.1371/journal.pone.0000308` | A second entry, after E1, whose only line is R2: `Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLoS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.` No warning and no indication of gaps | P2 |
| E3 | `DOI: 10.1038/NATURE12373` | None: no request is made | `10.1038/nature12373`, the identity of the entry of E1 | The message of row 16 of the approved copy table, «Ця публікація вже є в переліку.» The list still holds E1 and E2 in this order | P3 |
| E4 | No DOI input. Correction of entry 2: the field «Назва журналу», which holds `PLoS ONE`, is set to `PLOS ONE` and saved (HD-E15) | None: no request is made | `10.1371/journal.pone.0000308`, unchanged | Entry 2 shows R4: `Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B. Sharing Detailed Research Data Is Associated with Increased Citation Rate // PLOS ONE. 2007. Т. 2, № 3. С. e308. DOI: 10.1371/journal.pone.0000308.` Entry 1 still shows R1 | P4 |
| E5 | `10.1234/this-doi-does-not-exist-xyz` | `not-found-unknown.txt`: 404 | None: no Publication | The message of row 11, «Crossref не має запису для цього DOI.» The list is empty and shows row 18. The typed text stays in the DOI field | F1 |
| E6 | `10.9999/unrecorded.e2e` | None recorded: the request is refused, with no network | None: no Publication | The message of row 13, «Crossref зараз недоступний. Спробуйте ще раз пізніше.» The list is empty. The record of the boundary shows the request as refused | C1 |

Values passed to `navigator.clipboard.writeText`:

| Row | Action | Expected value | Step |
|---|---|---|---|
| K1 | Copy the reference of entry 1, after the correction and the move | R4, exactly, and nothing else | P6 |
| K2 | Copy the whole list, after the correction and the move | R4, one line feed U+000A, R1. No carriage return, no number, no line break after the last reference | P7 |

Steps of the browser tests:

| Step | Action | Asserted |
|---|---|---|
| C1 | Canary, a newly opened page: read the record of the boundary; submit the input of E6 | Exactly one `installed` line exists before anything is submitted; then E6 |
| P0 | Primary flow, a newly opened page | Document language `uk`; the heading of row 17; the empty-list text of row 18; the notice of row 5; «Копіювати весь перелік» shown and disabled |
| P1 | Submit the input of E1 | E1; one `served` line for its URL |
| P2 | Submit the input of E2 | E2; the order is E1, E2; one `served` line for its URL |
| P3 | Submit the input of E3 | E3; the record of the boundary gains no line |
| P4 | «Редагувати: запис 2»; change the journal title; «Зберегти» | E4 |
| P5 | «Вище: запис 2» | Entry 1 shows R4 and entry 2 shows R1 |
| P6 | «Копіювати: запис 1» | K1; the confirmation of row 41, «Скопійовано.» |
| P7 | «Копіювати весь перелік» | K2; the confirmation of row 41 |
| P8 | «Вилучити: запис 1» | The list holds one entry, with R1 |
| F1 | Not-found failure, a newly opened page: submit the input of E5 | E5; one `served` line for its URL |

Derivation of the three reference texts:

| Segment | Text | Basis | Approved analogue |
|---|---|---|---|
| R1, no heading | The entry begins with the title; eight authors | D3a; provisional P21, P22 | GF03 |
| R1, responsibility | ` / G. Kucsko, P. C. Maurer, … M. D. Lukin`: given value, space, family name; `, ` between authors; source order; none dropped | O9, R5, P16, P42 | GF03 |
| R1, journal | ` // Nature` | D7, D8 | GF01 |
| R1, year | `. 2013`: the print date, August 2013, is present | D11, D15 | GF02 |
| R1, volume and issue | `. Т. 500, № 7460` | R2, D9b, D10a, O3, D13 | GF01 |
| R1, pages | `. С. 54—58`: the stored value `54-58` is a plain numeric range | D13, O6, R4, O8 | GF01 |
| R1, DOI and end | `. DOI: 10.1038/nature12373.` | D14b, R6 | GF01 |
| R1, no warning | No subtitle; every person has both parts of the name; no supplied value ends in a full stop | O13, D5, O17 | GF01 |
| R2, heading | `Piwowar, Heather A.; Day, Roger S.; Fridsma, Douglas B.`: family name, comma, given value as supplied; `; ` between authors | N7, D2a, D2b, D2d; provisional P23, P25; C12 | GF02 |
| R2, end of the heading | No second full stop after `Douglas B.` and no warning: the heading ends in a terminal initial, a letter that follows a space and is followed by `.` | O18, O21; provisional P26; HD-E11 | GF02 (`Durand, J.-P.`); the spec scenario "Terminal initial" (`Smith, K. J.`) |
| R2, journal | ` // PLoS ONE` | D7, D8 | GF01 |
| R2, year | `. 2007`: no print date; the issued date is 21 March 2007 | D11 | GF03 |
| R2, volume and issue | `. Т. 2, № 3` | R2, D9b, D10a, O3 | GF01 |
| R2, pages | `. С. e308`: not a plain range, printed as supplied | D12b, O8, O6 | The spec scenario "Electronic locator in the pages" |
| R2, DOI and end | `. DOI: 10.1371/journal.pone.0000308.` | D14b, R6 | GF01 |
| R4, journal | ` // PLOS ONE`: the corrected value, printed as stored; every other segment as in R2 | D8; `metadata-correction`, Reference is recomputed from the Publication | The spec scenario "Full-stop collision is corrected" |

In the "Basis" column `R2` and `R4` are the profile rules of
`docs/dstu/rules.md` (8.5), not the reference texts.

The application of O18 to `Douglas B.`, approved with R2 (HD-E11). The given
value of the last heading author is a full name followed by an initial. O18
covers a name that "ends in one or more ordinary initials whose final token
is a single alphabetic character followed by `.`", and the accepted
requirement "Full stop after the heading" states the same test; `Douglas B.`
meets it. The approved golden fixtures show only given values made of
initials alone. The human approved this as an application of an existing
approved rule, not as a new formatter decision; the profile and the golden
oracle are unchanged by it.

Cross-check, not a source: R1 and R2 equal what the page showed in the live
browser check of 2026-10-06
(`evidence/runs/20261006T110108Z_workspace-manual-browser-check-repeat.log`,
"observed entry 1" and "observed entry 2"). That record shows output of the
product and gives the texts no provenance; their provenance is the derivation
above and the human's approval.

### Source limitations carried, not resolved

R1 depends on the provisional rows P21 and P22, and R2 and R4 on P23, P25 and
P26; the heading standard ДСТУ ГОСТ 7.80:2007 was not verified (G1). The
`; ` between heading authors is a human convention (C12). The em dash of the
page range in R1 comes from the uncorrected printing of S1 by human decision
(O8, G11). A browser test that passes shows that the page prints what the
approved profile prescribes. It verifies no source.

### Rule planned for `AGENTS.md` (HD-E9, HD-E18, HD-E22)

Not added during planning. Added to the Verification section only after
`pnpm e2e` exists and has been demonstrated successfully by the recorded
runs of tasks 3.3 and 3.4 (task 3.6), in exactly this wording. If the wording
has to differ materially, the final wording is shown to the human immediately
before it is written:

> `pnpm e2e` builds the app and runs the Playwright browser E2E of the
> primary flow against recorded Crossref answers; it is separate from
> `pnpm check` and needs `pnpm exec playwright install chromium` once.
> It never contacts live Crossref: do not weaken the fail-closed stub or its
> canary to obtain GREEN.

## What the verification proves and does not prove

It proves, for the commit and the platform a run record names: that the
production build, driven through its page in Chromium, takes a DOI through
the Server Function, DOI normalization, DOI resolution, the mapping and the
formatter to the approved reference text; that the listed steps of the
primary flow behave as the accepted specs say; that the application passes
the specified text to the clipboard; and that no request left the server for
Crossref.

It does not prove: anything about the current state of live Crossref, since
the provider answers were recorded on 2026-10-05 and a record may have
changed since; that the application can reach Crossref at all, or what it
sends as `User-Agent` with a configured contact address; behaviour in another
browser or on another platform; what a platform stores on its clipboard; any
scenario outside the listed steps; that the fail-closed property holds on
another version of Next.js than the pinned one (HD-E20).

The live browser check of 2026-10-06 stays the only evidence against live
Crossref: `…105455Z_workspace-manual-browser-check.log`,
`…105522Z_workspace-manual-browser-check.log` and
`…110108Z_workspace-manual-browser-check-repeat.log`. It is one unrepeatable
pass and is not E2E evidence. Those three records are not touched, and the
check is not repeated or automated by this change.

## Risks / Trade-offs

- [The stub relies on the Server Function reading `globalThis.fetch` when it
  is called, on Next.js wrapping the function it finds rather than replacing
  it, and on `next start` serving requests in the process it is started in.
  A later version of Next.js could change any of these] → Accepted by the
  human as a documented limitation (HD-E20). The guarantee is claimed for the
  pinned version only; on an upgrade the two refusals to start, the canary
  and `pnpm e2e` are run and recorded again before the claim is carried
  forward. See "How fail-closed is guaranteed".
- [`node` in the `webServer` command is the one found on `PATH`] → It is the
  Node that runs pnpm and Playwright in the same shell. The run record names
  the Node version.
- [The recorded answers are dated] → Stated wherever the verification is
  described (HD-E4). They are evidence of 2026-10-05, not of today.
- [The tests start GREEN, so none is seen to fail on the behaviour it names]
  → Recorded as it happens (HD-E8, HD-E17). No RED is produced for the
  record. This limit goes into the Verification history.
- [Task 2.6 makes the server fail to start on purpose, twice] → Approved by
  the human (HD-E21). The two failures are the expected behaviour of the
  harness; their record says so and is never presented as a product RED.
- [A first run can fail] → Recorded and classified (HD-E17) as
  infrastructure or harness, as a defect of the test, or as product behaviour
  that differs from an approved expectation. In the last case the work stops
  for the human's disposition; neither product code nor the expectation is
  changed first.
- [ESLint may read a callback parameter named `use`, as custom Playwright
  fixtures have, as a React Hook] → The tests use plain helper functions and
  no custom fixture. ESLint settings are not changed.
- [pnpm may report a build script of a new package that needs an entry in
  `pnpm-workspace.yaml`] → That file is tooling. The agent stops and asks.
- [Evidence comes from one machine: Windows, Chromium. CI is not modified and
  has no remote to run on] → Stated as a limit. No claim is made for another
  platform.
- [`pnpm e2e` rewrites `.next`, as `pnpm check` does] → No mitigation needed.
- [Port 3100 is taken] → The run fails without submitting a DOI. Nothing is
  reused.
- [The record of the boundary is left in the temporary folder after a run] →
  It holds methods and URLs of requests for the DOIs of the tests and nothing
  else (HD-E12). It is not in the repository.
- [The Chromium download is large and lives in the cache of Playwright
  outside the repository] → One command, approved in HD-E1 and HD-E16. The
  repository cannot be verified by `pnpm e2e` before it has been run; that
  belongs in the README, which is outside this change.

## Verification history

Nothing has been run under this change yet.

Planning input, not evidence. On 2026-10-06 the agent tried the approach
twice with throwaway files outside the repository, against the existing
production build at `6e32be4`. Neither attempt was recorded with
`scripts/record-run.sh`, used a browser or changed anything in the
repository. They showed feasibility on this version of Next.js; the recorded
runs of the tasks are the evidence.

- Before the strategy was approved: `pnpm start` with the stub in
  `NODE_OPTIONS`. Four direct calls of the Server Function gave a Publication
  for `10.1038/nature12373`, `not-found` for the recorded unknown DOI,
  `unsupported-type` for the recorded book and `provider-unavailable` for an
  unrecorded DOI. The stub was loaded in two processes, the wrapper of pnpm
  and the server; that observation led to HD-E13.
- After HD-E13: the direct launch,
  `node --import <stub> ./node_modules/next/dist/bin/next start -p 3210`. The
  stub loaded once; the process that was launched, the process that loaded
  the stub and the process listening on the port were the same one. A
  recorded DOI was answered from its file and an unrecorded one was refused.
  With a preload path that does not exist, and with a stub that throws while
  loading, Node exited with code 1 and nothing listened on the port. A
  relative `--import` path given to a shell as one command string worked from
  a folder whose path contains a space.

## Open Questions

None. The human approved the change as designed on 2026-10-06 (HD-E19) and
disposed of every point that was open (HD-E20 to HD-E23).
