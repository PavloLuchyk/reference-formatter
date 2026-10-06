// Tests for openspec/changes/bibliography-workspace/specs/metadata-correction/spec.md (decisions HD-1, HD-5, HD-6,
// HD-7; assumptions AS-4, AS-15). Inputs are the Publications of the golden oracle. Expected values are written by
// hand from the spec scenarios; an expected reference text is the approved text of the oracle or is written by hand,
// and the formatter is called only to produce the text that is checked against it.
import { describe, expect, test } from "vitest";
import { approvedText, EM_DASH, ES, goldenPublication, NUMERO, TE } from "@/lib/bibliography/__fixtures__/golden";
import {
  addAuthor,
  applyCorrection,
  draftFromPublication,
  moveAuthor,
  removeAuthor,
  type AuthorDraft,
  type CorrectionDraft,
} from "@/lib/bibliography/correction";
import { normalizeDoi } from "@/lib/doi/normalize-doi";
import { formatJournalArticle } from "@/lib/dstu/format-journal-article";
import { createPublication, type Publication } from "@/lib/publication/publication";

const GF01 = goldenPublication("GF01");
const GF02 = goldenPublication("GF02");
const GF03 = goldenPublication("GF03");
const GF04 = goldenPublication("GF04");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06");
const GF07 = goldenPublication("GF07");
const GF08 = goldenPublication("GF08");

const person = (family: string, given: string): AuthorDraft => ({ kind: "person", family, given, name: "" });
const organisation = (name: string): AuthorDraft => ({ kind: "organisation", family: "", given: "", name });

// The correction of `publication` as it is opened, with some fields then changed by the user.
const corrected = (publication: Publication, change: Partial<CorrectionDraft>): Publication => {
  const outcome = applyCorrection(publication, { ...draftFromPublication(publication), ...change });
  expect(outcome).toMatchObject({ ok: true });
  if (!outcome.ok) throw new Error("unreachable");
  return outcome.publication;
};

const rejected = (publication: Publication, change: Partial<CorrectionDraft>) =>
  applyCorrection(publication, { ...draftFromPublication(publication), ...change });

const INVALID_YEAR = { ok: false, errors: [{ field: "year", kind: "invalid-year" }] };

const referenceText = (publication: Publication): string => {
  const outcome = formatJournalArticle(publication);
  expect(outcome.kind).toBe("formatted");
  return outcome.kind === "formatted" ? outcome.text : "";
};

// An entry whose only date is an issued date of the year 999, outside the range accepted for a typed year.
const sourceYear999 = (): Publication => {
  const normalized = normalizeDoi("10.0000/workspace.year999");
  if (!normalized.ok) throw new Error("unreachable");
  return createPublication({
    doi: normalized.doi,
    title: "An old charter",
    journalTitle: "Example Archive",
    dates: { issued: { year: 999 } },
  });
};

describe("correctable fields", () => {
  test("the correction offers exactly the nine approved fields", () => {
    expect(Object.keys(draftFromPublication(GF01)).sort()).toEqual([
      "articleNumber",
      "authors",
      "issue",
      "journalTitle",
      "pages",
      "subtitle",
      "title",
      "volume",
      "year",
    ]);
  });

  test("a correction keeps the DOI", () => {
    expect(corrected(GF01, { title: "Another title" }).doi).toBe("10.0000/golden.gf01");
  });

  test("a correction keeps the language", () => {
    expect(corrected(GF01, { title: "Another title", year: "2020", authors: [] }).language).toBe("uk");
  });

  test("the publication that is corrected is not changed", () => {
    const before = structuredClone(GF01);
    corrected(GF01, { title: "Another title", year: "2020" });

    expect(GF01).toEqual(before);
  });
});

describe("current values are shown as stored", () => {
  test("a complete record", () => {
    expect(draftFromPublication(GF01)).toEqual({
      title: "Цифрові архіви в університетських бібліотеках",
      subtitle: "",
      authors: [person("Коваленко", "Олена")],
      journalTitle: "Умовний науковий вісник",
      year: "2021",
      volume: "12",
      issue: "3",
      pages: "45-67",
      articleNumber: "",
    });
  });

  test("pages are shown with the hyphen they are stored with, not as printed", () => {
    expect(draftFromPublication(GF01).pages).toBe("45-67");
  });

  test("a Roman-numeral volume is shown as stored", () => {
    expect(draftFromPublication(GF03).volume).toBe("XII");
  });

  test("missing values are empty, and no author row is made up", () => {
    expect(draftFromPublication(GF05)).toMatchObject({
      subtitle: "",
      authors: [],
      volume: "",
      issue: "",
      pages: "",
      articleNumber: "",
    });
  });

  test("an organisation and a person keep their kinds and their order", () => {
    expect(draftFromPublication(GF04).authors).toEqual([
      organisation("Regional Library Consortium"),
      person("Shevchuk", "Iryna"),
    ]);
  });

  test("a missing part of a personal name is an empty field", () => {
    expect(draftFromPublication(GF07).authors).toEqual([person("Okafor", "")]);
  });
});

