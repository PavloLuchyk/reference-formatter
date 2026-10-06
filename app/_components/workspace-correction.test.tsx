// @vitest-environment jsdom
// Component tests for openspec/changes/bibliography-workspace/specs/metadata-correction/spec.md, driven through the
// page: the correction is opened at an entry, fields are changed and the correction is saved or cancelled.
// Expected reference texts are the approved texts of the golden oracle or are written by hand from the scenarios.
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import {
  authorField,
  authorKind,
  authorRow,
  button,
  cancel,
  canonical,
  chooseAuthorKind,
  correction,
  entries,
  entryTexts,
  field,
  press,
  renderWith,
  save,
  submitDoi,
  typeInto,
  typeIntoAuthor,
} from "@/app/_components/__fixtures__/workspace-driver";
import { approvedText, EM_DASH, ES, goldenPublication, NUMERO, TE } from "@/lib/bibliography/__fixtures__/golden";
import { createPublication, type Publication } from "@/lib/publication/publication";

const GF01 = goldenPublication("GF01");
const GF02 = goldenPublication("GF02");
const GF03 = goldenPublication("GF03");
const GF04 = goldenPublication("GF04");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06");
const GF07 = goldenPublication("GF07");
const GF08 = goldenPublication("GF08");

// An entry whose only date is an issued date of the year 999, outside the range accepted for a typed year.
const sourceYear999 = (): Publication =>
  createPublication({
    doi: canonical("10.0000/workspace.year999"),
    title: "An old charter",
    journalTitle: "Example Archive",
    dates: { issued: { year: 999 } },
  });

const openCorrection = (position = 1) => press(UI.correct(position));

const correctionIsOpen = () => screen.queryByRole("form", { name: UI.correctionHeading }) !== null;

const labelOf = (input: HTMLElement) => (input as HTMLInputElement).labels?.[0]?.textContent ?? "";

afterEach(cleanup);

describe("correctable fields", () => {
  test("the correction offers the nine approved fields and shows the DOI", async () => {
    await renderWith(GF05);

    openCorrection();

    expect(within(correction()).getByRole("heading", { name: UI.correctionHeading })).toBeDefined();
    // GF05 has no authors, so every text field of the form is one of the scalar fields or the DOI.
    expect(within(correction()).getAllByRole("textbox").map(labelOf).sort()).toEqual(
      [
        "DOI",
        "Назва статті",
        "Підзаголовок",
        "Назва журналу",
        "Рік",
        "Том",
        "Номер випуску",
        "Сторінки",
        "Номер статті",
      ].sort(),
    );
    expect(within(correction()).getByRole("group", { name: UI.authorsHeading })).toBeDefined();
  });

  test("the DOI is shown and cannot be edited", async () => {
    await renderWith(GF01);

    openCorrection();

    expect(field(UI.doi).value).toBe("10.0000/golden.gf01");
    expect(field(UI.doi).readOnly).toBe(true);
  });

  test("there is one year field and no field for a date, a month, a day or the language", async () => {
    await renderWith(GF02);

    openCorrection();

    const authorLabels: string[] = [UI.family, UI.given, UI.organisationName];
    const labels = within(correction())
      .getAllByRole("textbox")
      .map(labelOf)
      .filter((label) => !authorLabels.includes(label));
    expect(labels.filter((label) => label === UI.year)).toHaveLength(1);
    expect(labels).toHaveLength(9);
    expect(within(correction()).queryByRole("spinbutton")).toBeNull();
    expect(correction().querySelector('input[type="date"], input[type="month"], input[type="number"]')).toBeNull();
  });
});

