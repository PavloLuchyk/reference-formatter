# bibliography-workspace Specification

## Purpose

Holds the user's ordered list of journal-article entries for one browser
session: adding an entry by DOI, refusing duplicates, reporting resolution
failures, removing and reordering entries, and showing for each entry its
reference or what blocks it. Fixtures GF01 to GF08 named in scenarios are those
of the human-approved golden oracle `tests/golden/dstu-journal.ts`; HD… and AS…
name decisions and assumptions recorded in the design of the change that
introduced this capability.

## Requirements

### Requirement: The list lives for one session
The workspace SHALL hold an ordered list of entries, each being one
Publication identified by its canonical DOI. The list SHALL be empty when the
page is opened, SHALL exist only in the memory of that page and SHALL NOT be
kept after the page is reloaded or closed. The page SHALL state this
limitation to the user.

#### Scenario: Page is opened
- **WHEN** the page is opened
- **THEN** the list is empty
- **AND** the page says that the list is empty and how to add the first entry

#### Scenario: Page is reloaded
- **WHEN** the list holds two entries and the page is reloaded
- **THEN** the list is empty

#### Scenario: Limitation is stated
- **WHEN** the page is shown, with or without entries
- **THEN** it says that the list is kept only until the page is reloaded

### Requirement: Adding an entry by DOI
The user SHALL be able to add an entry by submitting one DOI. For input that
DOI normalization accepts and that is not a duplicate, the system SHALL
request DOI resolution and, when the outcome is a Publication, SHALL append
one entry holding that Publication at the end of the list and SHALL clear the
DOI field. Bibliographic values SHALL come from DOI resolution only. [HD-8]

#### Scenario: First entry
- **WHEN** the list is empty and `10.0000/golden.gf01` is submitted and resolves to the Publication of fixture GF01
- **THEN** the list holds one entry
- **AND** that entry shows the approved reference text of GF01

#### Scenario: Later entry goes to the end
- **WHEN** the list holds the entry of GF01 and a DOI that resolves to the Publication of GF05 is submitted
- **THEN** the list holds the entry of GF01 first and the entry of GF05 second

#### Scenario: Accepted input forms
- **WHEN** `https://doi.org/10.1038/NATURE12373` is submitted and resolves
- **THEN** the new entry has the DOI `10.1038/nature12373`

#### Scenario: Field is cleared after success
- **WHEN** a submitted DOI has been added to the list
- **THEN** the DOI field is empty

### Requirement: One DOI at a time
The system SHALL accept one DOI per submission and SHALL NOT split an input
into several DOIs. While a resolution is in progress the system SHALL show
that it is in progress and SHALL NOT accept another submission.

#### Scenario: Two DOIs in one input
- **WHEN** `10.1038/nature12373 10.1371/journal.pone.0000308` is submitted
- **THEN** the input is reported as not being a DOI
- **AND** no entry is added and no request for resolution is made

#### Scenario: Submission while a resolution is in progress
- **WHEN** a DOI has been submitted and its resolution has not ended
- **THEN** the page shows that the lookup is in progress
- **AND** a further submission is not accepted and starts no second resolution

### Requirement: Input that is not a DOI is refused without a request
Input that DOI normalization rejects SHALL be answered with the message of the
`invalid-input` failure without any request for resolution, with the list
unchanged and the submitted text kept in the DOI field. Nothing other than DOI
normalization SHALL decide whether input is a DOI.

#### Scenario: Text that is not a DOI
- **WHEN** `nature thermometry 2013` is submitted
- **THEN** no entry is added and the text stays in the field
- **AND** the message says that the input is not a DOI and names the accepted forms
- **AND** no request for resolution is made

#### Scenario: Input form that DOI normalization does not accept
- **WHEN** `http://dx.doi.org/10.1038/nature12373` is submitted
- **THEN** the same message is shown and no request for resolution is made

#### Scenario: Empty input
- **WHEN** an empty DOI field is submitted
- **THEN** the same message is shown and no request for resolution is made

