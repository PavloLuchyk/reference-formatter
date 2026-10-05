# Proposal

## Why

Reference Formatter turns a DOI into a bibliography entry, and nothing in the
repo can yet take a DOI and return bibliographic metadata. DOI Resolution is the
first feature slice in `docs/intent.md`; the DSTU formatter and the bibliography
workspace both consume its output, so it has to exist and be specified first.

## What Changes

- Add DOI normalization: turn user input (bare DOI, `doi:` prefix,
  `https://doi.org/…` URL) into one canonical DOI, or reject it as invalid
  without calling the network.
- Add a normalized `Publication` model for journal articles, in which every
  bibliographic value that the source did not supply is explicitly missing and
  never invented.
- Add DOI resolution through Crossref: look up the canonical DOI, map the
  Crossref work record to a `Publication`, and return a typed failure for
  invalid input, an unknown DOI, a work that is not a journal article, an
  unavailable provider and an unusable response.
- Keep Crossref response shapes inside the metadata/provider boundary; everything
  outside it sees only `Publication` and the failure kinds.

Not in this change: DSTU formatting, the bibliography workspace, any UI, route
handler or server action, manual metadata correction, duplicate prevention,
caching or persistence, other providers or fallbacks, publication types other
than journal articles, and any AI-based correction.

Several behaviours in this slice are policies with more than one reasonable
answer. `docs/intent.md` reserves those for the human. They are the numbered
human decisions HD-1 … HD-10 in `design.md`, which the human decided on
2026-10-05; the specs implement those answers. One of them, the choice of
publication year, is deliberately deferred: this slice preserves the source
dates and selects no year. The explicit Crossref field → Publication field
mapping table in `design.md` was approved by the human on the same day.

## Capabilities

### New Capabilities

- `doi-normalization`: accepted DOI input forms, the canonical DOI used as
  identity, and rejection of input that is not a DOI.
- `publication-model`: the normalized journal-article `Publication`, its fields,
  and how missing metadata is represented.
- `doi-resolution`: resolving a DOI to a `Publication` through Crossref, the
  mapping from a Crossref work record, and the failure outcomes.

### Modified Capabilities

None. `openspec/specs/` is empty; these are the project's first specs.

## Impact

- **Code**: new pure domain modules under `lib/` (which does not exist yet), with
  no dependency on React, Next.js or, outside the Crossref provider, the network.
  No change to `app/`.
- **Dependencies**: no runtime product dependency added; the lookup uses the
  platform `fetch`. OpenSpec (`@fission-ai/openspec`, a devDependency) was added
  as development and tooling infrastructure for this spec workflow, with its
  `.claude/commands/opsx/` commands and `.claude/skills/openspec-*` skills
  (commit `1fd61a4`).
- **External system**: the public Crossref REST API (`api.crossref.org`), read
  only, one request per resolution.
- **Configuration**: possibly one optional contact address for Crossref, supplied
  by the human (HD-9). The agent does not create or edit `.env*`.
- **Verification**: new Vitest tests in the `node` environment and recorded
  Crossref fixtures with provenance. `pnpm check` stays the gate. The script
  `spec:check` was introduced to validate the specs with OpenSpec. No change to
  CI or hooks.
- **Later slices**: the formatter and the workspace depend on `Publication` and
  on the canonical DOI as identity; the field set may need extending once the
  DSTU journal-article profile is approved (HD-5).
