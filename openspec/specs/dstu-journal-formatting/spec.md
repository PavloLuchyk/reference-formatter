# dstu-journal-formatting Specification

## Purpose

Turns a normalized journal-article Publication into a plain-text bibliographic
reference under the human-approved DSTU 8302:2015 journal-article profile
(`docs/dstu/rules.md`), or reports which fields block formatting, together with
the warnings that profile prescribes. IDs in square brackets (D…, O…, R…, N…,
P…, C…) name rows of that profile; rows marked provisional are still
provisional there.

## Requirements

### Requirement: Formatting outcome
Formatting a Publication SHALL yield exactly one outcome: a formatted
reference, which is plain text with a set of warnings that may be empty, or a
cannot-format outcome that names the blocking fields. The outcome SHALL depend
only on the Publication and SHALL be identical whenever the same Publication is
formatted. Formatting SHALL NOT change the Publication. [D7]

#### Scenario: Same record formatted twice
- **WHEN** the same Publication is formatted twice
- **THEN** the two outcomes are equal

#### Scenario: The record is not changed
- **WHEN** a Publication with the volume `XII` and the pages `45-67` is formatted
- **THEN** the Publication still carries the volume `XII` and the pages `45-67`

#### Scenario: Plain text only
- **WHEN** a Publication is formatted
- **THEN** the text carries no markup for italics or any other emphasis

### Requirement: Blocking fields
Formatting SHALL be blocked only when the title, the journal title or the year
is missing. The cannot-format outcome SHALL name every one of these three that
is missing, as `title`, `journalTitle` and `year`. No other missing field SHALL
block formatting. [D16, D11]

#### Scenario: No date of any kind
- **WHEN** a Publication that is otherwise complete has none of its four dates (fixture GF06)
- **THEN** the outcome is cannot-format and names `year` only

#### Scenario: Two critical fields missing
- **WHEN** a Publication has a year but neither a title nor a journal title
- **THEN** the outcome is cannot-format and names `title` and `journalTitle`

#### Scenario: Only optional fields missing
- **WHEN** a Publication has a title, a journal title and a year, and no authors, volume, issue, pages or article number
- **THEN** the outcome is a formatted reference

### Requirement: Missing optional elements are omitted
A missing optional element (authors, subtitle, volume, issue, pages, article
number) SHALL be left out together with its designation and its punctuation.
No placeholder, marker or inferred value SHALL be printed in its place. [D16, P2]

#### Scenario: Minimal record
- **WHEN** a Publication has only a title, a journal title, an online date and a DOI (fixture GF05)
- **THEN** the text is `Editorial note on data availability statements // Example Bulletin of Research Practice. 2024. DOI: 10.0000/golden.gf05.`

### Requirement: Order of the reference
A formatted reference SHALL consist of, in this order: the heading, when there
are one to three authors; the title with its subtitle; the statement of
responsibility, when there are four or more authors; ` // `; the journal
title; then the zones year, volume and issue, locator, and DOI note. Each zone
that is present SHALL be preceded by a full stop and a space. [D1, D7, D15]

#### Scenario: Complete record with one author
- **WHEN** a Publication has one author and every zone (fixture GF01)
- **THEN** the text is `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. Т. 12, № 3. С. 45—67. DOI: 10.0000/golden.gf01.`

### Requirement: Heading for one to three authors
When a Publication has one, two or three authors, the reference SHALL begin
with a heading listing them in source order, separated by `; `. A person SHALL
be written as family name, comma, space, given value, with the given value
exactly as supplied. An organisation SHALL be written with its name exactly as
supplied and SHALL count as an author. These authors SHALL NOT be repeated
after the title. [N7, D2, D4; provisional P23, P25, P26; the `; ` is a human
convention, C12]

#### Scenario: One person
- **WHEN** the only author is the person with family name `Коваленко` and given value `Олена`
- **THEN** the heading is `Коваленко, Олена`

#### Scenario: Three persons with initials
- **WHEN** the authors are `Miller` / `K. J.`, `Novak` / `M.` and `Durand` / `J.-P.` (fixture GF02)
- **THEN** the heading is `Miller, K. J.; Novak, M.; Durand, J.-P.`
- **AND** no statement of responsibility follows the title

