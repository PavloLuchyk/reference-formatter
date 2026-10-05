# Design

## Context

See `proposal.md` for motivation. Current state of the repo:

- `lib/publication/publication.ts` defines `Publication`: canonical DOI, title,
  subtitle, authors (`person` with `family` and `given`, or `organisation`
  with `name`), journal title, four source dates, volume, issue, pages,
  article number, language. Every field but the DOI may be `null` or empty.
  The year is not stored; the four dates are.
- `lib/metadata/resolution.ts` shows the house style for outcomes: a
  discriminated union returned as a value, never an exception.
- There is no formatter code and no `lib/dstu/`.
- `docs/dstu/rules.md` (HUMAN-APPROVED FOR MVP) and
  `tests/golden/dstu-journal.ts` (GF01–GF08, HUMAN-APPROVED ORACLE DATA) are
  the oracles. `AGENTS.md` forbids changing either to make tests pass and
  requires formatter tests to consume the approved oracle.
- Verification is `pnpm check`; tests are Vitest in the `node` environment.
  Adding dependencies needs human approval; none is needed here.

## Goals / Non-Goals

**Goals:**

- One pure function from a `Publication` to a formatting outcome, usable from
  any later entry point.
- Every punctuation collision decided in one place, so that the rules of O10,
  O17–O21 and R7 cannot be applied differently at different boundaries.
- Tests whose expected values never come from the formatter.

**Non-Goals:**

- No entry point: no route handler, server action or UI.
- No wording for warnings or blocking fields. They are data; Ukrainian text
  belongs to the workspace slice.
- No location inside a warning (which element collided). The approved oracle
  records kinds only.
- No change to `Publication`, to `missingFields` or to DOI resolution.
- No normalisation of values beyond what the specs name: no trimming, no case
  change, no abbreviation, no initials derived.

## Decisions

### Technical decisions (agent's, within the approved architecture)

**TD-1 Module layout.** A new folder `lib/dstu/` with one exported entry,
`formatJournalArticle(publication)`, and small internal modules for the
serial-number normaliser, the author block and the boundary joiner. Nothing
outside the folder imports its internals. Alternative: put the formatter in
`lib/publication/`. Rejected: the model is style-neutral by its own spec.

**TD-2 Outcome shape.** A discriminated union on `kind`:
`{ kind: "formatted", text, warnings }` or
`{ kind: "cannot-format", blockedBy }`, with warnings
`"subtitle-capitalisation" | "incomplete-personal-name" | "full-stop-collision"`
and blocking fields `"title" | "journalTitle" | "year"`. This is the shape the
human approved in the golden oracle, so a conformance test can compare
structurally. The formatter declares its own types; it does not import from
`tests/`, and the oracle file does not import formatter code. Alternative: the
`ok: true | false` shape of `ResolutionOutcome`. Rejected: it would need an
adapter between the formatter and its approved oracle.

**TD-3 Warnings and blocking fields are sets.** Each warning kind appears at
most once; `blockedBy` holds each missing critical field once. Tests compare
them without regard to order. The formatter still emits a fixed order so that
the outcome is deterministic.

**TD-4 One boundary joiner.** Elements are rendered without the punctuation
that precedes the next element. One function joins them and decides, for each
boundary, whether the full stop is printed and whether a collision warning is
raised. The heading boundary and the terminal full stop after the DOI go
through the same function with their own exceptions (terminal initial, DOI
ending in `.`). Alternative: each element appends its own full stop. Rejected:
the collision rules would be duplicated and could drift.

**TD-5 One number normaliser for volume and issue.** It returns either a
normalised numeric form (a number, or two numbers joined by `/`) or the
supplied text unchanged. The volume prints `Т. ` in both cases; the issue
prints `№ ` only in the first.

**TD-6 Year from an ordered list.** The four dates are looked up in the order
print, issued, published, online; the first present gives the year. `year` is
blocking when none is present.

**TD-7 Tests.** Two kinds, both colocated in `lib/dstu/`:
- a conformance test that imports `tests/golden/dstu-journal.ts` and checks
  every fixture; `tests/golden/` keeps oracle data only;
- targeted tests, one group per requirement of the spec, for the behaviour
  GF01–GF08 do not cover. Their expected values are written by hand from the
  scenarios of the accepted spec and from `docs/dstu/rules.md`. They are
  verification tests, not an approved oracle.