describe("current values are shown as stored", () => {
  test("a complete record", async () => {
    await renderWith(GF01);

    openCorrection();

    expect(field(UI.title).value).toBe("Цифрові архіви в університетських бібліотеках");
    expect(field(UI.subtitle).value).toBe("");
    expect(field(UI.journalTitle).value).toBe("Умовний науковий вісник");
    expect(field(UI.year).value).toBe("2021");
    expect(field(UI.volume).value).toBe("12");
    expect(field(UI.issue).value).toBe("3");
    expect(field(UI.pages).value).toBe("45-67");
    expect(field(UI.articleNumber).value).toBe("");
    expect(authorField(1, UI.family).value).toBe("Коваленко");
    expect(authorField(1, UI.given).value).toBe("Олена");
  });

  test("a Roman-numeral volume is shown as stored", async () => {
    await renderWith(GF03);

    openCorrection();

    expect(field(UI.volume).value).toBe("XII");
    expect(field(UI.pages).value).toBe("5 - 12");
  });

  test("missing values are empty fields and the list of authors is empty", async () => {
    await renderWith(GF05);

    openCorrection();

    for (const label of [UI.subtitle, UI.volume, UI.issue, UI.pages, UI.articleNumber]) {
      expect(field(label).value).toBe("");
      expect(field(label).placeholder).toBe("");
    }
    expect(within(correction()).queryByRole("group", { name: UI.author(1) })).toBeNull();
    expect(within(correction()).getByText(UI.noAuthors)).toBeDefined();
  });

  test("an organisation and a person are shown with their kinds", async () => {
    await renderWith(GF04);

    openCorrection();

    expect(authorKind(1).selectedOptions[0].textContent).toBe(UI.organisation);
    expect(authorField(1, UI.organisationName).value).toBe("Regional Library Consortium");
    expect(authorKind(2).selectedOptions[0].textContent).toBe(UI.person);
    expect(authorField(2, UI.family).value).toBe("Shevchuk");
    expect(authorField(2, UI.given).value).toBe("Iryna");
  });

  test.each([
    ["GF02", GF02, "2022"],
    ["GF03", GF03, "2019"],
    ["GF06", GF06, ""],
  ])("the year shown for %s", async (_id, publication, year) => {
    await renderWith(publication);

    openCorrection();

    expect(field(UI.year).value).toBe(year);
  });
});

describe("saving and cancelling", () => {
  test("saving closes the correction and shows the corrected reference", async () => {
    const withoutTitle: Publication = { ...GF01, title: null };
    await renderWith(withoutTitle);
    expect(within(entries()[0]).getByText(UI.cannotBeFormed("назва статті"))).toBeDefined();

    openCorrection();
    typeInto(UI.title, "Цифрові архіви в університетських бібліотеках");
    save();

    expect(correctionIsOpen()).toBe(false);
    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
    expect(screen.queryByText(UI.cannotBeFormed("назва статті"))).toBeNull();
  });

  test("cancelling leaves the entry as it was", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.title, "Another title");
    cancel();

    expect(correctionIsOpen()).toBe(false);
    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
  });

  test("a cancelled change is not there when the correction is opened again", async () => {
    await renderWith(GF01);
    openCorrection();
    typeInto(UI.title, "Another title");
    cancel();

    openCorrection();

    expect(field(UI.title).value).toBe("Цифрові архіви в університетських бібліотеках");
  });

  test("saving without a change leaves the reference as it was", async () => {
    await renderWith(GF02);

    openCorrection();
    save();

    expect(within(entries()[0]).getByText(approvedText("GF02"))).toBeDefined();
  });

  test("the corrected entry keeps its position", async () => {
    await renderWith(GF01, GF05, GF08);

    openCorrection(2);
    typeInto(UI.title, "A corrected editorial note");
    save();

    expect(entryTexts()[0]).toContain(approvedText("GF01"));
    expect(entryTexts()[1]).toContain(
      "A corrected editorial note // Example Bulletin of Research Practice. 2024. DOI: 10.0000/golden.gf05.",
    );
    expect(entryTexts()[2]).toContain(approvedText("GF08"));
  });

  test("a corrected entry is still the same publication: its DOI is not added again", async () => {
    const resolve = await renderWith(GF01);
    openCorrection();
    typeInto(UI.title, "A corrected title");
    save();

    submitDoi("10.0000/golden.gf01");

    expect(screen.getByRole("alert").textContent).toBe(UI.duplicate);
    expect(entries()).toHaveLength(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(entryTexts()[0]).toContain("Коваленко, Олена. A corrected title // ");
  });

  test("the correction is opened at its own entry", async () => {
    await renderWith(GF01, GF05);

    openCorrection(2);

    expect(within(entries()[1]).getByRole("form", { name: UI.correctionHeading })).toBeDefined();
    expect(field(UI.doi).value).toBe("10.0000/golden.gf05");
  });
});