#### Scenario: Organisation and person
- **WHEN** the authors are the organisation `Regional Library Consortium` and the person `Shevchuk` / `Iryna` (fixture GF04)
- **THEN** the heading is `Regional Library Consortium; Shevchuk, Iryna`

#### Scenario: Spacing of initials is kept
- **WHEN** one person has the given value `K.J.` and another `K. J.`
- **THEN** the first is printed with `K.J.` and the second with `K. J.`

### Requirement: Incomplete personal name
A person who has only a family name or only a given value SHALL be written
with the part that is present, without a comma. Nothing SHALL be invented for
the missing part, formatting SHALL NOT be blocked, and the outcome SHALL carry
the incomplete-personal-name warning. [D5; reading approved with GF07]

#### Scenario: Family name only
- **WHEN** the only author is a person with the family name `Okafor` and no given value (fixture GF07)
- **THEN** the reference begins `Okafor. Supplementary tables`
- **AND** the outcome carries the incomplete-personal-name warning

#### Scenario: Given value only
- **WHEN** the only author is a person with a given value and no family name
- **THEN** the heading is that given value alone, without a comma
- **AND** the outcome carries the incomplete-personal-name warning

### Requirement: Statement of responsibility for four or more authors
When a Publication has four or more authors, the reference SHALL have no
heading and SHALL begin with the title. All authors SHALL follow the title and
subtitle after ` / `, in source order, separated by `, `: a person as given
value, space, family name; an organisation with its name exactly as supplied.
No author SHALL be dropped and «та ін.» SHALL NOT be used. [D3, D4, O9, R5;
provisional P21, P22]

#### Scenario: Four authors, one an organisation
- **WHEN** the authors are `Brown` / `Alice`, `Garcia` / `L. M.`, the organisation `Open Metadata Working Group` and `Ivanenko` / `Petro` (fixture GF03)
- **THEN** the reference begins with the title
- **AND** the text contains ` / Alice Brown, L. M. Garcia, Open Metadata Working Group, Petro Ivanenko // `

#### Scenario: An organisation counts toward the limit
- **WHEN** a Publication has three persons and one organisation as authors
- **THEN** the reference has no heading

### Requirement: Reference without authors
When a Publication has no authors, the reference SHALL begin with the title
and SHALL have neither a heading nor a statement of responsibility. [D16;
provisional P43]

#### Scenario: No authors
- **WHEN** a Publication has no authors (fixture GF05)
- **THEN** the reference begins `Editorial note on data availability statements // `

### Requirement: Title and subtitle
The title SHALL be printed exactly as supplied. A subtitle, when present,
SHALL follow the title after ` : ` (space, colon, space) and SHALL be printed
exactly as supplied; its letter case SHALL NOT be changed. [D6, R1, O7, O13]

#### Scenario: Subtitle in lower case
- **WHEN** the title is `Measuring reuse of open research data` and the subtitle is `a survey of three repositories` (fixture GF02)
- **THEN** the text contains `Measuring reuse of open research data : a survey of three repositories`

#### Scenario: Subtitle beginning with a capital letter
- **WHEN** the subtitle is `Lessons from a national pilot` (fixture GF03)
- **THEN** the text contains ` : Lessons from a national pilot`

### Requirement: Journal title
The journal title SHALL follow ` // ` (space, two slashes, space) and SHALL be
printed exactly as supplied. It SHALL NOT be abbreviated or expanded. [D7, D8]

#### Scenario: Title supplied in an abbreviated form
- **WHEN** the journal title is `Ex. J. Bibliogr. Stud.` (fixture GF08)
- **THEN** the text contains ` // Ex. J. Bibliogr. Stud.`

### Requirement: Year selection
The year SHALL be taken from the first available date in this order: print,
issued, published, online. It SHALL be printed as the year of that date
exactly as supplied. Month and day SHALL NOT be printed, and the year SHALL
NOT be corrected from the other dates. [D11]

#### Scenario: Print year later than the others
- **WHEN** the print date is in 2022 and the issued, published and online dates are in 2021 (fixture GF02)
- **THEN** the year printed is `2022`

#### Scenario: No print date
- **WHEN** there is no print date, the issued date is in 2019 and the published and online dates are in 2020 (fixture GF03)
- **THEN** the year printed is `2019`

#### Scenario: No print and no issued date
- **WHEN** only the published date, in 2023, and the online date, in 2022, are present (fixture GF04)
- **THEN** the year printed is `2023`

