# metadata-correction Specification

## Purpose

Lets the user correct by hand the bibliographic metadata of an entry, so that a
value the source gave wrongly or not at all can be fixed. A correction changes
the entry's Publication; the reference is always recomputed from it. Fixtures
GF01 to GF08 named in scenarios are those of the human-approved golden oracle
`tests/golden/dstu-journal.ts`; HD… and AS… name decisions and assumptions
recorded in the design of the change that introduced this capability.

## Requirements

### Requirement: Correctable fields
The user SHALL be able to correct, for any entry: the title, the subtitle, the
authors, the journal title, the year, the volume, the issue, the pages and the
article number. The DOI SHALL be shown and SHALL NOT be editable. The
language, the four source dates as separate values and the month and day of a
date SHALL NOT be offered for correction; the language SHALL keep its value,
and a date SHALL change only through the year field. [HD-5]

#### Scenario: Fields of a complete record
- **WHEN** the correction of the entry of fixture GF01 is opened
- **THEN** it offers the title, the subtitle, the authors, the journal title, the year, the volume, the issue, the pages and the article number

#### Scenario: DOI cannot be changed
- **WHEN** the correction of an entry is opened
- **THEN** the DOI is shown and cannot be edited

#### Scenario: Language is kept
- **WHEN** any correction of the entry of fixture GF01 is saved
- **THEN** the language of the Publication is still `uk`

#### Scenario: Dates are not offered separately
- **WHEN** the correction of the entry of fixture GF02 is opened
- **THEN** it offers one year field
- **AND** it offers no field for the print, issued, published or online date and none for a month or a day

### Requirement: Current values are shown as stored
The correction SHALL show each value exactly as the Publication holds it, not
as the reference prints it. A missing value SHALL be shown as an empty field,
with no placeholder value standing in for data. [HD-9]

#### Scenario: Pages as stored
- **WHEN** the correction of the entry of fixture GF01 is opened
- **THEN** the pages field holds `45-67`, with the hyphen, and not `45—67`

#### Scenario: Roman-numeral volume as stored
- **WHEN** the correction of the entry of fixture GF03 is opened
- **THEN** the volume field holds `XII`

#### Scenario: Missing values
- **WHEN** the correction of the entry of fixture GF05 is opened
- **THEN** the subtitle, volume, issue, pages and article number fields are empty and the list of authors is empty

### Requirement: Saving and cancelling
Saving a correction SHALL replace the entry's Publication with the corrected
one and SHALL keep the entry's DOI and its position in the list. Cancelling
SHALL leave the Publication unchanged. Saving without having changed any field
SHALL leave the Publication equal to what it was.

#### Scenario: Position is kept
- **WHEN** the list holds A, B and C in this order and a correction of B is saved
- **THEN** the list holds A, B and C in this order

#### Scenario: Cancel
- **WHEN** the title field of an entry is changed and the correction is cancelled
- **THEN** the entry shows the reference it showed before

#### Scenario: Save without a change
- **WHEN** the correction of the entry of fixture GF02 is opened and saved with no field changed
- **THEN** the Publication equals the Publication of GF02, including the month and day of each of its four dates

### Requirement: Reference is recomputed from the Publication
After a correction is saved, the entry SHALL show the outcome of formatting
the corrected Publication: its reference text and warnings, or its blocking
fields. The reference text SHALL NOT be editable as text, and nothing of the
earlier outcome SHALL remain.

#### Scenario: Missing title is supplied
- **WHEN** an entry holds the Publication of fixture GF01 without its title, and the title `Цифрові архіви в університетських бібліотеках` is entered and saved
- **THEN** the entry shows the approved reference text of GF01

#### Scenario: Warning disappears with its cause
- **WHEN** the subtitle of the entry of fixture GF03 is changed to `lessons from a national pilot` and saved
- **THEN** the reference contains `Persistent identifiers in practice : lessons from a national pilot / `
- **AND** the entry shows no subtitle-capitalisation message

#### Scenario: Full-stop collision is corrected
- **WHEN** the journal title of the entry of fixture GF08 is changed to `Example Journal of Bibliographic Studies` and saved
- **THEN** the reference contains ` // Example Journal of Bibliographic Studies. 2021. `
- **AND** the entry shows no full-stop-collision message

#### Scenario: Required value is removed
- **WHEN** the journal title of the entry of fixture GF01 is emptied and saved
- **THEN** the entry shows no reference, says that the reference cannot be formed and names the journal title

### Requirement: Blank values and surrounding whitespace
A field left empty or holding only whitespace SHALL make that value missing.
Whitespace surrounding a typed value SHALL be ignored, and the value SHALL
otherwise be kept exactly as typed. The system SHALL NOT fill in, complete,
abbreviate or repair any value. [HD-6]

#### Scenario: Emptied optional field
- **WHEN** the issue of the entry of fixture GF01 is emptied and saved
- **THEN** the issue of the Publication is missing
- **AND** the reference contains `. 2021. Т. 12. С. 45—67. `