describe("reference is recomputed from the publication", () => {
  test("a warning disappears with its cause", async () => {
    await renderWith(GF03);
    expect(screen.getByText(UI.subtitleCapitalisation)).toBeDefined();

    openCorrection();
    typeInto(UI.subtitle, "lessons from a national pilot");
    save();

    expect(entryTexts()[0]).toContain("Persistent identifiers in practice : lessons from a national pilot / ");
    expect(screen.queryByText(UI.subtitleCapitalisation)).toBeNull();
    expect(screen.queryByText(approvedText("GF03"))).toBeNull();
  });

  test("a full-stop collision is corrected", async () => {
    await renderWith(GF08);
    expect(screen.getByText(UI.fullStopCollision)).toBeDefined();

    openCorrection();
    typeInto(UI.journalTitle, "Example Journal of Bibliographic Studies");
    save();

    expect(entryTexts()[0]).toContain(" // Example Journal of Bibliographic Studies. 2021. ");
    expect(screen.queryByText(UI.fullStopCollision)).toBeNull();
  });

  test("a required value is removed", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.journalTitle, "");
    save();

    expect(screen.queryByText(approvedText("GF01"))).toBeNull();
    expect(within(entries()[0]).getByText(UI.cannotBeFormed("назва журналу"))).toBeDefined();
    expect(entryTexts()[0]).not.toContain(" // ");
  });

  test("the indication of gaps follows a correction", async () => {
    await renderWith(GF07);
    expect(screen.getByText(UI.gaps("том"))).toBeDefined();

    openCorrection();
    typeInto(UI.volume, "9");
    save();

    expect(entryTexts()[0]).not.toContain(UI.gapsPrefix);
    expect(entryTexts()[0]).toContain(`2020. ${TE}. 9, ${NUMERO} 4. `);
  });
});

describe("blank values and surrounding whitespace", () => {
  test("an emptied optional field leaves its zone out", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.issue, "");
    save();

    expect(entryTexts()[0]).toContain(`. 2021. ${TE}. 12. ${ES}. 45${EM_DASH}67. `);
    expect(screen.getByText(UI.gaps("номер випуску"))).toBeDefined();
  });

  test("a field of only whitespace makes the value missing", async () => {
    await renderWith(GF02);

    openCorrection();
    typeInto(UI.subtitle, "   ");
    save();

    expect(entryTexts()[0]).toContain("Measuring reuse of open research data // Example Journal of Information Studies. ");
  });

  test("surrounding whitespace is ignored", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.journalTitle, "  Nature  ");
    save();

    expect(entryTexts()[0]).toContain(" // Nature. 2021. ");
  });

  test("a value is otherwise kept as typed", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.title, "THE ORIGIN  OF SPECIES");
    save();
    openCorrection();

    expect(field(UI.title).value).toBe("THE ORIGIN  OF SPECIES");
  });
});

