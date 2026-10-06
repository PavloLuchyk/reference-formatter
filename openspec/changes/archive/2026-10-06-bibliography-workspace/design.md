# Design

## Context

See `proposal.md` for motivation. State of the repository on 2026-10-06, at
`87bc889`:

- `app/` is the `create-next-app` shell (`page.tsx`, `layout.tsx` with
  `lang="en"` and the `latin` font subset, `globals.css`) and imports nothing
  from `lib/`. There is no route handler, Server Function or client component.
- The pure code the workspace builds on, all under `lib/`:
  `normalizeDoi` (`lib/doi/`), `resolveDoi(input, { fetch, appName,
  contactEmail })` returning a `ResolutionOutcome` (`lib/metadata/`),
  `Publication`, `createPublication`, `missingFields`, `isSamePublication`
  (`lib/publication/`), and `formatJournalArticle(publication)` returning
  `{ kind: "formatted", text, warnings }` or
  `{ kind: "cannot-format", blockedBy }` (`lib/dstu/`).
- `createPublication` turns a blank scalar into `null`, trims author names and
  drops an author without any name. It does not trim a scalar that is not
  blank; the Crossref mapper trims before calling it.
- The year selection of the formatter (`selectYear`, order print, issued,
  published, online, decision D11) is a private function of
  `lib/dstu/format-journal-article.ts`.
- Test tooling installed: Vitest in the `node` environment, jsdom on opt-in,
  `@testing-library/react` and `@testing-library/dom`.
  `@testing-library/user-event` and any browser test tool are not installed.
- `docs/dstu/rules.md` holds no approved rule on the numbering or order of
  entries in a list: section 11 leaves them to this slice and S1 §5.4.1.1 is
  not restated. Row N3 says that a set of endnote references laid out as a
  list is not a bibliography list.

Read in `node_modules/next/dist/docs/` for Next.js 16.3.8 before this design
was written: `01-app/01-getting-started/07-mutating-data.md` (Server
Functions, invoking them from event handlers, passing them as props),
`01-app/02-guides/server-actions.md` (one dispatch at a time per client; a
Server Function is reachable by direct POST and is an untrusted entry point),
`01-app/02-guides/environment-variables.md` (variables without the
`NEXT_PUBLIC_` prefix exist on the server only),
`01-app/01-getting-started/02-project-structure.md` (private folders
`_folder`), `01-app/02-guides/testing/vitest.md` (Vitest does not support
`async` Server Components).

## Goals / Non-Goals

**Goals:**

- All behaviour of the list, the correction, the missing-metadata indication
  and the copy text as pure functions under `lib/bibliography/`, testable in
  the `node` environment.
- A UI layer that only wires those functions to controls: no rule about
  duplicates, years, authors, missing values or copy text lives in a
  component.
- One place for the reference text: it is derived from the `Publication` at
  the moment it is shown or copied, never stored.
- Tests whose expected reference texts never come from running the formatter.

**Non-Goals:**

- No change to `Publication`, to `createPublication`, to DOI normalization,
  to DOI resolution or to any formatting rule. The one touch on `lib/dstu/`
  is TD-5.
- No persistence, no `localStorage`, no URL state.
- No component library, no drag and drop, no rich text.
- No clipboard fallback, no retry of a failed resolution, no reset of a
  corrected entry to its resolved metadata.
- No browser E2E test in this change (HD-4).

## Decisions

### Human decisions (decided 2026-10-06, before the proposal was written)

Reserved for the human by `docs/intent.md` and `AGENTS.md`. The agent asked;
the "Decision" column is the human's answer, and the specs implement it.

| ID | Question | Decision | Spec requirement |
|---|---|---|---|
| HD-1 | `Publication` has four source dates and no year. How is a corrected year stored, without changing the model or the formatter? | One year field. It shows the year the formatter prints. A changed year is saved as the print date, year only, which D11 prints first; the other three source dates stay. An emptied field clears all four dates. Accepted trade-off: the print slot then holds a year stated by the user, not a print date. | `metadata-correction`: Year shown for correction; Corrected year is stored as the print date; Emptied year |
| HD-2 | The profile has no approved rule on numbering or order of entries. What does copying the whole list write? | Unnumbered lines: each reference on its own line, in the order of the list, one line break between them. Numbering is left to the user's word processor. | `bibliography-copy`: Copying the whole list |
| HD-3 | What does copying the whole list do while an entry cannot be formatted? | It is blocked until every such entry is corrected or removed, with a message that says how many. | `bibliography-copy`: Copying the whole list is blocked by an unformatted entry |
| HD-4 | `docs/intent.md` requires deterministic E2E of the primary browser flow and no browser test tool is installed. Is E2E part of this slice? | No. It is a separate later change, where the human approves the tool and how Crossref is made deterministic. This slice is verified with pure tests and jsdom component tests driven by a fake resolver. | — (Definition of Done item left open) |

HD-1 does not reopen D11: the formatter still prints the first date present
in its approved order. The correction only chooses which slot receives a year
the user states.

### Human decisions (decided 2026-10-06, after the review of the assumptions)

The first draft of this design listed fifteen assumptions, AS-1 to AS-15. The
human reviewed them in a review packet on 2026-10-06 and promoted six to
explicit decisions. The "Was" column names the assumption each replaces.