#### Scenario: Only whitespace
- **WHEN** the subtitle field holds three spaces and the correction is saved
- **THEN** the subtitle of the Publication is missing

#### Scenario: Surrounding whitespace
- **WHEN** the journal title is entered as `  Nature  ` with two spaces on each side and saved
- **THEN** the journal title of the Publication is `Nature`

#### Scenario: Value is kept as typed
- **WHEN** the title is entered as `THE ORIGIN  OF SPECIES`, in capitals and with two spaces inside, and saved
- **THEN** the title of the Publication is `THE ORIGIN  OF SPECIES`, with both spaces

### Requirement: Year shown for correction
The year field SHALL show the year that DSTU journal formatting prints for the
Publication: the year of the first date present in the order print, issued,
published, online. When the Publication has no date, the field SHALL be empty.
[HD-1]

#### Scenario: Print date present
- **WHEN** the correction of the entry of fixture GF02 is opened
- **THEN** the year field holds `2022`

#### Scenario: No print date
- **WHEN** the correction of the entry of fixture GF03 is opened
- **THEN** the year field holds `2019`

#### Scenario: No date
- **WHEN** the correction of the entry of fixture GF06 is opened
- **THEN** the year field is empty

#### Scenario: Year shown is the year of the approved reference
- **WHEN** the correction is opened for the entry of each of the fixtures GF01, GF02, GF03, GF04, GF05, GF07 and GF08
- **THEN** the year field holds `2021`, `2022`, `2019`, `2023`, `2024`, `2020` and `2021` respectively, the year printed in the approved reference text of that fixture

### Requirement: Corrected year is stored as the print date
When a correction is saved with a year different from the one shown, the print
date of the Publication SHALL become that year alone, without month or day,
and the issued, published and online dates SHALL stay as they were. When the
year field is unchanged, all four dates SHALL stay as they were, with their
precision. [HD-1]

#### Scenario: Missing year is supplied
- **WHEN** the year `2021` is entered for the entry of fixture GF06 and saved
- **THEN** the print date of the Publication is the year 2021 without a month, and its other three dates are missing
- **AND** the entry shows a reference that contains `Example Journal of Academic Writing. 2021. Т. 3, № 2. `

#### Scenario: Year is changed where there was no print date
- **WHEN** the year of the entry of fixture GF03 is changed from `2019` to `2020` and saved
- **THEN** the print date is the year 2020 without a month
- **AND** the issued date is still December 2019 and the published and online dates are still 10 January 2020
- **AND** the reference contains `Example Review of Scholarly Communication. 2020. `

#### Scenario: Year is changed where there was a print date
- **WHEN** the year of the entry of fixture GF02 is changed from `2022` to `2023` and saved
- **THEN** the print date is the year 2023 without a month
- **AND** the other three dates are still 15 November 2021

#### Scenario: Year is not touched
- **WHEN** the title of the entry of fixture GF02 is changed and the year field is left at `2022`
- **THEN** the print date is still January 2022 and the other three dates are still 15 November 2021

### Requirement: Emptied year
When a correction is saved with the year field emptied, all four dates of the
Publication SHALL become missing, so that the entry cannot be formatted until
a year is entered. [HD-1]

#### Scenario: Year is removed
- **WHEN** the year of the entry of fixture GF02 is emptied and saved
- **THEN** the print, issued, published and online dates of the Publication are all missing
- **AND** the entry says that the reference cannot be formed and names the year

### Requirement: Unchanged year is not validated
When the year field, with surrounding whitespace ignored, equals the year
that was shown when the correction was opened, the system SHALL NOT validate
it and SHALL NOT rewrite any date, whatever that year is. A year of the source
that lies outside the range accepted for a changed year SHALL NOT prevent the
correction of other fields. [HD-7]

#### Scenario: Source year outside the accepted range
- **WHEN** an entry whose only date is an issued date of the year 999 has its title changed, and the year field is left at `999`
- **THEN** the correction is saved and the Publication has the new title
- **AND** its issued date is still the year 999 and its print date is still missing
- **AND** no message is shown at the year field

#### Scenario: Same year typed again
- **WHEN** the year field of that entry is emptied, `999` is typed again and the correction is saved
- **THEN** the correction is saved and no date is changed

#### Scenario: Out-of-range year changed to another value that is not accepted
- **WHEN** the year of that entry is changed from `999` to `99` and the correction is saved
- **THEN** the Publication is unchanged and the message is shown at the year field

#### Scenario: Out-of-range year changed to an accepted value
- **WHEN** the year of that entry is changed from `999` to `1999` and saved
- **THEN** the print date is the year 1999 and the issued date is still the year 999

### Requirement: Changed year value that is not accepted
A changed year SHALL be accepted only when, with surrounding whitespace
ignored, it is exactly four ASCII digits `0` to `9` that denote a number from
1000 to 9999. For any other changed value that is not blank, the system SHALL
NOT save the correction, SHALL keep the correction open with everything the
user typed and SHALL show a Ukrainian message at the year field. This is a
product constraint of the MVP, not a rule of DSTU 8302:2015. [HD-7]

