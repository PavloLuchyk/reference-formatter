// Tests for the mapping requirements of openspec/changes/doi-resolution/specs/doi-resolution/spec.md
// (Field mapping, Publication dates, Title text, Author mapping, Author name whitespace, Absent metadata)
// and for the approved Crossref field → Publication field mapping table in design.md.
// Tests marked "(mapping table)" cover a rule of that table that has no scenario of its own.
import { describe, expect, test } from "vitest";
import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import { mapCrossrefWork } from "@/lib/metadata/crossref/map-work";
import { expectedPublications } from "@/lib/metadata/crossref/__fixtures__/expected";
import { fixtureWork } from "@/lib/metadata/crossref/__fixtures__/load";

const doi = "10.1000/test" as CanonicalDoi;

const PUBLICATION_KEYS = [
  "articleNumber",
  "authors",
  "dates",
  "doi",
  "issue",
  "journalTitle",
  "language",
  "pages",
  "subtitle",
  "title",
  "volume",
];

// A minimal journal-article work record; each test adds only the fields it is about.
const mapArticle = (fields: Record<string, unknown>) =>
  mapCrossrefWork(doi, { type: "journal-article", DOI: "10.1000/test", ...fields });

const mapFixture = (file: string) => mapCrossrefWork(expectedPublications[file].doi, fixtureWork(file));

const titleFrom = (title: string) => mapArticle({ title: [title] }).title;
const authorsFrom = (author: unknown[]) => mapArticle({ author }).authors;
const dateParts = (...parts: Array<number | null>) => ({ "date-parts": [parts] });

describe("Publication is provider-independent and style-neutral", () => {
  test("Record produced from Crossref", () => {
    const publication = mapFixture("nature12373.json");
    const serialized = JSON.stringify(publication);

    expect(Object.keys(publication).sort()).toEqual(PUBLICATION_KEYS);
    for (const crossrefName of ["container-title", "date-parts", "published-print", "is-referenced-by-count", "Springer"]) {
      expect(serialized).not.toContain(crossrefName);
    }
  });
});

describe("Field mapping from the Crossref record", () => {
  test("Surrounding whitespace in a field", () => {
    expect(mapArticle({ page: " 54-58 " }).pages).toBe("54-58");
  });

  test("Fully described article", () => {
    const publication = mapFixture("nature12373.json");

    expect(publication.title).toBe("Nanometre-scale thermometry in a living cell");
    expect(publication.journalTitle).toBe("Nature");
    expect(publication.volume).toBe("500");
    expect(publication.issue).toBe("7460");
    expect(publication.pages).toBe("54-58");
    expect(publication.language).toBe("en");
  });

  test("Article identifier supplied as the page", () => {
    const publication = mapFixture("pone-0000308.json");

    expect(publication.pages).toBe("e308");
    expect(publication.articleNumber).toBeNull();
  });

  test("Several container titles", () => {
    const publication = mapArticle({ "container-title": ["First Journal", "Second Journal"] });

    expect(publication.journalTitle).toBe("First Journal");
  });

  test("Surrounding whitespace in every trimmed field (mapping table)", () => {
    const publication = mapArticle({
      volume: " 136 ",
      issue: "\t3\n",
      page: " 114-115 ",
      "article-number": " 335 ",
      language: " en ",
    });

    expect(publication.volume).toBe("136");
    expect(publication.issue).toBe("3");
    expect(publication.pages).toBe("114-115");
    expect(publication.articleNumber).toBe("335");
    expect(publication.language).toBe("en");
  });

  test("Internal content of a field is preserved (mapping table)", () => {
    expect(mapArticle({ page: "S12 - S19" }).pages).toBe("S12 - S19");
  });

  test("The DOI is the requested one, not the record's (mapping table)", () => {
    const publication = mapCrossrefWork(doi, { type: "journal-article", DOI: "10.9999/another-doi" });

    expect(publication.doi).toBe("10.1000/test");
  });

  test.each(Object.keys(expectedPublications))("Recorded fixture %s maps to its expected Publication", (file) => {
    expect(mapFixture(file)).toEqual(expectedPublications[file]);
  });
});