| ID | Was | Subject | Decision | Spec requirement |
|---|---|---|---|---|
| HD-5 | AS-1 | Editable metadata fields | Editable in the MVP: title, subtitle, authors, journal title, year, volume, issue, pages, article number. Not directly editable: the DOI, because it is the Publication identity; the language, because this formatter profile does not use it to choose designations; the four source-date slots independently; month and day components. The single year correction field behaves exactly as defined by HD-1. | `metadata-correction`: Correctable fields |
| HD-6 | AS-2 | Typed-value whitespace | Surrounding whitespace is trimmed from manually entered scalar and name values. A value blank after trimming is missing. Internal whitespace is preserved. Content is not invented or otherwise normalised. | `metadata-correction`: Blank values and surrounding whitespace; Author names in a correction |
| HD-7 | AS-3 | Year validation | An edited year is accepted as exactly four ASCII decimal digits representing 1000–9999. This is an explicit MVP product constraint, not a DSTU rule. If the year field is unchanged from the year originally displayed by `selectYear()`, it is not validated and not rewritten, so that other metadata can be corrected even when the resolved source metadata contains a year outside the manual input range. Invalid changed input blocks saving and leaves the form open. | `metadata-correction`: Unchanged year is not validated; Changed year value that is not accepted |
| HD-8 | AS-5 | Workspace ordering | A newly added publication is appended to the end. There is no automatic sorting. The user-controlled list order is used by copy-all. No claim is made that this ordering is required by DSTU. | `bibliography-workspace`: Adding an entry by DOI; Reordering entries. `bibliography-copy`: Copying the whole list |
| HD-9 | AS-9, revised | Visibility of missing metadata | Blocking missing fields remain explicitly visible at the entry and prevent formatting. Selected non-blocking bibliographic gaps, defined by RD-1, remain visible at entry level. RD-1 defines those gaps as: authors missing; volume missing; issue missing; both pages and article number missing. Other editable-but-absent values, such as the subtitle, remain visible in the correction form but are not entry-level missing-metadata indicators. No missing value is invented. (Wording revised by the human on 2026-10-06 in a consistency correction after the final review; see below.) | `bibliography-workspace`: Entry that cannot be formatted; Entry shows gaps in optional metadata; Indication of gaps makes no claim and changes nothing. `metadata-correction`: Current values are shown as stored |
| HD-10 | AS-10 | UI terminology | The Ukrainian product terms are «посилання» and «Перелік посилань». This is the approved product wording for this MVP, informed by the source/profile distinction. It is not claimed that N3 universally mandates this UI terminology. | `bibliography-workspace`: Product terms |

### Other human dispositions of 2026-10-06

Given by the human together with HD-5 to HD-10.

- The duplicate-prevention algorithm stays exactly on the existing canonical
  DOI and `isSamePublication` semantics.
- Input that the existing `normalizeDoi` classifies as invalid is rejected
  locally, without invoking the Server Function.
- A newly added author row starts as a person.
- The copy-all control remains visible but disabled when unavailable.
- An entry that cannot be formatted has no copy-one action.
- No metadata reset feature is added.
- Switching the author kind does not transfer names between the person and
  the organisation shape.
- Removal remains immediate with no confirmation for this MVP.
- Clipboard fallback mechanisms remain out of scope.
- The generic request failure message is «Не вдалося виконати запит.
  Спробуйте ще раз.» It does not imply that the user's connection is
  necessarily the cause.
- **Approved: the completed-slice dependency.** The existing pure
  `selectYear` is exported from the DSTU formatter so that the workspace
  displays the same selected year. Its behaviour is not changed and the D11
  logic is not duplicated. This is the only intentional code touch on the
  formatter slice and is protected by a regression and integration check
  (TD-5, tasks 2.4 and 4.2).
- **Approved: the server-side Crossref wiring.** The existing DOI resolution
  capability is called and Crossref access is not reimplemented; the
  application name is `reference-formatter`; the optional contact address is
  read from `CROSSREF_CONTACT_EMAIL` on the server; no `.env` file is
  touched; the contact value is not exposed to client code (TD-6).
- At that point the Ukrainian copy table was explicitly not approved: the
  human asked to see the complete table first. It was approved later the same
  day, in the final review below.

### Final human review (2026-10-06)

The human reviewed the three readings the agent had made (RD-1 to RD-3) and
the complete Ukrainian copy table, and decided:

- **RD-1 — revised by the human.** The agent had read HD-9 as naming every
  empty optional field with a control. That reading is withdrawn. The compact
  non-blocking indication reports:
  - «автори» when no authors are present;
  - «том» when the volume is absent;
  - «номер випуску» when the issue is absent;
  - «сторінки або номер статті» only when both pages and article number are
    absent.

  A missing subtitle is not reported. The article number is not reported as
  missing when pages are present, and pages are not reported as missing when
  the article number is present. The indicator describes gaps in the
  available bibliographic metadata; it does not claim that every listed field
  is normatively required. The correction form still shows all nine approved
  editable fields, including the subtitle, the pages and the article number.
- **RD-2 — approved.** Surrounding whitespace is trimmed before the year
  validation and before the unchanged-year comparison. The rules for internal
  whitespace are unchanged.
- **RD-3 — approved.** «запис» is the neutral UI term for an item of the
  workspace list. «посилання» is used only when a formatted reference
  actually exists.
- **Copy table — approved with three wording changes**, to rows 19, 23 and
  40, and with the values used by row 23 changed to match the revised RD-1,
  including «сторінки або номер статті». All other Ukrainian copy in the
  table presented on 2026-10-06 is HUMAN-APPROVED for this MVP.
- The statements that the product formats references according to the
  approved DSTU 8302:2015 profile (rows 2 and 4) are approved.
- The session-only notice (row 5) is approved.
- The copy-failure instruction (row 42) is approved as wording only. It does
  not authorize an automatic clipboard fallback mechanism.

Consistency correction by the human, 2026-10-06, after the final review. HD-9
was first recorded as: "Non-blocking missing bibliographic metadata must also
remain visible without requiring the user to open the correction form: a
compact entry-level indication of the missing optional fields, while the
correction form contains the corresponding empty controls." That wording was
broader than the revised RD-1, under which a missing subtitle is intentionally
not reported at the entry. The human replaced it with the text now in the
HD-9 row. The behaviour approved with RD-1 did not change, and no requirement
or scenario changed with this correction.

