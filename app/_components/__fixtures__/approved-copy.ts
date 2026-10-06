// Test support: the Ukrainian strings the tests expect, written by hand from the HUMAN-APPROVED copy table in the
// design of the change bibliography-workspace (rows in comments). Never imported from copy.ts: a difference between
// the two is a failing test. Three characters here have a look-alike: the apostrophe U+2019, the ellipsis U+2026 and
// the em dash U+2014. They stand as literal characters, not as escapes: check the code point when one is edited.

export const UI = {
  pageHeading: "Бібліографічні посилання на журнальні статті", // 3
  introduction: "Додайте статтю за DOI, щоб отримати посилання, оформлене за профілем ДСТУ 8302:2015.", // 4
  sessionNotice: "Перелік зберігається лише до перезавантаження сторінки.", // 5
  doiLabel: "DOI статті", // 6
  doiHint: "Наприклад: 10.1038/nature12373, doi:10.1038/nature12373 або https://doi.org/10.1038/nature12373", // 7
  add: "Додати", // 8
  lookupInProgress: "Шукаємо в Crossref…", // 9
  invalidInput:
    "Це не схоже на DOI. Введіть один DOI у вигляді 10.xxxx/…, doi:10.xxxx/… або https://doi.org/10.xxxx/…", // 10
  notFound: "Crossref не має запису для цього DOI.", // 11
  unsupportedType: "Підтримуються лише журнальні статті. Запис Crossref для цього DOI не є журнальною статтею.", // 12
  providerUnavailable: "Crossref зараз недоступний. Спробуйте ще раз пізніше.", // 13
  invalidResponse: "Crossref повернув відповідь, яку не вдалося використати.", // 14
  requestFailed: "Не вдалося виконати запит. Спробуйте ще раз.", // 15
  duplicate: "Ця публікація вже є в переліку.", // 16
  listHeading: "Перелік посилань", // 17
  emptyList: "Перелік порожній. Додайте першу статтю за DOI.", // 18
  cannotBeFormed: (fields: string) => `Не вдалося сформувати посилання. Бракує: ${fields}.`, // 19 with 20 to 22
  gaps: (fields: string) => `Не вказано в метаданих: ${fields}.`, // 23 with 25 to 28
  gapsPrefix: "Не вказано в метаданих", // 23
  subtitleCapitalisation:
    "Підзаголовок починається з великої літери. Програма не змінює регістр — перевірте його.", // 30
  incompletePersonalName:
    "Для одного з авторів є лише прізвище або лише ім’я. Програма нічого не додає — перевірте дані автора.", // 31
  fullStopCollision:
    "У посиланні дві крапки поспіль, бо значення з метаданих закінчується крапкою. Програма її не прибирає — перевірте значення.", // 32
  copyOne: (position: number) => `Копіювати: запис ${position}`, // 33, 38
  correct: (position: number) => `Редагувати: запис ${position}`, // 34, 38
  remove: (position: number) => `Вилучити: запис ${position}`, // 35, 38
  moveUp: (position: number) => `Вище: запис ${position}`, // 36, 38
  moveDown: (position: number) => `Нижче: запис ${position}`, // 37, 38
  copyAll: "Копіювати весь перелік", // 39
  copyAllBlocked: (unformatted: number) =>
    `Щоб скопіювати весь перелік, виправте або вилучіть записи, для яких не сформовано посилання: ${unformatted}.`, // 40
  copyAllBlockedPrefix: "Щоб скопіювати весь перелік", // 40
  copied: "Скопійовано.", // 41
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
  author: (position: number) => `Автор ${position}`, // 56
  authorKind: "Тип автора", // 57
  person: "Особа", // 58
  organisation: "Організація", // 59
  family: "Прізвище", // 60
  given: "Ім’я або ініціали", // 61
  organisationName: "Назва організації", // 62
  addAuthor: "Додати автора", // 63
  removeAuthor: (position: number) => `Вилучити: автор ${position}`, // 64, 65
  moveAuthorUp: (position: number) => `Вище: автор ${position}`, // 64, 65
  moveAuthorDown: (position: number) => `Нижче: автор ${position}`, // 64, 65
  save: "Зберегти", // 66
  cancel: "Скасувати", // 67
} as const;
