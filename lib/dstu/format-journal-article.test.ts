// Targeted tests for the requirements of openspec/changes/dstu-journal-formatter/specs/dstu-journal-formatting/spec.md.
// They cover behaviour that the golden oracle (lib/dstu/golden.test.ts) leaves out. Every expected value is written by
// hand from a spec scenario or from docs/dstu/rules.md; none comes from running the formatter. They are verification
// tests, not an approved oracle. Tests marked "(requirement text)" cover the wording of a requirement beyond its scenarios.
import { describe, expect, test } from "vitest";
import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import { formatJournalArticle, type FormatWarning } from "@/lib/dstu/format-journal-article";
import type { Author, Publication, PublicationDates } from "@/lib/publication/publication";

const doi = (value: string) => value as CanonicalDoi;

// A complete record with nothing unusual in it. Each test changes only what it is about.
const base: Publication = {
  doi: doi("10.0000/test.base"),
  title: "Base title",
  subtitle: null,
  authors: [{ kind: "person", family: "Smith", given: "John" }],
  journalTitle: "Test Journal",
  dates: { print: { year: 2020, month: null, day: null }, online: null, published: null, issued: null },
  volume: "5",
  issue: "2",
  pages: "10-20",
  articleNumber: null,
  language: "en",
};

const BASE_TEXT = "Smith, John. Base title // Test Journal. 2020. Т. 5, № 2. С. 10—20. DOI: 10.0000/test.base.";

// The parts of BASE_TEXT around the element under test, written out so that each expectation is a whole reference.
const AFTER_HEADING = "Base title // Test Journal. 2020. Т. 5, № 2. С. 10—20. DOI: 10.0000/test.base.";
const BEFORE_JOURNAL = "Smith, John. Base title // ";
const FROM_YEAR = "2020. Т. 5, № 2. С. 10—20. DOI: 10.0000/test.base.";
const BEFORE_YEAR = "Smith, John. Base title // Test Journal. ";
const AFTER_YEAR = ". Т. 5, № 2. С. 10—20. DOI: 10.0000/test.base.";
const BEFORE_NUMBERS = "Smith, John. Base title // Test Journal. 2020. ";
const AFTER_NUMBERS = ". С. 10—20. DOI: 10.0000/test.base.";
const BEFORE_LOCATOR = "Smith, John. Base title // Test Journal. 2020. Т. 5, № 2. ";
const AFTER_LOCATOR = ". DOI: 10.0000/test.base.";

const NO_DATES: PublicationDates = { print: null, online: null, published: null, issued: null };
const person = (family: string | null, given: string | null): Author => ({ kind: "person", family, given });
const organisation = (name: string): Author => ({ kind: "organisation", name });

const sorted = (values: readonly string[]) => [...values].sort();

function formatted(publication: Publication) {
  const outcome = formatJournalArticle(publication);
  expect(outcome).toMatchObject({ kind: "formatted" });
  return outcome as Extract<typeof outcome, { kind: "formatted" }>;
}
const textOf = (publication: Publication) => formatted(publication).text;
const warningsOf = (publication: Publication) => sorted(formatted(publication).warnings);
const warnings = (...kinds: FormatWarning[]) => sorted(kinds);

function blocked(publication: Publication) {
  const outcome = formatJournalArticle(publication);
  expect(outcome).toMatchObject({ kind: "cannot-format" });
  return outcome as Extract<typeof outcome, { kind: "cannot-format" }>;
}

describe("Formatting outcome", () => {
  test("the same record formatted twice gives equal outcomes", () => {
    expect(formatJournalArticle(base)).toEqual(formatJournalArticle(base));
  });

  test("the record is not changed", () => {
    const publication: Publication = { ...base, volume: "XII", pages: "45-67" };
    const before = structuredClone(publication);
    formatJournalArticle(publication);
    expect(publication).toEqual(before);
    expect(publication.volume).toBe("XII");
    expect(publication.pages).toBe("45-67");
  });

  test("a formatted reference is plain text", () => {
    const text = textOf(base);
    expect(text).toBe(BASE_TEXT);
    expect(text).not.toMatch(/[<>*_]/);
  });
});