### Requirement: Duplicate prevention
The system SHALL NOT add an entry whose canonical DOI equals that of an entry
already in the list. Sameness SHALL be the Publication identity of the
publication model, decided from the canonical DOI that DOI normalization gives
for the input, and by no other rule. For a duplicate the system SHALL make no
request for resolution, SHALL leave the list unchanged and SHALL say in
Ukrainian that the publication is already in the list.

#### Scenario: Same DOI submitted again
- **WHEN** the list holds an entry with the DOI `10.1038/nature12373` and `10.1038/nature12373` is submitted
- **THEN** the list still holds exactly one entry
- **AND** the page says that this publication is already in the list

#### Scenario: Same DOI in another form and letter case
- **WHEN** the list holds an entry with the DOI `10.1038/nature12373` and `DOI: 10.1038/NATURE12373` is submitted
- **THEN** no entry is added
- **AND** no request for resolution is made

#### Scenario: DOI that is different under DOI normalization
- **WHEN** the list holds an entry with the DOI `10.1000/abc` and `10.1000/abc.`, with a trailing full stop, is submitted
- **THEN** the input is not treated as a duplicate and a request for its resolution is made

#### Scenario: Corrected entry is still the same publication
- **WHEN** the title of an entry has been corrected and the DOI of that entry is submitted again
- **THEN** no entry is added and the corrected entry is unchanged

#### Scenario: Entry removed and added again
- **WHEN** an entry is removed and its DOI is submitted afterwards
- **THEN** the DOI is resolved and a new entry is added

### Requirement: Resolution failures add nothing
When DOI resolution ends in a failure, the system SHALL leave the list
unchanged, SHALL keep the submitted text in the DOI field and SHALL show a
Ukrainian message specific to the failure kind: `invalid-input`, `not-found`,
`unsupported-type`, `provider-unavailable` or `invalid-response`. A message
SHALL NOT outlive the next submission.

#### Scenario: Resolution reports invalid input
- **WHEN** a request for resolution ends in an `invalid-input` failure
- **THEN** no entry is added and the text stays in the field
- **AND** the message is the one shown for input refused without a request

#### Scenario: Crossref has no record
- **WHEN** a submitted DOI ends in a `not-found` failure
- **THEN** the message says that Crossref has no record for this DOI
- **AND** the message does not say that the DOI does not exist

#### Scenario: Not a journal article
- **WHEN** a submitted DOI ends in an `unsupported-type` failure
- **THEN** the message says that only journal articles are supported

#### Scenario: Crossref is unavailable
- **WHEN** a submitted DOI ends in a `provider-unavailable` failure
- **THEN** the message says that Crossref is unavailable and that the user can try again later

#### Scenario: Unusable answer
- **WHEN** a submitted DOI ends in an `invalid-response` failure
- **THEN** the message says that the answer of Crossref could not be used

#### Scenario: Each kind has its own message
- **WHEN** the five failure kinds are compared
- **THEN** no two of them show the same message

#### Scenario: Message is gone after a later success
- **WHEN** a failure message is shown and a DOI is then added successfully
- **THEN** the failure message is no longer shown

### Requirement: Resolution that could not be requested
When the request for resolution cannot be completed, so that no resolution
outcome arrives, the system SHALL leave the list unchanged, SHALL keep the
submitted text, SHALL end the in-progress state and SHALL show a Ukrainian
message that the request failed. That message SHALL NOT attribute the failure
to Crossref, to the DOI or to the user's connection. [AS-13]

#### Scenario: Connection to the application is lost
- **WHEN** a DOI is submitted and the request for its resolution fails before any outcome arrives
- **THEN** no entry is added and the text stays in the field
- **AND** the page says that the request failed, and a new submission is accepted

### Requirement: Entry shows its reference
For an entry whose Publication can be formatted, the system SHALL show the
reference text exactly as DSTU journal formatting returns it, as plain text.
The workspace SHALL NOT alter, shorten, number or decorate the reference text.

#### Scenario: Complete record
- **WHEN** the list holds the entry of fixture GF01
- **THEN** the entry shows `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. Т. 12, № 3. С. 45—67. DOI: 10.0000/golden.gf01.`