### Human disposition of the manual browser check (2026-10-06)

The first manual browser check of task 4.4 ended RED: after copying the whole
list, the Windows system clipboard held the references separated by a
carriage return and a line feed, where the spec said "exactly one line feed"
and its scenarios said what "the clipboard holds". The application had passed
exactly one line feed; Chrome on Windows stores it as CR LF. The human's
disposition:

- **Accepted as a specification clarification, not an implementation
  defect.** The `bibliography-copy` contract governs the text produced by the
  application and passed to the clipboard API.
- For copy-all the application joins references with exactly one LF character
  (U+000A) and adds no trailing line break.
- The value passed to `navigator.clipboard.writeText()` is the normative
  product output for this requirement.
- The operating system or clipboard implementation may represent that line
  break using its platform-native line ending after the write. Such platform
  normalization is not a product defect.
- AS-12 and the `bibliography-copy` requirement and scenarios are revised
  accordingly. The copy implementation is not changed.
- The failed manual-browser-check record is preserved as historical evidence
  and is neither deleted nor rewritten.
- Task 4.4 is repeated with the clarified acceptance criterion.

### Assumptions kept

Reviewed by the human on 2026-10-06 and kept as assumptions. The numbers of
the promoted assumptions (AS-1, AS-2, AS-3, AS-5, AS-9, AS-10) are not reused.

| # | Assumption | Alternative not taken |
|---|---|---|
| AS-4 | An author row with no name at all is left out on saving, without a message | Refusing to save until the row is filled or removed |
| AS-6 | Removing an entry is immediate, without a confirmation, although corrections made to it are lost | A confirmation step; undo |
| AS-7 | A duplicate is refused before any lookup. The existing entry is not moved, replaced or refreshed | Offering to replace the existing entry with freshly resolved metadata |
| AS-8 | After a failed attempt the typed text stays in the DOI field; after a success the field is cleared | Clearing the field in both cases |
| AS-11 | An entry that cannot be formatted offers no copy of its own | Copying an error text |
| AS-12 | The text the application passes to `navigator.clipboard.writeText()` joins references with exactly one line feed, U+000A, and has no trailing line break. That value is the normative product output. The operating system or the clipboard implementation may represent the line break with its platform-native line ending after the write; such normalization is not a product defect (clarified by the human on 2026-10-06 after the manual browser check; see below) | CRLF passed by the application; a trailing line break |
| AS-13 | A request for resolution that fails before any outcome arrives gets its own generic message, «Не вдалося виконати запит. Спробуйте ще раз.», which blames neither Crossref, nor the DOI, nor the user's connection (wording set by the human on 2026-10-06) | Reporting it as `provider-unavailable` |
| AS-14 | A corrected entry cannot be reset to its resolved metadata. The user removes the entry and adds the DOI again | A reset control; keeping the resolved `Publication` beside the corrected one |
| AS-15 | Setting an author as the other kind does not carry names over: the user types the organisation name or the personal names | Copying the family name into the organisation name |

### Readings, with the human's dispositions

Writing HD-5 to HD-10 into testable requirements needed three readings by the
agent. The human disposed of all three in the final review above; none is
open. The specs follow the "Disposition" column.

| # | Reading as the agent wrote it | Disposition (2026-10-06) |
|---|---|---|
| RD-1 | The entry-level indication names each of the six optional values with a control in the correction: subtitle, authors, volume, issue, pages, article number | **Revised by the human.** Reported: no authors; volume absent; issue absent; pages and article number both absent, as one gap. Never reported: a missing subtitle; one of pages and article number when the other is present. The language and the dates are not in the human's list and are not reported; a missing year stays a blocking field |
| RD-2 | The trimming of HD-6 applies to the year field before the check of HD-7, so ` 2021 ` with surrounding spaces is accepted, and "unchanged" is judged after trimming | **Approved** |
| RD-3 | An entry of the list is called «запис» where «посилання» would be wrong, because the entry may have no reference | **Approved**, and stated as a rule: «запис» for an item of the list, «посилання» only when a formatted reference exists |

### Technical decisions (agent's, within the approved architecture)

**TD-1 Module layout.**

- `lib/bibliography/workspace.ts` — the list and its operations.
- `lib/bibliography/correction.ts` — the correction draft and applying it.
- `lib/bibliography/metadata-gaps.ts` — which gaps in optional metadata an
  entry has (HD-9).
- `lib/bibliography/bibliography-text.ts` — the text for copying the list.
- `app/actions.ts` — the one Server Function.
- `app/_components/` — the client components (`workspace.tsx`,
  `entry-card.tsx`, `correction-form.tsx`) and `copy.ts`, the Ukrainian text.
- `app/page.tsx` stays a Server Component and renders the workspace.

`_components` is a private folder, so nothing in it becomes a route.
Alternative: a root `components/` folder. Rejected: the repository has none,
and these components belong to this one page.

**TD-2 The list is a value.** `Workspace` is `{ entries }`, an entry is
`{ publication }`, and its identity is `publication.doi`. Operations take a
`Workspace` and return a new one: `addEntry`, `removeEntry`, `moveEntry`,
`replacePublication`, with `hasEntry` to ask about a canonical DOI. Sameness
is the existing `isSamePublication`; `hasEntry` compares the `CanonicalDoi`
that `normalizeDoi` returned. No other comparison exists. A refused add is a
value, `{ ok: false, reason: "duplicate" }`, as resolution failures are.
`addEntry` appends (HD-8). No entry id beside the DOI: the DOI cannot be
edited (HD-5), so it is stable. Alternative: a generated id per entry.
Rejected: a second identity that the specs do not know.

**TD-3 The reference is derived, never stored.** An entry holds only its
`Publication`. `formatJournalArticle` is called when the entry is shown and
when text is built for copying. This makes "Reference is recomputed from the
Publication" true by construction. Alternative: store the outcome in the entry
and refresh it on correction. Rejected: a stored text can go stale. The
formatter is pure and cheap, so no memoisation is planned.