describe("Blocking fields", () => {
  test("no date of any kind blocks on the year only", () => {
    expect(sorted(blocked({ ...base, dates: NO_DATES }).blockedBy)).toEqual(["year"]);
  });

  test("a missing title alone is named alone (requirement text)", () => {
    expect(blocked({ ...base, title: null }).blockedBy).toEqual(["title"]);
  });

  test("a missing journal title alone is named alone (requirement text)", () => {
    expect(blocked({ ...base, journalTitle: null }).blockedBy).toEqual(["journalTitle"]);
  });

  test("a missing title and journal title are both named", () => {
    expect(sorted(blocked({ ...base, title: null, journalTitle: null }).blockedBy)).toEqual(["journalTitle", "title"]);
  });

  test("all three critical fields are named when all are missing (requirement text)", () => {
    expect(sorted(blocked({ ...base, title: null, journalTitle: null, dates: NO_DATES }).blockedBy)).toEqual([
      "journalTitle",
      "title",
      "year",
    ]);
  });

  test("missing optional fields do not block", () => {
    const publication: Publication = {
      ...base,
      authors: [],
      volume: null,
      issue: null,
      pages: null,
      articleNumber: null,
    };
    expect(formatJournalArticle(publication)).toMatchObject({ kind: "formatted" });
  });
});

describe("Missing optional elements are omitted", () => {
  test("a record with only a title, a journal title, a date and a DOI", () => {
    const publication: Publication = {
      ...base,
      subtitle: null,
      authors: [],
      volume: null,
      issue: null,
      pages: null,
      articleNumber: null,
      language: null,
    };
    expect(textOf(publication)).toBe("Base title // Test Journal. 2020. DOI: 10.0000/test.base.");
  });
});

describe("Order of the reference", () => {
  test("a complete record with one author", () => {
    expect(textOf(base)).toBe(BASE_TEXT);
  });

  test("with four authors the statement of responsibility stands between the subtitle and the journal (requirement text)", () => {
    const publication: Publication = {
      ...base,
      subtitle: "a subtitle",
      authors: [person("Brown", "Alice"), person("Lee", "Sora"), person("Novak", "Mila"), person("Okoro", "Ada")],
    };
    expect(textOf(publication)).toBe(
      "Base title : a subtitle / Alice Brown, Sora Lee, Mila Novak, Ada Okoro // Test Journal. " + FROM_YEAR,
    );
  });
});

describe("Year selection", () => {
  const year = (dates: PublicationDates) => textOf({ ...base, dates });

  test("the print year wins although the other dates are earlier", () => {
    expect(
      year({
        print: { year: 2022, month: 1, day: null },
        online: { year: 2021, month: 11, day: 15 },
        published: { year: 2021, month: 11, day: 15 },
        issued: { year: 2021, month: 11, day: 15 },
      }),
    ).toBe(BEFORE_YEAR + "2022" + AFTER_YEAR);
  });

  test("without a print date the issued year is used", () => {
    expect(
      year({
        print: null,
        online: { year: 2020, month: 1, day: 10 },
        published: { year: 2020, month: 1, day: 10 },
        issued: { year: 2019, month: 12, day: null },
      }),
    ).toBe(BEFORE_YEAR + "2019" + AFTER_YEAR);
  });

  test("without print and issued dates the published year is used", () => {
    expect(
      year({
        print: null,
        online: { year: 2022, month: 12, day: 20 },
        published: { year: 2023, month: 2, day: null },
        issued: null,
      }),
    ).toBe(BEFORE_YEAR + "2023" + AFTER_YEAR);
  });

  test("the online year is the last source", () => {
    expect(year({ ...NO_DATES, online: { year: 2024, month: 5, day: 2 } })).toBe(BEFORE_YEAR + "2024" + AFTER_YEAR);
  });

  test("month and day are not printed (requirement text)", () => {
    expect(year({ ...NO_DATES, print: { year: 2020, month: 8, day: 31 } })).toBe(BASE_TEXT);
  });
});