describe("the year", () => {
  test("a missing year is supplied", async () => {
    await renderWith(GF06);

    openCorrection();
    typeInto(UI.year, "2021");
    save();

    expect(entryTexts()[0]).toContain(`Example Journal of Academic Writing. 2021. ${TE}. 3, ${NUMERO} 2. `);
    expect(screen.queryByText(UI.cannotBeFormed("рік"))).toBeNull();
  });

  test("a year is changed where the issued date gave it", async () => {
    await renderWith(GF03);

    openCorrection();
    typeInto(UI.year, "2020");
    save();

    expect(entryTexts()[0]).toContain("Example Review of Scholarly Communication. 2020. ");
    openCorrection();
    expect(field(UI.year).value).toBe("2020");
  });

  test("whitespace around a typed year is ignored", async () => {
    await renderWith(GF06);

    openCorrection();
    typeInto(UI.year, " 2021 ");
    save();

    expect(correctionIsOpen()).toBe(false);
    expect(entryTexts()[0]).toContain("Example Journal of Academic Writing. 2021. ");
  });

  test("an emptied year leaves the entry without a reference, for want of the year", async () => {
    await renderWith(GF02);

    openCorrection();
    typeInto(UI.year, "");
    save();

    expect(screen.queryByText(approvedText("GF02"))).toBeNull();
    expect(within(entries()[0]).getByText(UI.cannotBeFormed("рік"))).toBeDefined();
  });

  test.each(["2021a", "21", "2021-03", "0999", "20211", "２０２１"])(
    "the year %s is not accepted: nothing is saved and the correction stays open",
    async (typed) => {
      await renderWith(GF01);

      openCorrection();
      typeInto(UI.year, typed);
      save();

      expect(correctionIsOpen()).toBe(true);
      expect(field(UI.year).value).toBe(typed);
      expect(within(correction()).getByText(UI.invalidYear)).toBeDefined();
      expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
    },
  );

  test("other fields typed with a rejected year are kept in the correction and not saved", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.title, "A new title");
    typeInto(UI.year, "21");
    save();

    expect(field(UI.title).value).toBe("A new title");
    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
  });

  test("the message at the year field goes when the year is corrected and saved", async () => {
    await renderWith(GF01);
    openCorrection();
    typeInto(UI.year, "21");
    save();
    expect(within(correction()).getByText(UI.invalidYear)).toBeDefined();

    typeInto(UI.year, "2020");
    save();

    expect(correctionIsOpen()).toBe(false);
    expect(screen.queryByText(UI.invalidYear)).toBeNull();
    expect(entryTexts()[0]).toContain("Умовний науковий вісник. 2020. ");
  });

  test("no message is shown at the year field before a year is rejected", async () => {
    await renderWith(GF01);

    openCorrection();

    expect(screen.queryByText(UI.invalidYear)).toBeNull();
  });

  test("an unchanged source year outside the accepted range lets another field be corrected", async () => {
    await renderWith(sourceYear999());

    openCorrection();
    expect(field(UI.year).value).toBe("999");
    typeInto(UI.title, "A corrected title");
    save();

    expect(correctionIsOpen()).toBe(false);
    expect(screen.queryByText(UI.invalidYear)).toBeNull();
    expect(
      within(entries()[0]).getByText("A corrected title // Example Archive. 999. DOI: 10.0000/workspace.year999."),
    ).toBeDefined();
  });

  test("changing that year to another value that is not accepted is rejected", async () => {
    await renderWith(sourceYear999());

    openCorrection();
    typeInto(UI.year, "99");
    save();

    expect(correctionIsOpen()).toBe(true);
    expect(within(correction()).getByText(UI.invalidYear)).toBeDefined();
  });
});

