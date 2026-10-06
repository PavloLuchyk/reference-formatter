# Proposal

## Why

Reference Formatter can resolve a DOI to a normalized `Publication` and format
a `Publication` under the approved DSTU 8302:2015 profile, but both exist only
as pure code under `lib/`: `app/` is still the `create-next-app` shell and
imports nothing from `lib/`. The Bibliography Workspace is the third and last
feature slice in `docs/intent.md`. It gives the user the flow the product is
for: add a journal article by DOI, correct its metadata, and copy the
resulting references.

## What Changes

- Add a workspace page, in Ukrainian, that holds an ordered list of entries in
  browser memory. Each entry is one `Publication` and shows its formatted
  reference, the formatter's warnings, or the fields that block formatting.
- Show at an entry, without opening the correction, the gaps in its optional
  metadata: no authors, no volume, no issue, neither pages nor an article
  number. Nothing is shown in place of a missing value, and the indication
  does not claim that a value is required.
- Add an entry by DOI, one DOI at a time, through the existing DOI resolution.
  Input that the existing DOI normalization rejects is refused without a
  request. Each of the five resolution failures gets its own Ukrainian message
  and adds nothing.
- Prevent duplicates by the existing canonical DOI identity: a DOI already in
  the list is not added and is not looked up again. No new normalization rule.
- Remove an entry, and move an entry one position up or down. A new entry is
  appended; nothing is sorted automatically.
- Correct the metadata of an entry by hand: title, subtitle, authors, journal
  title, year, volume, issue, pages, article number. The correction replaces
  the entry's `Publication`; the reference is always recomputed from the
  `Publication` and never edited as text.
- Copy one reference, and copy the whole list, to the clipboard as plain text.
- Replace the `create-next-app` shell page and set the document language to
  Ukrainian.

Ten points reserved for the human were decided on 2026-10-06 and are recorded
as HD-1 to HD-10 in `design.md`:

- HD-1: the corrected year is stored as the print date, which the approved
  precedence D11 prints first;
- HD-2: the whole list is copied as unnumbered lines, one reference per line;
- HD-3: copying the whole list is blocked while any entry cannot be formatted;
- HD-4: browser E2E verification is a separate later change;
- HD-5: the nine editable fields; the DOI, the language, the four source
  dates on their own and month and day are not directly editable;
- HD-6: typed values are trimmed, a blank value is missing, nothing else is
  normalised;
- HD-7: a changed year is exactly four ASCII digits, 1000–9999, as a product
  constraint and not a DSTU rule; an unchanged year is never validated;
- HD-8: new entries are appended, nothing is sorted, copy-all follows the
  user's order;
- HD-9: blocking missing fields and four selected gaps are visible at the
  entry (no authors, no volume, no issue, neither pages nor article number);
  other absent values, such as the subtitle, are visible in the correction
  form only;
- HD-10: the product terms «посилання» and «Перелік посилань», with «запис»
  for an item of the list.

The human also approved, on the same day, the export of `selectYear`, the
server-side Crossref wiring described under Impact, and, in a final review,
the complete Ukrainian copy table of `design.md`, with the human's own
wording in four rows.

Not in this change (agreed in `docs/session-notes.md`): pasting several DOIs
at once, partial failures inside a batch, a clipboard fallback. Also not in
this change: persistence across a page reload, drag and drop, automatic
sorting or numbering of entries, restoring the resolved metadata of a
corrected entry, a confirmation before removal, rich text or italics, browser
E2E tests, the README and final product documentation, authentication, a
database, another metadata provider, another publication type or citation
style.

No normative DSTU decision is made here. `docs/dstu/rules.md` leaves the
numbering and order of entries to this slice and holds no approved rule for
them. Printing no numbers and keeping the order the user gives are product
decisions (HD-2, HD-8); the product does not claim that DSTU requires them.
The nine assumptions the human reviewed and kept, and the three readings the
agent made with the human's disposition of each, are listed in `design.md`.

## Capabilities

### New Capabilities

- `bibliography-workspace`: the in-memory ordered list of entries; adding an
  entry by DOI, duplicate prevention, reporting resolution failures, removing
  and reordering entries, and what each entry shows (reference, warnings,
  blocking fields, gaps in optional metadata).
- `metadata-correction`: manual correction of an entry's `Publication`; which
  fields can be corrected, how blank values, the year and the authors are
  handled, and recomputing the reference from the corrected `Publication`.
- `bibliography-copy`: the plain text placed on the clipboard for one
  reference and for the whole list, when copying the whole list is blocked,
  and how a clipboard failure is reported.

### Modified Capabilities

None. `doi-normalization`, `doi-resolution`, `publication-model` and
`dstu-journal-formatting` keep their requirements. The workspace calls them
and does not change what they do.

## Impact

- **Code, new**: pure domain modules under `lib/bibliography/` (the list, the
  correction, the metadata gaps, the copy text) with no dependency
  on React, Next.js or the network; a thin UI under `app/` (one Server
  Function that calls `resolveDoi`, client components for the list and the
  correction form, one module with the Ukrainian copy).
- **Code, changed**: `app/page.tsx` and `app/layout.tsx` (the shell is
  replaced; `lang="uk"`, Ukrainian title, the `cyrillic` subset of the fonts
  already used).
- **One touch on a completed slice, approved by the human on 2026-10-06**:
  `lib/dstu/format-journal-article.ts` exports its existing pure `selectYear`,
  so that the correction shows the year the formatter prints without a second
  copy of the D11 order. No behaviour changes. It is the only intentional
  code touch on the formatter slice and is protected by a regression and
  integration check: the formatter tests and the golden conformance test pass
  with their files unchanged, the diff of `lib/dstu/` is that one word, and
  the year shown for each golden fixture is checked against its approved
  reference text. Nothing else under `lib/doi/`, `lib/metadata/`,
  `lib/publication/` or `lib/dstu/` changes.
- **Oracles**: `docs/dstu/rules.md` and `tests/golden/` are read, never
  edited. Workspace tests may read golden fixtures as inputs with their
  approved texts.
- **Crossref wiring, approved by the human on 2026-10-06**: the Server
  Function calls the existing DOI resolution and reimplements nothing of
  Crossref access; the application name is `reference-formatter`; the
  optional contact address is read on the server from
  `CROSSREF_CONTACT_EMAIL` and is not exposed to client code. No `.env*` file
  is created or edited.
- **Dependencies**: none added. Component tests use the installed Vitest,
  jsdom and Testing Library.
- **Verification**: `pnpm check` stays the gate; runs are recorded with
  `scripts/record-run.sh`. No change to CI, hooks, scripts or agent settings.
- **Definition of Done items left open by this slice**: deterministic browser
  E2E of the primary flow (HD-4), and the README with the documented
  limitations, including that the list does not survive a page reload.
