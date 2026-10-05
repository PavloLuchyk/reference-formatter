// HUMAN-APPROVED ORACLE DATA: golden oracle for the DSTU 8302:2015 journal-article formatter, fixtures GF01–GF08.
// Profile: docs/dstu/rules.md, HUMAN-APPROVED FOR MVP on 2026-10-05 with documented source limitations.
// On 2026-10-05 the human approved the fixture matrix, every Publication input and every expected outcome below.
// Each outcome was derived by hand, segment by segment, from the rule IDs listed with its fixture; no code produced it.
// An expected value is never changed to make a test pass: changing one needs a new human approval.
//
// Limits that stay visible here:
// - `provisionalRules` names the rows of the profile that an outcome depends on and that are still provisional
//   (the heading standard ДСТУ ГОСТ 7.80:2007 was not verified). Approved is not verified.
// - Heading authors are separated by `; ` by human convention (D2d), although the examples of S1 use commas (C12).
//
// Readings approved by the human together with these outcomes; the profile does not state them word for word:
// 1. GF07: a person with a family name only is printed without a comma.
// 2. GF04: the article number is printed bare as its own locator zone, where the pages would otherwise stand.
// 3. GF07: a page value that is not a plain range is still preceded by `С. `.
// 4. GF08: only the full-stop collision after the journal title raises a warning; the DOI convention does not.
// 5. GF06: the blocking field the formatter reports is `year`, although Publication stores the source dates.
// 6. GF07: the incomplete-name warning is part of the formatter outcome; its presentation is specified later.
//
// Non-ASCII formatting characters in the expected text: Cyrillic `Т` U+0422 and `С` U+0421 (not Latin T and C),
// `№` U+2116 and the em dash `—` U+2014. GF07 keeps the supplied en dash U+2013.
//
// Every value is synthetic and written for its scenario: no real article, no Crossref record and no example
// copied from a standard. This file is test-oracle data: it must not import formatter or provider code.
import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import type { Publication } from "@/lib/publication/publication";

export type GoldenWarning = "subtitle-capitalisation" | "full-stop-collision" | "incomplete-personal-name";

export type GoldenExpectation =
  | { readonly kind: "formatted"; readonly text: string; readonly warnings: readonly GoldenWarning[] }
  | { readonly kind: "cannot-format"; readonly blockedBy: readonly ("title" | "journalTitle" | "year")[] };

export type GoldenFixture = {
  readonly id: string;
  readonly name: string;
  // Rule and decision IDs of docs/dstu/rules.md behind the expected outcome.
  readonly rules: readonly string[];
  // The members of `rules` that are still provisional rows of the profile.
  readonly provisionalRules: readonly string[];
  readonly expected: GoldenExpectation;
  readonly publication: Publication;
};

const doi = (value: string) => value as CanonicalDoi;

