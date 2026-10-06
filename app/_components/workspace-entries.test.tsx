// @vitest-environment jsdom
// Component tests for openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md, requirements:
// Entry shows its reference, Entry shows the formatter's warnings, Entry that cannot be formatted, Entry shows gaps in
// optional metadata, Indication of gaps makes no claim and changes nothing, Removing an entry, Reordering entries,
// Ukrainian interface (except Page language) and Product terms.
// Expected reference texts are the approved texts of the golden oracle; expected messages are written by hand.
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import {
  button,
  canonical,
  entries,
  entryTexts,
  press,
  renderWith,
} from "@/app/_components/__fixtures__/workspace-driver";
import { approvedText, EM_DASH, ES, goldenPublication, NUMERO, TE } from "@/lib/bibliography/__fixtures__/golden";
import { createPublication, type Publication } from "@/lib/publication/publication";

const GF01 = goldenPublication("GF01");
const GF03 = goldenPublication("GF03");
const GF04 = goldenPublication("GF04");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06"); // no date: cannot be formatted
const GF07 = goldenPublication("GF07");
const GF08 = goldenPublication("GF08");

const WARNINGS = [UI.subtitleCapitalisation, UI.incompletePersonalName, UI.fullStopCollision];

// The entry at a position counted from 1, to look inside it.
const entry = (position: number) => within(entries()[position - 1]);

afterEach(cleanup);

describe("entry shows its reference", () => {
  test("a complete record is shown exactly as approved", async () => {
    await renderWith(GF01);

    // The text of the spec scenario, with its non-ASCII formatting characters as escapes.
    expect(
      entry(1).getByText(
        `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. ${TE}. 12, ${NUMERO} 3. ${ES}. 45${EM_DASH}67. DOI: 10.0000/golden.gf01.`,
      ),
    ).toBeDefined();
    expect(entry(1).getByText(approvedText("GF01"))).toBeDefined();
  });

  test("a doubled full stop is not hidden", async () => {
    await renderWith(GF08);

    expect(entry(1).getByText(approvedText("GF08")).textContent).toContain("Ex. J. Bibliogr. Stud.. 2021");
  });

  test("no reference is numbered or decorated by the workspace", async () => {
    await renderWith(GF01, GF05, GF08);

    // Each reference stands in an element of its own whose whole text is the approved text.
    expect(entry(1).getByText(approvedText("GF01"))).toBeDefined();
    expect(entry(2).getByText(approvedText("GF05"))).toBeDefined();
    expect(entry(3).getByText(approvedText("GF08"))).toBeDefined();
    for (const text of entryTexts()) expect(text).not.toMatch(/^\s*\d+[.)]/);
  });
});

describe("entry shows the formatter's warnings", () => {
  test("subtitle capitalisation", async () => {
    await renderWith(GF03);

    expect(entry(1).getByText(approvedText("GF03"))).toBeDefined();
    expect(entry(1).getByText(UI.subtitleCapitalisation)).toBeDefined();
  });

  test("incomplete personal name", async () => {
    await renderWith(GF07);

    expect(entry(1).getByText(approvedText("GF07"))).toBeDefined();
    expect(entry(1).getByText(UI.incompletePersonalName)).toBeDefined();
  });

  test("full-stop collision", async () => {
    await renderWith(GF08);

    expect(entry(1).getByText(approvedText("GF08"))).toBeDefined();
    expect(entry(1).getByText(UI.fullStopCollision)).toBeDefined();
  });

  test("an entry without warnings shows none", async () => {
    await renderWith(GF01);

    for (const warning of WARNINGS) expect(screen.queryByText(warning)).toBeNull();
  });

  test("an entry shows only the warnings of its own outcome", async () => {
    await renderWith(GF03);

    expect(entry(1).queryByText(UI.incompletePersonalName)).toBeNull();
    expect(entry(1).queryByText(UI.fullStopCollision)).toBeNull();
  });

  test("a warning is shown at its own entry only", async () => {
    await renderWith(GF01, GF08);

    expect(entry(1).queryByText(UI.fullStopCollision)).toBeNull();
    expect(entry(2).getByText(UI.fullStopCollision)).toBeDefined();
  });
});

