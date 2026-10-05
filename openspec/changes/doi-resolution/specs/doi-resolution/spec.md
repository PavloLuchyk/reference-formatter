# Spec Delta

## Purpose

Resolves a DOI to a normalized journal-article Publication using Crossref as the
only metadata source, and reports every way that can fail as a distinct outcome.

## ADDED Requirements

### Requirement: Resolution has exactly one outcome
Resolving a DOI SHALL end in exactly one outcome: a Publication, or one failure
of kind `invalid-input`, `not-found`, `unsupported-type`, `provider-unavailable`
or `invalid-response`. A failure SHALL NOT carry a partial Publication.

#### Scenario: Journal article is resolved
- **WHEN** the DOI `10.1038/nature12373` is resolved and Crossref returns its journal-article record
- **THEN** the outcome is a Publication whose DOI is `10.1038/nature12373`

#### Scenario: Failure carries no publication
- **WHEN** a resolution ends in any failure
- **THEN** the outcome contains the failure kind and no Publication

### Requirement: Invalid input is rejected before lookup
The system SHALL return an `invalid-input` failure for input that DOI
normalization rejects, and SHALL NOT contact Crossref for it.

#### Scenario: Input is not a DOI
- **WHEN** the input `not a doi` is resolved
- **THEN** the outcome is an `invalid-input` failure
- **AND** no request is sent to Crossref

#### Scenario: Input form that is not accepted
- **WHEN** the input `http://dx.doi.org/10.1038/nature12373` is resolved
- **THEN** the outcome is an `invalid-input` failure
- **AND** no request is sent to Crossref

### Requirement: Crossref is the only metadata source
The system SHALL look up the canonical DOI in Crossref and SHALL NOT consult any
other provider, website or model for bibliographic values, including when
Crossref has no record or is unavailable.

#### Scenario: Lookup uses the canonical DOI
- **WHEN** the input `https://doi.org/10.1038/NATURE12373` is resolved
- **THEN** Crossref is asked for `10.1038/nature12373`

#### Scenario: No fallback
- **WHEN** Crossref has no record for a DOI
- **THEN** no other source is queried

### Requirement: Unknown DOI
The system SHALL return a `not-found` failure when Crossref reports that it has
no record for the DOI. Because Crossref answers the same way for a DOI that does
not exist and for a DOI registered with another agency, the failure SHALL NOT
claim that the DOI does not exist.

#### Scenario: DOI that does not exist
- **WHEN** Crossref answers HTTP 404 for `10.1234/this-doi-does-not-exist-xyz`
- **THEN** the outcome is a `not-found` failure

#### Scenario: DOI registered with another agency
- **WHEN** Crossref answers HTTP 404 for the DataCite DOI `10.5281/zenodo.3233118`
- **THEN** the outcome is a `not-found` failure

### Requirement: Only journal articles are resolved
The system SHALL return an `unsupported-type` failure, stating the type Crossref
reported, when the Crossref record is not of type `journal-article`.

#### Scenario: Book
- **WHEN** Crossref returns a record of type `book` for `10.1007/978-3-319-24277-4`
- **THEN** the outcome is an `unsupported-type` failure that states the type `book`

#### Scenario: Record without a type
- **WHEN** Crossref returns a record that has no type
- **THEN** the outcome is an `unsupported-type` failure

### Requirement: Provider unavailability
The system SHALL return a `provider-unavailable` failure when Crossref cannot be
reached, does not answer within 10 seconds, or answers HTTP 429 or any HTTP 5xx.
It SHALL send one request per resolution and SHALL NOT retry automatically.

#### Scenario: Network error
- **WHEN** the request to Crossref fails before any answer arrives
- **THEN** the outcome is a `provider-unavailable` failure

#### Scenario: Timeout
- **WHEN** Crossref has not answered after 10 seconds
- **THEN** the request is abandoned and the outcome is a `provider-unavailable` failure

#### Scenario: Rate limited
- **WHEN** Crossref answers HTTP 429
- **THEN** the outcome is a `provider-unavailable` failure and no second request is sent

#### Scenario: Server error
- **WHEN** Crossref answers HTTP 503
- **THEN** the outcome is a `provider-unavailable` failure

### Requirement: Unusable response
The system SHALL return an `invalid-response` failure when Crossref answers
successfully but the answer is not a usable work record, or when Crossref
answers with an HTTP status this capability does not otherwise define.

