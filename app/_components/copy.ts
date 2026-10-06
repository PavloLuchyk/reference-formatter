import type { MetadataGap } from "@/lib/bibliography/metadata-gaps";
import type { BlockingField, FormatWarning } from "@/lib/dstu/format-journal-article";
import type { ResolutionFailure } from "@/lib/metadata/resolution";

// Every Ukrainian string of the workspace. The wording is the copy table of the design of the change
// bibliography-workspace, HUMAN-APPROVED for this MVP on 2026-10-06; the numbers in comments are its rows.
// Changing a string needs a new approval. The apostrophe is U+2019 and the ellipsis is U+2026.
// «запис» names an item of the list; «посилання» names a formatted reference (HD-10).

// A kind added later without a text fails the type check here instead of showing nothing.
const failure: Record<ResolutionFailure["kind"], string> = {
  "invalid-input":
    "Це не схоже на DOI. Введіть один DOI у вигляді 10.xxxx/…, doi:10.xxxx/… або https://doi.org/10.xxxx/…", // 10
  "not-found": "Crossref не має запису для цього DOI.", // 11
  "unsupported-type": "Підтримуються лише журнальні статті. Запис Crossref для цього DOI не є журнальною статтею.", // 12
  "provider-unavailable": "Crossref зараз недоступний. Спробуйте ще раз пізніше.", // 13
  "invalid-response": "Crossref повернув відповідь, яку не вдалося використати.", // 14
};

const blockingField: Record<BlockingField, string> = {
  title: "назва статті", // 20
  journalTitle: "назва журналу", // 21
  year: "рік", // 22
};

// HD-9: what the available metadata does not give. Not a claim that the value is required.
const gap: Record<MetadataGap, string> = {
  authors: "автори", // 25
  volume: "том", // 26
  issue: "номер випуску", // 27
  "pages-or-article-number": "сторінки або номер статті", // 28
};

// The warnings say what the program did and ask the user to check; they state no rule of the standard.
const warning: Record<FormatWarning, string> = {
  "subtitle-capitalisation": "Підзаголовок починається з великої літери. Програма не змінює регістр — перевірте його.", // 30
  "incomplete-personal-name":
    "Для одного з авторів є лише прізвище або лише ім’я. Програма нічого не додає — перевірте дані автора.", // 31
  "full-stop-collision":
    "У посиланні дві крапки поспіль, бо значення з метаданих закінчується крапкою. Програма її не прибирає — перевірте значення.", // 32
};

const listed = (names: readonly string[]): string => names.join(", ");

export const copy = {
  documentTitle: "Перелік посилань за DOI", // 1
  documentDescription: "Бібліографічні посилання на журнальні статті за DOI, оформлені за профілем ДСТУ 8302:2015.", // 2
  pageHeading: "Бібліографічні посилання на журнальні статті", // 3
  introduction: "Додайте статтю за DOI, щоб отримати посилання, оформлене за профілем ДСТУ 8302:2015.", // 4
  sessionNotice: "Перелік зберігається лише до перезавантаження сторінки.", // 5

  doiLabel: "DOI статті", // 6
  doiHint: "Наприклад: 10.1038/nature12373, doi:10.1038/nature12373 або https://doi.org/10.1038/nature12373", // 7
  add: "Додати", // 8
  lookupInProgress: "Шукаємо в Crossref…", // 9
  failure,
  requestFailed: "Не вдалося виконати запит. Спробуйте ще раз.", // 15
  duplicate: "Ця публікація вже є в переліку.", // 16

  listHeading: "Перелік посилань", // 17
  emptyList: "Перелік порожній. Додайте першу статтю за DOI.", // 18
  cannotBeFormed: (fields: readonly BlockingField[]): string =>
    `Не вдалося сформувати посилання. Бракує: ${listed(fields.map((field) => blockingField[field]))}.`, // 19
  gaps: (gaps: readonly MetadataGap[]): string =>
    `Не вказано в метаданих: ${listed(gaps.map((name) => gap[name]))}.`, // 23
  warning,

  copyOne: "Копіювати", // 33
  correct: "Редагувати", // 34
  remove: "Вилучити", // 35
  moveUp: "Вище", // 36
  moveDown: "Нижче", // 37
  entryControl: (control: string, position: number): string => `${control}: запис ${position}`, // 38

  copyAll: "Копіювати весь перелік", // 39
  copyAllBlocked: (unformatted: number): string =>
    `Щоб скопіювати весь перелік, виправте або вилучіть записи, для яких не сформовано посилання: ${unformatted}.`, // 40
  copied: "Скопійовано.", // 41
  // Wording only: no other way of copying is attempted.
  copyFailed: "Не вдалося скопіювати. Виділіть текст і скопіюйте його вручну.", // 42

  correctionHeading: "Редагування метаданих", // 43
  doi: "DOI", // 44
  title: "Назва статті", // 45
  subtitle: "Підзаголовок", // 46
  journalTitle: "Назва журналу", // 47
  year: "Рік", // 48
  volume: "Том", // 49
  issue: "Номер випуску", // 50
  pages: "Сторінки", // 51
  articleNumber: "Номер статті", // 52
  invalidYear: "Рік має складатися з чотирьох цифр, від 1000 до 9999.", // 53

  authorsHeading: "Автори", // 54
  noAuthors: "Авторів не вказано.", // 55
  author: (position: number): string => `Автор ${position}`, // 56
  authorKind: "Тип автора", // 57
  person: "Особа", // 58
  organisation: "Організація", // 59
  family: "Прізвище", // 60
  given: "Ім’я або ініціали", // 61
  organisationName: "Назва організації", // 62
  addAuthor: "Додати автора", // 63
  authorControl: (control: string, position: number): string => `${control}: автор ${position}`, // 64, 65
  save: "Зберегти", // 66
  cancel: "Скасувати", // 67
} as const;