describe("saving without a change", () => {
  test.each(["GF01", "GF02", "GF03", "GF04", "GF05", "GF06", "GF07", "GF08"])(
    "%s is equal to what it was",
    (id) => {
      const publication = goldenPublication(id);

      expect(applyCorrection(publication, draftFromPublication(publication))).toEqual({ ok: true, publication });
    },
  );

  test("the month and day of each of the four dates are kept", () => {
    expect(corrected(GF02, {}).dates).toEqual({
      print: { year: 2022, month: 1, day: null },
      online: { year: 2021, month: 11, day: 15 },
      published: { year: 2021, month: 11, day: 15 },
      issued: { year: 2021, month: 11, day: 15 },
    });
  });
});

describe("blank values and surrounding whitespace", () => {
  test("an emptied field makes the value missing", () => {
    expect(corrected(GF01, { issue: "" }).issue).toBeNull();
  });

  test("a field of only whitespace makes the value missing", () => {
    expect(corrected(GF02, { subtitle: "   " }).subtitle).toBeNull();
  });

  test("an emptied required value is missing too", () => {
    expect(corrected(GF01, { journalTitle: "" }).journalTitle).toBeNull();
  });

  test("surrounding whitespace is ignored", () => {
    expect(corrected(GF01, { journalTitle: "  Nature  " }).journalTitle).toBe("Nature");
  });

  test("every scalar field is trimmed", () => {
    expect(
      corrected(GF01, {
        title: " T ",
        subtitle: "\ts\t",
        journalTitle: " J ",
        volume: " 1 ",
        issue: " 2 ",
        pages: " 3-4 ",
        articleNumber: " e5 ",
      }),
    ).toMatchObject({
      title: "T",
      subtitle: "s",
      journalTitle: "J",
      volume: "1",
      issue: "2",
      pages: "3-4",
      articleNumber: "e5",
    });
  });

  test("a value is otherwise kept exactly as typed", () => {
    expect(corrected(GF01, { title: "THE ORIGIN  OF SPECIES" }).title).toBe("THE ORIGIN  OF SPECIES");
  });

  test("nothing is repaired: a typed page range keeps its hyphen", () => {
    expect(corrected(GF01, { pages: "100-110" }).pages).toBe("100-110");
  });
});

describe("year shown for correction", () => {
  test("the print date gives the year when it is present", () => {
    expect(draftFromPublication(GF02).year).toBe("2022");
  });

  test("without a print date the issued date gives it", () => {
    expect(draftFromPublication(GF03).year).toBe("2019");
  });

  test("without any date the field is empty", () => {
    expect(draftFromPublication(GF06).year).toBe("");
  });

  // The integration check of design TD-5: the year shown is the year of the approved reference text.
  test.each([
    ["GF01", "2021"],
    ["GF02", "2022"],
    ["GF03", "2019"],
    ["GF04", "2023"],
    ["GF05", "2024"],
    ["GF07", "2020"],
    ["GF08", "2021"],
  ])("%s shows %s, the year printed in its approved reference", (id, year) => {
    expect(draftFromPublication(goldenPublication(id)).year).toBe(year);
    expect(approvedText(id)).toContain(`. ${year}. `);
  });
});