**TD-4 A correction is a draft of strings.** `draftFromPublication` gives
the form its values: one string per scalar field, the year as a string, and
the authors as rows of `kind`, `family`, `given` and `name`.
`applyCorrection(publication, draft)` returns either the corrected
`Publication` or `{ ok: false, errors }`, where the only error of this slice
is an invalid year. It:

- trims the scalars (HD-6);
- compares the trimmed year of the draft with `selectYear` of the publication
  it corrects, as a string. Equal: the dates are passed through untouched and
  the year is not validated (HD-7). Blank: all four dates become missing
  (HD-1). Otherwise the value must be four ASCII digits denoting 1000–9999
  (HD-7), and `print` becomes that year alone (HD-1);
- keeps the DOI and the language of that publication (HD-5);
- builds the result with `createPublication`, so that the rules of
  `publication-model` for blank values and nameless authors are applied in
  one place.

The component holds the draft in state and knows no rule. A new author row is
`{ kind: "person" }` with empty names.

**TD-5 The year selection is shared, not copied (approved by the human on
2026-10-06).** `lib/dstu/format-journal-article.ts` exports its existing
`selectYear`. The correction imports it to show the year and to decide
whether the year field was changed. This is the only edit to a completed
slice; it adds the word `export` and changes no behaviour. It is protected
three ways: the formatter tests and the golden conformance test must pass
with their files unchanged; `git diff` of `lib/dstu/` against the baseline
must show that one word; and a test of the correction checks, for every
formatted golden fixture, that the year shown is the year in the approved
reference text. The one fact the correction relies on beyond the function is
that `print` is the slot it writes to, which is HD-1; the scenarios assert
the printed year after every correction. Alternatives: repeating the order in
`lib/bibliography/` (rejected: two places to keep in step with the profile);
reading the year out of the reference text (rejected: parsing output).

**TD-6 Resolution runs in a Server Function (wiring approved by the human on
2026-10-06).** `app/actions.ts` has `'use server'` and exports
`resolveDoiAction(input)`, which calls the existing `resolveDoi` with the
global `fetch`, the application name `reference-formatter` and
`process.env.CROSSREF_CONTACT_EMAIL`, and returns the `ResolutionOutcome`
unchanged. Nothing about Crossref is reimplemented. It must run on the
server: a browser cannot set `User-Agent` (TD-7 of the DOI slice), and the
contact address is server configuration. The variable has no `NEXT_PUBLIC_`
prefix, is read only in this file and is never part of what the function
returns, so the contact value does not reach client code; task 4.1 checks
that the built client files do not contain it. No `.env*` file is created or
edited. The function is reachable by direct POST, so it treats its argument
as untrusted: anything that is not a string is answered with `invalid-input`,
and a string goes through `normalizeDoi` inside `resolveDoi` before any
request. There is no authentication because the MVP has no accounts; the
function can only ask Crossref for one work per call. Alternative: a Route
Handler `GET /api/resolve`. Rejected for this slice: the client would have to
narrow untyped JSON back into a `ResolutionOutcome`, while a Server Function
keeps the type. The Next.js guide notes that Server Functions are designed
for mutations and are dispatched one at a time; that fits one DOI at a time
and is to be revisited if batch input is added.

**TD-7 The resolver is a prop, and the input is checked before it is
called.** `page.tsx` passes the Server Function to the client component:
`<Workspace resolve={resolveDoiAction} />`. Component tests pass a fake
resolver, so no test starts a server or touches the network. On submit the
component calls the existing `normalizeDoi`, which is pure:

1. rejected input gets the `invalid-input` message and the resolver is not
   called;
2. a canonical DOI already in the list is refused as a duplicate and the
   resolver is not called;
3. otherwise the resolver is called, and `addEntry` refuses a duplicate again
   when the outcome arrives.

The Server Function still validates its own argument (TD-6); the local check
is not its replacement.

**TD-8 Client state.** One `useReducer` in `workspace.tsx` holds all state
of the page: the list, the text of the DOI field, the in-progress flag, the
message of the last submission, the result of the last copy and which entry
is being corrected. Its transitions call the pure operations of TD-2 and
decide nothing about DOIs, duplicates or order themselves. The correction
form keeps its own draft in local state. `workspace.tsx` is the only file
with the `'use client'` directive; `entry-card.tsx` and `correction-form.tsx`
are imported only from it. (As first written, this decision kept the DOI
field, the flag and the messages in separate local state; they were put into
the reducer during implementation so that every transition is one pure
function. No behaviour of the specs depends on the difference.)

**TD-9 Clipboard.** The component calls `navigator.clipboard.writeText`. A
missing clipboard or a rejected promise gives the failure message. Tests
define `navigator.clipboard` in jsdom. No `document.execCommand` path and no
other fallback. The copy-all control is always rendered and carries the
`disabled` attribute while `bibliography-text` reports the list as empty or
blocked.

**TD-10 Ukrainian text in one module.** `app/_components/copy.ts` holds every
string of the table below. Failure kinds, warnings, blocking fields and
metadata gaps are mapped with `Record<Kind, string>`, so that a kind added
later without text fails the type check instead of showing nothing.

**TD-11 Tests.**

- Pure tests beside the modules in `lib/bibliography/`, `node` environment.
- Component tests beside the components, `// @vitest-environment jsdom`,
  with `fireEvent` of `@testing-library/react`. `user-event` is not installed
  and is not added.
- A test of the Server Function with `vi.stubGlobal("fetch", …)` and
  `vi.stubEnv`; it never reaches the network.
- Expected reference texts come from two places only: the approved texts of
  `tests/golden/dstu-journal.ts`, read as data, and texts written by hand
  from the scenarios of the accepted specs. No test computes an expected
  reference by calling the formatter, and there are no snapshot tests.
