# Proposal

## Why

The Definition of Done of `docs/intent.md` asks that "the primary browser flow
has deterministic E2E verification". It is the one open item of that list that
concerns verification: the three feature slices are implemented, reviewed and
archived, and browser E2E was deferred as a separate later change by decision
HD-4 of the `bibliography-workspace` change. Today the primary flow has no
automated browser evidence. The component tests run in jsdom with a fake
resolver and a stubbed clipboard, and the one live browser check depends on
live Crossref and cannot be repeated.

## What Changes

- Add a browser test tool, `@playwright/test`, as one devDependency, and the
  Chromium binary it manages, installed outside the repository with
  `pnpm exec playwright install chromium`. Chromium only.
- Add a dedicated script, `pnpm e2e`, that makes the ordinary production
  build and runs the browser tests against the application started from it.
  `pnpm check` is not changed and starts no browser.
- Make Crossref deterministic for that run only: the browser test tool
  starts the Next.js production server as one Node process, with a stub
  preloaded into that process by an option of its own. The stub answers the requests of the existing
  resolver from the recorded, unmodified Crossref answers under
  `lib/metadata/crossref/__fixtures__/`. A request with no recorded answer
  is refused and does not reach live Crossref; if the stub cannot load, the
  server does not start. A canary and a temporary record of the requests
  prove it. This fail-closed property is claimed for the pinned version of
  Next.js it is verified against, not for every future version.
- Add browser tests of the accepted primary flow: add a recorded DOI, add a
  second one in another accepted input form, refuse a duplicate, correct a
  metadata value and see the reference recomputed, reorder, copy one
  reference, copy the whole list in the order of the list, remove an entry;
  one recorded `not-found` failure; the canary.
- Expected reference texts are literals written from the expectation table
  in `design.md`, derived by hand from the approved profile and the approved
  expected Publications and approved by the human on 2026-10-06. No test
  computes an expected value by calling the formatter, and no second golden
  oracle is created.
- Once the mechanism exists and has been demonstrated, add one verification
  rule for `pnpm e2e` to `AGENTS.md`, and update the handoff in
  `docs/session-notes.md`.

The human decided the tool and the deterministic strategy on 2026-10-06,
before this proposal was written, and set the limits of the change. Those ten
decisions are recorded as HD-E1 to HD-E10 in `design.md`:

- HD-E1: `@playwright/test`, Chromium only, the binary managed by Playwright;
  no Cypress, MSW, other browser framework or runtime dependency;
- HD-E2: a dedicated `pnpm e2e`, separate from `pnpm check`; CI is not
  modified in this change;
- HD-E3: the E2E-only preloaded Crossref stub, with its ten requirements;
- HD-E4: the verification proves behaviour against recorded provider
  answers, not the current state of live Crossref, and says so;
- HD-E5: expected output is independent of the formatter and rests on the
  approved profile and oracle; the expectation table is reviewed before
  implementation; no second golden oracle;
- HD-E6: the coverage of the primary flow, kept focused;
- HD-E7: clipboard assertions are made on the value passed to
  `navigator.clipboard.writeText`, under the approved line-feed contract;
- HD-E8: no behavioural RED is manufactured;
- HD-E9: one concise rule in `AGENTS.md`, only once the mechanism exists;
- HD-E10: the README and product documentation stay outside; the three
  archived slices are not reopened.

After reviewing the plan the human gave eight final decisions on the same
day, recorded as HD-E11 to HD-E18:

- HD-E11: the expectation table is approved, with its three reference texts
  and the application of the existing rule O18 to the heading of E2;
- HD-E12: the request record is approved within a boundary: unique per run,
  outside the repository, method and URL only, temporary instrumentation and
  not evidence by itself;
- HD-E13: the server under test is the Next.js production server started
  directly as a Node process with the preload, not `pnpm start` with
  `NODE_OPTIONS`; this supersedes items 3 and 4 of HD-E3;
- HD-E14: the browser tests may read the approved Ukrainian copy fixture,
  for UI copy only;
- HD-E15: the correction of the flow is the journal title `PLoS ONE` set to
  `PLOS ONE`;
- HD-E16: the Playwright setup: an exact devDependency, Chromium managed by
  Playwright, one worker, no retries;
- HD-E17: a failing run is classified as infrastructure, a defect of the
  test, or product behaviour that differs from an approved expectation; the
  last kind stops the work for the human's disposition;