#### Scenario: Online date only
- **WHEN** only the online date, in 2024, is present (fixture GF05)
- **THEN** the year printed is `2024`

### Requirement: Qualifying Roman numeral
A Roman numeral SHALL qualify for conversion to Arabic digits only when the
whole value or component is a canonical upper-case Roman numeral, has at least
two Roman-numeral characters and represents a valid number. Single letters,
lower-case forms and Roman-looking text inside a longer value SHALL NOT be
converted. [O15]

#### Scenario: Numerals that qualify
- **WHEN** a volume or issue value is `II`, `IV`, `XII` or `XX`
- **THEN** it is written as `2`, `4`, `12` or `20`

#### Scenario: Single letters
- **WHEN** a volume or issue value is `C`, `V` or `X`
- **THEN** it is printed exactly as supplied

#### Scenario: Lower case
- **WHEN** a volume or issue value is `iv`
- **THEN** it is printed exactly as supplied

#### Scenario: Not canonical
- **WHEN** a volume or issue value is `IIII` or `VX`
- **THEN** it is printed exactly as supplied

### Requirement: Numbers in volume and issue
A volume or issue value SHALL be normalised only in two cases. A value that is
wholly a qualifying Roman numeral SHALL be written in Arabic digits. A value
that is two components separated by `/`, a hyphen, an en dash or an em dash,
with optional ordinary spaces around the separator, each component being
Arabic digits or a qualifying Roman numeral, SHALL be written as the two
numbers joined by `/`. Every other value SHALL be printed exactly as supplied.
[O11, O12, O14, O16, O20]

#### Scenario: Pair of numbers with any recognised separator
- **WHEN** a value is `1-3`, `1–3`, `1—3` or `1/3`
- **THEN** it is written as `1/3`

#### Scenario: Spaces around the separator
- **WHEN** a value is `12 - 13`
- **THEN** it is written as `12/13`

#### Scenario: Roman component in a pair
- **WHEN** a value is `II-3` or `3 – IV`
- **THEN** it is written as `2/3` or `3/4`

#### Scenario: Roman-looking text inside another value
- **WHEN** a value is `Suppl IV`
- **THEN** it is printed exactly as supplied

### Requirement: Volume
When a volume is present, it SHALL be printed as `Т. ` (Cyrillic capital
letter Te U+0422, full stop, space) followed by the volume value after
normalisation. The designation SHALL precede every volume value, including
one that is printed as supplied. [R2, D9, D13]

#### Scenario: Numeric volume
- **WHEN** the volume is `12`
- **THEN** it is printed as `Т. 12`

#### Scenario: Roman-numeral volume
- **WHEN** the volume is `XII` (fixture GF03)
- **THEN** it is printed as `Т. 12`

#### Scenario: Combined volume
- **WHEN** the volume is `12-13`, `12–13`, `12—13` or `12/13`
- **THEN** it is printed as `Т. 12/13`

#### Scenario: Any other volume value
- **WHEN** the volume is a value that is not normalised
- **THEN** it is printed after `Т. ` exactly as supplied

### Requirement: Issue
When an issue is present and its value after normalisation is a number or a
pair of numbers, it SHALL be printed as `№ ` (numero sign U+2116, space)
followed by that value. Any other issue value SHALL be printed exactly as
supplied, without `№`. [D10, O3, O11, O14]

#### Scenario: Numeric issue
- **WHEN** the issue is `3`
- **THEN** it is printed as `№ 3`

#### Scenario: Combined issue
- **WHEN** the issue is `1 - 3`, `1–3`, `1—3` or `1/3`
- **THEN** it is printed as `№ 1/3`

#### Scenario: Roman-numeral issue
- **WHEN** the issue is `IV`
- **THEN** it is printed as `№ 4`

#### Scenario: Arbitrary issue value
- **WHEN** the issue is `Suppl 1` (fixture GF03)
- **THEN** it is printed as `Suppl 1`, without `№`

#### Scenario: Single-letter issue
- **WHEN** the issue is `V`
- **THEN** it is printed as `V`, without `№`

### Requirement: Volume and issue zone
Volume and issue SHALL form one zone, the volume first, joined by a comma and
a space. When only one of them is present the zone SHALL hold that one alone,
and when neither is present the zone SHALL be omitted. [D9]

