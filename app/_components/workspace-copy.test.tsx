// @vitest-environment jsdom
// Component tests for openspec/changes/bibliography-workspace/specs/bibliography-copy/spec.md. The clipboard of the
// page is a stub. Expected texts are the approved texts of the golden oracle or are written by hand.
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import {
  button,
  canonical,
  entries,
  entryTexts,
  press,
  renderWith,
  renderWorkspace,
  resolverFor,
  save,
  typeInto,
} from "@/app/_components/__fixtures__/workspace-driver";
import { approvedText, EM_DASH, ES, goldenPublication, NUMERO, TE } from "@/lib/bibliography/__fixtures__/golden";
import type { Publication } from "@/lib/publication/publication";

const GF01 = goldenPublication("GF01");
const GF03 = goldenPublication("GF03");
const GF05 = goldenPublication("GF05");
const GF06 = goldenPublication("GF06"); // no date: cannot be formatted
const GF08 = goldenPublication("GF08");

// A second entry that cannot be formatted, with a DOI of its own: GF01 without its title.
const untitled = (): Publication => ({ ...GF01, doi: canonical("10.0000/workspace.untitled"), title: null });

const WARNINGS = [UI.subtitleCapitalisation, UI.incompletePersonalName, UI.fullStopCollision];

type WriteText = (text: string) => Promise<void>;

// Puts a clipboard on the page of the test, or takes it away with `undefined`.
const setClipboard = (clipboard: { writeText: WriteText } | undefined) =>
  Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });

const acceptingClipboard = () => {
  const writeText = vi.fn<WriteText>(async () => {});
  setClipboard({ writeText });
  return writeText;
};

const refusingClipboard = () => {
  const writeText = vi.fn<WriteText>(async () => {
    throw new DOMException("Write permission denied.", "NotAllowedError");
  });
  setClipboard({ writeText });
  return writeText;
};

const copyAllButton = () => button(UI.copyAll);

afterEach(() => {
  cleanup();
  setClipboard(undefined);
});

describe("copying one reference", () => {
  test("the clipboard holds the reference and nothing else", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01);

    press(UI.copyOne(1));

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([
      [
        `Коваленко, Олена. Цифрові архіви в університетських бібліотеках // Умовний науковий вісник. 2021. ${TE}. 12, ${NUMERO} 3. ${ES}. 45${EM_DASH}67. DOI: 10.0000/golden.gf01.`,
      ],
    ]);
    expect(writeText.mock.calls).toEqual([[approvedText("GF01")]]);
  });

  test("a reference with a warning is copied as it is, without the warning text", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF08);

    press(UI.copyOne(1));

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[approvedText("GF08")]]);
    const copiedText = writeText.mock.calls[0][0];
    expect(copiedText).toContain("Stud.. 2021");
    for (const warning of WARNINGS) expect(copiedText).not.toContain(warning);
  });

  test("the entry of one reference is copied, not that of another", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF05);

    press(UI.copyOne(2));

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[approvedText("GF05")]]);
  });

  test("an entry that cannot be formatted offers no copy", async () => {
    acceptingClipboard();
    await renderWith(GF06);

    expect(screen.queryByRole("button", { name: UI.copyOne(1) })).toBeNull();
    expect(button(UI.correct(1))).toBeDefined();
  });
});

describe("copying the whole list", () => {
  test("two references are joined by one line feed, in the order of the list", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF05);

    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[`${approvedText("GF01")}\n${approvedText("GF05")}`]]);
  });

  test("the order follows the list after a move", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF05);

    press(UI.moveUp(2));
    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[`${approvedText("GF05")}\n${approvedText("GF01")}`]]);
  });

  test("a single reference is copied with no line feed", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01);

    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[approvedText("GF01")]]);
  });

  test("no line begins with a number and none is empty", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF05, GF08);

    press(UI.copyAll);

    await screen.findByText(UI.copied);
    const lines = writeText.mock.calls[0][0].split("\n");
    expect(lines).toEqual([approvedText("GF01"), approvedText("GF05"), approvedText("GF08")]);
  });

  test("a corrected entry is copied as the reference of its corrected publication", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF06);

    press(UI.correct(2));
    typeInto(UI.year, "2021");
    save();
    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([
      [
        `${approvedText("GF01")}\nPetrenko, Andrii; Lee, Sora. Citation habits of first-year doctoral students // Example Journal of Academic Writing. 2021. ${TE}. 3, ${NUMERO} 2. ${ES}. 210${EM_DASH}225. DOI: 10.0000/golden.gf06.`,
      ],
    ]);
  });
});

