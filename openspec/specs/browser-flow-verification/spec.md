# browser-flow-verification Specification

## Purpose

Verifies the accepted primary flow of the product in a real browser,
deterministically: the production application is driven through its page while
every Crossref request of the server under test is answered from a recorded
response or refused. That fail-closed property is claimed for the Next.js
version and the `next start` process model it was verified against, and not
beyond them.
E… and K… name rows of the human-approved expectation table, and HD-E… name
human decisions, recorded in the design of the change that introduced this
capability.

## Requirements

### Requirement: Dedicated command
The project SHALL provide the command `pnpm e2e`, which makes the ordinary
production build and then verifies the primary flow in a browser against the
application started from that build. `pnpm check` SHALL keep its four stages,
typecheck, lint, tests and build, and SHALL NOT start a browser. [HD-E2,
HD-E16]

#### Scenario: Browser verification is run
- **WHEN** `pnpm e2e` is run with the browser binary installed
- **THEN** the production build is made and the browser tests run against the application started from it
- **AND** the command exits with 0 only when every browser test passed

#### Scenario: Canonical check is unchanged
- **WHEN** `pnpm check` is run
- **THEN** no browser is started and no browser test runs

### Requirement: Application under test is the production application
The browser verification SHALL drive the Next.js production server of the
application, started from the build that `pnpm build` produces, in the
Chromium binary managed by the browser test tool. That build SHALL be made
before the server is started and with no recorded answer loaded. A DOI
submitted in the browser SHALL travel the product's own path: the Server
Function, DOI normalization, DOI resolution, the mapping to a Publication and
DSTU journal formatting. [HD-E1, HD-E3, HD-E13]

#### Scenario: Ordinary build
- **WHEN** `pnpm e2e` makes the production build
- **THEN** the build is the one `pnpm build` makes and no recorded answer is loaded into the process that makes it

#### Scenario: Request made by the product
- **WHEN** `10.1038/nature12373` is submitted in the browser
- **THEN** the request that reaches the Crossref boundary is a `GET` for `https://api.crossref.org/works/10.1038%2Fnature12373`, as DOI resolution specifies

### Requirement: Product files hold nothing for the verification
No file of the product SHALL hold code or configuration that exists only for
the browser verification. The verification SHALL change nothing under `app/`
or `lib/`, and SHALL NOT change `next.config.ts` or the semantics of DOI
resolution. [HD-E3, HD-E10]

#### Scenario: Product files are unchanged
- **WHEN** the browser verification has been added
- **THEN** no file under `app/` or `lib/` and not `next.config.ts` differs from its state before the change

### Requirement: Crossref is answered from recorded responses
In the server started for the browser verification, a request that DOI
resolution makes for a DOI with a recorded answer SHALL be answered with that
answer: the status, the content type and the unmodified body of the file that
`lib/metadata/crossref/__fixtures__/provenance.json` names for the DOI. The
recorded files SHALL be read and never written. No answer SHALL be composed,
edited or derived from formatter output. [HD-E3]

#### Scenario: Recorded journal article
- **WHEN** `10.1038/nature12373` is submitted
- **THEN** the request is answered with status 200 and the body of `nature12373.json`

#### Scenario: Recorded absence
- **WHEN** `10.1234/this-doi-does-not-exist-xyz` is submitted
- **THEN** the request is answered with the status 404 recorded with `not-found-unknown.txt`

#### Scenario: Recorded files stay as they are
- **WHEN** a browser verification run has ended
- **THEN** no file under `lib/metadata/crossref/__fixtures__/` differs from its committed state

### Requirement: Recorded answers live in the serving process only
The recorded answers SHALL be loaded by an option of the Node process that
itself runs the Next.js server under test, not taken from the environment and
not given to a process that starts it, and by no other process. When they
cannot be loaded, that process SHALL fail to start and the run SHALL fail
without submitting a DOI. An application started in any other way SHALL
resolve DOIs exactly as before this capability existed. [HD-E3, HD-E13]

#### Scenario: One process loads the recorded answers
- **WHEN** the server under test has started
- **THEN** exactly one process has loaded the recorded answers, and it is the process that serves the application

#### Scenario: Server command is launched through a shell
- **WHEN** the browser test tool hands the server command to a shell and the server inherits the environment of the caller
- **THEN** the option that loads the recorded answers still belongs to the Node process that runs the server, and exactly one process loads them

#### Scenario: Module of the recorded answers is missing
- **WHEN** the server under test is started and the module that holds the recorded answers does not exist
- **THEN** the server process exits with an error without listening and no browser test runs

#### Scenario: Required configuration is missing
- **WHEN** the server under test is started without the location of the record of the Crossref boundary
- **THEN** the server process exits with an error without listening and no browser test runs

