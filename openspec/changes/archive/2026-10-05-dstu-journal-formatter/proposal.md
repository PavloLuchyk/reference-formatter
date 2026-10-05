# Proposal

## Why

Reference Formatter can resolve a DOI to a normalized `Publication`, but nothing
turns a `Publication` into a bibliography entry. The DSTU Journal Article
Formatter is the second feature slice in `docs/intent.md`, and its two
preconditions now exist: the profile `docs/dstu/rules.md` is HUMAN-APPROVED FOR
MVP, and the golden oracle `tests/golden/dstu-journal.ts` (GF01–GF08) is
human-approved.

## What Changes

- Add formatting of a `Publication` as a full, primary endnote reference for a
  journal article, in plain text, according to the approved profile.
- Add the formatting outcome: either the formatted text with the warnings the
  profile prescribes, or a cannot-format outcome naming the blocking fields
  (`title`, `journalTitle`, `year`).
- Add three warning kinds as data: subtitle capitalisation, incomplete personal
  name, full-stop collision. Their Ukrainian wording and presentation belong to
  the workspace slice.

Not in this change: the bibliography workspace, any UI, route handler or
server action, manual metadata correction, numbering or ordering of entries,
rich text or italics, any other publication type or citation style, any change
to the `Publication` model, to DOI resolution or to the two existing oracles.

No normative decision is made here. The specs restate decisions of the
approved profile and cite their IDs (D…, O…, R…, N…, P…). Where a requirement
rests on a provisional row of the profile (P21, P22, P23, P25, P26, P43), it
says so; these stay documented limitations and are not resolved in code. The
few points where the agent had to read the profile to state a testable
behaviour are listed as readings in `design.md` for the human's review of this
proposal.

## Capabilities

### New Capabilities

- `dstu-journal-formatting`: turning a normalized journal-article
  `Publication` into a DSTU 8302:2015 reference under the approved profile,
  the cannot-format outcome, and the warnings raised with a formatted
  reference.

### Modified Capabilities

None. `publication-model`, `doi-normalization` and `doi-resolution` keep their
requirements; the formatter only reads a `Publication`.

## Impact

- **Code**: one new pure domain module under `lib/dstu/`, with no dependency
  on React, Next.js, the network or the Crossref provider. No change to
  `app/`, `lib/publication/`, `lib/doi/` or `lib/metadata/`.
- **Dependencies**: none added.
- **Oracles**: `docs/dstu/rules.md` and `tests/golden/dstu-journal.ts` are
  read, never edited. `tests/golden/dstu-journal.ts` remains the sole
  human-approved golden formatter oracle; nothing is added under
  `tests/golden/`.
- **Verification**: new Vitest tests in the `node` environment. A conformance
  test consumes the golden oracle. For approved behaviour that GF01–GF08 do
  not cover, ordinary targeted formatter tests are derived from the accepted
  specs of this change and `docs/dstu/rules.md`; they are verification tests,
  not another independently approved oracle. `pnpm check` stays the gate and
  runs are recorded with `scripts/record-run.sh`. No change to CI, hooks or
  scripts.
- **Later slices**: the workspace consumes the outcome, shows the warnings and
  the blocking fields in Ukrainian, and recomputes the reference after manual
  correction.