describe("Publication dates are preserved from the record", () => {
  test("Print and online dates differ", () => {
    const { dates } = mapFixture("nature12373.json");

    expect(dates.print).toEqual({ year: 2013, month: 8, day: null });
    expect(dates.online).toEqual({ year: 2013, month: 7, day: 31 });
    expect(dates.published).toEqual({ year: 2013, month: 7, day: 31 });
    expect(dates.issued).toEqual({ year: 2013, month: 7, day: 31 });
  });

  test("No print date", () => {
    const { dates } = mapFixture("pone-0000308.json");

    expect(dates).toEqual({
      print: null,
      online: { year: 2007, month: 3, day: 21 },
      published: { year: 2007, month: 3, day: 21 },
      issued: { year: 2007, month: 3, day: 21 },
    });
  });

  test("No date", () => {
    const publication = mapArticle({});

    expect(publication.dates).toEqual({ print: null, online: null, published: null, issued: null });
    expect(publication).not.toHaveProperty("year");
  });

  test("Each date goes to the date of the same kind (mapping table)", () => {
    const { dates } = mapArticle({
      "published-print": dateParts(2001),
      "published-online": dateParts(2002, 2),
      published: dateParts(2003, 3, 3),
      issued: dateParts(2004, 4),
    });

    expect(dates).toEqual({
      print: { year: 2001, month: null, day: null },
      online: { year: 2002, month: 2, day: null },
      published: { year: 2003, month: 3, day: 3 },
      issued: { year: 2004, month: 4, day: null },
    });
  });

  // Constructed defensive case: no recorded Crossref answer contains a date without a year.
  // Approved by the human on 2026-10-05.
  test("A date without a year counts as missing (mapping table; constructed defensive case)", () => {
    const { dates } = mapArticle({ issued: dateParts(null), published: { "date-parts": [[]] } });

    expect(dates.issued).toBeNull();
    expect(dates.published).toBeNull();
  });
});

describe("Title text", () => {
  test("Markup in the title", () => {
    expect(titleFrom("Structure of <i>Escherichia coli</i> ribosomes")).toBe(
      "Structure of Escherichia coli ribosomes",
    );
  });

  test("Entity in the title", () => {
    expect(titleFrom("Law &amp; order")).toBe("Law & order");
  });

  test("Surrounding whitespace", () => {
    expect(titleFrom("  Deep learning  ")).toBe("Deep learning");
  });

  test("Whitespace introduced by cleaning", () => {
    expect(titleFrom("Water <i></i> splitting")).toBe("Water splitting");
  });

  test("Whitespace that was already in the text", () => {
    expect(titleFrom("Law  and order")).toBe("Law  and order");
  });

  test("Entity in the journal title", () => {
    expect(mapArticle({ "container-title": ["Science &amp; Society"] }).journalTitle).toBe("Science & Society");
  });

  test("Plain title is unchanged", () => {
    const title = "Nanometre-scale thermometry in a living cell";

    expect(titleFrom(title)).toBe(title);
  });

  test("Letter case is kept", () => {
    expect(titleFrom("THE ORIGIN OF SPECIES")).toBe("THE ORIGIN OF SPECIES");
  });

  test("Subtitle is supplied", () => {
    const publication = mapArticle({ title: ["Deep learning"], subtitle: ["A critical appraisal"] });

    expect(publication.title).toBe("Deep learning");
    expect(publication.subtitle).toBe("A critical appraisal");
  });

  // Regression: only text with the syntax of a markup tag is removed; other angle-bracket text stays.
  test.each([
    "Survival when p < 0.05 and n > 30",
    "Slip along the <111> direction",
    "Orderings where a<b and c>d",
    "Bounds 1<x and y>2 revisited",
  ])("Angle-bracket text that is not markup is kept: %s", (title) => {
    expect(titleFrom(title)).toBe(title);
  });

  test("Markup is removed next to angle-bracket text that is not markup", () => {
    expect(titleFrom("Effect of <i>x</i> when x < 3 and a<b and c>d")).toBe("Effect of x when x < 3 and a<b and c>d");
  });

  test("Markup with attributes is still removed", () => {
    const math = '<mml:math xmlns:mml="http://www.w3.org/1998/Math/MathML"><mml:mi>x</mml:mi></mml:math>';

    expect(titleFrom(`Scattering of ${math} rays<br/>`)).toBe("Scattering of x rays");
  });

  test("Markup in a real recorded title", () => {
    expect(mapFixture("title-markup.json").title).toBe("Escherichia coli");
  });

  test("Subtitle and journal title are cleaned like the title (mapping table)", () => {
    const publication = mapArticle({
      subtitle: [" The <i>E. coli</i> case &amp; beyond "],
      "container-title": ["Annals of <i>Botany</i>"],
    });

    expect(publication.subtitle).toBe("The E. coli case & beyond");
    expect(publication.journalTitle).toBe("Annals of Botany");
  });
});