#### Scenario: Application started outside the verification
- **WHEN** the application is started with `pnpm dev` or `pnpm start`, not by the browser verification
- **THEN** a submitted DOI is requested from Crossref as DOI resolution specifies and no recorded answer is used

### Requirement: Unrecorded Crossref requests fail closed
A request to Crossref that has no recorded answer SHALL be refused inside the
server without any network request, so that DOI resolution receives no
answer. No request SHALL reach live Crossref during a browser verification
run. The run SHALL include a canary that submits an unrecorded DOI and fails
unless that request was refused. [HD-E3, HD-E12]

#### Scenario: Canary
- **WHEN** `10.9999/unrecorded.e2e`, which has no recorded answer, is submitted
- **THEN** the page shows the result of row E6: the message of the `provider-unavailable` failure and no entry
- **AND** the record of requests at the Crossref boundary shows that request as refused

#### Scenario: Recorded answers are checked before any DOI is submitted
- **WHEN** any browser test that can submit a DOI runs
- **THEN** before its first submission it confirms from the record of the boundary that the recorded answers were loaded, by exactly one process

#### Scenario: One test selected by a filter
- **WHEN** the primary-flow test is run alone, so that the canary does not run
- **THEN** it makes that confirmation itself before it submits a DOI

#### Scenario: Every request is accounted for
- **WHEN** a browser test has ended
- **THEN** every request to Crossref that the server made during it was either answered from a recorded file or refused

### Requirement: Fail-closed claim is tied to the verified Next.js version
The fail-closed property SHALL be claimed only for the Next.js version
against which the server start, the refusal to start without the recorded
answers and the canary were verified. It SHALL NOT be stated as holding for
every future version. After an upgrade of Next.js that verification SHALL be
run and recorded again before the claim is carried forward. [HD-E20]

#### Scenario: Statement of the claim
- **WHEN** the fail-closed property is described in the design or in the handoff
- **THEN** the description names the Next.js version it was verified against and says that an upgrade requires the verification again

#### Scenario: Next.js is upgraded
- **WHEN** the version of `next` in `package.json` changes
- **THEN** the two refusals to start, the canary and `pnpm e2e` are run and recorded again before the fail-closed property is claimed for the new version

### Requirement: Record of the Crossref boundary
The verification SHALL keep a record of the requests that reach the Crossref
boundary, in a file outside the repository that is new for each run. It SHALL
hold only what the proof needs: that the recorded answers were loaded, and
for each request its method, its URL and whether it was answered or refused.
It SHALL NOT hold request headers or the contact address. It is temporary
test instrumentation and SHALL NOT be kept as repository evidence. [HD-E12,
HD-E23]

#### Scenario: Content of a line
- **WHEN** a request for a recorded DOI has been answered
- **THEN** its line holds the method, the URL and the outcome, and no header value

#### Scenario: Contact address is configured
- **WHEN** a run is made with `CROSSREF_CONTACT_EMAIL` set in the environment
- **THEN** the address appears neither in the record nor in the output of the stub

#### Scenario: Not committed
- **WHEN** a browser verification run has ended
- **THEN** the record lies outside the repository and `git status` shows no file from it

### Requirement: Each run allocates its own record
Each run of `pnpm e2e` SHALL create a new record file of its own under the
temporary folder of the system and SHALL use that file in the test runner, in
its workers and in the server it starts. A location that the caller had set in
`E2E_CROSSREF_RECORD` SHALL NOT be used or written to, and no record SHALL be
written inside the repository. [HD-E12]

#### Scenario: Location pre-set by the caller
- **WHEN** `E2E_CROSSREF_RECORD` names a file before `pnpm e2e` is run
- **THEN** that file is not written to
- **AND** the run uses a new file under the temporary folder of the system and passes

### Requirement: The run starts its own server
The browser verification SHALL start its own application server and SHALL NOT
use a server that is already running. When its port is taken, the run SHALL
fail without submitting a DOI. [HD-E3]

#### Scenario: Port is in use
- **WHEN** another process listens on the port of the browser verification
- **THEN** the run fails and no browser test runs

### Requirement: Primary flow is verified in the browser
The verification SHALL drive, in one browser session and through the controls
of the page, the accepted primary flow: adding a recorded DOI; adding a second
one in another accepted input form; refusal of a duplicate; a metadata
correction and the recomputed reference; reordering; copying; removal. It
SHALL also verify one recorded `not-found` failure. It SHALL NOT repeat the
scenarios of the component tests beyond this flow. [HD-E6, HD-E11, HD-E15]

#### Scenario: Page as it opens
- **WHEN** the page is opened
- **THEN** its document language is `uk`, the list is empty and the control for copying the whole list is disabled

#### Scenario: First entry
- **WHEN** the input of row E1 is submitted on the opened page
- **THEN** the list holds one entry that shows the reference text of row E1 and nothing else
- **AND** the DOI field is empty