#### Scenario: Volume and issue
- **WHEN** the volume is `12` and the issue is `3` (fixture GF01)
- **THEN** the zone is `Т. 12, № 3`

#### Scenario: Volume and an arbitrary issue value
- **WHEN** the volume is `XII` and the issue is `Suppl 1` (fixture GF03)
- **THEN** the zone is `Т. 12, Suppl 1`

#### Scenario: Volume only
- **WHEN** the volume is `45` and there is no issue (fixture GF04)
- **THEN** the zone is `Т. 45`

#### Scenario: Issue only
- **WHEN** the issue is `4` and there is no volume (fixture GF07)
- **THEN** the zone is `№ 4`

### Requirement: Pages
When pages are present, the locator SHALL be `С. ` (Cyrillic capital letter Es
U+0421, full stop, one space) followed by the page value. A plain numeric
range (digits, one hyphen, en dash or em dash, digits, with optional spaces
around the separator) SHALL be written as the two numbers joined by an em dash
U+2014 without spaces. Every other page value SHALL be printed exactly as
supplied. [D12, R4, O6, O8]

#### Scenario: Plain range with any recognised separator
- **WHEN** the pages are `12-18`, `12–18` or `12—18`
- **THEN** the locator is `С. 12—18`

#### Scenario: Spaces around the separator
- **WHEN** the pages are `5 - 12` (fixture GF03)
- **THEN** the locator is `С. 5—12`

#### Scenario: Range with prefixes
- **WHEN** the pages are `S12–S19`, with an en dash (fixture GF07)
- **THEN** the locator is `С. S12–S19`, with the en dash kept

#### Scenario: Electronic locator in the pages
- **WHEN** the pages are `e308`
- **THEN** the locator is `С. e308`

### Requirement: Article number
When pages are present, the article number SHALL NOT be printed. When pages
are absent and an article number is present, the locator zone SHALL be the
article number alone, exactly as supplied and with no designation. When both
are absent, the locator zone SHALL be omitted. [D12, O4; reading approved with
GF04]

#### Scenario: Pages and article number
- **WHEN** the pages are `S12–S19` and the article number is `A7` (fixture GF07)
- **THEN** the text contains `С. S12–S19` and does not contain `A7`

#### Scenario: Article number only
- **WHEN** there are no pages and the article number is `e0457` (fixture GF04)
- **THEN** the text contains `. Т. 45. e0457. DOI: `

### Requirement: DOI note and end of the reference
The last zone SHALL be `DOI: ` followed by the canonical DOI exactly as
stored. The reference SHALL end with one full stop after the DOI, except that
no full stop is added when the DOI itself ends in a full stop. No address,
date of access, access-mode words or material designation SHALL be printed.
[D14, R6, O10, O19]

#### Scenario: Ordinary DOI
- **WHEN** the DOI is `10.0000/golden.gf01`
- **THEN** the reference ends `. DOI: 10.0000/golden.gf01.`

#### Scenario: DOI that ends in a full stop
- **WHEN** the DOI is `10.0000/golden.gf08.` (fixture GF08)
- **THEN** the reference ends `. DOI: 10.0000/golden.gf08.` with no second full stop
- **AND** this raises no warning

### Requirement: Designations do not depend on language
The designations `Т.`, `№` and `С.` SHALL be used in every reference, whatever
the language of the Publication or of its title. [D13]

#### Scenario: English article
- **WHEN** a Publication with the language `en` has a volume, an issue and pages (fixture GF02)
- **THEN** the text contains `Т. 7, № 1/2. С. 101—118`

#### Scenario: Language not known
- **WHEN** a Publication without a language has a volume, an issue and pages
- **THEN** the same designations are used

### Requirement: Full stop before a zone
The full stop that precedes a zone SHALL be printed after the previous element
even when that element ends in `.`, `?` or `!`. It SHALL be omitted only when
the previous element ends in an ellipsis: the character `…` (U+2026) or
exactly three consecutive full stops. When it is printed after an element that
ends in `.`, the outcome SHALL carry the full-stop-collision warning. [O17,
R7, O20]

#### Scenario: Journal title ending in a full stop
- **WHEN** the journal title is `Ex. J. Bibliogr. Stud.` (fixture GF08)
- **THEN** the text contains `Ex. J. Bibliogr. Stud.. 2021`
- **AND** the outcome carries the full-stop-collision warning