describe("copying the whole list is blocked by an unformatted entry", () => {
  test("the control is shown and disabled, with the number of entries to correct or remove", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF06);

    expect(copyAllButton().disabled).toBe(true);
    expect(
      screen.getByText(
        "Щоб скопіювати весь перелік, виправте або вилучіть записи, для яких не сформовано посилання: 1.",
      ),
    ).toBeDefined();

    press(UI.copyAll);

    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText(UI.copied)).toBeNull();
  });

  test("two such entries are counted as two", async () => {
    acceptingClipboard();
    await renderWith(GF06, GF01, untitled());

    expect(copyAllButton().disabled).toBe(true);
    expect(screen.getByText(UI.copyAllBlocked(2))).toBeDefined();
  });

  test("correcting the entry makes copying available and takes the message away", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF06);

    press(UI.correct(2));
    typeInto(UI.year, "2021");
    save();

    expect(copyAllButton().disabled).toBe(false);
    expect(screen.queryByText(UI.copyAllBlocked(1))).toBeNull();
    expect(document.body.textContent).not.toContain(UI.copyAllBlockedPrefix);
    expect(writeText).not.toHaveBeenCalled();
  });

  test("removing the entry makes copying available and takes the message away", async () => {
    acceptingClipboard();
    await renderWith(GF01, GF06);

    press(UI.remove(2));

    expect(copyAllButton().disabled).toBe(false);
    expect(document.body.textContent).not.toContain(UI.copyAllBlockedPrefix);
  });

  test("an empty list shows the control disabled and no message about entries to correct", () => {
    acceptingClipboard();
    renderWorkspace(resolverFor());

    expect(copyAllButton().disabled).toBe(true);
    expect(document.body.textContent).not.toContain(UI.copyAllBlockedPrefix);
  });

  test("the control is disabled again when the last entry is removed", async () => {
    acceptingClipboard();
    await renderWith(GF01);
    expect(copyAllButton().disabled).toBe(false);

    press(UI.remove(1));

    expect(copyAllButton().disabled).toBe(true);
  });

  test("warnings do not block copying", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF03, GF08);

    expect(copyAllButton().disabled).toBe(false);
    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[`${approvedText("GF03")}\n${approvedText("GF08")}`]]);
  });

  test("gaps in optional metadata do not block copying", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF05);

    press(UI.copyAll);

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[approvedText("GF05")]]);
  });

  test("one reference can still be copied while the whole list is blocked", async () => {
    const writeText = acceptingClipboard();
    await renderWith(GF01, GF06);

    press(UI.copyOne(1));

    await screen.findByText(UI.copied);
    expect(writeText.mock.calls).toEqual([[approvedText("GF01")]]);
  });
});

describe("copy is confirmed", () => {
  test("no confirmation is shown before anything is copied", async () => {
    acceptingClipboard();
    await renderWith(GF01);

    expect(screen.queryByText(UI.copied)).toBeNull();
    expect(screen.queryByText(UI.copyFailed)).toBeNull();
  });

  test("the page says that the text was copied", async () => {
    acceptingClipboard();
    await renderWith(GF01);

    press(UI.copyOne(1));

    expect(await screen.findByText(UI.copied)).toBeDefined();
    expect(screen.queryByText(UI.copyFailed)).toBeNull();
  });

  test("copying changes neither the entries nor their order", async () => {
    acceptingClipboard();
    await renderWith(GF01, GF05, GF08);
    const before = entryTexts().map((text) => ["GF01", "GF05", "GF08"].find((id) => text.includes(approvedText(id))));

    press(UI.copyAll);
    await screen.findByText(UI.copied);

    expect(before).toEqual(["GF01", "GF05", "GF08"]);
    expect(entries()).toHaveLength(3);
    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
    expect(within(entries()[1]).getByText(approvedText("GF05"))).toBeDefined();
    expect(within(entries()[2]).getByText(approvedText("GF08"))).toBeDefined();
  });
});

describe("clipboard failure is reported", () => {
  test("a clipboard that refuses the text: the page says that copying failed and confirms nothing", async () => {
    const writeText = refusingClipboard();
    await renderWith(GF01);

    press(UI.copyOne(1));

    expect(await screen.findByText(UI.copyFailed)).toBeDefined();
    expect(screen.queryByText(UI.copied)).toBeNull();
    // One attempt and no other way of copying.
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  test("a page without a clipboard: the page says that copying failed", async () => {
    setClipboard(undefined);
    await renderWith(GF01);

    press(UI.copyOne(1));

    expect(await screen.findByText(UI.copyFailed)).toBeDefined();
    expect(screen.queryByText(UI.copied)).toBeNull();
  });

  test("the whole list: a refusal is reported in the same way", async () => {
    refusingClipboard();
    await renderWith(GF01, GF05);

    press(UI.copyAll);

    expect(await screen.findByText(UI.copyFailed)).toBeDefined();
    expect(screen.queryByText(UI.copied)).toBeNull();
  });

  test("the reference stays on the page after a failure", async () => {
    refusingClipboard();
    await renderWith(GF01);

    press(UI.copyOne(1));
    await screen.findByText(UI.copyFailed);

    expect(within(entries()[0]).getByText(approvedText("GF01"))).toBeDefined();
  });

  test("a later copy that succeeds replaces the failure message", async () => {
    refusingClipboard();
    await renderWith(GF01);
    press(UI.copyOne(1));
    await screen.findByText(UI.copyFailed);

    acceptingClipboard();
    press(UI.copyOne(1));

    expect(await screen.findByText(UI.copied)).toBeDefined();
    await waitFor(() => expect(screen.queryByText(UI.copyFailed)).toBeNull());
  });
});