No snapshot tests and no expected value produced by running the formatter.
Targeted tests go through the exported entry with a small complete
`Publication` written in the test file, and assert on the outcome.

**TD-8 RED with assertion failures.** The first step adds the outcome types
and a stub entry that returns a fixed outcome, so that the first failing run
fails on assertions and not on a missing module. The DOI slice recorded a
stub-error-driven RED as a finding; this avoids repeating it.

### Readings for the human's review

The profile is approved and its decisions are closed. Stating testable
behaviour still needed these readings. They are the agent's, they are written
into the spec, and accepting this change accepts them. None reopens a decision.

| # | Reading | Where the profile stands |
|---|---|---|
| RD-1 | The full stop after the heading follows the general rule of a zone full stop, apart from the terminal initial: kept after `?`, `!` and any other `.` (with a warning for `.`), omitted after an ellipsis | O18 and O21 state the initial; the O18 row records that any other `.` keeps both full stops and warns |
| RD-2 | A full stop printed after `?` or `!` raises no warning | R7 retains both signs; O17 prescribes a warning only for a supplied `.` |
| RD-3 | After an ellipsis the zone full stop is omitted and the space stays | O20 |
| RD-4 | Each warning kind is carried at most once, without a location | The approved oracle records kinds only |
| RD-5 | Cannot-format names every missing critical field and carries no warnings | D16; GF06 names one |
| RD-6 | A terminal initial is a letter followed by `.` at the end of the last person's name as rendered in the heading, where the letter starts the name or follows a space, a full stop or a hyphen. Clarified on 2026-10-05 after feature review 01 (finding R01-1, accepted by the human): the first wording said "given value" and so left out a person whose initials stand in the family name, such as `Petrenko O. V.` without a given value | O18 and O21 speak of the final rendered author name. The human confirmed that this is their intended rule; the clarification restates the approved profile and is not a new decision |
| RD-7 | "Canonical" Roman numeral means standard subtractive notation, 2 to 3999: `IIII` and `VX` do not qualify | O15 says canonical, upper case, at least two characters, valid |
| RD-8 | A person with only a given value is printed as that value alone | The approved reading of GF07 covers the family-only case; D5 prints what is present |
| RD-9 | "Ordinary spaces" around a separator are U+0020 only; digits are `0`–`9` | O8, O20 |
| RD-10 | `№` is decided on the normalised value: a number or two numbers joined by `/` | O3, O14 |
| RD-11 | "Letter" and "cased letter" mean any Unicode letter, Cyrillic and Latin alike | O13, O21 |

### Source limitations carried, not resolved

These stay limitations of the approved profile. The code implements the
approved behaviour and does not claim more.

- Provisional rows still used: P21, P22 (title first for four or more
  authors), P23 (comma after the family name in the heading), P25 (one uniform
  name form), P26 (full stop after the heading), P43 (entry under its title
  without authors). The text of ДСТУ ГОСТ 7.80:2007 was not verified (G1).
- Heading authors are separated by `; ` by human convention, although the
  examples of S1 use commas (C12).
- The official corrections to S1 are not available (G11); the em dash of a
  page range is taken from the uncorrected printing by human decision (O8).
- No place of publication can be printed for same-named journals (G10).
- Names are always rendered from the `family` and `given` fields; naming
  conventions that do not fit them are not inferred (C9).

## Risks / Trade-offs

- [A reference can show two full stops, for example after an abbreviated
  journal title or a given value such as `Yu.`] → This is the approved
  behaviour (O17, O18). The collision warning tells the workspace to offer
  manual correction.
- [A two-letter label that happens to be a valid Roman numeral, such as `CD`,
  is converted] → Accepted with O15; the supplied value stays in the
  `Publication`, so the workspace can show it.
- [Targeted tests are written by the same agent that writes the formatter] →
  Their expected values are fixed before the implementation (RED first) and
  are taken from spec scenarios the human accepts; the golden oracle is
  independent; an independent review closes the change.
- [Warnings without a location may be too coarse for the workspace] → The
  kinds are what the oracle approves. Adding a location later extends the
  outcome and does not change the text.
- [An agent edits an oracle to get GREEN] → `AGENTS.md` forbids it; the tasks
  end with a check that both oracle files are byte-identical to their state
  before the change.

## Verification history