- HD-E18: the `AGENTS.md` rule is added just in time, only after the
  mechanism exists and has been demonstrated.

On 2026-10-06 the human approved the change as designed and disposed of the
remaining points, recorded as HD-E19 to HD-E23:

- HD-E19: the change is approved as designed;
- HD-E20: the fail-closed guarantee is accepted for the currently pinned
  Next.js version and the verified process model of `next start`; no
  unconditional guarantee is stated for future versions, and a Next.js
  upgrade requires the server, preload and canary verification to be run
  again before the claim is carried forward. A documented limitation of the
  harness, not a blocker for the MVP;
- HD-E21: the verification that the server refuses to start with a broken
  preload stays, recorded as expected harness behaviour and not as a product
  RED;
- HD-E22: the `AGENTS.md` rule is not added during planning; it is added in
  the planned wording after `pnpm e2e` has been demonstrated, and shown to
  the human first only if the wording materially differs;
- HD-E23: the expectation table, the request record, the correction and the
  scope are confirmed as recorded in HD-E11, HD-E12, HD-E14, HD-E15, HD-E16
  and HD-E10.

Feature review 01 gave the verdict READY with seven findings, one minor and
six notes. The human accepted all seven on 2026-10-06; the dispositions are
recorded in `design.md` and below the review report. They led to two
hardenings of the harness (a record file that each run allocates for itself,
and a check in every test that the stub is active), to executed checks of two
scenarios that had only been read, and to corrections of wording. No product
code, no expectation and no oracle changed.

Not in this change: the README and the final product documentation; any
change to CI; any change to product code, to `next.config.ts` or to the
semantics of DOI resolution; any change to `docs/dstu/rules.md`, to
`tests/golden/` or to an archived change; a test against live Crossref;
other browsers; a browser rewrite of the component tests; visual or
accessibility audits.

No normative DSTU decision is made here. The expected reference texts apply
rows of the profile that are already approved, and the provisional rows they
depend on stay provisional.

## Capabilities

### New Capabilities

- `browser-flow-verification`: the deterministic verification of the primary
  flow in a browser: the command that runs it, the application it drives,
  how Crossref is answered from recorded responses and fails closed, what the
  flow covers, how copying is asserted, where expected values come from, and
  what the verification does and does not prove.

### Modified Capabilities

None. `doi-normalization`, `doi-resolution`, `publication-model`,
`dstu-journal-formatting`, `bibliography-workspace`, `metadata-correction`
and `bibliography-copy` keep their requirements. The browser tests observe
them and change none.

## Impact

- **Dependencies**: one new devDependency, `@playwright/test`, pinned to an
  exact version; `pnpm-lock.yaml` follows. The Chromium binary is downloaded
  by Playwright to its own cache outside the repository and is not committed.
- **Files, new**: `playwright.config.ts`; `e2e/primary-flow.e2e.ts`;
  `e2e/support/crossref-stub.mjs`.
- **Files, changed**: `package.json` (the devDependency and the `e2e`
  script; the `check` script is untouched); `.gitignore` (the output folders
  of Playwright); `AGENTS.md` (one rule, after the mechanism exists);
  `docs/session-notes.md` (handoff).
- **Product code**: none. Nothing under `app/` or `lib/` and not
  `next.config.ts` changes. The recorded Crossref answers and the approved
  copy fixture are read, never written. The `start` script is unchanged and
  is not what the browser tests launch.
- **Tooling left as it is**: `vitest.config.mts`, `eslint.config.mjs`,
  `tsconfig.json`, `pnpm-workspace.yaml`, `.github/workflows/ci.yml`,
  `.claude/`, `scripts/`. The browser test files are named `*.e2e.ts`, which
  the default include of Vitest does not match; the existing typecheck and
  lint cover them as they stand.
- **Oracles**: `docs/dstu/rules.md` and `tests/golden/` are read as the basis
  of the expectation table and are not edited.
- **Evidence**: runs are recorded with `scripts/record-run.sh` under labels
  that begin `e2e-`. The three records of the live browser check stay as they
  are and remain the only evidence against live Crossref.
- **Definition of Done**: closes "the primary browser flow has deterministic
  E2E verification" once the runs are recorded and reviewed. The README item
  and the final acceptance stay open.