describe("Entities decoded in title text", () => {
  test("Predefined XML entities", () => {
    expect(titleFrom("&quot;Smart&quot; cities &lt; 1 km &amp; &gt; 1 km: Hobson&apos;s choice")).toBe(
      "\"Smart\" cities < 1 km & > 1 km: Hobson's choice",
    );
  });

  test("Decimal character reference", () => {
    expect(titleFrom("Caf&#233; society")).toBe("Café society");
  });

  test("Hexadecimal character reference", () => {
    expect(titleFrom("Caf&#xE9; society")).toBe("Café society");
  });

  test("Other named entity is preserved", () => {
    expect(titleFrom("Caf&eacute; society&nbsp;today")).toBe("Caf&eacute; society&nbsp;today");
  });

  test("The same rules apply to the subtitle and the journal title", () => {
    const publication = mapArticle({
      subtitle: ["Caf&#233; &amp; caf&eacute;"],
      "container-title": ["Caf&#xE9; &amp; caf&eacute;"],
    });

    expect(publication.subtitle).toBe("Café & caf&eacute;");
    expect(publication.journalTitle).toBe("Café & caf&eacute;");
  });
});

// Checker finding F2: decoding before markup removal would turn escaped text into markup and delete it.
describe("Entities decoded in title text: order of cleaning", () => {
  test("Escaped markup is not markup", () => {
    expect(titleFrom("&lt;i&gt;Escherichia coli&lt;/i&gt;")).toBe("<i>Escherichia coli</i>");
  });
});

// Checker finding F3.
describe("Only matched markup is removed", () => {
  test("Tag-shaped text without a closing tag", () => {
    expect(titleFrom("Role of <y> in <N>-body systems")).toBe("Role of <y> in <N>-body systems");
  });

  test("Unclosed tag", () => {
    expect(titleFrom("Bold <b>move")).toBe("Bold <b>move");
  });

  test("Closing tag without an opening tag", () => {
    expect(titleFrom("End of </i> an era")).toBe("End of </i> an era");
  });

  test("Matched tags are removed", () => {
    expect(titleFrom("H<sub>2</sub>O and <i>E. coli</i>")).toBe("H2O and E. coli");
  });

  test("Empty-element tag is removed", () => {
    expect(titleFrom("Scattering of x rays<br/>")).toBe("Scattering of x rays");
  });

  test("A closing tag before its opening tag is not a match", () => {
    expect(titleFrom("From </i> to <i> and back")).toBe("From </i> to <i> and back");
  });

  test("The same rule applies to the subtitle and the journal title", () => {
    const publication = mapArticle({ subtitle: ["The <N>-body problem"], "container-title": ["Journal of <i>Botany</i>"] });

    expect(publication.subtitle).toBe("The <N>-body problem");
    expect(publication.journalTitle).toBe("Journal of Botany");
  });
});

// Checker finding F4.
describe("Numeric references to unusable characters are kept", () => {
  test("Surrogate", () => {
    expect(titleFrom("A&#xD800;B")).toBe("A&#xD800;B");
  });

  test("Control character", () => {
    expect(titleFrom("A&#7;B")).toBe("A&#7;B");
  });

  test("Null character and value beyond Unicode", () => {
    expect(titleFrom("A&#0;B and C&#x110000;D")).toBe("A&#0;B and C&#x110000;D");
  });

  test("Usable characters next to them are still decoded", () => {
    expect(titleFrom("Caf&#233; &#x7;&#xDFFF; &#x1F600;")).toBe("Café &#x7;&#xDFFF; \u{1F600}");
  });
});

// Checker finding F5.
describe("Whitespace produced by decoding is collapsed", () => {
  test("Decoded space between spaces", () => {
    expect(titleFrom("A &#32; B")).toBe("A B");
  });

  test("Decoded line break", () => {
    expect(titleFrom("A&#10;B")).toBe("A B");
  });

  test("Decoded tab next to a decoded space", () => {
    expect(titleFrom("A&#9;&#32;B")).toBe("A B");
  });

  test("Decoded no-break space", () => {
    expect(titleFrom("5&#160;km")).toBe("5 km");
  });

  test("Whitespace that touches no decoded character stays as supplied", () => {
    expect(titleFrom("Law  and &#32; order")).toBe("Law  and order");
  });
});

