// Tests for the scenarios of openspec/changes/doi-resolution/specs/publication-model/spec.md.
// The scenario "Record produced from Crossref" is also tested against a real record in lib/metadata/crossref/map-work.test.ts.
import { describe, expect, test } from "vitest";
import { normalizeDoi, type CanonicalDoi } from "@/lib/doi/normalize-doi";
import {
  createPublication,
  isSamePublication,
  missingFields,
  type Publication,
  type PublicationField,
  type PublicationInput,
} from "@/lib/publication/publication";

const doi = "10.1038/nature12373" as CanonicalDoi;

const OPTIONAL_FIELDS: PublicationField[] = [
  "title",
  "subtitle",
  "authors",
  "journalTitle",
  "dates",
  "volume",
  "issue",
  "pages",
  "articleNumber",
  "language",
];

const sorted = (values: readonly string[]) => [...values].sort();

const completeInput: PublicationInput = {
  doi,
  title: "Nanometre-scale thermometry in a living cell",
  subtitle: "A worked example",
  authors: [
    { kind: "person", family: "Kucsko", given: "G." },
    { kind: "organisation", name: "ATLAS Collaboration" },
  ],
  journalTitle: "Nature",
  dates: {
    print: { year: 2013, month: 8 },
    online: { year: 2013, month: 7, day: 31 },
    published: { year: 2013, month: 7, day: 31 },
    issued: { year: 2013, month: 7, day: 31 },
  },
  volume: "500",
  issue: "7460",
  pages: "54-58",
  articleNumber: "335",
  language: "en",
};

const produceFor = (typed: string): Publication => {
  const normalized = normalizeDoi(typed);
  if (!normalized.ok) throw new Error(`Test input was rejected as a DOI: ${typed}`);
  return createPublication({ doi: normalized.doi });
};

describe("Publication is provider-independent and style-neutral", () => {
  test("Record produced from Crossref: only the defined fields are exposed", () => {
    const withProviderFields = {
      ...completeInput,
      "container-title": ["Nature"],
      "published-print": { "date-parts": [[2013, 8]] },
      publisher: "Springer Science and Business Media LLC",
    } as PublicationInput;

    const publication = createPublication(withProviderFields);

    expect(sorted(Object.keys(publication))).toEqual(sorted(["doi", ...OPTIONAL_FIELDS]));
    expect(JSON.stringify(publication)).not.toContain("container-title");
    expect(JSON.stringify(publication)).not.toContain("date-parts");
    expect(JSON.stringify(publication)).not.toContain("Springer");
  });
});

