// Expected Publication for each recorded journal-article fixture.
// Source: the Crossref field → Publication field mapping table in
// openspec/changes/doi-resolution/design.md (approved by the human on 2026-10-05), applied by hand to the recorded file.
// Approval of these values (task 4.3): all five approved by the human on 2026-10-05, with two rules:
// different date precisions are preserved exactly as supplied, and no bibliographic value is inferred
// or corrected from the retrieval date (no-volume-issue.json keeps Crossref's 2027 dates).
import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import type { Publication } from "@/lib/publication/publication";

const doi = (value: string) => value as CanonicalDoi;

export const expectedPublications: Record<string, Publication> = {
  "nature12373.json": {
    doi: doi("10.1038/nature12373"),
    title: "Nanometre-scale thermometry in a living cell",
    subtitle: null,
    authors: [
      { kind: "person", family: "Kucsko", given: "G." },
      { kind: "person", family: "Maurer", given: "P. C." },
      { kind: "person", family: "Yao", given: "N. Y." },
      { kind: "person", family: "Kubo", given: "M." },
      { kind: "person", family: "Noh", given: "H. J." },
      { kind: "person", family: "Lo", given: "P. K." },
      { kind: "person", family: "Park", given: "H." },
      { kind: "person", family: "Lukin", given: "M. D." },
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
    articleNumber: null,
    language: "en",
  },

  "pone-0000308.json": {
    doi: doi("10.1371/journal.pone.0000308"),
    title: "Sharing Detailed Research Data Is Associated with Increased Citation Rate",
    subtitle: null,
    authors: [
      { kind: "person", family: "Piwowar", given: "Heather A." },
      { kind: "person", family: "Day", given: "Roger S." },
      { kind: "person", family: "Fridsma", given: "Douglas B." },
    ],
    journalTitle: "PLoS ONE",
    dates: {
      print: null,
      online: { year: 2007, month: 3, day: 21 },
      published: { year: 2007, month: 3, day: 21 },
      issued: { year: 2007, month: 3, day: 21 },
    },
    volume: "2",
    issue: "3",
    pages: "e308",
    articleNumber: null,
    language: "en",
  },

  "title-markup.json": {
    doi: doi("10.1542/pir.27.3.114"),
    title: "Escherichia coli",
    subtitle: null,
    authors: [
      { kind: "person", family: "Goldman", given: "Robin" },
      { kind: "person", family: "Adam", given: "Henry M." },
    ],
    journalTitle: "Pediatrics In Review",
    dates: {
      print: { year: 2006, month: 3, day: 1 },
      online: { year: 2006, month: 3, day: 1 },
      published: { year: 2006, month: 3, day: 1 },
      issued: { year: 2006, month: 3, day: 1 },
    },
    volume: "27",
    issue: "3",
    pages: "114-115",
    articleNumber: null,
    language: "en",
  },

  "group-author-article-number.json": {
    doi: doi("10.1140/epjp/s13360-021-01214-4"),
    title: "High-bandwidth beam balance for vacuum-weight experiment and Newtonian noise subtraction",
    subtitle: null,
    authors: [
      { kind: "organisation", name: "Archimedes Collaboration" },
      { kind: "person", family: "Calloni", given: "Enrico" },
      { kind: "organisation", name: "Virgo Collaboration" },
    ],
    journalTitle: "The European Physical Journal Plus",
    dates: {
      print: { year: 2021, month: 3, day: null },
      online: { year: 2021, month: 3, day: 23 },
      published: { year: 2021, month: 3, day: null },
      issued: { year: 2021, month: 3, day: null },
    },
    volume: "136",
    issue: "3",
    pages: null,
    articleNumber: "335",
    language: "en",
  },

  "no-volume-issue.json": {
    doi: doi("10.5705/ss.202024.0145"),
    title: "Construction of Maximin Distance Latin Hypercube Designs via Good Lattice Point Sets",
    subtitle: null,
    authors: [
      { kind: "person", family: "Zhang", given: "Xueru" },
      { kind: "person", family: "Lin", given: "Dennis K.J." },
      { kind: "person", family: "Zheng", given: "Wei" },
    ],
    journalTitle: "Statistica Sinica",
    dates: {
      print: { year: 2027, month: null, day: null },
      online: { year: 2027, month: null, day: null },
      published: { year: 2027, month: null, day: null },
      issued: { year: 2027, month: null, day: null },
    },
    volume: null,
    issue: null,
    pages: null,
    articleNumber: null,
    language: null,
  },
};