describe("correcting the list of authors", () => {
  test("an added author starts as a person without names", async () => {
    await renderWith(GF05);

    openCorrection();
    press(UI.addAuthor);

    expect(authorKind(1).selectedOptions[0].textContent).toBe(UI.person);
    expect(authorField(1, UI.family).value).toBe("");
    expect(authorField(1, UI.given).value).toBe("");
    expect(within(authorRow(1)).queryByLabelText(UI.organisationName)).toBeNull();
    expect(within(correction()).queryByText(UI.noAuthors)).toBeNull();
  });

  test("an author is added at the end", async () => {
    await renderWith(GF05);

    openCorrection();
    press(UI.addAuthor);
    typeIntoAuthor(1, UI.family, "Shevchuk");
    typeIntoAuthor(1, UI.given, "Iryna");
    save();

    expect(entryTexts()[0]).toContain("Shevchuk, Iryna. Editorial note on data availability statements // ");
  });

  test("a given value is changed", async () => {
    await renderWith(GF01);

    openCorrection();
    typeIntoAuthor(1, UI.given, "О.");
    save();

    expect(entryTexts()[0]).toContain("Коваленко, О. Цифрові архіви");
  });

  test("an author is removed", async () => {
    await renderWith(GF04);

    openCorrection();
    press(UI.removeAuthor(1));
    save();

    expect(entryTexts()[0]).toContain("Shevchuk, Iryna. Shared cataloguing after migration // ");
    expect(entryTexts()[0]).not.toContain("Regional Library Consortium");
  });

  test("the order is changed", async () => {
    await renderWith(GF04);

    openCorrection();
    press(UI.moveAuthorUp(2));
    save();

    expect(entryTexts()[0]).toContain(
      "Shevchuk, Iryna; Regional Library Consortium. Shared cataloguing after migration // ",
    );
  });

  test("the first author cannot move up and the last cannot move down", async () => {
    await renderWith(GF04);

    openCorrection();

    expect(button(UI.moveAuthorUp(1)).disabled).toBe(true);
    expect(button(UI.moveAuthorDown(2)).disabled).toBe(true);
    expect(button(UI.moveAuthorDown(1)).disabled).toBe(false);
    expect(button(UI.moveAuthorUp(2)).disabled).toBe(false);
  });

  test("a person is set as an organisation", async () => {
    await renderWith(GF07);
    expect(screen.getByText(UI.incompletePersonalName)).toBeDefined();

    openCorrection();
    chooseAuthorKind(1, UI.organisation);
    typeIntoAuthor(1, UI.organisationName, "Okafor Research Group");
    save();

    expect(entryTexts()[0]).toContain("Okafor Research Group. Supplementary tables");
    expect(screen.queryByText(UI.incompletePersonalName)).toBeNull();
  });

  test("names of the other kind are not carried over", async () => {
    await renderWith(GF07);

    openCorrection();
    chooseAuthorKind(1, UI.organisation);

    expect(authorField(1, UI.organisationName).value).toBe("");
    expect(within(authorRow(1)).queryByLabelText(UI.family)).toBeNull();

    save();

    // No author is left: the reference begins with the title, and the gap is shown.
    expect(entryTexts()[0]).toContain(
      "Supplementary tables for the regional reading survey // Example Annals of Reading Research. 2020. ",
    );
    expect(entryTexts()[0]).not.toContain("Okafor");
    expect(screen.getByText(UI.gaps("автори, том"))).toBeDefined();
  });

  test("every author is removed", async () => {
    await renderWith(GF01);

    openCorrection();
    press(UI.removeAuthor(1));
    save();

    expect(entryTexts()[0]).toContain("Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. ");
    expect(entryTexts()[0]).not.toContain("Коваленко");
    expect(screen.getByText(UI.gaps("автори"))).toBeDefined();
  });

  test("an author row left empty is not saved", async () => {
    await renderWith(GF01);

    openCorrection();
    press(UI.addAuthor);
    save();

    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
    openCorrection();
    expect(within(correction()).queryByRole("group", { name: UI.author(2) })).toBeNull();
  });

  test("a removed given value leaves a person with a family name only, with its warning", async () => {
    await renderWith(GF01);

    openCorrection();
    typeIntoAuthor(1, UI.given, "");
    save();

    expect(entryTexts()[0]).toContain("Коваленко. Цифрові архіви в університетських бібліотеках // ");
    expect(screen.getByText(UI.incompletePersonalName)).toBeDefined();
  });

  test("surrounding whitespace in a name is ignored", async () => {
    await renderWith(GF05);

    openCorrection();
    press(UI.addAuthor);
    typeIntoAuthor(1, UI.family, " Shevchuk ");
    typeIntoAuthor(1, UI.given, " Iryna ");
    save();

    expect(entryTexts()[0]).toContain("Shevchuk, Iryna. Editorial note");
  });

  test("a correction that does not touch the author keeps the given name as it is", async () => {
    await renderWith(GF01);

    openCorrection();
    typeInto(UI.volume, "13");
    save();

    expect(entryTexts()[0]).toContain("Коваленко, Олена. Цифрові архіви");
  });
});
