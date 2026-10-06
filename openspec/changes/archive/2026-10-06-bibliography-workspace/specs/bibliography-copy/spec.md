# Spec Delta

## Purpose

Places references on the system clipboard as plain text, one reference or the
whole list, so that the user can paste them into a document. The contract
governs the text the application passes to the clipboard of the browser; how a
platform then stores that text is outside the product. Fixtures GF01 to
GF08 named in scenarios are those of the human-approved golden oracle
`tests/golden/dstu-journal.ts`; HD… and AS… name decisions and assumptions
recorded in the design of the change that introduced this capability.

## ADDED Requirements

### Requirement: Copying one reference
For an entry that has a reference, the user SHALL be able to copy it. The text
the application passes to the clipboard SHALL be the reference text exactly,
character for character, as plain text, with no number, no line break and no
warning text added. An entry that cannot be formatted SHALL offer no copy.
[AS-11]

#### Scenario: Reference without warnings
- **WHEN** the reference of the entry of fixture GF01 is copied
- **THEN** the text passed to the clipboard is `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. Т. 12, № 3. С. 45—67. DOI: 10.0000/golden.gf01.` and nothing else

#### Scenario: Reference with a warning
- **WHEN** the reference of the entry of fixture GF08 is copied
- **THEN** the text passed to the clipboard is the approved reference text of GF08, with both full stops after `Stud`
- **AND** it holds no warning text

#### Scenario: Entry without a reference
- **WHEN** the list holds the entry of fixture GF06
- **THEN** that entry offers no copy

### Requirement: Copying the whole list
The user SHALL be able to copy the whole list. The text the application
passes to the clipboard SHALL hold the reference of every entry in the order
of the list, joined by exactly one line feed (U+000A) between two references,
with no numbers, no blank lines, no carriage return and no line break after
the last reference. The value passed to the clipboard is the normative output
of this requirement. [HD-2, HD-8, AS-12]

#### Scenario: Two entries
- **WHEN** the list holds the entries of GF01 and GF05 in this order and the whole list is copied
- **THEN** the text passed to the clipboard is the approved reference text of GF01, one line feed, and the approved reference text of GF05

#### Scenario: Order follows the list
- **WHEN** the entry of GF05 is moved above the entry of GF01 and the whole list is copied
- **THEN** the text passed to the clipboard is the reference of GF05, one line feed, and the reference of GF01

#### Scenario: Single entry
- **WHEN** the list holds only the entry of GF01 and the whole list is copied
- **THEN** the text passed to the clipboard is the reference of GF01 with no line feed

#### Scenario: No trailing line break
- **WHEN** the whole list of two or more entries is copied
- **THEN** the text passed to the clipboard ends with the last character of the last reference

#### Scenario: No numbers
- **WHEN** the whole list is copied
- **THEN** no line of the text passed to the clipboard begins with a position number added by the system

#### Scenario: Corrected entry
- **WHEN** an entry has been corrected and the whole list is copied
- **THEN** the text passed to the clipboard holds the reference of the corrected Publication

### Requirement: Platform representation of the line break
After the text has been passed to the clipboard, the operating system or the
clipboard implementation MAY represent the line feed between references with
its platform-native line ending. Such normalization by the platform SHALL NOT
be treated as a defect of the product. [AS-12]

#### Scenario: Clipboard of a platform with another line ending
- **WHEN** the whole list of two entries is copied in a browser on Windows
- **THEN** the text passed to the clipboard has exactly one line feed between the two references
- **AND** the system clipboard may hold a carriage return and a line feed in its place, which is not a defect

### Requirement: Copying the whole list is blocked by an unformatted entry
While at least one entry cannot be formatted, the control for copying the
whole list SHALL stay visible and SHALL be disabled, nothing SHALL be written
to the clipboard, and the system SHALL tell the user in Ukrainian how many
entries must be corrected or removed. The control SHALL also be visible and
disabled while the list is empty. Neither warnings nor gaps in optional
metadata SHALL block copying. [HD-3]

#### Scenario: One entry cannot be formatted
- **WHEN** the list holds the entries of GF01 and GF06
- **THEN** the control for copying the whole list is shown and disabled
- **AND** the page says that one entry must be corrected or removed first

#### Scenario: Two entries cannot be formatted
- **WHEN** the list holds the entry of GF01 and two entries that cannot be formatted
- **THEN** the message gives the number 2

#### Scenario: Entry is corrected
- **WHEN** the list holds the entries of GF01 and GF06 and a year is entered for the entry of GF06
- **THEN** copying the whole list is available and the message is gone

#### Scenario: Entry is removed
- **WHEN** the list holds the entries of GF01 and GF06 and the entry of GF06 is removed
- **THEN** copying the whole list is available and the message is gone

#### Scenario: Empty list
- **WHEN** the list is empty
- **THEN** the control for copying the whole list is shown and disabled
- **AND** no message about entries to correct is shown

#### Scenario: Warnings only
- **WHEN** the list holds the entries of GF03 and GF08, each with a warning
- **THEN** copying the whole list is available

#### Scenario: One reference can still be copied
- **WHEN** the list holds the entries of GF01 and GF06
- **THEN** the reference of the entry of GF01 can be copied

### Requirement: Copy is confirmed
After text has been written to the clipboard, the system SHALL confirm in
Ukrainian that it was copied. Copying SHALL NOT change the list, its entries
or their order.

#### Scenario: Confirmation
- **WHEN** a reference is copied and the clipboard accepts the text
- **THEN** the page says that the text was copied

#### Scenario: List is unchanged
- **WHEN** the whole list is copied
- **THEN** the list holds the same entries in the same order as before

### Requirement: Clipboard failure is reported
When the clipboard cannot be written, because it is unavailable or refuses
the text, the system SHALL tell the user in Ukrainian that copying failed and
SHALL NOT confirm a copy. The reference text SHALL remain on the page as text
the user can select. The system SHALL NOT try another way of copying.

#### Scenario: Clipboard refuses the text
- **WHEN** a reference is copied and the clipboard refuses the text
- **THEN** the page says that copying failed and does not say that the text was copied

#### Scenario: No clipboard
- **WHEN** a reference is copied in a browser that offers no clipboard to the page
- **THEN** the page says that copying failed

#### Scenario: Reference stays readable
- **WHEN** copying has failed
- **THEN** the reference text is still shown at its entry