Written on 2026-10-05 after the independent review
(`evidence/reviews/dstu-journal-formatter-review.md`). The human accepted its
finding F3 as an evidence limitation. This section says what is durably
recorded and what is not. No evidence was created afterwards to fill a gap: a
check repeated now proves only the current state.

Durably recorded in `evidence/runs/`:

- baseline GREEN at `dc76a2e`: `20261005T185848Z_dstu-formatter-baseline.log`;
- RED: `20261005T190147Z_dstu-formatter-red.log`, 172 tests failed and 179
  passed, exit 1, tree not committed;
- GREEN before the first commit: `20261005T190516Z_dstu-formatter-check.log`,
  tree not committed;
- GREEN on a clean tree at `6de412c`:
  `20261005T192011Z_dstu-formatter-green.log`.

Not durably recorded:

- **The RED state was never a commit.** Tests and implementation were first
  committed together in `6de412c`. Task 3.6 claims that no test file and no
  oracle changed between the RED run and GREEN. That claim rests on SHA-256
  hashes which the maker session took at the RED run and kept only in a
  session scratch file outside the repository; no committed record holds
  them. The review found corroboration, which is not a substitute: the test
  line positions in the RED record match the committed test files, and the
  hook log shows the targeted test file written once, before the first
  implementation write.
- **The stub.** The stub of task 2.1 was overwritten by the implementation
  and is in no commit. Its type check and lint run were not recorded.
- **Tasks 1.1, 4.1, 4.2 and 4.3.** `pnpm spec:check`, the boundary searches,
  `git diff --stat` against the baseline and the search for the provisional
  rows were run interactively by the maker session. Their output was shown
  in that session and was not kept in `evidence/runs/`.
- **Task 2.3.** The task says it notes which tests pass against the stub;
  the note was not written at the time. They were the two invariant tests of
  the requirement Formatting outcome and the test that the oracle holds its
  eight fixture IDs. The RED record shows them only by their absence from
  the failures.
- **Tasks 3.1 to 3.4.** Their step-by-step verification did not hold as
  written, as their task notes say: the targeted tests assert whole
  references and passed together after 3.5.

About the RED run (finding F4, acknowledged by the human, no repair): it was
a genuine assertion-level RED, with no import or module error. The stub
returned a cannot-format outcome, so nearly all of the 164 targeted failures
stopped at the helper's assertion on the outcome kind, before any comparison
of text. The RED run therefore does not show each expected string failing on
its own.

After the review (finding F2, accepted): three targeted regression tests were
added for a missing title alone, a missing journal title alone, and a page
range with no-break spaces. They passed without any change to the formatter.
The run labelled `dstu-formatter-review-followup` in `evidence/runs/` records
that state. Finding F1 was rejected as a formatter defect: a person without
any name part is outside the normalized `Publication` that the formatter
accepts, and the formatter was not changed.

After feature review 01 (`evidence/reviews/dstu-journal-formatter-review-01.md`,
at `82ce571`, dispositions given by the human on 2026-10-05):

- **R01-1, accepted.** The requirement Full stop after the heading and reading
  RD-6 said that a terminal initial ends the person's given value. O18 and O21
  speak of the final rendered author name, and the human confirmed that this
  is their intended rule. The spec and RD-6 were clarified; this restates the
  approved profile and is not a new decision. One regression test was added
  for a person with the family name `Petrenko O. V.` and no given value. It
  failed against the unchanged implementation, by an assertion on the text:
  `20261005T200927Z_dstu-formatter-r01-red.log`, 1 failed and 354 passed, and
  the git status in that record lists no implementation file as changed. Only
  the terminal-initial detection in `lib/dstu/authors.ts` was repaired. GREEN
  after the repair: `20261005T201010Z_dstu-formatter-r01-repair.log`, 355
  tests, tree not committed.
- **R01-2, accepted.** `20261005T192011Z_dstu-formatter-green.log` is the last
  record on a clean tree and predates the tests added after it, so it is
  stale as evidence for the final state. A fresh record on the committed clean
  state replaces it for that purpose once the repair is committed (task 6.4).
  The older record stays as history and is not rewritten.
- **R01-3, accepted as pending process work.** Tasks 4.5 and 4.6 stay open.
- **R01-4, dismissed as a defect.** The human explicitly requested and
  approved the change of the reviewer's definition.

## Open Questions

None that affects the specs or the tasks. How the workspace words and shows
the three warnings and the blocking fields is decided in the workspace slice.
