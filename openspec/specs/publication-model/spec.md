# publication-model Specification

## Purpose

Defines the provider-independent journal-article record that citation formatting
and the bibliography workspace consume, including how absent metadata is
represented.

## Requirements

### Requirement: Publication is provider-independent and style-neutral
A Publication SHALL expose only the fields defined in this capability. It SHALL
NOT expose structures or field names of any metadata provider, and its values
SHALL NOT contain punctuation, abbreviations or ordering that belong to a
citation style.

#### Scenario: Record produced from Crossref
- **WHEN** a Publication is produced from a Crossref work record
- **THEN** it exposes only the fields defined in this capability
- **AND** no Crossref-specific field or structure is reachable from it

### Requirement: Publication fields
A Publication SHALL carry the canonical DOI and, each when known: title,
subtitle, authors in order, journal title, source publication dates, volume,
issue, pages, article number and language. The DOI SHALL be the only required
field; every other field SHALL be allowed to be missing.

#### Scenario: Complete record
- **WHEN** every bibliographic value of an article is known
- **THEN** the Publication carries the DOI and all ten other fields

#### Scenario: Only the DOI is known
- **WHEN** no bibliographic value other than the DOI is known
- **THEN** the Publication is still valid, with the DOI present and every other field missing

### Requirement: Canonical DOI is the Publication identity
The canonical DOI SHALL be the identity of a Publication: two Publications with
the same canonical DOI SHALL be the same publication. A Publication SHALL NOT
retain the text the user typed.

#### Scenario: Input in a different form and case
- **WHEN** a Publication is produced for the input ` DOI:10.1038/NATURE12373 `
- **THEN** its DOI is `10.1038/nature12373`
- **AND** the typed text is not reachable from the Publication

#### Scenario: Same publication from two inputs
- **WHEN** Publications are produced for `10.1038/NATURE12373` and for `https://doi.org/10.1038/nature12373`
- **THEN** both have the same identity

### Requirement: Source publication dates are preserved
A Publication SHALL carry the publication dates the source supplies, each kept
separately and each allowed to be missing: print publication, online
publication, published and issued. A date SHALL keep the precision supplied
(year, year and month, or full date). The Publication SHALL NOT contain a single
derived publication year.

#### Scenario: Dates of different precision
- **WHEN** a source gives print publication as August 2013 and online publication as 31 July 2013
- **THEN** the Publication carries print publication `2013-08` and online publication `2013-07-31`

#### Scenario: Year only
- **WHEN** a source gives a date as the year 2016 only
- **THEN** the Publication carries that date as `2016`, without a month or day

#### Scenario: A date kind is not supplied
- **WHEN** a source gives no print publication date
- **THEN** the print publication date is missing and is not filled from another date

### Requirement: Missing metadata is explicit
Every field without a known value SHALL be represented as explicitly missing, in
a way that is distinguishable from any real value, and it SHALL be possible to
tell for every field whether it is missing. The system SHALL NOT substitute a
placeholder, a default or an inferred value for a missing field.

#### Scenario: Missing volume
- **WHEN** the volume of an article is not known
- **THEN** the volume is reported as missing
- **AND** it is not an empty string, a zero or placeholder text

#### Scenario: Blank value
- **WHEN** a source supplies a value that is empty or only whitespace
- **THEN** the field is reported as missing

#### Scenario: No authors
- **WHEN** no author is known
- **THEN** the Publication has no authors and reports the authors as missing
- **AND** no author such as "Anonymous" is added

### Requirement: Author representation
Each author SHALL be explicitly either a person, with a family name, given
names or both, or an organisation, with a single name. Authors SHALL keep the
order of the source. Names SHALL be kept as supplied apart from surrounding
whitespace, and no part of an author that the source did not supply SHALL be
invented.

#### Scenario: Person with given names
- **WHEN** an author is supplied with family name `Piwowar` and given names `Heather A.`
- **THEN** the author is a person with family name `Piwowar` and given names `Heather A.`

#### Scenario: Person without given names
- **WHEN** an author is supplied with a family name and no given names
- **THEN** the author is a person whose given names are missing
- **AND** no initials or given names are added

#### Scenario: Person with only given names
- **WHEN** an author is supplied with given names and no family name
- **THEN** the author is a person whose family name is missing
- **AND** no family name is added

#### Scenario: Organisation
- **WHEN** an author is supplied only as the name of a group or organisation
- **THEN** the author is an organisation with that name

#### Scenario: Order
- **WHEN** a source lists three authors in a given order
- **THEN** the Publication lists the same three authors in the same order