describe("Publication fields", () => {
  test("Complete record", () => {
    const publication = createPublication(completeInput);

    expect(publication).toEqual({
      doi: "10.1038/nature12373",
      title: "Nanometre-scale thermometry in a living cell",
      subtitle: "A worked example",
      authors: [
        { kind: "person", family: "Kucsko", given: "G." },
        { kind: "organisation", name: "ATLAS Collaboration" },
      ],
      journalTitle: "Nature",
      dates: {
        print: { year: 2013, month: 8, day: null },
        online: { year: 2013, month: 7, day: 31 },
        published: { year: 2013, month: 7, day: 31 },
        issued: { year: 2013, month: 7, day: 31 },
      },
      volume: "500",
      issue: "7460",
      pages: "54-58",
      articleNumber: "335",
      language: "en",
    });
    expect(missingFields(publication)).toEqual([]);
  });

  test("Only the DOI is known", () => {
    const publication = createPublication({ doi });

    expect(publication).toEqual({
      doi: "10.1038/nature12373",
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
    expect(sorted(missingFields(publication))).toEqual(sorted(OPTIONAL_FIELDS));
  });
});

describe("Canonical DOI is the Publication identity", () => {
  test("Input in a different form and case", () => {
    const publication = produceFor(" DOI:10.1038/NATURE12373 ");

    expect(publication.doi).toBe("10.1038/nature12373");
    expect(sorted(Object.keys(publication))).toEqual(sorted(["doi", ...OPTIONAL_FIELDS]));
    expect(JSON.stringify(publication)).not.toContain("NATURE12373");
    expect(JSON.stringify(publication)).not.toContain("DOI:");
  });

  test("Same publication from two inputs", () => {
    const fromBare = produceFor("10.1038/NATURE12373");
    const fromUrl = produceFor("https://doi.org/10.1038/nature12373");
    const other = produceFor("10.1371/journal.pone.0000308");

    expect(isSamePublication(fromBare, fromUrl)).toBe(true);
    expect(isSamePublication(fromBare, other)).toBe(false);
  });
});

describe("Source publication dates are preserved", () => {
  test("Dates of different precision", () => {
    const publication = createPublication({
      doi,
      dates: { print: { year: 2013, month: 8 }, online: { year: 2013, month: 7, day: 31 } },
    });

    expect(publication.dates.print).toEqual({ year: 2013, month: 8, day: null });
    expect(publication.dates.online).toEqual({ year: 2013, month: 7, day: 31 });
    expect(publication).not.toHaveProperty("year");
  });

  test("Year only", () => {
    const publication = createPublication({ doi, dates: { issued: { year: 2016 } } });

    expect(publication.dates.issued).toEqual({ year: 2016, month: null, day: null });
  });

  test("A date kind is not supplied", () => {
    const publication = createPublication({
      doi,
      dates: {
        online: { year: 2007, month: 3, day: 21 },
        published: { year: 2007, month: 3, day: 21 },
        issued: { year: 2007, month: 3, day: 21 },
      },
    });

    expect(publication.dates).toEqual({
      print: null,
      online: { year: 2007, month: 3, day: 21 },
      published: { year: 2007, month: 3, day: 21 },
      issued: { year: 2007, month: 3, day: 21 },
    });
    expect(missingFields(publication)).not.toContain("dates");
  });
});

describe("Missing metadata is explicit", () => {
  test("Missing volume", () => {
    const publication = createPublication({ ...completeInput, volume: undefined });

    expect(publication.volume).toBeNull();
    expect(missingFields(publication)).toEqual(["volume"]);
  });

  test("Blank value", () => {
    const publication = createPublication({ ...completeInput, title: "", volume: "   ", journalTitle: "\t\n" });

    expect(publication.title).toBeNull();
    expect(publication.volume).toBeNull();
    expect(publication.journalTitle).toBeNull();
    expect(sorted(missingFields(publication))).toEqual(sorted(["title", "volume", "journalTitle"]));
  });

  test("No authors", () => {
    const publication = createPublication({ ...completeInput, authors: [] });

    expect(publication.authors).toEqual([]);
    expect(missingFields(publication)).toEqual(["authors"]);
  });
});

describe("Author representation", () => {
  test("Person with given names", () => {
    const publication = createPublication({
      doi,
      authors: [{ kind: "person", family: "Piwowar", given: "Heather A." }],
    });

    expect(publication.authors).toEqual([{ kind: "person", family: "Piwowar", given: "Heather A." }]);
  });

  test("Person without given names", () => {
    const publication = createPublication({ doi, authors: [{ kind: "person", family: "Aristotle" }] });

    expect(publication.authors).toEqual([{ kind: "person", family: "Aristotle", given: null }]);
  });

  test("Person with only given names", () => {
    const publication = createPublication({ doi, authors: [{ kind: "person", given: "Madonna" }] });

    expect(publication.authors).toEqual([{ kind: "person", family: null, given: "Madonna" }]);
  });

  test("Organisation", () => {
    const publication = createPublication({
      doi,
      authors: [{ kind: "organisation", name: "ATLAS Collaboration" }],
    });

    expect(publication.authors).toEqual([{ kind: "organisation", name: "ATLAS Collaboration" }]);
  });

  test("Order", () => {
    const publication = createPublication({
      doi,
      authors: [
        { kind: "person", family: "Piwowar", given: "Heather A." },
        { kind: "person", family: "Day", given: "Roger S." },
        { kind: "person", family: "Fridsma", given: "Douglas B." },
      ],
    });

    expect(publication.authors.map((author) => (author.kind === "person" ? author.family : author.name))).toEqual([
      "Piwowar",
      "Day",
      "Fridsma",
    ]);
  });
});
