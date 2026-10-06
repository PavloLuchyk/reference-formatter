# Review: browser-e2e (review 02)

- Reviewed HEAD: `c7317980ce860cf243a2fa1a358e9154bce3c0eb` (`master`; read from `.git/HEAD` and `.git/refs/heads/master`). The hardening is commit `a268ad4`; `c731798` adds the three clean-tree records and the closing note of task 5.14.
- Checker: `feature-reviewer`
- Mode: fresh session, read-only apart from this report. No command was run.
- Date: 2026-10-06
- Follow-up to: `evidence/reviews/browser-e2e-review-01.md` (review 01 at `a6c46f8`, seven findings, all accepted by the human).
- Working tree: per the caller's status snapshot, only `.agent-log/actions.jsonl` differs from HEAD.

## Verdict

**READY** — all seven review-01 dispositions are implemented and evidenced, the clean-tree records at `a268ad4` are GREEN, and no blocking, major or minor finding remains; one documentation note (BE-R02-1) is left for the human.

Because one note remains, this report does not say "Findings: none". Nothing found blocks completing the review; that decision and the disposition of the note are the human's.

## Findings

### BE-R02-1 — note — the Verification history says no run on the committed follow-up exists, and three do

- **Requirement / decision:** task 5.14; the disposition of BE-R01-6 (the Verification history reflects the committed state and its clean-tree verification); `AGENTS.md`, evidence describes actual repository states.
- **Area:** `openspec/changes/browser-e2e/design.md:598-602` and `:740-744`; `openspec/changes/browser-e2e/tasks.md:54`; the three records `…163716Z_e2e-review01-final-green.log`, `…163724Z_e2e-review01-final-check.log`, `…163736Z_e2e-review01-final-spec-check.log`.
- **Verified:** at HEAD `design.md:742-744` reads "The runs of the follow-up to review 01 were made at `a6c46f8` with the follow-up uncommitted; no run on the committed follow-up exists yet (task 5.14)", and `:598-602` lists three groups of runs, the last being "at `a6c46f8` with the follow-up uncommitted". At the same HEAD three records name `a268ad4` with a clean tree, and `tasks.md:54` closes task 5.14 on them. The history names none of the three.
- **Inference:** the sentence was true when written. `design.md` is part of `a268ad4`, and the runs could only follow that commit. The agent log shows one edit between the final runs and `c731798`, to `tasks.md` (`.agent-log/actions.jsonl:3363`). The sentence points to task 5.14, where the records are named, so a reader can find them.
- **Reasoning:** this is the same class as BE-R01-6. No task is unmet as written: 5.13 was done before the commit and 5.14 does not ask for an update of the design. The effect is one sentence that is false at HEAD and would be archived as it stands.

## Review-01 dispositions

### BE-R01-1 — implemented and evidenced

- **A, port in use. Verified:** `…162848Z_e2e-review01-port-in-use.log`. A local HTTP server answered on port 3100. `pnpm e2e` exited 1 after the build with "http://localhost:3100 is already used" (line 208). No "Running N tests" line and no `[crossref-stub]` line appear. The occupying server saw `["GET /"]` and no `POST`. The record is GREEN because the check passed, and it calls the refusal expected harness behaviour, not a product RED (line 222). This matches Playwright 1.63.0, `runner/index.js:859-865`.
- **B, contact address. Verified:** `…162859Z_e2e-review01-contact-email.log`. `CROSSREF_CONTACT_EMAIL=e2e@example.invalid` was in the environment of the run. Three tests passed. The record of the boundary used the fields `["event","method","url"]` with 1 `installed`, 3 `served` and 1 `refused` line. The address was in neither the record nor the output. No `.env*` file exists at HEAD.
- **Verified by reading:** the stub writes only the entry it is given (`e2e/support/crossref-stub.mjs:28-31`) and reads only the URL and the method (`:38-42`). The product puts the address in the `User-Agent` header only (`lib/metadata/crossref/lookup-work.ts:24-35`).
- **Inference:** the address reached the server process, since Playwright passes `process.env` on (`runner/index.js:872-876`) and `app/actions.ts:13` reads it per call. The record cannot show this, and `design.md:745-747` says so.

### BE-R01-2 — implemented

- **Verified:** `AGENTS.md:76-84` bounds the property to "the pinned Next.js 16.3.8 and its `next start` process model" and requires the server start, the preload refusals and the canary again after an upgrade. It equals the revised wording in `design.md:503-511`. The spec Purpose (`spec.md:5-10`) no longer says "can never be reached live". The same bound stands in `playwright.config.ts:6-9`, `e2e/primary-flow.e2e.ts:4-7`, `proposal.md:28-30` and `design.md:352-370`.
- **Verified:** no broader claim remains in the harness, proposal or spec. The absolute sentences left are a SHALL requirement (`spec.md:109-113`), bounded by the requirement at `spec.md:132-145`, and the stub's description of its own branches (`crossref-stub.mjs:5-7`).