- Expected Ukrainian strings are written by hand from the approved table
  below, not imported from `copy.ts`.

**TD-12 RED with assertion failures.** Each RED step first adds the types and
stubs that return one fixed value (or, for a component, render only a
heading), so that the failing run fails on assertions and queries, not on a
missing module. The hashes of the test files are recorded with
`scripts/record-run.sh` at RED and again at GREEN, so that "no test changed"
is durable evidence; the formatter slice kept such hashes outside the
repository and that was a review finding.

**TD-13 Styling.** Tailwind utility classes, which are installed. The font
setup of the shell is kept and gains the `cyrillic` subset; the installed
`next/font` data lists it for Geist and Geist Mono.

**TD-14 Gaps in optional metadata come from the model.**
`metadataGaps(publication)` in `lib/bibliography/metadata-gaps.ts` returns,
in this order, the gaps the human listed in the final review: `authors`,
`volume`, `issue`, and `pages-or-article-number`, the last only when both
pages and article number are missing. It is computed from the existing
`missingFields` of `lib/publication/`, so no second definition of "missing"
is written. The subtitle, the language and the dates are never returned.

### Ukrainian copy (HUMAN-APPROVED for this MVP on 2026-10-06)

Proposed by the agent and approved by the human in the final review of
2026-10-06, with the human's wording in rows 15, 19, 23 and 40 and the values
of row 23 set by the revised RD-1. Changing a string needs a new approval.
The messages for warnings say what the program did and ask the user to check;
they state no rule of the standard. Row 23 says what the metadata does not
give and does not say that a value is required. `{fields}` is a list joined
by a comma and a space; `{n}` is a number. The apostrophe is U+2019 and the
ellipsis is U+2026. The numbers are those of the table the human reviewed;
24 (subtitle) and 29 (article number on its own) are no longer used. Row 68
was added on 2026-10-06 by the human's approval of finding BW-R01-8 of
feature review 01: `{doi}` is the canonical DOI of the entry, and the line is
rendered from the label of row 44, a colon and a space. That approval covers
this one line and no other copy change.

| # | Where | Text |
|---|---|---|
| 1 | Document title | Перелік посилань за DOI |
| 2 | Document description | Бібліографічні посилання на журнальні статті за DOI, оформлені за профілем ДСТУ 8302:2015. |
| 3 | Page heading | Бібліографічні посилання на журнальні статті |
| 4 | Introduction | Додайте статтю за DOI, щоб отримати посилання, оформлене за профілем ДСТУ 8302:2015. |
| 5 | Session notice | Перелік зберігається лише до перезавантаження сторінки. |
| 6 | DOI field label | DOI статті |
| 7 | DOI field hint | Наприклад: 10.1038/nature12373, doi:10.1038/nature12373 або https://doi.org/10.1038/nature12373 |
| 8 | Add control | Додати |
| 9 | Lookup in progress | Шукаємо в Crossref… |
| 10 | `invalid-input` | Це не схоже на DOI. Введіть один DOI у вигляді 10.xxxx/…, doi:10.xxxx/… або https://doi.org/10.xxxx/… |
| 11 | `not-found` | Crossref не має запису для цього DOI. |
| 12 | `unsupported-type` | Підтримуються лише журнальні статті. Запис Crossref для цього DOI не є журнальною статтею. |
| 13 | `provider-unavailable` | Crossref зараз недоступний. Спробуйте ще раз пізніше. |
| 14 | `invalid-response` | Crossref повернув відповідь, яку не вдалося використати. |
| 15 | Request failed (AS-13, wording set by the human) | Не вдалося виконати запит. Спробуйте ще раз. |
| 16 | Duplicate | Ця публікація вже є в переліку. |
| 17 | List heading (HD-10) | Перелік посилань |
| 18 | Empty list | Перелік порожній. Додайте першу статтю за DOI. |
| 19 | Cannot be formed (wording set by the human) | Не вдалося сформувати посилання. Бракує: {fields}. |
| 20 | Blocking field `title` | назва статті |
| 21 | Blocking field `journalTitle` | назва журналу |
| 22 | Blocking field `year` | рік |
| 23 | Gaps in optional metadata (HD-9, wording set by the human) | Не вказано в метаданих: {fields}. |
| 25 | Gap `authors`: no authors | автори |
| 26 | Gap `volume`: volume absent | том |
| 27 | Gap `issue`: issue absent | номер випуску |
| 28 | Gap `pages-or-article-number`: both absent | сторінки або номер статті |
| 30 | Warning `subtitle-capitalisation` | Підзаголовок починається з великої літери. Програма не змінює регістр — перевірте його. |
| 31 | Warning `incomplete-personal-name` | Для одного з авторів є лише прізвище або лише ім’я. Програма нічого не додає — перевірте дані автора. |
| 32 | Warning `full-stop-collision` | У посиланні дві крапки поспіль, бо значення з метаданих закінчується крапкою. Програма її не прибирає — перевірте значення. |
| 33 | Entry control: copy one | Копіювати |
| 34 | Entry control: correct | Редагувати |
| 35 | Entry control: remove | Вилучити |
| 36 | Entry control: move up | Вище |
| 37 | Entry control: move down | Нижче |
| 38 | Accessible name of an entry control (RD-3) | {control}: запис {n} — for example «Вилучити: запис 2» |
| 39 | Copy the whole list | Копіювати весь перелік |
| 40 | Copy-all blocked (wording set by the human) | Щоб скопіювати весь перелік, виправте або вилучіть записи, для яких не сформовано посилання: {n}. |
| 41 | Copied | Скопійовано. |
| 42 | Copy failed (wording only; no fallback mechanism) | Не вдалося скопіювати. Виділіть текст і скопіюйте його вручну. |
| 43 | Correction heading | Редагування метаданих |
| 44 | Field label: DOI (read-only) | DOI |
| 45 | Field label: title | Назва статті |
| 46 | Field label: subtitle | Підзаголовок |
| 47 | Field label: journal title | Назва журналу |
| 48 | Field label: year | Рік |
| 49 | Field label: volume | Том |
| 50 | Field label: issue | Номер випуску |
| 51 | Field label: pages | Сторінки |
| 52 | Field label: article number | Номер статті |
| 53 | Invalid year (HD-7) | Рік має складатися з чотирьох цифр, від 1000 до 9999. |
| 54 | Authors heading | Автори |
| 55 | No author rows | Авторів не вказано. |
| 56 | Author row label | Автор {n} |
| 57 | Author kind label | Тип автора |
| 58 | Author kind: person | Особа |
| 59 | Author kind: organisation | Організація |
| 60 | Person: family name | Прізвище |
| 61 | Person: given value | Ім’я або ініціали |
| 62 | Organisation: name | Назва організації |
| 63 | Add an author | Додати автора |
| 64 | Author row controls | Вилучити · Вище · Нижче |
| 65 | Accessible name of an author row control | {control}: автор {n} — for example «Вилучити: автор 2» |
| 66 | Save the correction | Зберегти |
| 67 | Cancel the correction | Скасувати |
| 68 | Entry-level DOI identity line, shown at an entry that has no reference (approved by the human on 2026-10-06 in the dispositions of feature review 01, BW-R01-8) | DOI: {doi} |