describe("entry that cannot be formatted", () => {
  test("shows its DOI, says that the reference could not be formed and names the year only", async () => {
    await renderWith(GF06);

    expect(entryTexts()[0]).toContain("10.0000/golden.gf06");
    expect(entry(1).getByText("Не вдалося сформувати посилання. Бракує: рік.")).toBeDefined();
  });

  test("names the title and the journal title, and not the year", async () => {
    const untitled: Publication = { ...GF01, title: null, journalTitle: null };
    await renderWith(untitled);

    expect(entry(1).getByText(UI.cannotBeFormed("назва статті, назва журналу"))).toBeDefined();
  });

  test("names all three blocking fields of a record that holds only its DOI", async () => {
    await renderWith(createPublication({ doi: canonical("10.1038/nature12373") }));

    expect(entry(1).getByText(UI.cannotBeFormed("назва статті, назва журналу, рік"))).toBeDefined();
  });

  test("shows no partial reference and nothing in place of the year", async () => {
    await renderWith(GF06);

    const text = entryTexts()[0];
    expect(text).not.toContain("Citation habits of first-year doctoral students");
    expect(text).not.toContain("Example Journal of Academic Writing");
    expect(text).not.toContain("Petrenko");
    expect(text).not.toContain(" // ");
    expect(text).not.toMatch(/б\. р\.|n\.d\.|\[\s*\]|\?\?/);
  });

  test("shows no warning", async () => {
    await renderWith(GF06);

    for (const warning of WARNINGS) expect(screen.queryByText(warning)).toBeNull();
  });

  test("stays in the list and can be corrected, removed and moved", async () => {
    await renderWith(GF01, GF06);

    expect(entries()).toHaveLength(2);
    expect(button(UI.correct(2)).disabled).toBe(false);
    expect(button(UI.remove(2)).disabled).toBe(false);
    expect(button(UI.moveUp(2)).disabled).toBe(false);
  });
});

describe("entry shows gaps in optional metadata", () => {
  test("a typical complete article, without subtitle or article number, shows no indication", async () => {
    await renderWith(GF01);

    expect(entry(1).getByText(approvedText("GF01"))).toBeDefined();
    expect(entryTexts()[0]).not.toContain(UI.gapsPrefix);
  });

  test("the minimal record shows all four gaps", async () => {
    await renderWith(GF05);

    expect(
      entry(1).getByText("Не вказано в метаданих: автори, том, номер випуску, сторінки або номер статті."),
    ).toBeDefined();
  });

  test("an article number without pages: the issue only", async () => {
    await renderWith(GF04);

    expect(entry(1).getByText(UI.gaps("номер випуску"))).toBeDefined();
  });

  test("pages and an article number: the volume only", async () => {
    await renderWith(GF07);

    expect(entry(1).getByText(UI.gaps("том"))).toBeDefined();
  });

  test("a missing subtitle is never reported", async () => {
    await renderWith(GF01, GF04, GF05, GF07);

    for (const text of entryTexts()) expect(text).not.toContain("підзаголовок");
  });

  test("the language and the dates are never reported", async () => {
    await renderWith(GF05);

    // GF05 has no language and no print, issued or published date.
    const indication = entry(1).getByText(/^Не вказано в метаданих/).textContent ?? "";
    expect(indication).toBe(UI.gaps("автори, том, номер випуску, сторінки або номер статті"));
    expect(indication).not.toMatch(/мов[аи]|дат[аи]|рік/);
  });

  test("an entry that cannot be formatted and has a gap shows both", async () => {
    const withoutVolume: Publication = { ...GF06, volume: null };
    await renderWith(withoutVolume);

    expect(entry(1).getByText(UI.cannotBeFormed("рік"))).toBeDefined();
    expect(entry(1).getByText(UI.gaps("том"))).toBeDefined();
  });

  test("an entry that cannot be formatted and has no gap shows no indication", async () => {
    await renderWith(GF06);

    expect(entry(1).getByText(UI.cannotBeFormed("рік"))).toBeDefined();
    expect(entryTexts()[0]).not.toContain(UI.gapsPrefix);
  });

  test("the indication is shown without a correction being open", async () => {
    await renderWith(GF05);

    expect(screen.queryByRole("form", { name: UI.correctionHeading })).toBeNull();
    expect(entry(1).getByText(UI.gaps("автори, том, номер випуску, сторінки або номер статті"))).toBeDefined();
  });
});

describe("indication of gaps makes no claim and changes nothing", () => {
  test("the reference is the approved one, and the indication stands apart from it", async () => {
    await renderWith(GF05);

    const reference = entry(1).getByText(approvedText("GF05"));
    const indication = entry(1).getByText(UI.gaps("автори, том, номер випуску, сторінки або номер статті"));
    expect(reference).not.toBe(indication);
    expect(reference.contains(indication)).toBe(false);
  });

  test("copying is not blocked", async () => {
    await renderWith(GF05);

    expect(button(UI.copyOne(1)).disabled).toBe(false);
    expect(button(UI.copyAll).disabled).toBe(false);
  });

  test("it says what the metadata does not give and not that a value is required", async () => {
    await renderWith(GF05);

    const indication = entry(1).getByText(/^Не вказано в метаданих/).textContent ?? "";
    expect(indication).not.toMatch(/обов.язков|потрібн|вимага|ДСТУ|бракує/i);
  });
});