export const goldenFixtures: readonly GoldenFixture[] = [
  // One person in the heading and every zone present: the baseline shape. Print date only; hyphen in the pages.
  {
    id: "GF01",
    name: "one-author-complete",
    rules: ["D1", "D2a", "D2b", "P23", "P26", "N17", "D7", "D8", "D15", "D11", "R2", "D9b", "D10a", "O3", "D13", "O6", "R4", "O8", "D14b", "R6"],
    provisionalRules: ["P23", "P26"],
    expected: {
      kind: "formatted",
      text: "Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. Т. 12, № 3. С. 45—67. DOI: 10.0000/golden.gf01.",
      warnings: [],
    },
    publication: {
      doi: doi("10.0000/golden.gf01"),
      title: "Цифрові архіви в університетських бібліотеках",
      subtitle: null,
      authors: [{ kind: "person", family: "Коваленко", given: "Олена" }],
      journalTitle: "Умовний науковий вісник",
      dates: {
        print: { year: 2021, month: 3, day: null },
        online: null,
        published: null,
        issued: null,
      },
      volume: "12",
      issue: "3",
      pages: "45-67",
      articleNumber: null,
      language: "uk",
    },
  },

  // Three persons, the heading ends in a hyphenated initial; subtitle in lower case; the print year is later than
  // the other three dates; combined issue with a hyphen; en dash (U+2013) in the pages.
  {
    id: "GF02",
    name: "three-authors-initials-subtitle",
    rules: ["N7", "D2a", "D2b", "D2c", "D2d", "P23", "P26", "O18", "O21", "D6a", "D6c", "O13", "D7", "D8", "D15", "D11", "R2", "D9b", "D10a", "R3", "O11", "O14", "D13", "O6", "R4", "O8", "D14b", "R6"],
    provisionalRules: ["P23", "P26"],
    expected: {
      kind: "formatted",
      text: "Miller, K. J.; Novak, M.; Durand, J.-P. Measuring reuse of open research data : a survey of three repositories // Example Journal of Information Studies. 2022. Т. 7, № 1/2. С. 101—118. DOI: 10.0000/golden.gf02.",
      warnings: [],
    },
    publication: {
      doi: doi("10.0000/golden.gf02"),
      title: "Measuring reuse of open research data",
      subtitle: "a survey of three repositories",
      authors: [
        { kind: "person", family: "Miller", given: "K. J." },
        { kind: "person", family: "Novak", given: "M." },
        { kind: "person", family: "Durand", given: "J.-P." },
      ],
      journalTitle: "Example Journal of Information Studies",
      dates: {
        print: { year: 2022, month: 1, day: null },
        online: { year: 2021, month: 11, day: 15 },
        published: { year: 2021, month: 11, day: 15 },
        issued: { year: 2021, month: 11, day: 15 },
      },
      volume: "7",
      issue: "1-2",
      pages: "101–118",
      articleNumber: null,
      language: "en",
    },
  },

  // Four authors, one of them an organisation; subtitle begins with a capital letter; no print date and the issued
  // year differs from published and online; Roman-numeral volume; arbitrary issue string; spaced hyphen in the pages.
  {
    id: "GF03",
    name: "four-authors-title-first",
    rules: ["D3a", "D4", "P21", "P22", "D6a", "D6c", "R1", "O7", "O13", "O9", "R5", "D7", "D8", "D15", "D11", "R2", "O12", "O15", "D9b", "D10b", "O3", "D13", "O6", "R4", "O8", "D14b", "R6"],
    provisionalRules: ["P21", "P22"],
    expected: {
      kind: "formatted",
      text: "Persistent identifiers in practice : Lessons from a national pilot / Alice Brown, L. M. Garcia, Open Metadata Working Group, Petro Ivanenko // Example Review of Scholarly Communication. 2019. Т. 12, Suppl 1. С. 5—12. DOI: 10.0000/golden.gf03.",
      warnings: ["subtitle-capitalisation"],
    },
    publication: {
      doi: doi("10.0000/golden.gf03"),
      title: "Persistent identifiers in practice",
      subtitle: "Lessons from a national pilot",
      authors: [
        { kind: "person", family: "Brown", given: "Alice" },
        { kind: "person", family: "Garcia", given: "L. M." },
        { kind: "organisation", name: "Open Metadata Working Group" },
        { kind: "person", family: "Ivanenko", given: "Petro" },
      ],
      journalTitle: "Example Review of Scholarly Communication",
      dates: {
        print: null,
        online: { year: 2020, month: 1, day: 10 },
        published: { year: 2020, month: 1, day: 10 },
        issued: { year: 2019, month: 12, day: null },
      },
      volume: "XII",
      issue: "Suppl 1",
      pages: "5 - 12",
      articleNumber: null,
      language: "en",
    },
  },

  // Organisation and person in one heading; no print and no issued date, published year differs from online;
  // volume without an issue; an article number and no pages.
  {
    id: "GF04",
    name: "organisation-in-heading-article-number",
    rules: ["D4", "D2a", "D2b", "D2d", "P23", "P26", "D7", "D8", "D15", "D11", "R2", "D9a", "P2", "D12c", "D14b", "R6"],
    provisionalRules: ["P23", "P26"],
    expected: {
      kind: "formatted",
      text: "Regional Library Consortium; Shevchuk, Iryna. Shared cataloguing after migration // Example Notes on Library Systems. 2023. Т. 45. e0457. DOI: 10.0000/golden.gf04.",
      warnings: [],
    },
    publication: {
      doi: doi("10.0000/golden.gf04"),
      title: "Shared cataloguing after migration",
      subtitle: null,
      authors: [
        { kind: "organisation", name: "Regional Library Consortium" },
        { kind: "person", family: "Shevchuk", given: "Iryna" },
      ],
      journalTitle: "Example Notes on Library Systems",
      dates: {
        print: null,
        online: { year: 2022, month: 12, day: 20 },
        published: { year: 2023, month: 2, day: null },
        issued: null,
      },
      volume: "45",
      issue: null,
      pages: null,
      articleNumber: "e0457",
      language: "en",
    },
  },

  // No authors and only the fields without which nothing can be formatted. Online date only.
  {
    id: "GF05",
    name: "no-authors-minimal",
    rules: ["D16a", "P43", "P2", "D7", "D8", "D15", "D11", "D14b", "R6"],
    provisionalRules: ["P43"],
    expected: {
      kind: "formatted",
      text: "Editorial note on data availability statements // Example Bulletin of Research Practice. 2024. DOI: 10.0000/golden.gf05.",
      warnings: [],
    },
    publication: {
      doi: doi("10.0000/golden.gf05"),
      title: "Editorial note on data availability statements",
      subtitle: null,
      authors: [],
      journalTitle: "Example Bulletin of Research Practice",
      dates: {
        print: null,
        online: { year: 2024, month: 5, day: 2 },
        published: null,
        issued: null,
      },
      volume: null,
      issue: null,
      pages: null,
      articleNumber: null,
      language: null,
    },
  },

  // A complete record without any date.
  {
    id: "GF06",
    name: "no-year-cannot-format",
    rules: ["D11", "D16a", "D16b"],
    provisionalRules: [],
    expected: { kind: "cannot-format", blockedBy: ["year"] },
    publication: {
      doi: doi("10.0000/golden.gf06"),
      title: "Citation habits of first-year doctoral students",
      subtitle: null,
      authors: [
        { kind: "person", family: "Petrenko", given: "Andrii" },
        { kind: "person", family: "Lee", given: "Sora" },
      ],
      journalTitle: "Example Journal of Academic Writing",
      dates: { print: null, online: null, published: null, issued: null },
      volume: "3",
      issue: "2",
      pages: "210-225",
      articleNumber: null,
      language: "en",
    },
  },

  // A person with a family name only; pages and an article number both present; the page value has prefixes and
  // an en dash (U+2013); issue without a volume; the four dates agree on the year.
  {
    id: "GF07",
    name: "pages-over-article-number-incomplete-name",
    rules: ["D5", "P26", "D7", "D8", "D15", "D11", "D10a", "O3", "D13", "O6", "D12b", "O4", "D14b", "R6"],
    provisionalRules: ["P26"],
    expected: {
      kind: "formatted",
      text: "Okafor. Supplementary tables for the regional reading survey // Example Annals of Reading Research. 2020. № 4. С. S12–S19. DOI: 10.0000/golden.gf07.",
      warnings: ["incomplete-personal-name"],
    },
    publication: {
      doi: doi("10.0000/golden.gf07"),
      title: "Supplementary tables for the regional reading survey",
      subtitle: null,
      authors: [{ kind: "person", family: "Okafor", given: null }],
      journalTitle: "Example Annals of Reading Research",
      dates: {
        print: { year: 2020, month: 6, day: null },
        online: { year: 2020, month: 5, day: 18 },
        published: { year: 2020, month: 5, day: 18 },
        issued: { year: 2020, month: 5, day: 18 },
      },
      volume: null,
      issue: "4",
      pages: "S12–S19",
      articleNumber: "A7",
      language: "en",
    },
  },

  // The journal title is supplied in an abbreviated form that ends in a full stop, and the DOI itself ends in one.
  {
    id: "GF08",
    name: "full-stop-collisions",
    rules: ["D2a", "D2b", "P23", "P26", "D7", "D8", "O17", "D15", "D11", "R2", "D9b", "D10a", "O3", "D13", "O6", "R4", "O8", "D14b", "R6", "O10", "O19"],
    provisionalRules: ["P23", "P26"],
    expected: {
      kind: "formatted",
      text: "Bondarenko, Maria. Abbreviated journal names in reference lists // Ex. J. Bibliogr. Stud.. 2021. Т. 30, № 6. С. 300—315. DOI: 10.0000/golden.gf08.",
      warnings: ["full-stop-collision"],
    },
    publication: {
      doi: doi("10.0000/golden.gf08."),
      title: "Abbreviated journal names in reference lists",
      subtitle: null,
      authors: [{ kind: "person", family: "Bondarenko", given: "Maria" }],
      journalTitle: "Ex. J. Bibliogr. Stud.",
      dates: {
        print: { year: 2021, month: 9, day: null },
        online: null,
        published: null,
        issued: null,
      },
      volume: "30",
      issue: "6",
      pages: "300-315",
      articleNumber: null,
      language: "en",
    },
  },
];