describe("DOI note and end of the reference", () => {
  test("an ordinary DOI is followed by one full stop", () => {
    expect(textOf(base).endsWith(". С. 10—20. DOI: 10.0000/test.base.")).toBe(true);
  });

  test("a DOI that ends in a full stop gets no second one and raises no warning", () => {
    const publication: Publication = { ...base, doi: doi("10.0000/test.dot.") };
    expect(textOf(publication)).toBe(BEFORE_LOCATOR + "С. 10—20. DOI: 10.0000/test.dot.");
    expect(warningsOf(publication)).toEqual([]);
  });

  test("no address, date of access or material designation is printed", () => {
    expect(textOf(base)).not.toMatch(/https?:|URL|Режим доступу|дата звернення|Електронний ресурс/i);
  });
});

describe("Qualifying Roman numeral and numbers in volume and issue", () => {
  // [supplied value, the same value after normalisation, or null when it is printed exactly as supplied]
  const values: [string, string | null][] = [
    // Qualifying Roman numeral
    ["II", "2"],
    ["IV", "4"],
    ["XII", "12"],
    ["XX", "20"],
    ["XL", "40"],
    ["MCMXCIV", "1994"],
    ["C", null],
    ["V", null],
    ["X", null],
    ["iv", null],
    ["IIII", null],
    ["VX", null],
    ["IC", null],
    ["XXXX", null],
    ["IIV", null],
    // Numbers in volume and issue
    ["12", "12"],
    ["1-3", "1/3"],
    ["1–3", "1/3"],
    ["1—3", "1/3"],
    ["1/3", "1/3"],
    ["12 - 13", "12/13"],
    ["1 / 3", "1/3"],
    ["II-3", "2/3"],
    ["3 – IV", "3/4"],
    ["II/IV", "2/4"],
    ["Suppl IV", null],
    ["Suppl 1", null],
    ["1-2-3", null],
    ["I-II", null],
    ["12 - 13", null],
    ["12-", null],
  ];

  test.each(values)("volume %j", (supplied, normalised) => {
    expect(textOf({ ...base, volume: supplied })).toBe(
      BEFORE_NUMBERS + "Т. " + (normalised ?? supplied) + ", № 2" + AFTER_NUMBERS,
    );
  });

  test.each(values)("issue %j", (supplied, normalised) => {
    const issue = normalised === null ? supplied : "№ " + normalised;
    expect(textOf({ ...base, issue: supplied })).toBe(BEFORE_NUMBERS + "Т. 5, " + issue + AFTER_NUMBERS);
  });
});

describe("Volume", () => {
  test.each(["12-13", "12–13", "12—13", "12/13"])("the combined volume %j", (volume) => {
    expect(textOf({ ...base, volume })).toBe(BEFORE_NUMBERS + "Т. 12/13, № 2" + AFTER_NUMBERS);
  });

  test("a value that is not normalised still takes the designation", () => {
    expect(textOf({ ...base, volume: "Spec. Iss. A" })).toBe(BEFORE_NUMBERS + "Т. Spec. Iss. A, № 2" + AFTER_NUMBERS);
  });
});

describe("Issue", () => {
  test.each(["1 - 3", "1–3", "1—3", "1/3"])("the combined issue %j", (issue) => {
    expect(textOf({ ...base, issue })).toBe(BEFORE_NUMBERS + "Т. 5, № 1/3" + AFTER_NUMBERS);
  });

  test("a Roman-numeral issue is converted and takes the designation", () => {
    expect(textOf({ ...base, issue: "IV" })).toBe(BEFORE_NUMBERS + "Т. 5, № 4" + AFTER_NUMBERS);
  });

  test("an arbitrary issue value is printed without the designation", () => {
    expect(textOf({ ...base, issue: "Suppl 1" })).toBe(BEFORE_NUMBERS + "Т. 5, Suppl 1" + AFTER_NUMBERS);
  });

  test("a single-letter issue is printed without the designation", () => {
    expect(textOf({ ...base, issue: "V" })).toBe(BEFORE_NUMBERS + "Т. 5, V" + AFTER_NUMBERS);
  });
});

