# Review: browser-e2e (review 01)

- Reviewed HEAD: `a6c46f8b827723b2bf88558c7cf21d9cb35268a4` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`). The change itself is commit `7d82901`; `a6c46f8` adds the clean-tree records.
- Checker: `feature-reviewer`
- Mode: fresh session, read-only apart from this report. No command was run.
- Date: 2026-10-06
- Working tree: per the caller's status snapshot, only `.agent-log/actions.jsonl` differs from HEAD.

## Verdict

**READY** — no blocking or major finding: the harness matches the accepted spec and the human decisions, the fail-closed path holds for `next` 16.3.8 as far as reading can show, and the records agree with each other, the reflog and the agent log. One minor finding and six notes are for the human to dispose of.

## Findings

### BE-R01-1 — minor — two spec scenarios have no executed verification

- **Requirement:** `browser-flow-verification`, "The run starts its own server" (scenario "Port is in use") and "Record of the Crossref boundary" (scenario "Contact address is configured").
- **Area:** all 17 `evidence/runs/*_e2e-*.log`; `playwright.config.ts:42`; `e2e/support/crossref-stub.mjs:28-31`.
- **Verified:** no record runs with port 3100 taken or with `CROSSREF_CONTACT_EMAIL` set, and no test covers either. No `.env*` file exists, no server banner in the records shows an `Environments:` line, and `docs/session-notes.md:280` says the variable was never set in a live run.
- **Verified by reading:** both hold by construction. Playwright 1.63.0 throws "is already used" when the URL already answers and `reuseExistingServer` is false (`playwright/lib/runner/index.js:859-866`). The stub writes only `event`, `method` and `url`, and the product puts the address in the `User-Agent` header, never in the URL (`lib/metadata/crossref/lookup-work.ts:21-36`).
- **Inference:** nothing would fail if either stopped holding. Playwright tests whether the URL answers, not whether the port is bound; I did not trace a listener that does not answer HTTP.

### BE-R01-2 — note — the `AGENTS.md` rule states the guarantee without its bound

- **Requirement:** "Fail-closed claim is tied to the verified Next.js version" (HD-E20), against HD-E9, HD-E18 and HD-E22.
- **Area:** `AGENTS.md:79`; also the spec Purpose (`spec.md:7`, "can never be reached live"), `playwright.config.ts:6`, `e2e/primary-flow.e2e.ts:5`.
- **Verified:** the rule equals the planned wording of `design.md:434-438` character for character, and HD-E22 approved adding it "exactly as planned". It was added after the mechanism ran: `AGENTS.md` is absent from the git status of `…145932Z_e2e-repeat.log` and present in `…150153Z_e2e-untouched.log`.
- **Verified:** "It never contacts live Crossref" names no Next.js version, and `AGENTS.md` does not carry the upgrade re-check. Both stand in the spec, in `design.md:295-313` and in `docs/session-notes.md:103-109`.
- **Inference:** this is not a deviation by the maker. Two accepted artifacts pull in different directions; whether the durable rule needs the bound is the human's call.

### BE-R01-3 — note — "no wrapper process" and "nothing inherited from the environment" are not literally true

- **Requirement:** "Recorded answers live in the serving process only" (HD-E13); design TD-E4.
- **Area:** `playwright.config.ts:36-38`; `design.md:131-134`; `spec.md:78-80`.
- **Verified:** Playwright 1.63.0 launches the `webServer` command with `shell: true` and `env: { ...DEFAULT_ENVIRONMENT_VARIABLES, ...process.env, ...options.env }` (`runner/index.js:870-879`). A shell is the direct child and Node is its child. The server inherits the whole environment of the invoking shell, including any `NODE_OPTIONS` and `CROSSREF_CONTACT_EMAIL`.
- **Verified:** the substance of HD-E13 holds. `--import` is an option of the Node process itself. `next start` calls `startServer` in that process (`next/dist/cli/next-start.js:102`), and `start-server.js` uses `child_process` only to `exec` `lsof` or `netstat`. Every run asserts exactly one `installed` line.
- **Inference:** I found no fail-open path from the shell or from an inherited variable. A shell cannot take a Node preload, and inherited options add to the command-line `--import` rather than replace it. The wording overstates; the mechanism does not depend on it.

### BE-R01-4 — note — a pre-set `E2E_CROSSREF_RECORD` is kept

- **Requirement:** "Record of the Crossref boundary": "a file outside the repository that is new for each run" (HD-E12).
- **Area:** `playwright.config.ts:13-17`.
- **Inference from the code:** `??=` keeps a value already present in the invoking environment. The workers need that, and the runner cannot tell it apart from a value set in the user's shell. With `E2E_CROSSREF_RECORD=<path>` exported before `pnpm e2e`, that file is appended to: it is not new per run, and it is inside the repository if the path says so. A reused file fails the canary (`installed` count is not 1), so the case fails closed. No record exercises it.

### BE-R01-5 — note — "found during implementation" has no recorded basis

- **Criterion:** HD-E8, HD-E17; `AGENTS.md`, "Never manufacture failures, findings or human interventions for evidence".
- **Area:** `design.md:502-507` against `design.md:541-559`.
- **Verified:** the risk entry says the hydration race was "Found during implementation". The Verification history says every run was GREEN on its first run and "No run of `pnpm e2e` was made outside the records". The agent log agrees with the history: `e2e/primary-flow.e2e.ts` was first written at 14:58:10Z, `e2e-harness` started at 14:58:16Z and passed, and no other browser run of session `3c60cf2b` appears (`.agent-log/actions.jsonl:3053-3124`).
- **Inference:** no record shows the race being observed. Either it was reasoned, and "found" overstates, or it was seen in a run that left no trace. I cannot tell which; the `cmd` fields of the log are cut at 200 characters. No RED was fabricated in the records either way.

### BE-R01-6 — note — the handoff and the Verification history are behind HEAD

- **Requirement:** tasks 3.5 and 4.7; "What the verification proves is stated".
- **Area:** `docs/session-notes.md:3-27, 66, 110-124, 267, 302-323`; `design.md:516-521, 574-575`; `tasks.md:35`.
- **Verified:** at HEAD the handoff still says that HEAD is `1d7976d`, the change is uncommitted, 22 of 24 tasks are done, there are eleven records and task 4.5 is open. The Verification history stops at `e2e-repeat` and says the tree was not clean. The six records at `7d82901` are named only in `tasks.md` 4.5, which still calls them uncommitted.
- **Verified:** task 4.7 discloses this ("it is to be brought up to date when they close"). The statements the spec requires, the Next.js version and the date of the provider answers, are present.

### BE-R01-7 — note — the "stub is active" precondition lives only in the canary

- **Requirement:** "Unrecorded Crossref requests fail closed" (scenario "Recorded answers are checked before any DOI is submitted"); design TD-E8.
- **Area:** `e2e/primary-flow.e2e.ts:17, 116-119, 133-134`.
- **Verified:** only the first test asserts the `installed` line. The order comes from declaration order and serial mode.
- **Inference (not run):** a filtered run such as `pnpm e2e -g "primary flow"` submits two DOIs without that check. On `next` 16.3.8 this cannot reach Crossref, because the server cannot start without the stub. In the case HD-E20 excludes, the flow would fail on its `served` assertion only after both requests.

## Checked without findings

1. **Scope and isolation. Verified:** `…151224Z_e2e-final-untouched.log` and `…151225Z_e2e-final-tooling-untouched.log`, at `7d82901` on a clean tree, show no difference from `1d7976d` under `app/`, `lib/`, `next.config.ts`, `tests/`, `docs/dstu/`, `docs/intent.md`, `README.md`, `openspec/specs/`, `openspec/changes/archive/`, the three live-check records, `vitest.config.mts`, `eslint.config.mjs`, `tsconfig.json`, `pnpm-workspace.yaml`, `.github/`, `.claude/` and `scripts/`. The `package.json` diff is two added lines. `.github/workflows/ci.yml` runs `pnpm check` only. `…151157Z_e2e-final-check.log` shows 18 files, 688 tests and no browser.
2. **Playwright setup. Verified:** `@playwright/test` is exactly `1.63.0` (`package.json:26`). `playwright.config.ts` has one `chromium` project with no `channel`, `workers: 1`, `retries: 0`, `forbidOnly` and `reuseExistingServer: false`. The `e2e` script builds first, and every record shows the build output before the first `[WebServer]` line.
3. **Launch. Verified:** `./node_modules/next/dist/bin/next` is the `bin` of `next` 16.3.8 (`node_modules/next/package.json:80-82`), and `start` runs in-process. For the wording see BE-R01-3.
4. **Fail-closed boundary. Verified by reading the stub:** it matches `crossref.org` and its subdomains; it answers only a `GET` of an exact URL built from `provenance.json`; otherwise it throws before any call of the original `fetch`. The body is the bytes of the recorded file, with the recorded status and content type. It throws at load without `E2E_CROSSREF_RECORD` or `provenance.json`. The product's URL is the constant `https://api.crossref.org/works/` plus `encodeURIComponent(doi)` (`lookup-work.ts:14, 21`), which the stub's key reproduces. `…145753Z_e2e-preload-required.log` shows both refusals: exit 1, nothing listening. The canary requires exactly one `installed` line in a per-run file before it submits, then row 13 on the page and exactly one `refused` line. The stub writes synchronously before it rejects, so reading the record after the message is not a race. **Inference:** on `next` 16.3.8 no Crossref request can leave the server through this path.
5. **Request record. Verified:** the path is under `os.tmpdir()`; the fields are `event`, `method` and `url`; the stub reads no header, no other environment variable and no body. The duplicate step asserts the record unchanged, and the flow asserts it again at its end. The page refuses the duplicate before it calls the resolver (`app/_components/workspace.tsx:144-147`). The design and the handoff call the file instrumentation, and none is in the repository.
6. **Expectations. Verified:** R1, R2, R4, K1 and K2 in the test equal the rows of `design.md:346-358`. I checked this with a code-point search: U+0422, U+2116, U+0421 and U+2014 are present, with no Latin look-alike and no carriage return. The inputs, messages and URLs of E1 to E6 match. The test imports `node:fs`, `@playwright/test` and the approved-copy fixture only, and uses `UI.*` for labels and messages only. R1 and R2 agree segment by segment with the approved Publications (`expected.ts:13-62`) and with GF01 to GF03. `Douglas B.` meets O18 (`docs/dstu/rules.md:648`) and the accepted requirement "Full stop after the heading" (`openspec/specs/dstu-journal-formatting/spec.md:394-401`). The oracles are unchanged.
7. **Primary flow. Verified:** every step of the table (C1, P0 to P8, F1) is driven and asserted. `shownEntries` compares every `<p>` line of each entry, so a warning or a gaps line would fail it. The original `PLoS ONE` is asserted before the correction.
8. **Clipboard. Verified:** an init script wraps `writeText`. The assertions are `toEqual([K1])` and then `toEqual([K1, K2])` on the captured arguments. K2 holds one `\n` and none at its end. Only `clipboard-write` is granted, and nothing reads the clipboard (`…151226Z_e2e-final-boundaries.log`, part d).
9. **First run and repeat. Verified:** `e2e-harness` and `e2e-first-run` were GREEN on their first run and are reported so. `e2e-repeat` lists 15 `ok` lines with differing durations, five worker process ids, and 1 `installed`, 15 `served` and 5 `refused` server lines. The agent log shows each command with a matching duration (8.8 s and 15.5 s). The reflog commit times (`1d7976d` 14:52:29Z, `7d82901` 15:11:05Z, `a6c46f8` 15:13:53Z) fit the record headers.
10. **Hydration wait. Verified:** `react-dom` 19.2.8 names the key `"__reactProps$" + randomKey` (`react-dom-client.production.js:845`). **Inference:** this is a documented harness risk, not a concrete reliability defect. The key appears only once React is running with its root listeners attached. If the name changed, the wait would time out and fail the run. A native submission would reload the page and fail the next assertion. Neither can pass a test. The 21 test executions in the records ran without retries and without a flake. For the provenance of the risk entry see BE-R01-5.
11. **Dependencies. Verified at HEAD:** `next` is 16.3.8 in `package.json`, the lockfile and `node_modules`. The lockfile holds `@playwright/test`, `playwright` and `playwright-core` at 1.63.0, and lists `@playwright/test` as a resolved optional peer of `next`. **Inference:** no runtime effect; `next` requires it only under `dist/experimental/testmode/playwright/`.
12. **`AGENTS.md`.** See BE-R01-2.
13. **Evidence. Verified:** each record header names the commit and tree it ran on. The eleven early records stand beside the six at `7d82901`. The throwaway check scripts print their source. No record or document claims anything about live Crossref.
14. **Upgrade limit. Verified:** stated as a requirement in the spec, in `design.md:295-313` and in `docs/session-notes.md:103-109`.

## Checks not performed

- I ran no command: not `pnpm e2e`, `pnpm check`, `pnpm spec:check` or git. I could not diff HEAD against `1d7976d` or `7d82901`. "Untouched" rests on the records and, between `7d82901` and `a6c46f8`, on the agent log, which shows only `tasks.md` edited.
- The lockfile diff. No record shows it; the note of task 2.1 is narrative.
- Nobody exercised these: port taken, contact address set, pre-set record variable, filtered run, offline run. On the last, `app/layout.tsx` uses `next/font/google`, so the build stage may need the network, while `design.md:40` says "no dependency on the network". I did not check font caching.
- The temporary record files, which Chromium binary ran, and the environment of the maker's shell.
- `isURLAvailable` and how Windows binds an occupied port, for BE-R01-1.
- The repository's logging hook appended this session's tool events to `.agent-log/actions.jsonl`. I wrote only this report.

## Oracle doubts for the human

None. The application of O18 to `Douglas B.` was settled by HD-E11 and agrees with the wording of O18 and of the accepted requirement; I do not reopen it.

Every finding's disposition belongs to the human.

---

## Human dispositions

This section was added by the maker session on 2026-10-06, after the human
gave the dispositions that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

| Finding | Disposition | Decision |
|---|---|---|
| BE-R01-1 | **ACCEPT** | Execute and record the two accepted scenarios that have not yet been exercised. **A. Port already in use:** occupy port 3100 with a local HTTP server that answers requests; attempt to start the Playwright E2E `webServer` with `reuseExistingServer: false`; verify that it refuses to reuse the occupied port or start over it and that the E2E run does not proceed as though it owned the server; classify this as expected harness verification, not a product RED. **B. `CROSSREF_CONTACT_EMAIL` configured:** use a harmless synthetic value such as `e2e@example.invalid`; run the deterministic E2E path; keep live Crossref unreachable through the stub; verify that the run still passes and that the request-record instrumentation contains only the approved event, method and URL information and does not contain the contact email, headers or other unnecessary data. Do not create or modify any `.env` file. |
| BE-R01-2 | **ACCEPT AS DOCUMENTATION CLARIFICATION** | Revise the durable wording so that the fail-closed guarantee is explicitly bounded to the currently pinned Next.js 16.3.8 and the verified `next start` process model. A future Next.js upgrade requires re-verifying server, preload and canary behaviour. Update `AGENTS.md` accordingly. Also revise any absolute wording in the browser-e2e spec Purpose, such as "can never be reached live", so that it carries the same version and process-model boundary. This is a clarification of HD-E20, not new behaviour. |
| BE-R01-3 | **ACCEPT AS DOCUMENTATION CORRECTION ONLY** | Do not change the server launch mechanism. Correct statements such as "no wrapper process" and "nothing inherited from the environment" so that they describe reality accurately: Playwright launches the configured command through its shell mechanism; that shell launches the explicit Node command; `--import` belongs to the Node process that runs Next; the process inherits the invoking environment; the fail-closed property does not depend on claiming otherwise. Do not weaken the actual fail-closed requirement. |
| BE-R01-4 | **ACCEPT** | Harden the allocation of `E2E_CROSSREF_RECORD`. Each `pnpm e2e` run SHALL create and use its own fresh record path under the system temporary directory. Do not preserve or reuse a caller-provided `E2E_CROSSREF_RECORD` value. The generated path must still be shared correctly with the Playwright runner and workers and with the E2E-started Next server. Add focused verification that starts with a pre-set `E2E_CROSSREF_RECORD` and proves that the harness overrides it with a new temp record rather than appending to the caller-provided file. Do not write request records inside the repository. |
| BE-R01-5 | **ACCEPT AS EVIDENCE WORDING CORRECTION** | There is no recorded run showing the hydration race being observed. Replace wording such as "Found during implementation" with wording that accurately describes it as a risk identified through implementation and harness reasoning. Do not invent or reconstruct a historical failure. |
| BE-R01-6 | **ACCEPT AS PROCESS WORK** | Update the Verification history of `design.md` now so that it includes the committed E2E implementation state, the final clean-tree `pnpm e2e`, `pnpm check`, `pnpm spec:check`, and the boundary and tooling evidence. Do not update `docs/session-notes.md` yet; that remains task 4.7 after the independent review is complete. |
| BE-R01-7 | **ACCEPT** | Strengthen the stub-active precondition. Every browser test that can submit a DOI SHALL verify, before its first DOI submission, that the request record proves the stub is installed exactly once. Do not rely only on declaration order or on the canary test having run first. A filtered Playwright invocation, such as a primary-flow-only run, must therefore still verify the stub-active precondition before submitting a DOI. Keep the canary itself. |

Additional wording clarification from the human: do not claim that the whole
`pnpm e2e` pipeline has no network dependency unless that has actually been
proven. The required claim is that deterministic provider behaviour has no
dependency on live Crossref, and that all Crossref requests in the
E2E-started server are recorded responses or fail closed under the verified
pinned Next.js process model. The build may have unrelated environmental or
network requirements; the Crossref guarantee is not silently broadened into
a fully-offline-build guarantee.

Boundaries set by the human for the follow-up: no modification of production
`app/` or `lib/` code, of archived slice semantics, of
`docs/dstu/rules.md` or `tests/golden/`; no change to R1, R2, R4 or the
approved expectation table; no other dependency; no change to CI;
`pnpm check` stays separate from `pnpm e2e`.

The follow-up is tracked as task group 5 of the change, and what was run for
it is in the Verification history of
`openspec/changes/browser-e2e/design.md`. These dispositions do not close
the independent review: task 4.6 is left open for the human.