#### Scenario: Doubled full stop is not hidden
- **WHEN** the list holds the entry of fixture GF08
- **THEN** the reference shown contains `Ex. J. Bibliogr. Stud.. 2021`

#### Scenario: No number before the reference
- **WHEN** the list holds several entries
- **THEN** no reference text begins with a position number added by the workspace

### Requirement: Entry shows the formatter's warnings
The system SHALL show every warning carried by an entry's formatting outcome
as a Ukrainian message at that entry: one message for each of subtitle
capitalisation, incomplete personal name and full-stop collision. A warning
SHALL NOT hide or change the reference text. An entry without warnings SHALL
show none.

#### Scenario: Subtitle capitalisation
- **WHEN** the list holds the entry of fixture GF03
- **THEN** the entry shows its reference and the message for the subtitle-capitalisation warning

#### Scenario: Incomplete personal name
- **WHEN** the list holds the entry of fixture GF07
- **THEN** the entry shows its reference and the message for the incomplete-personal-name warning

#### Scenario: Full-stop collision
- **WHEN** the list holds the entry of fixture GF08
- **THEN** the entry shows its reference and the message for the full-stop-collision warning

#### Scenario: No warning
- **WHEN** the list holds the entry of fixture GF01
- **THEN** the entry shows no warning message

#### Scenario: Warnings belong to their entry
- **WHEN** the list holds the entries of GF01 and GF08
- **THEN** the full-stop-collision message is shown at the entry of GF08 only

### Requirement: Entry that cannot be formatted
For an entry whose Publication cannot be formatted, the system SHALL show its
DOI, SHALL state in Ukrainian that the reference cannot be formed, and SHALL
name each blocking field: the title, the journal title, the year. It SHALL NOT
show a partial reference or any placeholder for a missing value. The entry
SHALL stay in the list and SHALL remain correctable, removable and movable.

#### Scenario: Year is missing
- **WHEN** the list holds the entry of fixture GF06
- **THEN** the entry shows the DOI `10.0000/golden.gf06` and says that the reference cannot be formed
- **AND** it names the year and no other field

#### Scenario: Title and journal title are missing
- **WHEN** an entry has a year but neither a title nor a journal title
- **THEN** the entry names the title and the journal title, and not the year

#### Scenario: No partial reference
- **WHEN** the list holds the entry of fixture GF06
- **THEN** the entry shows no reference text and no text standing in for the year

#### Scenario: Entry is kept
- **WHEN** a DOI resolves to a Publication that cannot be formatted
- **THEN** the entry is added to the list like any other

### Requirement: Entry shows gaps in optional metadata
For every entry, whether or not it can be formatted, the system SHALL show at
the entry one compact Ukrainian indication of these gaps, in this order: the
authors, when there are none; the volume, when it is missing; the issue, when
it is missing; the pages or article number, only when both are missing. A
missing subtitle SHALL NOT be reported. An entry with none of these gaps SHALL
show no indication. [HD-9]

#### Scenario: Typical complete article
- **WHEN** the list holds the entry of fixture GF01, which has no subtitle and no article number
- **THEN** the entry shows its reference and no indication of gaps

#### Scenario: Minimal record
- **WHEN** the list holds the entry of fixture GF05
- **THEN** the entry shows `Не вказано в метаданих: автори, том, номер випуску, сторінки або номер статті.`

#### Scenario: Article number without pages
- **WHEN** the list holds the entry of fixture GF04, which has an article number, no pages and no issue
- **THEN** the indication names the issue only

#### Scenario: Pages and article number both present
- **WHEN** the list holds the entry of fixture GF07, which has pages, an article number and no volume
- **THEN** the indication names the volume only

#### Scenario: Missing subtitle is not reported
- **WHEN** the list holds the entries of fixtures GF01, GF04, GF05 and GF07, none of which has a subtitle
- **THEN** no indication names the subtitle

#### Scenario: Entry that cannot be formatted and has a gap
- **WHEN** an entry holds the Publication of fixture GF06 without its volume
- **THEN** the entry names the year as blocking
- **AND** its indication of gaps names the volume only

#### Scenario: Entry that cannot be formatted and has no gap
- **WHEN** the list holds the entry of fixture GF06
- **THEN** the entry names the year as blocking and shows no indication of gaps