### BE-R01-3 — implemented, nothing weakened

- **Verified:** the documents now say that Playwright hands the command to a shell, that the shell starts Node, that `--import` belongs to that Node process and that the process inherits the caller's environment: `playwright.config.ts:44-48`, `design.md:165-177`, `:302`, `:328-335`, and the scenario at `spec.md:92-94`. This agrees with Playwright 1.63.0: `shell: true` and `env: { ...DEFAULT_ENVIRONMENT_VARIABLES, ...process.env, ...this._options.env }` (`runner/index.js:870-879`).
- **Verified:** the command still carries the preload (`playwright.config.ts:49`; `…163250Z_e2e-review01-boundaries.log`, parts e and g). The requirement keeps "by no other process", the failure to start and both refusal scenarios (`spec.md:80-102`).

### BE-R01-4 — implemented and evidenced

- **Verified:** `playwright.config.ts:18-25`. A process that finds no owner mark equal to its own pid or its parent's pid creates a new folder with `mkdtempSync` under `os.tmpdir()`, overwrites `E2E_CROSSREF_RECORD` and sets the mark to its pid. The server receives the path through `webServer.env` (`:55`), which overrides an inherited value. Workers are forked directly by the runner with its environment (`runner/index.js:1915-1923`), so their parent pid is the mark.
- **Verified:** `…162906Z_e2e-review01-preset-record.log`. The caller set `E2E_CROSSREF_RECORD` to a file with one sentinel line, and a stale owner value. The sha256 of that file was equal before and after. Exactly one new folder appeared under the temporary folder and held the 1/3/1 lines of the run. Three tests passed.
- **Inference:** the check is genuine. A server writing to the caller's file would change the hash. A worker reading the caller's file would find no `installed` line and fail. A worker allocating for itself would create a second folder and fail on a missing file.
- **Inference:** two bounds, neither a finding. A caller value would be kept only if the caller also set the internal mark to the pid of the runner or of its parent, which cannot happen by leaving a variable set. The case "variable set, mark unset" was not run on its own; it takes the same branch as the recorded case.

### BE-R01-5 — implemented

- **Verified:** `design.md:578-586` describes "a risk identified by reasoning about the harness while it was written" and says "No run showed this happening". No document describes an observed hydration failure. The test comment states the reasoning only (`e2e/primary-flow.e2e.ts:74-75`).

### BE-R01-6 — implemented as disposed; one lag reported above

- **Verified:** `design.md:634-656` now holds the integration checks, the commit `7d82901`, the six clean-tree records of task 4.5 and review 01. `:658-716` holds the follow-up, including the RED record. `docs/session-notes.md` is still in its earlier state (`:3-27`, `:66`, `:110-124`); by the disposition and by `tasks.md:37` this is pending for the handoff task and is not a finding. For the three records the history does not yet name, see BE-R02-1.

### BE-R01-7 — implemented and evidenced

- **Verified:** a `beforeEach` hook requires exactly one `installed` line (`e2e/primary-flow.e2e.ts:39-43`). All three tests submit a DOI only in their bodies, after the hook (`:127`, `:142`, `:210`).
- **Verified:** `…162940Z_e2e-review01-filtered-run-2.log`: "Running 1 test", the canary absent, the precondition step printed before the first `served` line, the record holding 1 `installed` and 2 `served` lines.
- **Verified:** the canary is intact (`:127-138`): the message of row 13, the empty list and exactly one `refused` line. The hook runs before it too (`…162914Z_e2e-review01-filtered-run.log:222`).

## Checked without findings