describe("corrected year is stored as the print date", () => {
  test("a missing year is supplied", () => {
    expect(corrected(GF06, { year: "2021" }).dates).toEqual({
      print: { year: 2021, month: null, day: null },
      online: null,
      published: null,
      issued: null,
    });
  });

  test("a year is changed where there was no print date", () => {
    expect(corrected(GF03, { year: "2020" }).dates).toEqual({
      print: { year: 2020, month: null, day: null },
      online: { year: 2020, month: 1, day: 10 },
      published: { year: 2020, month: 1, day: 10 },
      issued: { year: 2019, month: 12, day: null },
    });
  });

  test("a year is changed where there was a print date: its month is dropped", () => {
    expect(corrected(GF02, { year: "2023" }).dates).toEqual({
      print: { year: 2023, month: null, day: null },
      online: { year: 2021, month: 11, day: 15 },
      published: { year: 2021, month: 11, day: 15 },
      issued: { year: 2021, month: 11, day: 15 },
    });
  });

  test("a year that is not touched leaves all four dates as they were", () => {
    expect(corrected(GF02, { title: "Another title" }).dates).toEqual(GF02.dates);
  });

  test("whitespace around a typed year is ignored", () => {
    expect(corrected(GF06, { year: " 2021 " }).dates.print).toEqual({ year: 2021, month: null, day: null });
  });

  test.each([
    ["1000", 1000],
    ["9999", 9999],
  ])("the bound %s is accepted", (typed, year) => {
    expect(corrected(GF06, { year: typed }).dates.print).toEqual({ year, month: null, day: null });
  });

  test("the formatter prints the corrected year: missing year supplied", () => {
    expect(referenceText(corrected(GF06, { year: "2021" }))).toBe(
      `Petrenko, Andrii; Lee, Sora. Citation habits of first-year doctoral students // Example Journal of Academic Writing. 2021. ${TE}. 3, ${NUMERO} 2. ${ES}. 210${EM_DASH}225. DOI: 10.0000/golden.gf06.`,
    );
  });

  test("the formatter prints the corrected year: over an issued date", () => {
    expect(referenceText(corrected(GF03, { year: "2020" }))).toBe(
      `Persistent identifiers in practice : Lessons from a national pilot / Alice Brown, L. M. Garcia, Open Metadata Working Group, Petro Ivanenko // Example Review of Scholarly Communication. 2020. ${TE}. 12, Suppl 1. ${ES}. 5${EM_DASH}12. DOI: 10.0000/golden.gf03.`,
    );
  });

  test("the formatter prints the corrected year: over a print date", () => {
    expect(referenceText(corrected(GF02, { year: "2023" }))).toBe(
      `Miller, K. J.; Novak, M.; Durand, J.-P. Measuring reuse of open research data : a survey of three repositories // Example Journal of Information Studies. 2023. ${TE}. 7, ${NUMERO} 1/2. ${ES}. 101${EM_DASH}118. DOI: 10.0000/golden.gf02.`,
    );
  });
});

describe("emptied year", () => {
  const NO_DATES = { print: null, online: null, published: null, issued: null };

  test("all four dates become missing", () => {
    expect(corrected(GF02, { year: "" }).dates).toEqual(NO_DATES);
  });

  test("a year field of only whitespace is an emptied field", () => {
    expect(corrected(GF02, { year: "  " }).dates).toEqual(NO_DATES);
  });

  test("the entry can then not be formatted, for want of the year", () => {
    expect(formatJournalArticle(corrected(GF02, { year: "" }))).toEqual({ kind: "cannot-format", blockedBy: ["year"] });
  });
});

describe("unchanged year is not validated", () => {
  test("the year shown for a source year outside the accepted range is that year", () => {
    expect(draftFromPublication(sourceYear999()).year).toBe("999");
  });

  test("another field can be corrected, and no date is rewritten", () => {
    const publication = corrected(sourceYear999(), { title: "A corrected title" });

    expect(publication.title).toBe("A corrected title");
    expect(publication.dates).toEqual({
      print: null,
      online: null,
      published: null,
      issued: { year: 999, month: null, day: null },
    });
  });

  test("the same year typed again, with spaces around it, is unchanged", () => {
    expect(corrected(sourceYear999(), { year: " 999 " }).dates).toEqual(sourceYear999().dates);
  });

  test("changing it to another value that is not accepted is rejected", () => {
    expect(rejected(sourceYear999(), { year: "99" })).toEqual(INVALID_YEAR);
  });

  test("changing it to an accepted value stores that year as the print date", () => {
    expect(corrected(sourceYear999(), { year: "1999" }).dates).toEqual({
      print: { year: 1999, month: null, day: null },
      online: null,
      published: null,
      issued: { year: 999, month: null, day: null },
    });
  });
});

describe("changed year value that is not accepted", () => {
  test.each([
    ["letters in the year", "2021a"],
    ["too few digits", "21"],
    ["a date instead of a year", "2021-03"],
    ["four digits below the range", "0999"],
    ["five digits", "20211"],
    ["full-width digits", "２０２１"],
    ["Arabic-Indic digits", "٢٠٢١"],
    ["a space inside", "20 21"],
    ["a sign", "+2021"],
    ["a decimal point", "2021.0"],
    ["words", "this year"],
  ])("%s is rejected and nothing is saved", (_name, typed) => {
    expect(rejected(GF06, { year: typed })).toEqual(INVALID_YEAR);
  });

  test("a rejected year where a year was shown", () => {
    expect(rejected(GF01, { year: "21" })).toEqual(INVALID_YEAR);
  });

  test("other fields typed with a rejected year are not saved either", () => {
    expect(rejected(GF01, { title: "A new title", year: "21" })).toEqual(INVALID_YEAR);
  });
});