#### Scenario: Body is not JSON
- **WHEN** Crossref answers HTTP 200 with a body that is not JSON
- **THEN** the outcome is an `invalid-response` failure

#### Scenario: Body is not a work record
- **WHEN** Crossref answers HTTP 200 with JSON that contains no work record
- **THEN** the outcome is an `invalid-response` failure

#### Scenario: Unexpected status
- **WHEN** Crossref answers HTTP 400
- **THEN** the outcome is an `invalid-response` failure

### Requirement: Publication DOI is the normalized requested DOI
The DOI of a resolved Publication SHALL be the canonical form of the DOI that was
requested, including when the Crossref record states a DOI that differs from it.
The text the user typed SHALL NOT be kept in the Publication.

#### Scenario: Record states the same DOI
- **WHEN** `10.1038/NATURE12373` is resolved and the record states `10.1038/nature12373`
- **THEN** the Publication DOI is `10.1038/nature12373`

#### Scenario: Record states a different DOI
- **WHEN** a DOI is resolved and the record states a different DOI
- **THEN** the Publication DOI is the canonical form of the requested DOI

### Requirement: Field mapping from the Crossref record
The system SHALL fill the Publication from the Crossref record as follows: title
from the first title, subtitle from the first subtitle, journal title from the
first container title, and volume, issue, pages, article number and language
from the fields of the same meaning, each with surrounding whitespace trimmed
and its content otherwise kept as supplied.

#### Scenario: Surrounding whitespace in a field
- **WHEN** the record has page ` 54-58 ` with a space on each side
- **THEN** the Publication has pages `54-58`

#### Scenario: Fully described article
- **WHEN** the record for `10.1038/nature12373` has title `Nanometre-scale thermometry in a living cell`, container title `Nature`, volume `500`, issue `7460`, page `54-58` and language `en`
- **THEN** the Publication has that title, journal title `Nature`, volume `500`, issue `7460`, pages `54-58` and language `en`

#### Scenario: Article identifier supplied as the page
- **WHEN** the record for `10.1371/journal.pone.0000308` has page `e308` and no article number
- **THEN** the Publication has pages `e308` and its article number is missing

#### Scenario: Several container titles
- **WHEN** the record lists more than one container title
- **THEN** the journal title is the first one

### Requirement: Publication dates are preserved from the record
The system SHALL copy the record's print publication, online publication,
published and issued dates into the Publication, each to the date of the same
kind and with the precision supplied. It SHALL NOT select one of them as the
publication year and SHALL NOT fill a missing date from another.

#### Scenario: Print and online dates differ
- **WHEN** the record for `10.1038/nature12373` gives print publication `2013-08` and online publication, published and issued `2013-07-31`
- **THEN** the Publication carries print publication `2013-08` and the other three dates as `2013-07-31`

#### Scenario: No print date
- **WHEN** the record for `10.1371/journal.pone.0000308` gives online publication, published and issued `2007-03-21` and no print publication
- **THEN** the Publication carries those three dates and its print publication date is missing

#### Scenario: No date
- **WHEN** the record supplies none of the four dates
- **THEN** all four dates are missing in the Publication

### Requirement: Title text
The system SHALL remove markup tags and decode character entities in the title,
the subtitle and the journal title, trim whitespace surrounding the text, and
collapse to one space any run of whitespace that the cleaning introduced. It SHALL NOT change
letter case, wording or punctuation, and SHALL leave other whitespace as
supplied. Title and subtitle SHALL stay separate fields.

#### Scenario: Markup in the title
- **WHEN** the record title is `Structure of <i>Escherichia coli</i> ribosomes`
- **THEN** the Publication title is `Structure of Escherichia coli ribosomes`

#### Scenario: Entity in the title
- **WHEN** the record title is `Law &amp; order`
- **THEN** the Publication title is `Law & order`

#### Scenario: Surrounding whitespace
- **WHEN** the record title is `  Deep learning  `
- **THEN** the Publication title is `Deep learning`

#### Scenario: Whitespace introduced by cleaning
- **WHEN** the record title is `Water <i></i> splitting`
- **THEN** the Publication title is `Water splitting`

#### Scenario: Whitespace that was already in the text
- **WHEN** the record title is `Law  and order`, with two spaces and no markup or entities
- **THEN** the Publication title keeps both spaces