#### Scenario: Second entry in another input form
- **WHEN** the input of row E2, a `https://doi.org/` address with upper-case letters, is submitted
- **THEN** the list holds the entry of E1 first and an entry that shows the reference text of row E2 second

#### Scenario: Duplicate is refused
- **WHEN** the input of row E3, the DOI of the first entry in another form and letter case, is submitted
- **THEN** the page says that this publication is already in the list and the list holds the same two entries in the same order
- **AND** no request for that DOI reaches the Crossref boundary

#### Scenario: Correction recomputes the reference
- **WHEN** the correction of row E4, the journal title `PLoS ONE` set to `PLOS ONE`, is saved for the second entry
- **THEN** the second entry shows the reference text of row E4
- **AND** the first entry still shows the reference text of row E1

#### Scenario: Reordering
- **WHEN** the second entry is moved up
- **THEN** the corrected entry is first and the entry of E1 is second

#### Scenario: Removal
- **WHEN** the first entry is removed
- **THEN** the list holds one entry, which shows the reference text of row E1

#### Scenario: Recorded not-found failure
- **WHEN** the input of row E5 is submitted on a newly opened page
- **THEN** the page shows the message of the `not-found` failure, the list is empty and the submitted text stays in the DOI field

### Requirement: Copy is verified at the application boundary
For copying, the verification SHALL assert the value the application passes
to `navigator.clipboard.writeText()`: the reference text exactly for one
reference, and for the whole list the references in the order of the list
joined by exactly one line feed (U+000A), with no carriage return and no line
break after the last. It SHALL NOT assert what the system clipboard holds.
[HD-E7]

#### Scenario: Copy one reference
- **WHEN** the reference of the first entry is copied after the reordering
- **THEN** the value passed to the clipboard is the text of row K1 and the page says that the text was copied

#### Scenario: Copy the whole list
- **WHEN** the whole list is copied after the reordering
- **THEN** the value passed to the clipboard is the text of row K2: the two references in the order of the list with one line feed between them and none after the last

#### Scenario: System clipboard is not read
- **WHEN** the files of the browser tests are inspected
- **THEN** they hold no call that reads the clipboard

### Requirement: Expected values are independent of the product code
Every expected reference text of the browser tests SHALL be a literal written
from the expectation table that the human approved. The browser tests SHALL
NOT obtain a reference text from DSTU journal formatting or from any helper
that computes it, and SHALL NOT import or call the Crossref mapping or any
other product module. Expected messages MAY be read from the approved
Ukrainian copy fixture, which SHALL be used for UI copy only. [HD-E5, HD-E11,
HD-E14]

#### Scenario: No product import
- **WHEN** the files of the browser tests are inspected
- **THEN** they import nothing from `lib/` and nothing from `app/` other than the approved copy fixture

#### Scenario: Reference texts are literals
- **WHEN** the files of the browser tests are inspected
- **THEN** the reference texts of rows E1, E2 and E4 stand in them as literal strings equal to the approved rows, and no code builds them

### Requirement: A difference from an approved expectation goes to the human
An expected value SHALL NOT be changed to make a browser test pass. When the
page shows behaviour that differs from an approved expectation, neither the
product code nor the expectation SHALL be changed before the human has
disposed of the difference. [HD-E5, HD-E17]

#### Scenario: Test disagrees with the product
- **WHEN** a browser test fails because the page shows another reference text than the approved row
- **THEN** the expected value and the product code are left as they are and the difference is brought to the human

### Requirement: No second golden oracle
The expectation table SHALL NOT serve as an oracle for the formatter tests,
and the verification SHALL add no file under `tests/golden/`. The
human-approved oracles `docs/dstu/rules.md` and `tests/golden/` SHALL stay
unchanged. [HD-E5]

#### Scenario: Oracles are unchanged
- **WHEN** the browser verification has been added
- **THEN** `docs/dstu/rules.md` and every file under `tests/golden/` equal their state before the change, and `tests/golden/` holds no new file

### Requirement: What the verification proves is stated
Records of the browser verification SHALL be kept apart from the records of
the live browser check and SHALL be described as showing the behaviour of the
product against Crossref answers recorded on a stated date. They SHALL NOT be
presented as evidence about the current state of live Crossref. The existing
records of the live browser check SHALL stay unchanged. [HD-E3, HD-E4]

#### Scenario: Separate records
- **WHEN** a browser verification run is recorded
- **THEN** the label of its record begins with `e2e-`
- **AND** no record of the live browser check is edited, renamed or removed

#### Scenario: Statement of the limit
- **WHEN** the browser verification is described in the design or in the handoff
- **THEN** the description says that the provider answers were recorded on 2026-10-05 and that nothing is shown about live Crossref
