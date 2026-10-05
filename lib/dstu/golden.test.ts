// Conformance with the human-approved golden oracle tests/golden/dstu-journal.ts
// (requirement "Approved golden oracle" of openspec/changes/dstu-journal-formatter/specs/dstu-journal-formatting/spec.md).
// The oracle is read here and never changed to match the formatter.
import { describe, expect, test } from "vitest";
import { formatJournalArticle, type FormatOutcome } from "@/lib/dstu/format-journal-article";
import { goldenFixtures, type GoldenExpectation } from "@/tests/golden/dstu-journal";

// Warnings and blocking fields are sets: the comparison ignores their order.
const comparable = (outcome: FormatOutcome | GoldenExpectation) =>
  outcome.kind === "formatted"
    ? { kind: outcome.kind, text: outcome.text, warnings: [...outcome.warnings].sort() }
    : { kind: outcome.kind, blockedBy: [...outcome.blockedBy].sort() };

describe("approved golden oracle", () => {
  test("holds the eight approved fixtures", () => {
    expect(goldenFixtures.map((fixture) => fixture.id)).toEqual([
      "GF01",
      "GF02",
      "GF03",
      "GF04",
      "GF05",
      "GF06",
      "GF07",
      "GF08",
    ]);
  });

  test.each(goldenFixtures.map((fixture) => [fixture.id, fixture.name, fixture] as const))(
    "%s %s yields its approved outcome",
    (_id, _name, fixture) => {
      expect(comparable(formatJournalArticle(fixture.publication))).toEqual(comparable(fixture.expected));
    },
  );
});