#### Scenario: Letters in the year
- **WHEN** the year `2021a` is entered and the correction is saved
- **THEN** the Publication is unchanged and the correction stays open with `2021a` in the year field
- **AND** a message at the year field says what a year must look like

#### Scenario: Too few digits
- **WHEN** the year `21` is entered and the correction is saved
- **THEN** the Publication is unchanged and the message is shown

#### Scenario: Date instead of a year
- **WHEN** the year `2021-03` is entered and the correction is saved
- **THEN** the Publication is unchanged and the message is shown

#### Scenario: Four digits below the range
- **WHEN** the year `0999` is entered and the correction is saved
- **THEN** the Publication is unchanged and the message is shown

#### Scenario: Five digits
- **WHEN** the year `20211` is entered and the correction is saved
- **THEN** the Publication is unchanged and the message is shown

#### Scenario: Digits that are not ASCII
- **WHEN** the year is entered as the four full-width digits `２０２１` (U+FF12, U+FF10, U+FF12, U+FF11) and the correction is saved
- **THEN** the Publication is unchanged and the message is shown

#### Scenario: Other fields typed with a rejected year
- **WHEN** a new title and the year `21` are entered and the correction is saved
- **THEN** the Publication keeps its former title, and the correction still holds the new title

#### Scenario: Surrounding whitespace
- **WHEN** the year ` 2021 ` with a space on each side is entered for the entry of fixture GF06 and saved
- **THEN** the print date is the year 2021

### Requirement: Correcting the list of authors
The user SHALL be able to change the names of each author, to add an author
at the end of the list, to remove an author, to move an author one position up
or down, and to set an author as a person, with a family name and a given
value, or as an organisation, with one name. An added author SHALL start as a
person without names. The saved Publication SHALL hold the authors in the
order shown.

#### Scenario: Added author starts as a person
- **WHEN** an author is added in the correction of the entry of fixture GF05
- **THEN** the new row is a person with an empty family name and an empty given value

#### Scenario: Given value is changed
- **WHEN** the given value of the author of the entry of fixture GF01 is changed from `Олена` to `О.` and saved
- **THEN** the reference begins `Коваленко, О. Цифрові архіви`

#### Scenario: Author is added
- **WHEN** a person with the family name `Shevchuk` and the given value `Iryna` is added to the entry of fixture GF05 and saved
- **THEN** the reference begins `Shevchuk, Iryna. Editorial note on data availability statements // `

#### Scenario: Author is removed
- **WHEN** the organisation `Regional Library Consortium` is removed from the entry of fixture GF04 and saved
- **THEN** the reference begins `Shevchuk, Iryna. Shared cataloguing after migration // `

#### Scenario: Order is changed
- **WHEN** the person `Shevchuk` is moved above the organisation in the entry of fixture GF04 and saved
- **THEN** the reference begins `Shevchuk, Iryna; Regional Library Consortium. Shared cataloguing after migration // `

#### Scenario: Person is set as an organisation
- **WHEN** the author of the entry of fixture GF07 is set as an organisation with the name `Okafor Research Group` and saved
- **THEN** the reference begins `Okafor Research Group. Supplementary tables`
- **AND** the entry shows no incomplete-personal-name message

#### Scenario: Every author is removed
- **WHEN** the only author of the entry of fixture GF01 is removed and the correction is saved
- **THEN** the Publication has no authors
- **AND** the reference begins `Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. `

### Requirement: Author names in a correction
On saving, whitespace surrounding each author name SHALL be ignored and a
blank name SHALL be missing. A person with only a family name or only a given
value SHALL be kept as such. An author with no name at all SHALL be left out
of the Publication. Only the names of the kind selected for an author SHALL be
saved. No part of a name SHALL be invented, derived or abbreviated. [HD-6,
AS-4, AS-15]

#### Scenario: Empty author row
- **WHEN** an author is added to the entry of fixture GF01, its names are left empty and the correction is saved
- **THEN** the Publication still has exactly one author

#### Scenario: Given value is removed
- **WHEN** the given value of the author of the entry of fixture GF01 is emptied and saved
- **THEN** that author is a person with the family name `Коваленко` whose given value is missing
- **AND** the entry shows the incomplete-personal-name message

#### Scenario: Given name is not abbreviated
- **WHEN** a correction of the entry of fixture GF01 that does not touch its author is saved
- **THEN** the given value of the author is still `Олена`

#### Scenario: Surrounding whitespace in a name
- **WHEN** a family name is entered as ` Shevchuk ` with a space on each side and saved
- **THEN** the family name of that author is `Shevchuk`

#### Scenario: Names of the other kind are not carried over
- **WHEN** the person `Okafor` of the entry of fixture GF07 is set as an organisation, the organisation name is left empty and the correction is saved
- **THEN** the Publication has no authors and no organisation named `Okafor`