#### Scenario: Indication follows a correction
- **WHEN** a volume is entered for the entry of fixture GF07 and saved
- **THEN** the entry shows no indication of gaps

#### Scenario: Visible without opening the correction
- **WHEN** the list holds the entry of fixture GF05 and no correction is open
- **THEN** the indication is shown

#### Scenario: Language and dates are not listed
- **WHEN** the list holds the entry of fixture GF05, whose language is missing
- **THEN** the indication names neither the language nor any date

### Requirement: Indication of gaps makes no claim and changes nothing
The indication of gaps SHALL describe what the available metadata lacks. It
SHALL NOT state or imply that a listed value is required by DSTU 8302:2015,
SHALL NOT change the reference text, SHALL NOT block copying and SHALL NOT
show any value in place of a missing one. [HD-9]

#### Scenario: Reference is unchanged
- **WHEN** the list holds the entry of fixture GF05
- **THEN** the reference shown is the approved reference text of GF05, and the indication is shown apart from it

#### Scenario: Copying is not blocked
- **WHEN** the list holds only the entry of fixture GF05
- **THEN** its reference can be copied and the whole list can be copied

#### Scenario: Wording
- **WHEN** an indication of gaps is shown
- **THEN** it says that the values are not given in the metadata and does not say that they are required

### Requirement: Removing an entry
The user SHALL be able to remove any entry. Removal SHALL delete exactly that
entry at once, without a confirmation step, and SHALL keep the other entries
and their order. [AS-6]

#### Scenario: Entry in the middle
- **WHEN** the list holds the entries A, B and C in this order and B is removed
- **THEN** the list holds A and C in this order

#### Scenario: Only entry
- **WHEN** the list holds one entry and it is removed
- **THEN** the list is empty and the page says so

### Requirement: Reordering entries
The user SHALL be able to move an entry one position up or one position down.
A move SHALL exchange the entry with its neighbour and change nothing else.
Moving up SHALL be unavailable for the first entry and moving down for the
last. The system SHALL NOT sort or reorder entries by itself. [HD-8]

#### Scenario: Move up
- **WHEN** the list holds A, B and C in this order and B is moved up
- **THEN** the list holds B, A and C in this order

#### Scenario: Move down
- **WHEN** the list holds A, B and C in this order and B is moved down
- **THEN** the list holds A, C and B in this order

#### Scenario: Ends of the list
- **WHEN** the list holds A, B and C in this order
- **THEN** moving up is unavailable for A and moving down is unavailable for C

#### Scenario: Single entry
- **WHEN** the list holds one entry
- **THEN** neither move is available for it

#### Scenario: No automatic sorting
- **WHEN** the list holds an entry whose reference begins with `Коваленко` and an entry whose reference begins with `Bondarenko` is added
- **THEN** the new entry is the last one

### Requirement: Ukrainian interface
All text the workspace shows, other than bibliographic values, DOIs and
reference text, SHALL be Ukrainian, and the page SHALL declare Ukrainian as
its language. Every control SHALL have an accessible name, and a control that
acts on one entry SHALL be distinguishable from the same control of another
entry.

#### Scenario: Page language
- **WHEN** the page is served
- **THEN** its document language is `uk`

#### Scenario: Controls of two entries
- **WHEN** the list holds two entries
- **THEN** the remove control of the first entry and that of the second have different accessible names

### Requirement: Product terms
The interface SHALL head the list with «Перелік посилань», SHALL call an item
of the list «запис», and SHALL use «посилання» for a formatted reference, not
as the name of an item that may have none. These are the approved product
terms of the MVP. [HD-10]

#### Scenario: Heading of the list
- **WHEN** the page is shown
- **THEN** the list is headed «Перелік посилань»

#### Scenario: Item of the list
- **WHEN** the list holds two entries
- **THEN** the remove control of the second entry has the accessible name «Вилучити: запис 2»

#### Scenario: Item without a reference
- **WHEN** the list holds the entry of fixture GF06
- **THEN** its controls name it «запис» and the entry says `Не вдалося сформувати посилання. Бракує: рік.`