### Source limitations carried, not resolved

The workspace shows what the approved formatter returns and adds no rule of
its own.

- The provisional rows the formatter uses (P21, P22, P23, P25, P26, P43), the
  `; ` between heading authors (C12), the em dash of a page range (O8, G11)
  and the missing place of publication (G10) stay as recorded in
  `docs/dstu/rules.md`. Nothing in this slice hides or corrects their effect.
- A doubled full stop (O17, O18) is shown and copied as the formatter returns
  it, with its warning.
- There is no approved rule for the numbering or order of entries. Printing
  no numbers (HD-2) and keeping the order the user gives (HD-8) are product
  decisions. Neither is a reading of the standard, and the product does not
  claim that DSTU requires this order.
- The terms «посилання» and «Перелік посилань» are the approved product
  wording of HD-10, informed by the distinction of row N3. The product does
  not claim that N3 mandates them.
- The indication of gaps (HD-9) says what the available metadata does not
  give. It does not claim that a listed value is normatively required, and
  the formatter still omits a missing optional element without a trace.
- The year range of HD-7 is a product constraint on typed input, not a rule
  of the standard. A source year outside it is printed as supplied.

## Risks / Trade-offs

- [After a year correction the print slot holds a year the user stated, and
  the month of a resolved print date is dropped; nothing marks the date as
  corrected] → Accepted with HD-1. The other three source dates are kept, and
  the model has no field that could carry the mark.
- [Emptying the year discards all four source dates of the entry] → Accepted
  with HD-1. To get them back the user removes the entry and adds the DOI
  again (AS-14).
- [An article that has no subtitle, or that has pages and no article number,
  shows no indication for them, so a subtitle that the source failed to give
  is visible only as an empty field in the correction] → Decided by the human
  in the final review (RD-1 revised): the indication reports gaps in the
  metadata, not every empty field.
- [A resolved value that contains a line break, which title cleaning can
  leave as supplied, puts a line break inside a reference, so that the
  references of a copied list are no longer one per line; a single-line field
  also drops that line break when the correction is opened] → Not handled in
  this slice. The user can correct the title. To be reported if it is
  observed with real records.
- [The Server Function can be called by anyone who can POST to the page] → It
  accepts one string, validates it structurally before any request, and can
  only ask Crossref for one work. No secret is returned: the contact address
  goes to Crossref, not to the client.
- [Component tests in jsdom with a fake resolver do not prove the wiring of
  the real Server Function, the real clipboard or the built page] → `pnpm
  build` is part of `pnpm check`; task 4.4 is a manual check in a browser
  whose result is written down as it happened; deterministic E2E is the later
  change of HD-4. Since feature review 01, `app/page-shell.test.tsx` pins the
  document language, the title and description, and the element the page
  returns with `resolveDoiAction` as its resolver; it inspects React elements
  and source text and still shows nothing in a browser. Until the E2E change
  the primary browser flow has no automated evidence; `docs/session-notes.md`
  says so since task 4.7 was done on 2026-10-06.
- [`fireEvent` is a cruder model of a user than `user-event`] → Accepted to
  avoid a dependency. The tests assert on roles and accessible names, so they
  do not depend on markup details.
- [Removal without confirmation loses corrections with one click] → AS-6,
  kept by the human for this MVP.
- [Everything is lost on reload] → Accepted in `docs/intent.md`; the page
  states it (requirement "The list lives for one session").
- [The strings the tests expect are written by hand from the approved copy
  table, so a later change of wording changes tests] → The table is
  human-approved; a change of wording is a new approval, and the tests then
  change with it on purpose.

## Verification history

What the recorded evidence does and does not prove, stated plainly. Written
by the maker session on 2026-10-06; every record named is in `evidence/runs/`.
The reference commit is `9c30af7`, a clean tree (`…102231Z_workspace-baseline.log`,
GREEN, 355 tests).

- **Neither RED state is a commit.** Nothing was committed between the
  baseline and the end of implementation, so the stubs exist in no commit and
  were overwritten by the implementation. What is durable instead: each RED
  run and the SHA-256 hashes of the test files at that moment, recorded with
  `scripts/record-run.sh`, and the same hashes recorded again at GREEN.
- **Domain RED** (`…102700Z_workspace-domain-red.log`): 126 failed, 380
  passed, every failure an AssertionError in one of the four new test files.
  25 new tests passed against the stubs because the fixed value a stub
  returns happens to be the expected one; they are listed at task 2.6. Those
  25 tests were therefore not seen to fail.