describe("removing an entry", () => {
  test("the entry in the middle goes at once and the others keep their order", async () => {
    await renderWith(GF01, GF05, GF08);

    press(UI.remove(2));

    expect(entries()).toHaveLength(2);
    expect(entryTexts()[0]).toContain(approvedText("GF01"));
    expect(entryTexts()[1]).toContain(approvedText("GF08"));
    expect(screen.queryByText(approvedText("GF05"))).toBeNull();
  });

  test("removing the only entry leaves an empty list, and the page says so", async () => {
    await renderWith(GF01);

    press(UI.remove(1));

    expect(entries()).toEqual([]);
    expect(screen.getByText(UI.emptyList)).toBeDefined();
  });
});

describe("reordering entries", () => {
  const order = () => entryTexts().map((text) => ["GF01", "GF05", "GF08"].find((id) => text.includes(approvedText(id))));

  test("moving up exchanges the entry with the one before it", async () => {
    await renderWith(GF01, GF05, GF08);

    press(UI.moveUp(2));

    expect(order()).toEqual(["GF05", "GF01", "GF08"]);
  });

  test("moving down exchanges the entry with the one after it", async () => {
    await renderWith(GF01, GF05, GF08);

    press(UI.moveDown(2));

    expect(order()).toEqual(["GF01", "GF08", "GF05"]);
  });

  test("the first entry cannot move up and the last cannot move down", async () => {
    await renderWith(GF01, GF05, GF08);

    expect(button(UI.moveUp(1)).disabled).toBe(true);
    expect(button(UI.moveDown(3)).disabled).toBe(true);
    expect(button(UI.moveDown(1)).disabled).toBe(false);
    expect(button(UI.moveUp(2)).disabled).toBe(false);
    expect(button(UI.moveDown(2)).disabled).toBe(false);
    expect(button(UI.moveUp(3)).disabled).toBe(false);
  });

  test("a single entry cannot move either way", async () => {
    await renderWith(GF01);

    expect(button(UI.moveUp(1)).disabled).toBe(true);
    expect(button(UI.moveDown(1)).disabled).toBe(true);
  });

  test("nothing is sorted: an entry that would sort first is added last", async () => {
    // GF01 begins with «Коваленко», GF08 with «Bondarenko».
    await renderWith(GF01, GF08);

    expect(entryTexts()[0]).toContain("Коваленко");
    expect(entryTexts()[1]).toContain("Bondarenko");
  });
});

describe("Ukrainian interface and product terms", () => {
  test("the list is headed «Перелік посилань»", async () => {
    await renderWith(GF01);

    expect(screen.getByRole("heading", { level: 2, name: "Перелік посилань" })).toBeDefined();
    expect(screen.getByRole("list", { name: "Перелік посилань" })).toBeDefined();
  });

  test("an item of the list is called «запис» in the names of its controls", async () => {
    await renderWith(GF01, GF05);

    expect(button("Вилучити: запис 2")).toBeDefined();
    expect(button("Копіювати: запис 1")).toBeDefined();
    expect(button("Редагувати: запис 1")).toBeDefined();
    expect(button("Вище: запис 2")).toBeDefined();
    expect(button("Нижче: запис 1")).toBeDefined();
  });

  test("the same control of two entries has two different accessible names", async () => {
    await renderWith(GF01, GF05);

    expect(screen.getAllByRole("button", { name: UI.remove(1) })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: UI.remove(2) })).toHaveLength(1);
  });

  test("an item without a reference is a «запис», and the text about it uses «посилання»", async () => {
    await renderWith(GF06);

    expect(button("Редагувати: запис 1")).toBeDefined();
    expect(button("Вилучити: запис 1")).toBeDefined();
    expect(entry(1).getByText("Не вдалося сформувати посилання. Бракує: рік.")).toBeDefined();
  });

  test("every control has an accessible name", async () => {
    await renderWith(GF01, GF06);

    for (const control of screen.getAllByRole("button")) {
      expect((control.getAttribute("aria-label") ?? control.textContent ?? "").trim()).not.toBe("");
    }
  });

  test("the names of the controls follow the position after a move", async () => {
    await renderWith(GF01, GF05);

    press(UI.moveDown(1));

    expect(within(entries()[1]).getByRole("button", { name: UI.remove(2) })).toBeDefined();
    expect(entryTexts()[1]).toContain(approvedText("GF01"));
  });
});