describe("Volume and issue zone", () => {
  test("volume and issue", () => {
    expect(textOf({ ...base, volume: "12", issue: "3" })).toBe(BEFORE_NUMBERS + "Т. 12, № 3" + AFTER_NUMBERS);
  });

  test("volume and an arbitrary issue value", () => {
    expect(textOf({ ...base, volume: "XII", issue: "Suppl 1" })).toBe(
      BEFORE_NUMBERS + "Т. 12, Suppl 1" + AFTER_NUMBERS,
    );
  });

  test("volume only", () => {
    expect(textOf({ ...base, volume: "45", issue: null })).toBe(BEFORE_NUMBERS + "Т. 45" + AFTER_NUMBERS);
  });

  test("issue only", () => {
    expect(textOf({ ...base, volume: null, issue: "4" })).toBe(BEFORE_NUMBERS + "№ 4" + AFTER_NUMBERS);
  });

  test("neither: the zone is omitted", () => {
    expect(textOf({ ...base, volume: null, issue: null })).toBe(
      "Smith, John. Base title // Test Journal. 2020. С. 10—20. DOI: 10.0000/test.base.",
    );
  });
});

describe("Pages", () => {
  const locator = (pages: string) => textOf({ ...base, pages });

  test.each(["12-18", "12–18", "12—18"])("the plain range %j takes an em dash", (pages) => {
    expect(locator(pages)).toBe(BEFORE_LOCATOR + "С. 12—18" + AFTER_LOCATOR);
  });

  test.each(["5 - 12", "5 – 12", "5— 12"])("spaces around the separator of %j are dropped", (pages) => {
    expect(locator(pages)).toBe(BEFORE_LOCATOR + "С. 5—12" + AFTER_LOCATOR);
  });

  test("a range with prefixes keeps its en dash", () => {
    expect(locator("S12–S19")).toBe(BEFORE_LOCATOR + "С. S12–S19" + AFTER_LOCATOR);
  });

  test("an electronic locator in the pages is printed as supplied", () => {
    expect(locator("e308")).toBe(BEFORE_LOCATOR + "С. e308" + AFTER_LOCATOR);
  });

  test.each(["7", "12-18, 20", "iv-ix", "12--18", "12-18-24"])(
    "%j is not a plain range and is printed as supplied (requirement text)",
    (pages) => {
      expect(locator(pages)).toBe(BEFORE_LOCATOR + "С. " + pages + AFTER_LOCATOR);
    },
  );

  test("no-break spaces around the separator do not make a plain range (requirement text)", () => {
    // U+00A0 is written by its code point because the character cannot be told from a space on screen.
    const noBreakSpace = String.fromCharCode(0x00a0);
    const pages = "12" + noBreakSpace + "-" + noBreakSpace + "18";
    const text = locator(pages);
    expect(text).toBe(BEFORE_LOCATOR + "С. " + pages + AFTER_LOCATOR);
    expect(text).not.toContain("12—18");
  });
});

describe("Article number", () => {
  test("pages win over the article number", () => {
    const text = textOf({ ...base, pages: "S12–S19", articleNumber: "A7" });
    expect(text).toBe(BEFORE_LOCATOR + "С. S12–S19" + AFTER_LOCATOR);
    expect(text).not.toContain("A7");
  });

  test("without pages the article number is the locator, bare", () => {
    expect(textOf({ ...base, pages: null, articleNumber: "e0457" })).toBe(BEFORE_LOCATOR + "e0457" + AFTER_LOCATOR);
  });

  test("without pages and article number the locator zone is omitted", () => {
    expect(textOf({ ...base, pages: null, articleNumber: null })).toBe(
      "Smith, John. Base title // Test Journal. 2020. Т. 5, № 2. DOI: 10.0000/test.base.",
    );
  });
});