- **Domain GREEN** (`…102806Z_workspace-domain-green.log`): `pnpm check`,
  exit 0, 506 tests, tree not committed. The five hashes equal those of RED.
- **UI RED** (`…103643Z_workspace-ui-red.log`): 165 failed, 508 passed,
  failures only in the five new test files. Every failure of a component
  test is a Testing Library query failure against stub components that render
  only a heading; two tests of `app/actions.test.ts` failed with a TypeError
  raised inside the test, when it read the first request and the stub had
  made none. Two tests of that file passed against the stub and were not seen
  to fail.
- **What the UI RED does not show** (finding BW-R01-2 of feature review 01,
  acknowledged by the human as an evidence limitation, with no repair). It is
  a genuine query-level RED, which TD-12 allows, but it does not
  discriminate: of the 139 query failures in the record, 135 are the same
  one, "Unable to find a label with the text of: DOI статті", raised by the
  first query of the shared test driver; the other four are the
  introduction, the session notice, the «Додати» control and the «Копіювати
  весь перелік» control. So nearly every component test stopped before it
  reached the behaviour it names, and no component test was seen to fail on
  that behaviour. In particular the negative assertions (no copy for an
  unformatted entry, no indication of gaps, resolver not called, no warning)
  were never seen to fail. The first wording of this section said "Most are
  Testing Library query failures"; the record shows all. The domain RED does
  not have this weakness. No stronger RED was produced afterwards, and the
  record is unchanged.
- **UI GREEN** (`…103936Z_workspace-check.log`): `pnpm check`, exit 0, 16
  files, 673 tests, build compiled, tree not committed. The eight UI hashes
  and the five domain hashes equal those of their RED runs
  (`…103948Z_workspace-ui-green-hashes.log`).
- **The stub checks were recorded late.** `…102656Z_workspace-domain-stubs.log`
  and `…103639Z_workspace-ui-stubs.log` show the type check and lint passing
  with the stubs, but each was taken after the tests of its group had been
  written, as the git status inside the record shows.
- **Checks that are searches** (`…104021Z_workspace-boundaries.log`,
  `…104032Z_workspace-oracles-untouched.log`,
  `…104034Z_workspace-tooling-untouched.log`,
  `…103926Z_workspace-copy-table-check.log`) record their commands and
  output. The commands were composed in the session; they are in the records
  and in no script of the repository.
- **Manual browser check of task 4.4, first run: RED.** Made on 2026-10-06
  by the maker session with the human's go-ahead, at `9c30af7` with the
  uncommitted slice, against `next dev` on port 3100 and live Crossref, with
  the DOIs `10.1038/nature12373` and `10.1371/journal.pone.0000308`.
  `…105522Z_workspace-manual-browser-check.log`: 97 checks, 3 unexpected, all
  three the same: after copying the whole list the Windows system clipboard
  held CR LF between the references, where the spec then said "exactly one
  line feed" of what "the clipboard holds". A probe in the same record shows
  that the application passed one LF and that this Chrome on Windows stores
  LF as CR LF by itself. The record is kept as it is. An earlier record,
  `…105455Z_workspace-manual-browser-check.log`, is a run in which the
  throwaway driver crashed on a screenshot before the first step; it shows a
  fault of the driver, not of the application, and is kept as history.
- **The RED run exposed an ambiguity at the boundary between the spec and
  the platform, not a defect.** The human accepted it as a specification
  clarification on 2026-10-06 (see Human disposition of the manual browser
  check): the contract governs the text passed to the clipboard API. AS-12
  and the `bibliography-copy` requirement and scenarios were revised; no
  product code and no test changed.
- **Manual browser check, repeat: PASS.**
  `…110108Z_workspace-manual-browser-check-repeat.log`, 2026-10-06, same
  commit, tree, server, browser and DOIs: 112 checks, none unexpected, exit 0.
  It observed the argument the application passes to
  `navigator.clipboard.writeText` (one U+000A between references, no
  carriage return, no trailing line break, four calls in all) and recorded
  separately that the system clipboard then held CR LF. It repeated the whole
  flow: adding by DOI through the real Server Function, duplicate prevention
  with three other spellings, correction of a scalar field and of the year, a
  rejected year, a blocking field emptied and restored, the four gaps one by
  one, reordering, copy-one, copy-all, a warning that does not block copying,
  removal, and an empty list after one reload.
- **What that check is, and is not.** It is a manual check in the sense of
  task 4.4: one pass through the flow in a real browser, not a test of the
  repository. A throwaway script outside the repository drove headless
  Chrome 151 over the DevTools protocol with real mouse and keyboard events;
  no person clicked. Its source is printed in the record. It is not
  deterministic E2E evidence: it depends on live Crossref, and the expected
  references were written by hand from the records of those DOIs as they
  were on 2026-10-05. Clipboard permission was granted through DevTools and
  focus was emulated, so the browser's own permission prompt was not
  exercised. `CROSSREF_CONTACT_EMAIL` was not set, so the check shows that
  nothing the browser received names the variable, a `mailto:` or the
  Crossref address (in the 18 of 49 response bodies the browser still held),
  and does not show what happens to a real value; `app/actions.test.ts`
  covers that with a stubbed one. Before the recorded runs there were two
  unrecorded trial runs of the driver and one of the probe. The two dev
  servers logged 17 calls of the Server Function that day, each one request
  to Crossref without a contact address. The runs named here account for 15
  of them; two calls for `10.1038/nature12373` early in the first server's
  log are not explained by the output of any of those runs. The server logs
  were kept outside the repository and are not evidence.
- **What no record proves.** Every component test runs in jsdom with a fake
  resolver and a stubbed clipboard. The manual check above is the only
  evidence of the page in a real browser, of the real Server Function called
  from the page, of a real clipboard and of a live answer of Crossref, and it
  is one unrepeatable pass in one browser on one platform. The document
  language and title were read from the built page and from that browser.
  Deterministic browser E2E is the later change of HD-4.