#### Scenario: Element ending in a question or exclamation mark
- **WHEN** the journal title ends in `?` or `!`
- **THEN** the zone full stop follows that mark
- **AND** this raises no warning

#### Scenario: Element ending in an ellipsis
- **WHEN** the journal title ends in `…` or in exactly three full stops
- **THEN** no zone full stop is added after it and a space follows
- **AND** this raises no warning

#### Scenario: Runs of full stops that are not an ellipsis
- **WHEN** the journal title ends in `..` or in `....`
- **THEN** the zone full stop is printed after it
- **AND** the outcome carries the full-stop-collision warning

### Requirement: Full stop after the heading
The heading SHALL be followed by a full stop and a space. That full stop SHALL
be omitted when the heading ends in a terminal personal-name initial: its last
author is a person whose name as rendered in the heading ends in a letter
followed by `.`, where the letter starts the name or follows a space, a full
stop or a hyphen. This holds wherever the initials are stored, in the given
value or in the family name. In every other case the rule for the full stop
before a zone SHALL apply to the heading as well. [O18, O21; provisional P26]

#### Scenario: Full given name
- **WHEN** the heading is `Коваленко, Олена` (fixture GF01)
- **THEN** it is followed by `. ` and the title

#### Scenario: Terminal initial
- **WHEN** the heading is `Smith, K.`, `Smith, K. J.`, `Smith, K.J.` or `Durand, J.-P.`
- **THEN** it is followed by a space and the title, with no second full stop
- **AND** this raises no warning

#### Scenario: Initials stored in the family name
- **WHEN** the last author of the heading is a person with the family name `Petrenko O. V.` and no given value
- **THEN** the heading `Petrenko O. V.` is followed by a space and the title, with no second full stop
- **AND** the outcome carries the incomplete-personal-name warning
- **AND** this raises no full-stop-collision warning

#### Scenario: Given value abbreviated to several letters
- **WHEN** the last author of the heading is a person with the given value `Yu.`
- **THEN** the heading full stop is printed after it
- **AND** the outcome carries the full-stop-collision warning

#### Scenario: Organisation name ending in a full stop
- **WHEN** the last author of the heading is an organisation whose name ends in `.`
- **THEN** the heading full stop is printed after it
- **AND** the outcome carries the full-stop-collision warning

### Requirement: Warnings
A formatted reference SHALL carry each warning at most once and only when its
condition holds. Subtitle-capitalisation: the first cased letter of the
supplied subtitle is upper case. Incomplete-personal-name: a person lacks the
family name or the given value. Full-stop-collision: a full stop is printed
directly after a supplied value that ends in `.`. A cannot-format outcome
SHALL carry no warnings. [O13, D5, O17]

#### Scenario: Subtitle beginning with a capital letter
- **WHEN** the subtitle is `Lessons from a national pilot` (fixture GF03)
- **THEN** the outcome carries the subtitle-capitalisation warning

#### Scenario: Subtitle beginning with a lower-case letter
- **WHEN** the subtitle is `a survey of three repositories` (fixture GF02)
- **THEN** the outcome carries no subtitle-capitalisation warning

#### Scenario: Subtitle whose first letter comes after other characters
- **WHEN** the subtitle begins with digits or punctuation and its first letter is upper case
- **THEN** the outcome carries the subtitle-capitalisation warning

#### Scenario: Subtitle without letters
- **WHEN** the subtitle contains no cased letter
- **THEN** the outcome carries no subtitle-capitalisation warning

#### Scenario: Several collisions in one reference
- **WHEN** both the heading and the journal title end in a `.` that is followed by a printed full stop
- **THEN** the outcome carries the full-stop-collision warning once

#### Scenario: No condition holds
- **WHEN** a Publication is complete and none of the three conditions holds (fixture GF01)
- **THEN** the set of warnings is empty

### Requirement: Approved golden oracle
For every fixture of the human-approved golden oracle
`tests/golden/dstu-journal.ts`, formatting its Publication SHALL yield exactly
its approved outcome: the same text character for character and the same set
of warnings, or the same blocking fields. The oracle SHALL NOT be changed to
match the formatter.

#### Scenario: Each golden fixture
- **WHEN** the Publication of any of the fixtures GF01 to GF08 is formatted
- **THEN** the outcome equals the approved outcome recorded for that fixture