#### Scenario: Entity in the journal title
- **WHEN** the record container title is `Science &amp; Society`
- **THEN** the Publication journal title is `Science & Society`

#### Scenario: Plain title is unchanged
- **WHEN** the record title is `Nanometre-scale thermometry in a living cell`
- **THEN** the Publication title is identical to the record title

#### Scenario: Letter case is kept
- **WHEN** the record title is `THE ORIGIN OF SPECIES`
- **THEN** the Publication title is `THE ORIGIN OF SPECIES`

#### Scenario: Subtitle is supplied
- **WHEN** the record has title `Deep learning` and subtitle `A critical appraisal`
- **THEN** the Publication has that title and that subtitle as two separate fields

### Requirement: Author mapping
The system SHALL map each Crossref author entry, in the order given, to a person
when it has a family name or given names, ignoring any group name on that entry,
otherwise to an organisation when it has a usable group name, and SHALL omit
only an entry that has no name at all.
It SHALL NOT invent any part of an author that the record does not supply.

#### Scenario: Authors of a real record
- **WHEN** the record for `10.1038/nature12373` lists eight authors beginning with given `G.`, family `Kucsko`
- **THEN** the Publication has eight authors in the same order, the first a person with family name `Kucsko` and given names `G.`

#### Scenario: Group author
- **WHEN** an author entry has only the name `ATLAS Collaboration`
- **THEN** that author is an organisation named `ATLAS Collaboration`

#### Scenario: Personal name and group name on one entry
- **WHEN** an author entry has family `Kucsko`, given `G.` and also the name `Quantum Sensing Group`
- **THEN** that author is a person with family name `Kucsko` and given names `G.`
- **AND** the group name is not used

#### Scenario: Given names only
- **WHEN** an author entry has given `Madonna` and no family name
- **THEN** that author is a person with given names `Madonna` whose family name is missing

#### Scenario: Family name only
- **WHEN** an author entry has family `Aristotle` and no given names
- **THEN** that author is a person with family name `Aristotle` whose given names are missing

#### Scenario: Entry without any name
- **WHEN** an author entry has no family name, no given names and no group name
- **THEN** that entry is not included in the Publication authors

### Requirement: Author name whitespace
The system SHALL trim whitespace surrounding each author's family name, given
names and group name, SHALL keep the content inside a name as supplied, and
SHALL treat a name that is blank after trimming as not supplied.

#### Scenario: Surrounding whitespace in a name
- **WHEN** an author entry has family ` Kucsko ` with a space on each side
- **THEN** that author's family name is `Kucsko`

#### Scenario: Blank family name
- **WHEN** an author entry has a family name of only whitespace and given `Madonna`
- **THEN** that author is a person with given names `Madonna` whose family name is missing

#### Scenario: Blank personal names with a group name
- **WHEN** an author entry has blank family and given names and the name `ATLAS Collaboration`
- **THEN** that author is an organisation named `ATLAS Collaboration`

#### Scenario: Every name is blank
- **WHEN** an author entry has only blank names
- **THEN** that entry is not included in the Publication authors

### Requirement: Absent metadata does not fail resolution
The system SHALL treat a Crossref value that is absent, an empty list, or blank
as missing in the Publication, and SHALL still resolve successfully when any
bibliographic field other than the DOI is missing.

#### Scenario: Article not yet assigned to an issue
- **WHEN** a journal-article record has no volume, issue or page
- **THEN** the outcome is a Publication whose volume, issue and pages are missing

#### Scenario: Empty subtitle list
- **WHEN** the record gives the subtitle as an empty list
- **THEN** the Publication subtitle is missing

#### Scenario: No title
- **WHEN** a journal-article record has no title
- **THEN** the outcome is a Publication whose title is missing, not a failure

### Requirement: Identification to Crossref
Each request to Crossref SHALL identify the application by name. A contact
address SHALL be sent only when one has been configured; it SHALL NOT be
hard-coded, and resolution SHALL work when none is configured.

#### Scenario: No contact address configured
- **WHEN** a DOI is resolved and no contact address is configured
- **THEN** the request identifies the application and contains no contact address

#### Scenario: Contact address configured
- **WHEN** a DOI is resolved and a contact address is configured
- **THEN** the request identifies the application and includes that address