describe("correcting the list of authors", () => {
  test("an added author goes to the end and starts as a person without names", () => {
    expect(addAuthor(draftFromPublication(GF05)).authors).toEqual([person("", "")]);
    expect(addAuthor(draftFromPublication(GF04)).authors).toEqual([
      organisation("Regional Library Consortium"),
      person("Shevchuk", "Iryna"),
      person("", ""),
    ]);
  });

  test("adding an author changes no other field of the correction", () => {
    expect(addAuthor(draftFromPublication(GF01))).toEqual({
      ...draftFromPublication(GF01),
      authors: [person("Коваленко", "Олена"), person("", "")],
    });
  });

  test("an author is removed and the others keep their order", () => {
    expect(removeAuthor(draftFromPublication(GF02), 1).authors).toEqual([
      person("Miller", "K. J."),
      person("Durand", "J.-P."),
    ]);
  });

  test("an author moves one position up or down", () => {
    const draft = draftFromPublication(GF02);

    expect(moveAuthor(draft, 1, "up").authors).toEqual([
      person("Novak", "M."),
      person("Miller", "K. J."),
      person("Durand", "J.-P."),
    ]);
    expect(moveAuthor(draft, 1, "down").authors).toEqual([
      person("Miller", "K. J."),
      person("Durand", "J.-P."),
      person("Novak", "M."),
    ]);
  });

  test("the first author does not move up and the last does not move down", () => {
    const draft = draftFromPublication(GF02);

    expect(moveAuthor(draft, 0, "up").authors).toEqual(draft.authors);
    expect(moveAuthor(draft, 2, "down").authors).toEqual(draft.authors);
  });

  test("a given value is changed", () => {
    const publication = corrected(GF01, { authors: [person("Коваленко", "О.")] });

    expect(publication.authors).toEqual([{ kind: "person", family: "Коваленко", given: "О." }]);
    expect(referenceText(publication).startsWith("Коваленко, О. Цифрові архіви")).toBe(true);
  });

  test("an author is added", () => {
    const draft = addAuthor(draftFromPublication(GF05));
    const publication = corrected(GF05, { authors: [{ ...draft.authors[0], family: "Shevchuk", given: "Iryna" }] });

    expect(publication.authors).toEqual([{ kind: "person", family: "Shevchuk", given: "Iryna" }]);
    expect(
      referenceText(publication).startsWith("Shevchuk, Iryna. Editorial note on data availability statements // "),
    ).toBe(true);
  });

  test("an author is removed", () => {
    const publication = corrected(GF04, { authors: removeAuthor(draftFromPublication(GF04), 0).authors });

    expect(publication.authors).toEqual([{ kind: "person", family: "Shevchuk", given: "Iryna" }]);
    expect(referenceText(publication).startsWith("Shevchuk, Iryna. Shared cataloguing after migration // ")).toBe(true);
  });

  test("the order is changed", () => {
    const publication = corrected(GF04, { authors: moveAuthor(draftFromPublication(GF04), 1, "up").authors });

    expect(publication.authors).toEqual([
      { kind: "person", family: "Shevchuk", given: "Iryna" },
      { kind: "organisation", name: "Regional Library Consortium" },
    ]);
    expect(
      referenceText(publication).startsWith(
        "Shevchuk, Iryna; Regional Library Consortium. Shared cataloguing after migration // ",
      ),
    ).toBe(true);
  });

  test("a person is set as an organisation", () => {
    // The row still holds the family name typed for the person; only the organisation name is saved.
    const publication = corrected(GF07, {
      authors: [{ kind: "organisation", family: "Okafor", given: "", name: "Okafor Research Group" }],
    });

    expect(publication.authors).toEqual([{ kind: "organisation", name: "Okafor Research Group" }]);
    expect(referenceText(publication).startsWith("Okafor Research Group. Supplementary tables")).toBe(true);
    expect(formatJournalArticle(publication)).toMatchObject({ warnings: [] });
  });

  test("an organisation is set as a person", () => {
    const publication = corrected(GF04, {
      authors: [
        { kind: "person", family: "Consortium", given: "R. L.", name: "Regional Library Consortium" },
        person("Shevchuk", "Iryna"),
      ],
    });

    expect(publication.authors).toEqual([
      { kind: "person", family: "Consortium", given: "R. L." },
      { kind: "person", family: "Shevchuk", given: "Iryna" },
    ]);
  });

  test("every author is removed", () => {
    const publication = corrected(GF01, { authors: [] });

    expect(publication.authors).toEqual([]);
    expect(
      referenceText(publication).startsWith("Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. "),
    ).toBe(true);
  });
});

