# Spec Delta

## Purpose

Defines which user input counts as a DOI and the single canonical DOI that
identifies a publication everywhere else in the system.

## ADDED Requirements

### Requirement: Accepted DOI input forms
The system SHALL accept a DOI written as a bare DOI, as a DOI with a `doi:`
prefix, or as an `https://doi.org/` URL, and SHALL produce the same canonical
DOI for all three forms of the same DOI.

#### Scenario: Bare DOI
- **WHEN** the input is `10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: DOI with prefix
- **WHEN** the input is `doi:10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: DOI as resolver URL
- **WHEN** the input is `https://doi.org/10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

### Requirement: Surrounding whitespace and prefix letter case
The system SHALL ignore whitespace surrounding the input and whitespace directly
after the `doi:` prefix, and SHALL match the `doi:` prefix and the
`https://doi.org/` prefix without regard to letter case.

#### Scenario: Surrounding whitespace
- **WHEN** the input is `  10.1038/nature12373  `
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: Space after the prefix
- **WHEN** the input is `doi: 10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: Upper-case prefix
- **WHEN** the input is `DOI:10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: Upper-case resolver URL
- **WHEN** the input is `HTTPS://DOI.ORG/10.1038/nature12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

### Requirement: Canonical DOI is the identity
The canonical DOI SHALL have its Basic Latin letters (A–Z) in lower case and
every other character unchanged. Two DOIs that differ only in the case of Basic
Latin letters SHALL be the same DOI.

#### Scenario: Mixed-case input
- **WHEN** the input is `10.1038/NATURE12373`
- **THEN** the canonical DOI is `10.1038/nature12373`

#### Scenario: Same DOI in two forms
- **WHEN** one input is `https://doi.org/10.1038/Nature12373` and another is `doi:10.1038/nature12373`
- **THEN** both yield the identical canonical DOI

#### Scenario: Letters outside Basic Latin
- **WHEN** the input is `10.1000/ÄBC`
- **THEN** the canonical DOI is `10.1000/Äbc`

### Requirement: Rejection of input that is not a DOI
The system SHALL reject, as an invalid DOI, any input that, after an accepted
prefix is removed, is not `10.` followed by a registrant code of 4 to 9 digits
(optionally with further `.`-separated digit groups), a `/`, and a non-empty
suffix containing no whitespace, no control characters and no unpaired
surrogates. Validation SHALL be structural only.

#### Scenario: Empty input
- **WHEN** the input is empty or only whitespace
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Text that is not a DOI
- **WHEN** the input is `nature thermometry 2013`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Missing suffix
- **WHEN** the input is `10.1038/`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Whitespace inside the DOI
- **WHEN** the input is `10.1038/nature 12373`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: URL of another site
- **WHEN** the input is `https://www.nature.com/articles/nature12373`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Unusual but structurally valid suffix
- **WHEN** the input is `10.1002/(sici)1097-4571(199205)43:4<284::aid-asi3>3.0.co;2-0`
- **THEN** the input is accepted and the canonical DOI equals the input

#### Scenario: Registrant code too short
- **WHEN** the input is `10.123/abc`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Registrant code too long
- **WHEN** the input is `10.1234567890/abc`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Control character in the suffix
- **WHEN** the input is `10.1000/ab`, the control character U+0007, `c`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Registrant code with a further digit group
- **WHEN** the input is `10.1000.10/abc`
- **THEN** the input is accepted and the canonical DOI is `10.1000.10/abc`

#### Scenario: Unpaired surrogate in the suffix
- **WHEN** the input is `10.1000/ab`, the unpaired surrogate U+D800, `cd`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Character outside the Basic Multilingual Plane
- **WHEN** the input is `10.1000/ab`, the character U+1F600, `cd`
- **THEN** the input is accepted and the canonical DOI equals the input

### Requirement: Other input forms are rejected
The system SHALL reject, as an invalid DOI, a DOI written in any form other than
the three accepted ones, including the `http://` scheme, the `dx.doi.org` host
and a resolver URL without a scheme.

#### Scenario: Insecure scheme
- **WHEN** the input is `http://doi.org/10.1038/nature12373`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Legacy resolver host
- **WHEN** the input is `https://dx.doi.org/10.1038/nature12373`
- **THEN** the input is rejected as an invalid DOI

#### Scenario: Resolver URL without a scheme
- **WHEN** the input is `doi.org/10.1038/nature12373`
- **THEN** the input is rejected as an invalid DOI

### Requirement: No repair of the DOI
The system SHALL NOT change a DOI beyond removing an accepted prefix and
converting Basic Latin letters to lower case. In particular it SHALL NOT strip
trailing punctuation, decode percent-encoding or guess at a corrected DOI.

#### Scenario: Trailing full stop is kept
- **WHEN** the input is `10.1000/abc.`
- **THEN** the canonical DOI is `10.1000/abc.`

#### Scenario: Percent-encoding is kept as written
- **WHEN** the input is `https://doi.org/10.1002/%28sici%291097-4571`
- **THEN** the canonical DOI is `10.1002/%28sici%291097-4571`

### Requirement: Normalization is deterministic and offline
The system SHALL derive the canonical DOI, or the rejection, from the input
alone, without any network request, and SHALL give the same result for the same
input every time.

#### Scenario: No network use
- **WHEN** any input is normalized
- **THEN** no request is sent to Crossref or any other service

#### Scenario: Canonical DOI is stable
- **WHEN** a canonical DOI is given as input
- **THEN** the canonical DOI returned is identical to the input