describe("Author mapping", () => {
  test("Authors of a real record", () => {
    const { authors } = mapFixture("nature12373.json");

    expect(authors).toHaveLength(8);
    expect(authors[0]).toEqual({ kind: "person", family: "Kucsko", given: "G." });
    expect(authors).toEqual(expectedPublications["nature12373.json"].authors);
  });

  test("Group author", () => {
    expect(authorsFrom([{ name: "ATLAS Collaboration", sequence: "first", affiliation: [] }])).toEqual([
      { kind: "organisation", name: "ATLAS Collaboration" },
    ]);
  });

  // Constructed defensive case: no recorded Crossref answer has an author entry with both kinds of name.
  // Approved by the human on 2026-10-05.
  test("Personal name and group name on one entry (constructed defensive case)", () => {
    expect(authorsFrom([{ family: "Kucsko", given: "G.", name: "Quantum Sensing Group" }])).toEqual([
      { kind: "person", family: "Kucsko", given: "G." },
    ]);
  });

  test("Given names only", () => {
    expect(authorsFrom([{ given: "Madonna" }])).toEqual([{ kind: "person", family: null, given: "Madonna" }]);
  });

  test("Family name only", () => {
    expect(authorsFrom([{ family: "Aristotle" }])).toEqual([{ kind: "person", family: "Aristotle", given: null }]);
  });

  test("Entry without any name", () => {
    expect(
      authorsFrom([{ family: "Piwowar", given: "Heather A." }, { sequence: "additional", affiliation: [] }]),
    ).toEqual([{ kind: "person", family: "Piwowar", given: "Heather A." }]);
  });

  test("Group and personal authors of a real record keep their order", () => {
    expect(mapFixture("group-author-article-number.json").authors).toEqual([
      { kind: "organisation", name: "Archimedes Collaboration" },
      { kind: "person", family: "Calloni", given: "Enrico" },
      { kind: "organisation", name: "Virgo Collaboration" },
    ]);
  });
});

describe("Author name whitespace", () => {
  test("Surrounding whitespace in a name", () => {
    expect(authorsFrom([{ family: " Kucsko ", given: "G." }])).toEqual([
      { kind: "person", family: "Kucsko", given: "G." },
    ]);
  });

  test("Blank family name", () => {
    expect(authorsFrom([{ family: "   ", given: "Madonna" }])).toEqual([
      { kind: "person", family: null, given: "Madonna" },
    ]);
  });

  test("Blank personal names with a group name", () => {
    expect(authorsFrom([{ family: " ", given: "", name: "ATLAS Collaboration" }])).toEqual([
      { kind: "organisation", name: "ATLAS Collaboration" },
    ]);
  });

  test("Every name is blank", () => {
    expect(authorsFrom([{ family: " ", given: "\t", name: "  " }])).toEqual([]);
  });

  test("Content inside a name is kept as supplied", () => {
    expect(authorsFrom([{ family: " van der  Waals ", given: " J. D. " }])).toEqual([
      { kind: "person", family: "van der  Waals", given: "J. D." },
    ]);
  });
});

describe("Absent metadata does not fail resolution", () => {
  test("Article not yet assigned to an issue", () => {
    const publication = mapFixture("no-volume-issue.json");

    expect(publication.volume).toBeNull();
    expect(publication.issue).toBeNull();
    expect(publication.pages).toBeNull();
  });

  test("Empty subtitle list", () => {
    expect(mapArticle({ title: ["Deep learning"], subtitle: [] }).subtitle).toBeNull();
  });

  test("No title", () => {
    const publication = mapArticle({ "container-title": ["Nature"] });

    expect(publication.title).toBeNull();
    expect(publication.journalTitle).toBe("Nature");
  });

  test("Blank values are missing (mapping table)", () => {
    const publication = mapArticle({
      title: ["   "],
      "container-title": [""],
      volume: "",
      issue: "  ",
      page: "\t",
      "article-number": " ",
      language: "",
    });

    expect(publication.title).toBeNull();
    expect(publication.journalTitle).toBeNull();
    expect(publication.volume).toBeNull();
    expect(publication.issue).toBeNull();
    expect(publication.pages).toBeNull();
    expect(publication.articleNumber).toBeNull();
    expect(publication.language).toBeNull();
  });

  test("A record with only a type maps to a Publication with every field missing", () => {
    expect(mapArticle({})).toEqual({
      doi: "10.1000/test",
      title: null,
      subtitle: null,
      authors: [],
      journalTitle: null,
      dates: { print: null, online: null, published: null, issued: null },
      volume: null,
      issue: null,
      pages: null,
      articleNumber: null,
      language: null,
    });
  });
});