describe("Heading for one to three authors", () => {
  const heading = (...authors: Author[]) => textOf({ ...base, authors });

  test("one person", () => {
    expect(heading(person("Коваленко", "Олена"))).toBe("Коваленко, Олена. " + AFTER_HEADING);
  });

  test("three persons with initials, and nothing after the title", () => {
    const text = heading(person("Miller", "K. J."), person("Novak", "M."), person("Durand", "J.-P."));
    expect(text).toBe("Miller, K. J.; Novak, M.; Durand, J.-P. " + AFTER_HEADING);
    expect(text).not.toContain(" / ");
  });

  test("organisation and person, in source order", () => {
    expect(heading(organisation("Regional Library Consortium"), person("Shevchuk", "Iryna"))).toBe(
      "Regional Library Consortium; Shevchuk, Iryna. " + AFTER_HEADING,
    );
  });

  test("the spacing of initials is kept as supplied", () => {
    expect(heading(person("Lee", "K.J."), person("Park", "K. J."), person("Smith", "John"))).toBe(
      "Lee, K.J.; Park, K. J.; Smith, John. " + AFTER_HEADING,
    );
  });
});

describe("Incomplete personal name", () => {
  test("a family name only is printed without a comma", () => {
    const publication: Publication = { ...base, authors: [person("Okafor", null)] };
    expect(textOf(publication)).toBe("Okafor. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("incomplete-personal-name"));
  });

  test("a given value only is printed alone", () => {
    const publication: Publication = { ...base, authors: [person(null, "Olena")] };
    expect(textOf(publication)).toBe("Olena. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("incomplete-personal-name"));
  });

  test("the same holds after the slash (requirement text)", () => {
    const publication: Publication = {
      ...base,
      authors: [person("Brown", "Alice"), person("Okafor", null), person(null, "Olena"), person("Lee", "Sora")],
    };
    expect(textOf(publication)).toBe("Base title / Alice Brown, Okafor, Olena, Sora Lee // Test Journal. " + FROM_YEAR);
    expect(warningsOf(publication)).toEqual(warnings("incomplete-personal-name"));
  });
});

describe("Statement of responsibility for four or more authors", () => {
  test("four authors, one of them an organisation", () => {
    const publication: Publication = {
      ...base,
      authors: [
        person("Brown", "Alice"),
        person("Garcia", "L. M."),
        organisation("Open Metadata Working Group"),
        person("Ivanenko", "Petro"),
      ],
    };
    expect(textOf(publication)).toBe(
      "Base title / Alice Brown, L. M. Garcia, Open Metadata Working Group, Petro Ivanenko // Test Journal. " + FROM_YEAR,
    );
  });

  test("an organisation counts toward the limit of three", () => {
    const publication: Publication = {
      ...base,
      authors: [person("Brown", "Alice"), person("Lee", "Sora"), person("Novak", "Mila"), organisation("Data Group")],
    };
    expect(textOf(publication)).toBe(
      "Base title / Alice Brown, Sora Lee, Mila Novak, Data Group // Test Journal. " + FROM_YEAR,
    );
  });

  test("no author is dropped (requirement text)", () => {
    const publication: Publication = {
      ...base,
      authors: [
        person("Brown", "Alice"),
        person("Lee", "Sora"),
        person("Novak", "Mila"),
        person("Okoro", "Ada"),
        person("Petrenko", "Andrii"),
        person("Quinn", "Rory"),
      ],
    };
    expect(textOf(publication)).toBe(
      "Base title / Alice Brown, Sora Lee, Mila Novak, Ada Okoro, Andrii Petrenko, Rory Quinn // Test Journal. " +
        FROM_YEAR,
    );
  });
});

describe("Reference without authors", () => {
  test("begins with the title and has no statement of responsibility", () => {
    expect(textOf({ ...base, authors: [] })).toBe(AFTER_HEADING);
  });
});

describe("Title and subtitle", () => {
  test("a subtitle in lower case follows the title after a spaced colon", () => {
    const publication: Publication = {
      ...base,
      title: "Measuring reuse of open research data",
      subtitle: "a survey of three repositories",
    };
    expect(textOf(publication)).toBe(
      "Smith, John. Measuring reuse of open research data : a survey of three repositories // Test Journal. " + FROM_YEAR,
    );
  });

  test("a subtitle beginning with a capital letter keeps it", () => {
    expect(textOf({ ...base, subtitle: "Lessons from a national pilot" })).toBe(
      "Smith, John. Base title : Lessons from a national pilot // Test Journal. " + FROM_YEAR,
    );
  });

  test("the title is printed exactly as supplied (requirement text)", () => {
    expect(textOf({ ...base, title: "What is OPEN access?" })).toBe(
      "Smith, John. What is OPEN access? // Test Journal. " + FROM_YEAR,
    );
  });
});

describe("Journal title", () => {
  test("a title supplied in an abbreviated form is printed as supplied", () => {
    expect(textOf({ ...base, journalTitle: "Ex. J. Bibliogr. Stud." })).toContain(" // Ex. J. Bibliogr. Stud.");
  });
});

describe("Designations do not depend on language", () => {
  test.each(["en", "uk", "de", null])("language %j", (language) => {
    expect(textOf({ ...base, language })).toBe(BASE_TEXT);
  });
});

describe("Full stop before a zone", () => {
  const journal = (journalTitle: string): Publication => ({ ...base, journalTitle });

  test("a journal title ending in a full stop keeps the zone full stop and warns", () => {
    const publication = journal("Ex. J. Bibliogr. Stud.");
    expect(textOf(publication)).toBe(BEFORE_JOURNAL + "Ex. J. Bibliogr. Stud.. " + FROM_YEAR);
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });

  test.each(["Quo vadis?", "Hooray!"])("after %j the zone full stop follows without a warning", (journalTitle) => {
    const publication = journal(journalTitle);
    expect(textOf(publication)).toBe(BEFORE_JOURNAL + journalTitle + ". " + FROM_YEAR);
    expect(warningsOf(publication)).toEqual([]);
  });

  test.each(["And so on…", "And so on..."])("after the ellipsis of %j no zone full stop is added", (journalTitle) => {
    const publication = journal(journalTitle);
    expect(textOf(publication)).toBe(BEFORE_JOURNAL + journalTitle + " " + FROM_YEAR);
    expect(warningsOf(publication)).toEqual([]);
  });

  test.each(["Odd..", "Odd...."])("the run of full stops in %j is not an ellipsis", (journalTitle) => {
    const publication = journal(journalTitle);
    expect(textOf(publication)).toBe(BEFORE_JOURNAL + journalTitle + ". " + FROM_YEAR);
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });

  test("the rule holds at the other zone boundaries (requirement text)", () => {
    const publication: Publication = { ...base, issue: "Suppl.", pages: "10-20, suppl." };
    expect(textOf(publication)).toBe(
      BEFORE_NUMBERS + "Т. 5, Suppl.. С. 10-20, suppl.. DOI: 10.0000/test.base.",
    );
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });
});

describe("Full stop after the heading", () => {
  const withAuthors = (...authors: Author[]): Publication => ({ ...base, authors });

  test("a full given name is followed by a full stop", () => {
    const publication = withAuthors(person("Коваленко", "Олена"));
    expect(textOf(publication)).toBe("Коваленко, Олена. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual([]);
  });

  test.each([
    ["Smith", "K."],
    ["Smith", "K. J."],
    ["Smith", "K.J."],
    ["Durand", "J.-P."],
    ["Smith", "John K."],
    ["Коваленко", "О. П."],
  ])("the terminal initial of %s, %s gets no second full stop", (family, given) => {
    const publication = withAuthors(person(family, given));
    expect(textOf(publication)).toBe(family + ", " + given + " " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual([]);
  });

  test("initials stored in the family name of a person without a given value are a terminal initial", () => {
    const publication = withAuthors(person("Petrenko O. V.", null));
    expect(textOf(publication)).toBe("Petrenko O. V. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("incomplete-personal-name"));
  });

  test("a given value abbreviated to several letters keeps the heading full stop and warns", () => {
    const publication = withAuthors(person("Petrenko", "Yu."));
    expect(textOf(publication)).toBe("Petrenko, Yu.. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });

  test("an organisation name ending in a full stop keeps the heading full stop and warns", () => {
    const publication = withAuthors(organisation("Acme Inc."));
    expect(textOf(publication)).toBe("Acme Inc.. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });

  test("an organisation name that looks like an initial is not a personal-name initial (requirement text)", () => {
    const publication = withAuthors(organisation("Group K."));
    expect(textOf(publication)).toBe("Group K.. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual(warnings("full-stop-collision"));
  });

  test("only the last author of the heading decides (requirement text)", () => {
    const publication = withAuthors(person("Miller", "K."), person("Smith", "John"));
    expect(textOf(publication)).toBe("Miller, K.; Smith, John. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual([]);
  });

  test("a heading ending in ? or ! keeps the full stop without a warning (requirement text)", () => {
    const publication = withAuthors(organisation("Why Not?"));
    expect(textOf(publication)).toBe("Why Not?. " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual([]);
  });

  test("a heading ending in an ellipsis gets no full stop (requirement text)", () => {
    const publication = withAuthors(organisation("Group…"));
    expect(textOf(publication)).toBe("Group… " + AFTER_HEADING);
    expect(warningsOf(publication)).toEqual([]);
  });
});

describe("Warnings", () => {
  const subtitle = (value: string) => warningsOf({ ...base, subtitle: value });

  test("a subtitle beginning with a capital letter", () => {
    expect(subtitle("Lessons from a national pilot")).toEqual(warnings("subtitle-capitalisation"));
  });

  test("a subtitle beginning with a lower-case letter", () => {
    expect(subtitle("a survey of three repositories")).toEqual([]);
  });

  test.each(["2020 Results", "«Open» data", "Досвід трьох бібліотек"])(
    "the first letter of %j is upper case",
    (value) => {
      expect(subtitle(value)).toEqual(warnings("subtitle-capitalisation"));
    },
  );

  test.each(["2nd edition", "досвід трьох бібліотек"])("the first letter of %j is lower case", (value) => {
    expect(subtitle(value)).toEqual([]);
  });

  test("a subtitle without letters", () => {
    expect(subtitle("2020–2021")).toEqual([]);
  });

  test("several collisions give the warning once", () => {
    const publication: Publication = {
      ...base,
      authors: [organisation("Acme Inc.")],
      journalTitle: "Ex. J. Bibliogr. Stud.",
    };
    expect(formatted(publication).warnings).toEqual(["full-stop-collision"]);
  });

  test("several incomplete names give the warning once (requirement text)", () => {
    const publication: Publication = { ...base, authors: [person("Okafor", null), person(null, "Olena")] };
    expect(formatted(publication).warnings).toEqual(["incomplete-personal-name"]);
  });

  test("the three kinds can be raised together (requirement text)", () => {
    const publication: Publication = {
      ...base,
      subtitle: "Lessons",
      authors: [person("Okafor", null)],
      journalTitle: "Ex. J.",
    };
    expect(warningsOf(publication)).toEqual(
      warnings("subtitle-capitalisation", "incomplete-personal-name", "full-stop-collision"),
    );
  });

  test("no condition holds", () => {
    expect(warningsOf(base)).toEqual([]);
  });

  test("a cannot-format outcome carries no warnings", () => {
    const publication: Publication = {
      ...base,
      subtitle: "Lessons",
      authors: [person("Okafor", null)],
      journalTitle: "Ex. J.",
      dates: NO_DATES,
    };
    expect(formatJournalArticle(publication)).toStrictEqual({ kind: "cannot-format", blockedBy: ["year"] });
  });
});