- **Clean-tree GREEN at the implementation commit.**
  `…111327Z_workspace-green.log`: `pnpm check` on the clean tree at
  `78a182e`, exit 0, 673 tests; `…111349Z_workspace-spec-check-final.log`:
  the spec check on the same commit, exit 0. The slice was committed by the
  maker session on the human's explicit instruction. Both records are kept
  as history; neither describes the state after the review hardening.
- **Feature review 01** (2026-10-06, `feature-reviewer`, a fresh session,
  read-only, at `78a182e`):
  `evidence/reviews/bibliography-workspace-review-01.md`. Verdict READY, no
  blocking or major defect, nine findings: three minor and six notes, all
  about evidence, test coverage and wording. The human's dispositions are
  appended below the report. Everything before the review was written and
  run by the session that wrote the code and the tests.
- **Review hardening started GREEN; no RED exists for it.** For the accepted
  findings BW-R01-3 and BW-R01-6 the maker session added
  `app/page-shell.test.tsx` (7 tests) and
  `app/_components/workspace-duplicate-refusal.test.tsx` (7 tests). The
  behaviour they pin was already implemented and no product code changed, so
  all 14 passed on their first run and none was ever seen to fail. That is
  what the human's disposition allows; no failure was produced for the
  record. At the human's request one more test was then added to
  `app/_components/workspace-entries.test.tsx`, pinning the line of row 68,
  `DOI: ` followed by the canonical DOI; it too passed on its first run and
  was never seen to fail.
- **Hardening runs.** `…115606Z_workspace-review01-hardening.log`: `pnpm
  check`, exit 0, 18 files, 687 tests, before the test of row 68 was added;
  kept as history. `…120227Z_workspace-review01-hardening-final.log`: `pnpm
  check` with all 15 hardening tests, exit 0, 18 files, 688 tests. Both were
  taken at `78a182e` with the hardening uncommitted; the clean-tree record of
  the hardened commit is task 5.10.
- **Three hashed files changed after their GREEN hashes.** For BW-R01-7 the
  comments that claimed the look-alike characters were written as escapes
  were corrected in `lib/bibliography/__fixtures__/golden.ts`,
  `app/_components/__fixtures__/approved-copy.ts` and
  `app/_components/workspace-entries.test.tsx`; in the first two every
  changed line is a comment, and the literal characters are the same code
  points as before. The third also gained the one test of row 68. So the
  hashes recorded at RED and GREEN no longer match these three files; the
  diff of the hardening commit shows the whole difference, and no test that
  existed at RED was changed in what it asserts.
- **Integration evidence predates the implementation commit** (BW-R01-4,
  acknowledged). The boundary, oracle and tooling records and the three
  browser records name `9c30af7` with a dirty tree. The live browser run is
  not repeated to move its timestamp. The cheap checks are to be repeated on
  the committed state after the hardening is committed (tasks 5.9 and 5.10).
- **Committed-state verification after the review hardening.** The hardening
  was committed as `33871dd` by the maker session on the human's explicit
  instruction. On that commit, with a clean tree, on 2026-10-06:
  `…121910Z_workspace-final-green.log` (`pnpm check`, exit 0, GREEN, 18
  files, 688 tests, type check, lint and production build);
  `…121922Z_workspace-final-spec-check.log` (exit 0);
  `…121934Z_workspace-final-boundaries.log` (the thirteen searches of task
  4.1 with the same results, and the built page of task 3.12: one
  `lang="uk"`, the approved title and description, no `create-next-app`
  text); `…121947Z_workspace-final-oracles-untouched.log` (between `9c30af7`
  and HEAD only `lib/dstu/format-journal-article.ts` differs under the
  oracles and the completed slices, by the word `export`; between `78a182e`
  and HEAD no product file differs; the 179 tests of `lib/dstu/` pass);
  `…121948Z_workspace-final-tooling-untouched.log` (nothing differs). These
  replace nothing: the earlier records stay as history. The live browser
  check was not repeated; its records are those of `9c30af7` with the
  uncommitted slice, and no product file has changed since.
- **Feature review 02** (2026-10-06, `feature-reviewer`, a fresh session,
  read-only, at `6c330e8`):
  `evidence/reviews/bibliography-workspace-review-02.md`. Verdict READY:
  every disposition of review 01 was carried out, the hardening changed no
  product code, oracle, dependency or tooling, and the final GREEN is
  recorded on the clean tree of the hardening commit. One finding of
  severity note, BW-R02-1: the note of task 5.7 said the test of row 68
  expected its line "for a record requested as" the URL form of the DOI,
  while that test builds its record with the canonical DOI and the URL form
  is submitted by a separate test. The human accepted it as a documentation
  correction; the task note was corrected and neither test was changed. The
  disposition is appended below the report.
- **The review process is closed.** Task 4.6 was completed by the human's
  decision on the basis of review 01, its dispositions and the hardening,
  the final committed GREEN and the READY verdict of review 02; task 4.7
  brought `docs/session-notes.md` up to this state. No `pnpm check` is
  recorded after `33871dd`: the commits after it hold only documents, review
  reports and evidence.
- **The entry line `DOI: {doi}`** (BW-R01-8) was not a row of the copy table
  when the slice was written. The human approved it on 2026-10-06 and it is
  now row 68. The tests written with the slice assert only that the DOI is
  shown; the exact line is pinned by the test added after the approval.

## Open Questions

- Which browser test tool is used for E2E and how Crossref is made
  deterministic for it belongs to the later change of HD-4.
- The README and the final product documentation, including the
  `CROSSREF_CONTACT_EMAIL` variable and the session-only list, belong to the
  change that closes the Definition of Done.