describe("author names in a correction", () => {
  test("an author row without any name is left out", () => {
    const publication = corrected(GF01, { authors: addAuthor(draftFromPublication(GF01)).authors });

    expect(publication.authors).toEqual([{ kind: "person", family: "Коваленко", given: "Олена" }]);
  });

  test("a row of only whitespace is left out too", () => {
    expect(corrected(GF05, { authors: [person("  ", "\t"), organisation("   ")] }).authors).toEqual([]);
  });

  test("a removed given value is missing, and the person is kept", () => {
    const publication = corrected(GF01, { authors: [person("Коваленко", "")] });

    expect(publication.authors).toEqual([{ kind: "person", family: "Коваленко", given: null }]);
    expect(formatJournalArticle(publication)).toMatchObject({ warnings: ["incomplete-personal-name"] });
  });

  test("a person with only a given value is kept as such", () => {
    expect(corrected(GF05, { authors: [person("", "Madonna")] }).authors).toEqual([
      { kind: "person", family: null, given: "Madonna" },
    ]);
  });

  test("a given name is not abbreviated", () => {
    expect(corrected(GF01, { title: "Another title" }).authors).toEqual([
      { kind: "person", family: "Коваленко", given: "Олена" },
    ]);
  });

  test("surrounding whitespace in a name is ignored and the inside is kept", () => {
    expect(
      corrected(GF05, { authors: [person(" Shevchuk ", " I.  V. "), organisation(" Open  Group ")] }).authors,
    ).toEqual([
      { kind: "person", family: "Shevchuk", given: "I.  V." },
      { kind: "organisation", name: "Open  Group" },
    ]);
  });

  test("names of the other kind are not carried over", () => {
    // The person «Okafor» set as an organisation, the organisation name left empty.
    const publication = corrected(GF07, {
      authors: [{ kind: "organisation", family: "Okafor", given: "", name: "" }],
    });

    expect(publication.authors).toEqual([]);
  });

  test("an organisation set as a person without names is left out", () => {
    const publication = corrected(GF04, {
      authors: [
        { kind: "person", family: "", given: "", name: "Regional Library Consortium" },
        person("Shevchuk", "Iryna"),
      ],
    });

    expect(publication.authors).toEqual([{ kind: "person", family: "Shevchuk", given: "Iryna" }]);
  });
});

describe("the reference is recomputed from the corrected publication", () => {
  test("a missing title is supplied", () => {
    const withoutTitle: Publication = { ...GF01, title: null };

    expect(formatJournalArticle(withoutTitle)).toEqual({ kind: "cannot-format", blockedBy: ["title"] });
    expect(
      formatJournalArticle(corrected(withoutTitle, { title: "Цифрові архіви в університетських бібліотеках" })),
    ).toEqual({ kind: "formatted", text: approvedText("GF01"), warnings: [] });
  });

  test("a warning disappears with its cause", () => {
    expect(formatJournalArticle(corrected(GF03, { subtitle: "lessons from a national pilot" }))).toEqual({
      kind: "formatted",
      text: `Persistent identifiers in practice : lessons from a national pilot / Alice Brown, L. M. Garcia, Open Metadata Working Group, Petro Ivanenko // Example Review of Scholarly Communication. 2019. ${TE}. 12, Suppl 1. ${ES}. 5${EM_DASH}12. DOI: 10.0000/golden.gf03.`,
      warnings: [],
    });
  });

  test("a full-stop collision is corrected", () => {
    expect(
      formatJournalArticle(corrected(GF08, { journalTitle: "Example Journal of Bibliographic Studies" })),
    ).toEqual({
      kind: "formatted",
      text: `Bondarenko, Maria. Abbreviated journal names in reference lists // Example Journal of Bibliographic Studies. 2021. ${TE}. 30, ${NUMERO} 6. ${ES}. 300${EM_DASH}315. DOI: 10.0000/golden.gf08.`,
      warnings: [],
    });
  });

  test("a required value is removed", () => {
    expect(formatJournalArticle(corrected(GF01, { journalTitle: "" }))).toEqual({
      kind: "cannot-format",
      blockedBy: ["journalTitle"],
    });
  });

  test("an emptied issue leaves the volume alone in its zone", () => {
    expect(referenceText(corrected(GF01, { issue: "" }))).toBe(
      `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. ${TE}. 12. ${ES}. 45${EM_DASH}67. DOI: 10.0000/golden.gf01.`,
    );
  });
});
