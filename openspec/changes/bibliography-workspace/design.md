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
| AS-12 | The line break between references is one line feed, U+000A, and none follows the last reference | CRLF; a trailing line break |
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

**TD-8 Client state.** One `useReducer` in `workspace.tsx` over the pure
operations of TD-2, plus local state for the DOI field, the in-progress flag,
the message and which entry is being corrected. Only the files in
`app/_components/` that need state or events are client components.

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
24 (subtitle) and 29 (article number on its own) are no longer used.

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
  change of HD-4. Until then the primary browser flow has no automated
  evidence, and the session notes say so.
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

## Open Questions

- Which browser test tool is used for E2E and how Crossref is made
  deterministic for it belongs to the later change of HD-4.
- The README and the final product documentation, including the
  `CROSSREF_CONTACT_EMAIL` variable and the session-only list, belong to the
  change that closes the Definition of Done.