1. **Expectations unchanged. Verified by code-point search:** R1, R2, R4, K1 and K2 in the test equal the rows of `design.md:403-415`, with U+0422, U+2116, U+0421 and U+2014, no Latin look-alike and no carriage return; K2 holds one `\n` and none at its end. R1 and R2 also equal the lines of `…110108Z_workspace-manual-browser-check-repeat.log`. The inputs of E1 to E6 and the messages of rows 11, 13, 16 and 41 match the table and the approved copy fixture. **Inference:** the table itself did not change in `a268ad4`; I could not diff it.
2. **Product code. Verified:** `…163248Z_e2e-review01-untouched.log` shows no difference from `1d7976d` under `app/`, `lib/`, `next.config.ts`, `tests/`, `docs/dstu/`, `docs/intent.md`, `README.md`, `openspec/specs/` and `openspec/changes/archive/`, with the follow-up in the tree. No git status in any follow-up record lists a path under `app/` or `lib/`. Nothing under `app/` or `lib/` names the stub, `e2e/` or Playwright at HEAD. **Inference:** the same holds for `a268ad4` and HEAD; see "Checks not performed".
3. **Oracles, archive, CI, tooling. Verified:** the same record, and `…163249Z_e2e-review01-tooling-untouched.log` for `.github/`, `.claude/`, `scripts/` and the test configurations; the `package.json` diff is still two added lines. `.github/workflows/ci.yml` runs `pnpm check` only. `tests/golden/` holds one file. The three live-check records are unchanged in that record.
4. **No offline claim. Verified:** the goal is "no dependency on live Crossref" (`design.md:39-41`); a network-free pipeline is a stated non-goal (`:56-57`); `:116-123` and `:529-532` say the build was not examined and name `next/font/google`, which `app/layout.tsx:2` imports. `AGENTS.md` makes no offline claim.
5. **The RED record. Verified:** `…162914Z_e2e-review01-filtered-run.log` is RED with exit 1 of the check. `--grep=primary` selected all three tests; all three passed; `pnpm e2e` exited 0; three expectations of the check about a single test failed. `design.md:690-700` and `tasks.md:47` describe it as a defect of the check script, followed by the GREEN run with `--grep=reorder`. Neither presents it as a product RED.
6. **Final clean-tree records. Verified:** each names `a268ad48…`, "tree: clean (excluding .agent-log/ and evidence/)", exit 0 and GREEN. `pnpm e2e`: the build before the server, Next.js 16.3.8, 3 passed, 1 `installed`, 3 `served`, 1 `refused`. `pnpm check`: typecheck, lint, 18 files and 688 tests, production build. `pnpm spec:check`: 8 passed, `change/browser-e2e` valid. The reflog puts `a268ad4` at 16:36:56Z and the records at 16:37:16Z to 16:37:38Z.
7. **Task 5.14. Verified:** complete and evidenced by those three records; its note matches them and says the five-times repeat was not run again.
8. **Hardening, other effects. Verified:** `retries: 0`, `workers: 1`, `forbidOnly` and `reuseExistingServer: false` stand; no `skip`, `only`, `fixme` or added timeout in `e2e/` or the config; `@playwright/test` is still exactly `1.63.0`, and no follow-up git status lists `package.json` or the lockfile. The stub is not in any follow-up git status. The repeat run passed 15 of 15 with 1/15/5 stub lines. **Inference:** no spec scenario was removed; the ones review 01 cited are present and three were added.
9. **Evidence integrity. Verified:** the record headers, the reflog and the agent log agree on commits and times. Each throwaway check prints its source. **Inference:** no `pnpm e2e` ran outside the records in the follow-up; the logged command durations fit the records.

## Checks not performed

- I ran no command: no `pnpm e2e`, `pnpm check`, `pnpm spec:check` or git. I could not diff `a6c46f8`, `a268ad4` and HEAD.
- No record repeats the searches of tasks 4.1 to 4.3 on `a268ad4` or on HEAD; task 5.14 does not ask for them. "Untouched" at those commits rests on the record made with the follow-up uncommitted, on the clean-tree headers and on the agent log. That log cuts commands at 200 characters, and several edits were made through scripts, so it cannot list every edited file.
- No run exists at HEAD `c731798` itself. By the agent log it differs from `a268ad4` in `tasks.md`, the evidence and the log only.
- The sha256 that task 5.1 gives for the body of review 01. By reading, the dispositions stand below a separator and the body above it is whole.
- The temporary record files, and the throwaway scripts other than as printed in the records.
- Not exercised by anyone: a port held by a listener that does not answer HTTP; `E2E_CROSSREF_RECORD` pre-set without the owner variable; a run without network; another version of Next.js.
- The repository's logging hook appended this session's tool events to `.agent-log/actions.jsonl`. I wrote only this report.

## Oracle doubts for the human

None.

Every finding's disposition belongs to the human.

---

## Human dispositions

This section was added by the maker session on 2026-10-06, after the human
gave the disposition that day. Everything above the line is the reviewer's
report and was not changed. The reviewer proposed none of these decisions.

| Finding | Disposition | Decision |
|---|---|---|
| BE-R02-1 | **ACCEPT AS DOCUMENTATION CORRECTION** | Update the Verification history in `openspec/changes/browser-e2e/design.md` so that it no longer says that no run exists on the committed review-01 follow-up. Record the actual final chronology: the review-01 hardening commit `a268ad4`; the clean-tree `pnpm e2e`, `evidence/runs/20261006T163716Z_e2e-review01-final-green.log`; the clean-tree `pnpm check`, `evidence/runs/20261006T163724Z_e2e-review01-final-check.log`; the clean-tree `pnpm spec:check`, `evidence/runs/20261006T163736Z_e2e-review01-final-spec-check.log`; all three GREEN and task 5.14 complete. Do not rewrite historical records or imply that those runs existed before the hardening commit. |

With this disposition the human closed the independent review of the change:
task 4.6 is completed on the basis of review 01, its human dispositions, the
review-01 hardening and its verification records, the committed clean-tree
verification of task 5.14, and the READY verdict of this review. The
correction is tracked as task group 6 of the change.
