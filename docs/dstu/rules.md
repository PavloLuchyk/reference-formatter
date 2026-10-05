# DSTU 8302:2015 — source-backed rules for journal articles

## 1. Status

**HUMAN-APPROVED FOR MVP on 2026-10-05, with the documented source
limitations (1.1).**

- Written on 2026-10-05 from the documents in `references/`.
- **Normative sources present:** S1 (ДСТУ 8302:2015) and, since the re-audit
  of 2026-10-05, S6 (ДСТУ ГОСТ 7.1:2006, official edition). The text of
  ДСТУ ГОСТ 7.80:2007 is still not available.
- The printed text of S1 carries acknowledged typesetting errors. A notice of
  official corrections (S7) says that the spaces before and after prescribed
  punctuation were removed from it by mistake. The corrections themselves are
  not in `references/`.
- On 2026-10-05 the human approved S4 as a **working proxy** for the two
  delegated standards, for this MVP profile only. S4 is a practice guide that
  restates them; it is not their text. Since the re-audit, 33 of the 47 rows
  taken from S4 are verified against S6 (section 5.8). The other 14 remain
  *provisionally sourced from S4 restatement; normative text unverified*.
- Where S1 and another source disagree, S1 governs. Where S6 and S4
  disagree, S6 governs.
- No rule in this file rests on an example alone.
- Section 8 holds the decisions that only the human can make. D1–D16 and
  O1–O6 were decided as conventions (8.1), and four contradictions found by
  the final source audit received a disposition (8.3). After ДСТУ ГОСТ
  7.1:2006 became available, the human kept one of eight departing decisions
  and revised seven (8.4, 8.5), then decided the points that followed in
  four rounds (8.6–8.9). On 2026-10-05 the human closed all product-profile
  decisions D1–D16 and O1–O21; none is open (8.2). The agent answered none
  of them.
- Deciding them did not approve the profile. The approval is a separate act
  of the human, recorded in 1.1.

This file is evidence for a later formatter specification. It contains no
expected output strings.

### 1.1 Approval record

On 2026-10-05 the human reviewed this file and approved this DSTU 8302:2015
journal-article profile for the MVP, with the documented source limitations.
Until then its status line read «Draft for human review. This profile is not
approved.»

All product-profile decisions D1–D16 and O1–O21 are approved as recorded in
section 8, including their supersession history.

The approval explicitly accepts that:

- the normative text of ДСТУ ГОСТ 7.80:2007 was not directly verified (G1);
- the six heading rows that the profile still uses (P21, P22, P23, P25, P26
  and P43; section 5.10) remain provisional and are traceable to the existing
  restatement and source evidence;
- the exact full set of official corrections to S1 is not available in the
  current source set (G11);
- the remaining documented limitation of G10 is accepted;
- these limitations must remain visible and must not be presented as
  verified normative facts.

The approval is a decision of the human about the profile. It verifies no
source and changes no rule: every row keeps the source status shown in
sections 4 and 5, and a provisional row stays provisional.

## 2. Sources

`references/` is not in git, so each file is identified by its SHA-256.

| ID | File | Pages | SHA-256 | What it is | Authority |
|---|---|---|---|---|---|
| S1 | `dstu-8302-2015.pdf` | 20: I–IV and 1–16 | `22c9ca96b86d8f2e04b5250520726f5300f58bfa38b28f1d994eea8e5889b776` | ДСТУ 8302:2015 «Інформація та документація. Бібліографічне посилання. Загальні положення та правила складання». Видання офіційне. Київ : ДП «УкрНДНЦ», 2016 | **Normative** |
| S6 | `nacionalnyy-standart-71-2006-ukr.pdf` | 52: I–III, contents, 1–47, one closing page | `a98b795b8051ecc99511dfbd73e932de14fa7a1d0e3a35a8e00355572d1f7920` | ДСТУ ГОСТ 7.1:2006 «Система стандартів з інформації, бібліотечної та видавничої справи. Бібліографічний запис. Бібліографічний опис. Загальні вимоги та правила складання (ГОСТ 7.1-2003, IDT)». Видання офіційне. Київ : Держспоживстандарт України, 2007. A scan with no text layer. The cover, foreword and national introduction are in Ukrainian; the body is the Russian text of ГОСТ 7.1–2003 | **Normative**; the standard S1 §4.4 delegates to |
| S7 | `popravki_ 8302.pdf` | 1 | `02b17caba4fc945fa5cfe7198aff16139d25389a3b9f45d2ed3d40d446f1d378` | Notice «Про внесення поправок у ДСТУ 8302:2015 …». It reports that corrections to S1 were published in «Інформаційний покажчик стандартів», 2016, № 12 (408), p. 103. The file does not name its issuer and does not reproduce the corrections | **Official correction, notice only** |
| S4 | `DSTU-7.1-2006_2010.pdf` | 98 | `2c5e2c06df32282e5dc250bab090b4c457f5c96a7f94224decd3b12bf7594152` | Практичний посібник «Упровадження в практику роботи бібліотек освітянської галузі ДСТУ ГОСТ 7.1:2006 … та ДСТУ ГОСТ 7.80:2007 …», ДНПБ України ім. В. О. Сухомлинського (identified from its foreword, p. 3) | **Authoritative secondary**; a restatement. Working proxy, by human decision, only where no normative text is present |
| S5 | `dstu780.pdf` | 3 | `0752ec1df3c7845499077882c53a3de8aa997e521598d0f8bbb4fced1a75ca70` | «Методичні рекомендації щодо складання заголовку бібліографічного запису (ДСТУ ГОСТ 7.80:2007 …)», signed «Матеріал підготувала Ольга Устіннікова, старший науковий співробітник відділу інформаційних систем». The institution is not named on the pages | **Authoritative secondary**; not the text of the standard |
| S2 | `dstu_8302.pdf` | 37 slides | `5fa42a15fecdeae15c07a2ba44c3fc4e0f14d587b7bf4e44d6fdd55f06145bbf` | Slide presentation about S1. С. Гузенко, Бібліотека університету імені Бориса Грінченка, 2017 | Mirror / restatement of S1 |
| S3 | `ДСТУОСТ7802007.pdf` | 4 | `1849c90dae47a79a5aba02fb6c23f931b6e61af2258d06689075fd1ff3dd8593` | Printout of the wiki page `unimarc.org.ua/wiki/ДСТУ_7.80:2007`, a summary of the heading standard | Mirror / restatement; its text follows S5 |

Not sources: `ДСТУГОСТ712006.pdf` is an empty file (0 bytes).

Standards S1 depends on whose text is **still not available**: ДСТУ ГОСТ
7.80:2007 (S1 §4.4, p. 2), known only through S4, S5 and S3. **Not
consulted**: ДСТУ 3582:2013, ДСТУ 6095:2009, ДСТУ 7093:2009, ГОСТ 7.12-93
(S1 §4.5, p. 3); ДСТУ 7157:2010 (S1 §7.3, p. 11). Also not present: the
published text of the corrections to S1 that S7 reports.

Reading limits:

- S1, S2, S4, S5 and S7 were read from their text layer. On 2026-10-05 the
  agent also read all 20 pages of S1 as page images; section 10 records what
  the print shows against the text layer.
- S6 is a scan without a text layer. All 52 pages were read as page images.
  Quotations from it are transcribed by hand and are not machine-checked.
- S4 was read in full, printed pages 2–97, in two passes; the second pass was
  the final source audit of 2026-10-05. Its cover and title page (PDF pages
  1–2) are images and were not viewed, so its year and authors are
  unconfirmed.
- S3 has no text layer and was read as page images.

## 3. Conventions

- **Locators.** `S1 §4.4, p. 2` is clause and printed page of S1 (PDF page =
  printed + 4). `S4 p. 9` is the printed page of S4 (PDF page = printed + 1);
  S4 gives no clause numbers of the standards it restates. `S2 slide 7` and
  `S3 p. 2/4` are slide and printout page.
  `S6 §4.7.5, p. 4` is clause and printed page of S6 (PDF page = printed + 4).
  `S5 p. 1/3` is a page of S5; S7 has one page.
- **Classes**, kept in separate sections:
  - *Normative (S1)* — stated in the clause text of S1. Section 4.
  - *Provisional (S4)* — provisionally sourced from S4 restatement; normative
    text unverified. Section 5. Section 5.8 says which of these rows are now
    verified against S6 and which stay provisional.
  - *Normative (S6)* — stated in the clause text of S6, which reaches
    references only through S1 §4.4. Sections 5.8 and 5.9.
  - *Secondary guidance* — S2, S3 and S5. Section 6. Settles nothing.
  - *Product-profile decision* — made by the human, or still open. Section 8.
- **Modality**: *required* (подають, зазначають, наводять), *recommended*
  (рекомендовано), *permitted* (дозволено, можна).
- **Source text** columns quote the source verbatim, with line-break
  hyphenation removed. ` … ` marks an omission.
  Quotations from S6 are in Russian, the language of its body.
- **Examples.** S1 states: «Приклади, що наведено в тексті стандарту, є
  умовними» (S1 Вступ, p. IV). Examples are quoted in section 7 as evidence
  only.

## 4. Normative rules from S1

### 4.1 Kind of reference

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N1 | A full reference contains all mandatory elements needed to characterise, identify and find the object. | Повне бібліографічне посилання містить усі обов’язкові елементи, що використовують для загальної характеристики, ідентифікування й пошуку об’єкта посилання. | S1 §5.1.1.1, p. 3 | definition |
| N2 | By placement, a reference is in-text, footnote or endnote. | За місцем розташування в документі розрізняють такі бібліографічні посилання | S1 §5.1.2, p. 4 | definition |
| N3 | A set of endnote references laid out as a list is not a bibliography list. | Сукупність позатекстових бібліографічних посилань, оформлених як перелік бібліографічних записів, не можна вважати бібліографічним списком (списком використаної літератури) чи покажчиком | S1 §5.4.2, p. 6 | required |

### 4.2 Governing standards and elements

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N4 | Elements and punctuation follow ДСТУ ГОСТ 7.80 and ДСТУ ГОСТ 7.1, with the deviations S1 lists. | подають згідно з ДСТУ ГОСТ 7.80 і ДСТУ ГОСТ 7.1 з урахуванням таких особливостей | S1 §4.4, p. 2 | required |
| N5 | An endnote reference may contain: heading (author), main title, title information, statement of responsibility, edition, imprint, volume or issue number, extent, the name of the host document, page location, notes. | Позатекстове бібліографічне посилання може містити такі елементи | S1 §5.4.4, p. 6 | permitted |
| N6 | The host document of an article (journal, collection, newspaper) is one of those elements. | назву документа (журналу, збірника, газети тощо), в якому опубліковано об’єкт посилання | S1 §5.4.4, p. 6 | permitted |

### 4.3 Authors

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N7 | The heading gives one, two or three authors. Their names are not repeated in the statement of responsibility after the slash. | у заголовку бібліографічного запису подають відомості про одного, двох чи трьох авторів, при цьому імена цих авторів у бібліографічному описі у відомостях про відповідальність (за навскісною рискою) не повторюють | S1 §4.4, p. 2 | required |
| N8 | In an endnote reference the heading may give more than three authors when needed. | за потреби у заголовку бібліографічного запису позатекстового посилання можна зазначати більше ніж три імені авторів | S1 §4.4, p. 2 | permitted |

### 4.4 Article and host

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N9 | In a reference to a component, `//` may be replaced by a full stop, with the host document's title set in a distinct font. | розділовий знак «дві навскісні риски» («//») можна замінювати крапкою, а відомості про документ (його назву), в якому розміщено складник, виділяти шрифтом (наприклад, курсивом) | S1 §4.9.1, p. 3 | permitted |
| N10 | The physical details may be either the total extent or the page on which the object is found. | можна зазначати або його загальний обсяг (наприклад: 285 с.), або номер сторінки, на якій подано об’єкт посилання (наприклад: С. 19) | S1 §4.4, p. 3 | permitted |

### 4.5 Punctuation and omissions

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N11 | A full stop is recommended between zones instead of full stop and dash. | в бібліографічному посиланні рекомендовано застосовувати знак «крапка» | S1 §4.4, p. 2 | recommended |
| N12 | Punctuation in references is uniform within one document. | в межах одного документа застосування в бібліографічних посиланнях розділових знаків уніфіковують | S1 §4.4, p. 2 | required |
| N13 | Information not taken from the title page need not be put in square brackets. | відомості, запозичені не з титульної сторінки документа, дозволено не брати у квадратні дужки | S1 §4.4, p. 3 | permitted |
| N14 | The general material designation may be omitted. | після назви дозволено не зазначати загального позначення матеріалу | S1 §4.4, p. 3 | permitted |
| N15 | Series and standard numbers (ISBN, ISMN, ISSN) may be omitted. | дозволено не наводити відомостей про серію та Міжнародний стандартний номер | S1 §4.4, p. 3 | permitted |

### 4.6 Abbreviation and language

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N16 | Words may be abbreviated in every element except the main title and one-word title information. | за винятком основної назви документа й відомостей, що належать до назви та містять одне слово | S1 §4.5, p. 3 | permitted |
| N17 | Information about a document published in another language is given in the original language. | у бібліографічних посиланнях наводять мовою оригіналу | S1 §4.8, p. 3 | required |

### 4.7 Electronic resources and DOI

D14 decides that this profile treats a DOI-resolved article as an electronic
resource, so these rules apply.

| ID | Rule | Source text | Locator | Modality |
|---|---|---|---|---|
| N18 | Publications in electronic serials are referenced by the general rules plus the particulars of §7. | публікації в електронних серіальних документах | S1 §7.4, p. 11 | required |
| N19 | The kind of electronic data need not be stated. | дозволено не подавати відомості про вид електронних даних чи програм | S1 §7.4.2, p. 11 | permitted |
| N20 | Notes follow this order: system requirements, access, date of update, electronic address, date of access. | дата оновлення документа або його частини … електронна адреса … дата звернення до документа | S1 §7.4.4, p. 12 | required |
| N21 | `URI` or `URL` may replace the words «Режим доступу». | дозволено замість слів «Режим доступу» (чи «Доступ») | S1 §7.4.4.3, p. 12 | permitted |
| N22 | When the resource has a DOI or another persistent identifier, giving the identifier instead of the address is recommended. | замість електронної адреси цього ресурсу рекомендовано зазначати його ідентифікатор | S1 §7.4.4.3.1, p. 12 | recommended |
| N23 | After the electronic address of a remote resource, the date of access follows in round brackets after the words «дата звернення». | число, місяць і рік (в круглих дужках) після слів «дата звернення» | S1 §7.4.4.4, p. 13 | required |
| N24 | The note on the source of the title may be omitted. | в примітці можна не подавати відомостей про джерело назви | S1 §7.4.4.5, p. 13 | permitted |

S1 states no form or label for a DOI, and does not say whether a date of
access is given when an identifier replaces the address.

### 4.8 Official correction to S1

S7 is a notice about the corrections, not their text.

| ID | Statement | Source text | Locator | Effect on this file |
|---|---|---|---|---|
| K1 | Spaces before and after prescribed punctuation were removed from the text of S1 by a technical error of the standardisation institute. | у тексті стандарту вилучено проміжки до та після приписаних (розділових) знаків пунктуації, та деякі інші | S7 | The tight colons and slashes in the examples of this copy of S1 are errors of the printing, not evidence of a rule. The spacing rule is the one in S6 §4.7.5 (P4) |
| K2 | The corrections were published officially and entered into the text of the standard. | опубліковано в офіційному друкованому виданні НОС: Інформаційний покажчик стандартів, 2016, №12 (408), С. 103 та внесено в його текст | S7 | The copy of S1 in `references/` was produced on 2016-06-09, before that issue, and still shows the errors. The corrected text is not available (G11) |

## 5. Provisional rules from the S4 restatement

The rows of 5.1–5.7 were taken from S4 when no normative text of the
delegated standards was present. They are kept as written. **Section 5.8
gives the status of every row after the re-audit of 2026-10-05:** verified
against S6, or still *provisionally sourced from S4 restatement; normative
text unverified*. Four rows are corrected there.

S6 says of itself that it does not cover bibliographic references (Q1). Its
rules reach a reference through S1 §4.4 (N4), with the deviations S1 lists;
where a row meets an S1 rule, the S1 rule governs, and the last column says
so.

### 5.1 Prescribed punctuation and spacing

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P1 | Each zone after the first is preceded by full stop and dash. | Кожній зоні БО, крім першої, передує знак крапка і тире (. –), який ставиться перед першим елементом зони. | S4 p. 9 | N11 recommends a full stop instead |
| P2 | An element that is not given loses its prescribed sign. | Якщо елемент не наводиться в описі, опускається й приписаний йому знак. | S4 p. 9 | — |
| P3 | The description ends with a full stop. | Наприкінці БО ставиться крапка. | S4 p. 9 | followed: R6, O10 |
| P4 | One space before and after each prescribed sign, except the full stop and the comma, which take a space after only. | застосовуються пробіли в один друкарський знак до та після приписаного знака. Винятком є крапка і кома – пробіли ставляться тільки після них. | S4 p. 9 | S1 states spacing only for the archival `//` (§8.2.1, p. 13) |
| P5 | Where a grammatical sign meets a prescribed sign, both are kept. A prescribed full stop is dropped only after an ellipsis or the full stop of an abbreviation. | При поєднанні граматичного і приписаного знаків у БО наводяться обидва. … тоді крапка від приписаної пунктуації наступного елемента опускається | S4 p. 9 | followed: R7, O17; see O10, O18 and O19 |
| P6 | Round and square brackets count as one sign: a space before the opening and after the closing bracket. | Круглі та квадратні дужки розглядаються як один знак | S4 p. 10 | — |
| P7 | In a note, the introductory word is followed by a colon with no space before it. | перед двокрапкою пробіл не робиться | S4 p. 25 | — |

### 5.2 Language, abbreviation, capitals, numerals

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P8 | The description follows the language of the document's imprint. | Мова БО найчастіше відповідає мові вихідних даних документа. | S4 p. 11 | agrees with N17 |
| P9 | Abbreviation is recommended, not required. | стандарти не примушують, а рекомендують скорочувати слова | S4 p. 13 | agrees with N16 |
| P10 | Titles of any kind are not abbreviated; the analytical record is the exception. | Не допускаються скорочення будь-яких назв … Винятком є аналітичний бібліографічний опис. | S4 p. 13 | N16 |
| P11 | In an analytical record the name of a periodical is abbreviated. | а також назва періодичного документа (журналу або газети) | S4 p. 32 | N16 only permits; see D8 |
| P12 | Only the first word of a zone is capitalised. | з великої літери слід наводити тільки перше слово зони опису | S4 p. 13 | not automated; see R1, O7 and O13 |
| P13 | Ordinal numbers of volumes and pages take no ending when the generic word precedes. | Без нарощування закінчення наводяться порядкові номери томів, глав, сторінок | S4 p. 16 | — |

### 5.3 Title and statement of responsibility

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P14 | The main title is given as in the source, in the same order and with the same signs. | у тій же послідовності та з тими ж знаками | S4 p. 16 | — |
| P15 | Title information is preceded by a colon. | Різнорідним відомостям або групам однорідних відомостей передує знак двокрапка (:) | S4 p. 19 | — |
| P16 | The first statement of responsibility is preceded by a slash; later groups by a semicolon. | Першим відомостям про відповідальність передує знак похила риска (/); наступні групи відомостей відокремлюються одна від одної крапкою з комою (;). | S4 p. 19 | — |
| P17 | Statements of responsibility are written in the form given in the source. | Відомості про відповідальність записуються в тій формі, в якій вони вказані в приписаному джерелі інформації | S4 p. 19 | cannot be applied to Crossref data; see O9 |
| P18 | For four or more persons the bibliographing institution decides how many to give: all, or the first followed by «та ін.» in square brackets. | кількість наведених відомостей про відповідальність визначає установа, що бібліографує. … зазначається перший з кожної групи з додаванням слів «та інші» [та ін.] у квадратних дужках | S4 p. 20 | N13 permits omitting the brackets; see D3 |
| P19 | In an analytical record, names already in the heading need not be repeated in the statement of responsibility. | їх можна не повторювати в зоні назви і відомостей про відповідальність | S4 p. 32 | N7 requires not repeating them |
| P42 | Within one group of a statement of responsibility, the names are separated by commas. | Однорідні відомості в середині групи відділяються комами. | S4 p. 19 | followed: R5, O9 |

### 5.4 Heading

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P20 | The heading of the main record names one person only. | У заголовку основного запису наводиться ім’я лише однієї особи | S4 p. 34 | **N7 governs**: one, two or three |
| P21 | With more than three authors no heading is used. | Якщо авторів більше трьох, заголовок не застосовується. | S4 p. 34 | N8 permits more than three; see D3 |
| P22 | Records for documents with four or more authors are made under the title. | На документи чотирьох і більше авторів основні БЗ складаються під назвою. | S4 p. 54 | N8; see D3 |
| P43 | A document without an author is recorded under its title: the main title is the first element. | першим елементом БЗ має бути основна назва документа … Під назвою найчастіше описуються так звані безавторські (анонімні) документи | S4 p. 53–55 | — ; see D16 |
| P23 | The surname comes first and is, as a rule, separated from the name or initials by a comma. | відділяється, як правило, комою (,) | S4 p. 35 | — |
| P24 | Exceptions to the comma are allowed: it is dropped before initials. | Перед ініціалами кома опускається. | S4 p. 35 | see D2 |
| P25 | Each institution may decide, provided one method is used throughout. | Кожна установа, що бібліографує, може ухвалити те рішення, яке вважатиме найбільш доцільним | S4 p. 35 | N12; see D2 |
| P45 | Names of Asian and African authors are written in direct order, with no part separated by a comma. | записуються в прямій послідовності слів з великої літери і комою жодна частина не відділяється | S4 p. 43 | not followed; see 8.3 and C9 |
| P26 | The heading ends with a full stop. | У кінці заголовка ставиться крапка. | S4 p. 34 | — |
| P27 | A heading names one organisation only. | У заголовку наводиться назва тільки однієї організації | S4 p. 46 | see D4 |

### 5.5 Article in a journal

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P28 | The details of the component and of the host are joined by two slashes with a space before and after. | сполучним елементом дві похилі риски [//] з пробілами до та після нього | S4 p. 30 | N9 permits a full stop instead; see D7 |
| P29 | Order for an article in a journal: heading; article title; title information; statement of responsibility; `//`; journal name; year; number; pages; notes. | – Рік виходу журналу (збірника). – Номер журналу (збірника) | S4 p. 31 | agrees with N5, N6 |
| P30 | In an analytical record the full stop and dash between zones may be replaced by a full stop. | В аналітичному записі допускається крапку і тире між зонами БЗ заміняти крапкою | S4 p. 31 | agrees with N11 |
| P31 | For a periodical host the place of publication is not given. | місце його публікації не наводиться | S4 p. 33 | — |
| P32 | The extent of the host is not given. | Відомості про обсяг ідентифікуючого документа в аналітичному БЗ не наводяться. | S4 p. 33 | — |
| P33 | Pages are introduced by the capitalised abbreviation «С.», in the language of the document or of the bibliographing institution. | яке наводиться з великої літери мовою вихідних або аналогічних їм відомостей документа або мовою установи, що бібліографує | S4 p. 33 | N17; see D13 |
| P34 | First and last page are joined by a dash without spaces. | між першою та останньою сторінками ставиться знак «тире» без пробілів | S4 p. 33 | followed: R4, O8 |

### 5.6 Year and serial numbering

P36–P39 are stated by S4 for the numbering zone of a serial's own record. S4's
scheme for an article (P29) has a single «Номер журналу» and shows no volume;
see D9.

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P35 | A year must be established at least approximately, even when the document gives none. | потрібно встановити хоча б приблизно | S4 p. 23 | see D16 |
| P36 | Words such as «випуск» and «том» are abbreviated; numbers and years are in Arabic numerals. | наводяться в скороченій формі. Номери і роки позначаються арабськими цифрами. | S4 p. 65 | — |
| P37 | When the document gives no designation of the unit, only its number is given. | За відсутності в документі позначення порядкової одиниці в БЗ наводиться лише її порядковий номер. | S4 p. 66 | unused since R2 |
| P38 | Double and triple numbers are joined by a slash. | Здвоєні, строєні тощо номери і роки наводяться через похилу риску | S4 p. 66 | followed: R3, O11, O14, O16 |
| P39 | A running number follows the ordinal number in round brackets. | Валовий номер вказується після порядкового номера в круглих дужках | S4 p. 66 | unused |
| P46 | Roman or spelled-out numerals are replaced by Arabic numerals for the numbers of volumes and issues of serials. | Числівники римськими цифрами або в словесній формі замінюються арабськими цифрами для позначення … номерів томів, випусків багатотомних, серіальних і продовжуваних ресурсів | S4 p. 15 | followed: O11 (issue), O12 (volume); C11 |

### 5.7 Bracketed and absent information

| ID | Rule per S4 | Source text | Locator | S1 |
|---|---|---|---|---|
| P40 | Information supplied by the cataloguer goes in square brackets, including «та ін.». | зокрема такі вказівки, як [та ін.] «та інші», [б. м.] «без місця», [б. в.] «без видавця» | S4 p. 11 | N13 permits omitting the brackets |
| P41 | Access-mode notes are mandatory for a remote electronic resource. | Ці примітки обов’язкові при описуванні електронного ресурсу віддаленого доступу | S4 p. 83 | N21 permits `URL`; see D14 |
| P44 | The access note also carries the date of access: mandatory when the date of creation of the resource is unknown, desirable in every other case. | наведення дати доступу обов’язкове, коли невідома дата створення ресурсу, а також бажане в усіх інших випадках | S4 p. 83–84 | N23 requires it after an electronic address; see 8.3 and C10 |
| P47 | A note on the source of the main title is mandatory for every kind of electronic resource. | Примітки про джерело основної назви є обов’язковими і наводяться для всіх видів електронних ресурсів | S4 p. 84 | **N24 governs**: it may be omitted |

S4 does not mention DOI anywhere in its text. It does speak of a date of
access (P44). An earlier draft of this file said it did not; that was an error
of a keyword search and was corrected by the final source audit.

### 5.8 Status of the rows above after the re-audit

*Verified* means the rule is found in the clause text of S6. *Provisional*
means it is still provisionally sourced from S4 restatement; normative text
unverified. Totals: 33 verified, 14 provisional.

| Row | Status | Basis | Normative text (transcribed from S6) or note |
|---|---|---|---|
| P1 | Verified | S6 §4.7.2, p. 4 | Каждой области описания, кроме первой, предшествует знак точка и тире, который ставится перед первым элементом области. |
| P2 | Verified | S6 §4.7.7, p. 4 | Если элемент не приводят в описании, опускают и предписанный ему знак. |
| P3 | Verified | S6 §4.7.1, p. 3 | В конце библиографического описания ставится точка. |
| P4 | Verified | S6 §4.7.5, p. 4 | применяют пробелы в один печатный знак до и после предписанного знака. Исключение составляют точка и запятая – пробелы оставляют только после них. |
| P5 | Verified | S6 §4.7.11, p. 4 | При сочетании грамматического и предписанного знаков препинания в описании приводят оба знака. … то точку, относящуюся к предписанной пунктуации следующего элемента, опускают. |
| P6 | Verified | S6 §4.7.6, p. 4 | Круглые и квадратные скобки рассматривают как единый знак |
| P7 | Verified | S6 §5.8.2, p. 24 | перед двоеточием пробел не оставляют |
| P8 | Verified | S6 §4.9, p. 5 | Язык библиографического описания, как правило, соответствует языку выходных сведений документа. |
| P9 | Verified in substance | S6 §4.10, p. 5 | можно применять сокращение слов и словосочетаний. The wording quoted in P9 is S4’s own |
| P10 | Verified | S6 §4.10.1, p. 5 | Не допускается сокращать любые заглавия в любой области … Исключение составляет аналитическое библиографическое описание |
| P11 | Verified | S6 §7.3.3, p. 37 | Основное заглавие идентифицирующего документа сокращают, если это: … б) заглавие периодического документа (журнала или газеты). |
| P12 | Verified, **corrected** | S6 §4.11.1, p. 6 | С прописных букв начинают первое слово каждой области, а также первое слово следующих элементов: общего обозначения материала и любых заглавий во всех областях описания. Все остальные элементы записывают со строчной буквы. S4 left out the titles |
| P13 | Verified | S6 §4.11.4.2, p. 6 | Без наращения окончания приводят порядковые номера томов, глав, страниц |
| P14 | Verified | S6 §5.2.2.1, p. 8 | в той же последовательности и с теми же знаками |
| P15 | Verified | S6 §5.2.5.3, p. 11 | Сведениям, относящимся к заглавию, предшествует знак двоеточие. |
| P16 | Verified | S6 §5.2.6.4, p. 13 | Первым сведениям об ответственности предшествует знак косая черта; последующие группы сведений отделяют друг от друга точкой с запятой. |
| P17 | Verified | S6 §5.2.6.2, p. 13 | записывают в той форме, в какой они указаны в предписанном источнике информации |
| P18 | Verified | S6 §5.2.6.9, p. 15 | количество приводимых сведений об ответственности определяет библиографирующее учреждение. … [и др.] или его эквивалента на латинском языке [et al.] |
| P19 | Verified | S6 §7.2.5.2, p. 36 | в аналитическом библиографическом описании они могут быть опущены |
| P20 | Provisional | Heading standard not available | Corroborated by S5 p. 1/3. N7 governs |
| P21 | Provisional | Heading standard not available | S4 only |
| P22 | Provisional | Heading standard not available | S4 only |
| P23 | Provisional | Heading standard not available | Corroborated by S5 p. 1/3 |
| P24 | Provisional, **corrected** | Heading standard not available | S5 p. 3/3 presents the missing comma before initials as an alternative that some institutions use under the words «як правило», not as a rule. The flat statement in P24 is S4’s |
| P25 | Provisional | Heading standard not available | Corroborated by S5 p. 3/3 |
| P26 | Provisional | Heading standard not available | S4 only |
| P27 | Provisional | Heading standard not available | Corroborated by S5 p. 2/3 |
| P28 | Verified | S6 §7.1.10, p. 35 | знак две косые черты с пробелами до и после него |
| P29 | Verified | S6 §7.5.2, p. 39 | дата издания (распространения); обозначение тома, выпуска, номера и его порядковый номер (для журналов) … страницы, на которых помещена составная часть |
| P30 | Verified | S6 §7.1.11, p. 35 | допускается точку и тире между областями библиографического описания заменять точкой |
| P31 | Verified | S6 §7.3.10, p. 38 | место его публикации не приводят, за исключением случаев, когда это необходимо для идентификации документа |
| P32 | Verified | S6 §7.3.11, p. 38 | Сведения об объеме идентифицирующего документа в аналитическом библиографическом описании не приводят. |
| P33 | Verified, **corrected** | S6 §7.4.1, p. 38 | Пагинации предшествует сокращенное обозначение слова страница («С.»), которое приводят на языке выходных или аналогичных им сведений документа или на языке библиографирующего учреждения. The words about a capital letter are S4’s addition |
| P34 | Verified, **corrected** | S6 §7.4.1, p. 38 | между первой и последней страницами ставят знак тире. The words “without spaces” are S4’s addition |
| P35 | Verified in substance | S6 §5.5.5.3, p. 20 | приводят предполагаемую дату издания с соответствующими пояснениями, если это необходимо. Обозначение [б. г.] – «без года» не приводят. |
| P36 | Verified | S6 §6.3.4.5, p. 33 | Обозначения тома, выпуска, наименования месяцев и т. п. приводят в сокращенной форме … Порядковые номера и годы приводят арабскими цифрами. |
| P37 | Provisional | Not found in the clause text of S6 | S6 §6.2.5.1 (p. 27) says a designation is given in the form shown in the document and shows a bare number only in an example |
| P38 | Verified | S6 §7.5.1.1, p. 39 | Сдвоенный номер тома или выпуска приводят через косую черту. |
| P39 | Provisional | Not found in the clause text of S6 | S6 shows a running number in round brackets only in examples |
| P40 | Verified | S6 §4.8.3, p. 5 | во всех областях библиографического описания, кроме области примечания, приводят в квадратных скобках |
| P41 | Provisional | Not in S6 | S6 refers electronic resources to ГОСТ 7.82 (§5.4.1.6, p. 22), which its national introduction (p. III) says is not implemented in Ukraine |
| P42 | Verified | S6 §5.2.6.4, p. 13 | Однородные сведения внутри группы отделяют запятыми. |
| P43 | Provisional | Heading standard not available | S4 only |
| P44 | Provisional | Not in S6 | Same reason as P41 |
| P45 | Provisional | Heading standard not available | S5 p. 3/3 says only that where the surname is hard to tell, the name is given as it stands in the source |
| P46 | Verified | S6 §4.11.4.1, p. 6 | Римские цифры и числительные в словесной форме заменяют арабскими цифрами при обозначении … номеров (выпусков) многотомного документа, сериального или другого продолжающегося ресурса. |
| P47 | Verified in part | S6 §5.8.3, p. 24 | отдельные примечания являются обязательными, например примечание об источнике основного заглавия. N24 governs |

### 5.9 Further statements of S6 that bear on the profile

| ID | Statement | Source text (transcribed from S6) | Locator | Bears on |
|---|---|---|---|---|
| Q1 | S6 does not cover bibliographic references. | Стандарт не распространяется на библиографические ссылки. | S6 §1, p. 1 | C1: its rules apply to a reference only because S1 §4.4 imports them |
| Q2 | The designations of volume, issue and number are named in clause text. | обозначение тома, выпуска, номера (Т., Вып., №) и его порядковый номер | S6 §7.5.1, p. 38 | D9c, D10a; closes G8 |
| Q3 | Smaller divisions of a volume follow it after a comma. | Если том включает более мелкие деления, их приводят через запятую. | S6 §7.5.1.1, p. 39 | Supports D9b: volume first, then the issue, joined by a comma |
| Q4 | A volume designation is given in the form the document shows; the number is in Arabic numerals. | При наличии обозначения тома его приводят в форме, данной в документе. Порядковый номер указывают арабскими цифрами. | S6 §6.2.5.1, p. 27 | D9c |
| Q5 | One to three persons are always given in the statement of responsibility, whether or not they are in the heading. | данные о них обязательно приводят в сведениях об ответственности, независимо от того, приводились они в заголовке записи или нет | S6 §5.2.6.8, p. 14 | C4: S1 N7 deviates and governs |
| Q6 | The standard number of the host is, as a rule, given. | При наличии у идентифицирующего документа международного стандартного номера его, как правило, указывают в описании. | S6 §7.3.13, p. 38 | N15 permits omitting it |
| Q7 | Standard numbers are written with their accepted abbreviation and prescribed spaces. | Стандартные номера приводят с принятой аббревиатурой и предписанными пробелами и дефисами. | S6 §5.9.1, p. 25 | D14b: in the standard-number area the form is abbreviation and space, without a colon. S1 puts a DOI in the note, where P7 applies. No conflict is claimed |
| Q8 | The title of an issue is optional. | частное заглавие тома, выпуска, номера (элемент факультативный, может быть опущен) | S6 §7.5.2, p. 39 | Closes the first part of G10 |
| Q9 | The heading is governed by the heading standard. | Формирование заголовка библиографической записи регламентирует ГОСТ 7.80. | S6 §4.1, p. 2 | P20–P27, P43, P45 cannot be verified from S6 |

### 5.10 Use of the rows in the profile after the dispositions of 2026-10-05

Whether a row is verified (5.8) and whether the profile uses it are
different things. This table lists the rows whose use was set or changed by
the dispositions in 8.4–8.6, and every row that is still provisional.

| Row | Source status | Use in the profile | Set by |
|---|---|---|---|
| P3 | Verified | Followed: the entry ends with a full stop. Not followed earlier (O1) | R6, O10 |
| P5 | Verified | Followed as far as it can be automated: both signs are kept. The prescribed full stop is dropped after an ellipsis (`…` or `...`) and, after the heading, after a terminal initial. Elsewhere the full stop of an abbreviation cannot be recognised, so both signs are kept with a warning. Not followed earlier (O2) | R7, O17, O18, O20, O21 |
| P11 | Verified | Not followed: the journal title is not abbreviated | D8, kept by H2 |
| P12 | Verified, corrected | Acknowledged and not automated: the subtitle is preserved, with a warning when it begins with a capital letter | R1, O7, O13 |
| P17 | Verified | **Unused.** Crossref does not record the form printed in the source; direct order after the slash is a convention | O9 |
| P34 | Verified, corrected | Followed: a plain numeric page range takes a dash. Not followed earlier (D12a) | R4, O8 |
| P36 | Verified | Followed: `Т.` before the volume; a value or component that qualifies as a Roman numeral becomes Arabic | R2, O11, O12, O15 |
| P38 | Verified | Followed for the issue and for the volume | R3, O11, O14, O16 |
| P42 | Verified | Followed: a comma between authors after the slash. Not followed earlier (D3d) | R5, O9 |
| P46 | Verified | Followed for an issue or volume value or component that qualifies under O15. Single-letter and lower-case Roman numerals stay unconverted. Not followed earlier (8.3) | R3, O11, O12, O15 |
| P20 | Provisional | Superseded by S1: the heading holds one to three authors | N7 |
| P21, P22 | Provisional | Used: with four or more authors the entry goes under its title | D3a |
| P23 | Provisional | Used in the heading only. **No longer extended to names after the slash**, where D3c had applied it | D2a; O9 |
| P24 | Provisional | Unused: the comma is always printed in the heading | D2a |
| P25 | Provisional | Used as the ground for one uniform choice of name form | D2 |
| P26 | Provisional | Used: the only source for the full stop after the heading. O18 relies on it | O18 |
| P27 | Provisional | Not followed: organisations stand in the heading beside persons | D4 |
| P37 | Provisional | **Unused.** It was the basis of D9c; the volume now always takes `Т.`. An issue printed without `№` rests on D10b, not on this row | R2 |
| P39 | Provisional | **Unused.** No decision applies it; an issue value with a running number is an arbitrary string and is printed as supplied | D10b, O11 |
| P41, P44 | Provisional | Not followed: no access note and no date of access with a DOI | D14, 8.3 |
| P43 | Provisional | Used: without authors the entry goes under its title | D16 |
| P45 | Provisional | Not followed in the heading (8.3). After the slash every personal name is `Given Family`, which is not the source order this row describes | D2a, O9 |

## 6. Secondary guidance

Nothing in this section is a rule.

### 6.1 S2 against S1

S2 restates S1. Its deviations within the journal-article scope:

| S2 | Deviation | S1 |
|---|---|---|
| slide 3 | Shortens the title of ДСТУ ГОСТ 7.80:2007 | §2, p. 1 |
| slides 6–8, 13, 17, 19–24 | Writes ` : ` and ` / ` with spaces. Agrees with P4; cannot be compared with S1's text layer | — |
| slide 7 | Own journal example `2015. № 8, С. 69-75`: a comma after the issue number and a hyphen in the page range | No such clause |
| slide 7 | Alters the «Цит. за» example (year 1998) | §4.6, p. 3 (1995) |
| slide 11 | Own example with a comma after the journal title; alters a URL | §5.2.5, p. 4 |
| slide 15 | Footnote element list omits the edition statement | §5.3.4, p. 5 |
| slide 23 | In-text citation adds initials | §5.4.6.2, p. 7 |
| slide 29 | States «Дата оновлення» as always preceding the address | §7.4.4.2, p. 12 |
| slide 31 | Replaces `//` with a full stop in S1's example; mangles a URL | §7.4.4.4, p. 13 |

Outside this scope S2 also alters S1's examples or wording on slides 9, 13,
14, 17, 19, 21, 22, 24, 26, 28, 30, 33 and 36, and cites ДСТУ 4331:2004
(slide 32), which S1 does not reference.

### 6.2 S3

| S3 | What it says | Against S1 and S4 |
|---|---|---|
| p. 1/4 | The heading standard applies to records «за винятком бібліографічних посилань» | S1 N4 applies it to references; see C1 |
| p. 1/4 | The main record has one author; for two or three, the first | Agrees with P20; S1 N7 governs |
| p. 2/4 | Surname first, separated by a comma | Agrees with P23; does not mention the exception in P24 |
| p. 2–3/4 | A heading may name one organisation | Agrees with P27 |

### 6.3 S5

S5 comments on the heading standard; it is not that standard.

| S5 | What it says | Against S1, S4 and the decisions |
|---|---|---|
| p. 1/3 | The heading standard covers headings in bibliographic records «за винятком бібліографічних посилань» | C1 |
| p. 1/3 | «У заголовку основного запису наводять ім’я одного автора» | Agrees with P20; S1 N7 governs |
| p. 1/3 | The surname comes first and «як правило, відокремлюється від імені (імен), імені і по батькові, ініціалів комою (,)» | Agrees with P23 and with D2a |
| p. 3/3 | «як правило» allows alternatives: some institutions put no comma before initials | Corrects P24 (5.8) |
| p. 3/3 | The examples in the appendix of the standard separate the surname with a comma, «що ілюструє основне, а не альтернативне положення» | Agrees with D2a |
| p. 3/3 | By decision of the institution the names after the surname may be full or reduced to initials | Agrees with P25; D2b keeps them as supplied |
| p. 3/3 | Where it is hard to tell which part of a name is the surname, as with authors of Asia and Africa, the name is given «в тій формі, як воно вказано в джерелі інформації» | Compare P45 and C9 |
| p. 2/3 | «У заголовку запису наводять найменування тільки однієї організації» | Agrees with P27; see D4 |

## 7. Source examples — evidence only

These are quotations, not rules and not expected formatter output. S1 calls
its own examples conditional. The S1 lines are as the text layer gives them.
Read as page images, the print has no space inside the page ranges
(«С. 18—20»), and S7 says the spaces around prescribed punctuation were
removed from S1 by error (K1), so a tight `//` or `:` in S1 shows nothing.
The S6 lines are transcribed from the scan.

| Source | Locator | Quoted example |
|---|---|---|
| S1 | §4.9, p. 3 | Вісник Книжкової палати. 2012. № 4. С. 18— 20. |
| S1 | §5.5.11, p. 10 | Сенченко М. Чи вміємо ми читати?//Вісн. Книжкової палати. 2012. № 3. С. 3. |
| S1 | §5.5.11, p. 10 | Афонін О. Українська книга 2011: рух по сходинках униз // Там само. С. 6— 8. |
| S4 | p. 86 | Світлана Буряк // Вісн. Кн. палати. – 2007. – № 11. – С. 9–12. |
| S4 | p. 66 | Vol. 1, № 1 – |
| S2 | slide 7 | 2015. № 8, С. 69-75. |
| S1 | §5.4.5, p. 7 | Денисенко М. П., Догмачов В. М., Кабанов В. Г. Кредитування та ризики: навч. посіб. |
| S6 | §7.3.10, p. 38 | // Квантовая электроника. – М., 1987. – Т. 14, № 7. – С. 512–516 |
| S6 | §7.5.2, p. 39 | // J. Hist. Biol. – 1986. – Vol. 19, N 1. – P. 79–130. |

What the examples of S1 show and no clause of S1 states: the author as
surname and initials without a comma, several authors in a heading separated
by a comma, and «№» before the number of a periodical. S1 has no example of
a journal article with both a volume and an issue; S6 has, and its clause
text now covers that case (P29, Q2, Q3).

## 8. Product-profile decisions

These belong to the human. A decision here is a product choice among options
the sources leave open; it is not a claim about what a standard requires.

### 8.1 Decided by the human

| ID | Decision | Decided | Basis and limits |
|---|---|---|---|
| D1 | Kind of reference | **Full, primary endnote reference** under S1 §5.4 (2026-10-05). The entry is not claimed to be an entry of a bibliography list. The product may still say "bibliography" in its user-facing workspace wording | N1, N2, N3, N5. All S1 deviations for references apply, including N8 |
| D2 | Author name form | (2026-10-05) **a.** A comma always separates the family name and the given names. **b.** The Crossref given value is printed as supplied; no initials are derived and given names are not rewritten. **c.** Spacing inside the given value is kept as supplied: `K.J.` stays `K.J.`, `K. J.` stays `K. J.`. **d.** Several authors in one heading are separated by `; ` | a: P23, the general rule of the S4 restatement; the exception in P24 is not used. b: no source requires initials. c and d: no clause in any source (G5, G6); these two are human profile decisions, not sourced rules |
| D3 | Four or more authors | (2026-10-05) **a.** The title comes first and all authors follow the responsibility slash, in source order; none is dropped. **b.** Not applicable: this profile does not use «та ін.». **c.** After the slash, persons and organisations are rendered by the same policy as in the heading; there is no second name-normalisation algorithm. **d.** Authors after the slash are separated by `; `, as in the heading | N7 (the heading holds one to three), P16, P18 (all names is one of the two forms S4 restates), P22. N8 is not used. P17 cannot apply literally, because Crossref gives the parts of a name as separate fields. d is a human profile convention: P42 (a comma between names) is not followed, because the decided form «family, given» already contains a comma **Part d is superseded by R5 (8.5); part c is superseded by the disposition of O9 (8.6).** |
| D4 | Organisation as author | (2026-10-05) Organisations are authors alongside persons: they count toward the limit of three and stay in source order. Organisation names are printed as supplied and are not restructured | The human’s reading of «авторів» in N7 for this profile; no source states it for an article. P27 (one organisation per heading) is not followed |
| D5 | Incomplete personal names | (2026-10-05) The metadata that is present is printed. An incomplete personal name is exposed as a warning for manual correction in the workspace. The missing part is never invented, and formatting is not blocked only because one part of a name is absent | No source covers a missing part of a name. The warning belongs to the workspace slice |
| D6 | Subtitle | (2026-10-05) **a.** Crossref’s subtitle is printed as title information after the main title. **b.** Its letter case is kept as supplied; it is not lower-cased or otherwise rewritten. **c.** The separator is a colon with a space on both sides, ` : ` | a: N5, P15. b: P12 (lower-case first word) is not followed, consistent with the accepted DOI-resolution decision HD-7 to keep title and subtitle case. c: P4 and P15, provisional when the decision was made and verified on 2026-10-05 against S6 §4.7.5 and §5.2.5.3 **Part b is superseded by R1 (8.5), handled as decided in O7 (8.6) and O13 (8.7).** |
| D7 | Article–journal separator | **`//`** (2026-10-05). The MVP formatter stays plain text; no italic or rich-text output | N9 permits the alternative, which is not taken. The space before and after `//` follows P28 and P4, provisional when the decision was made and verified on 2026-10-05 against S6 §7.1.10 and §4.7.5 |
| D8 | Journal title | (2026-10-05) Printed as supplied. It is not abbreviated, and the excluded `short-container-title` mapping is not reopened for this MVP | N16 only permits abbreviation; P9. P11 (a periodical’s name is abbreviated) is not followed **Kept on 2026-10-05 against S6 §7.3.3 (H2): abbreviation is optional overall under S6 §4.10 and S1 §4.5.** |
| D9 | Volume | (2026-10-05) **a.** The volume is printed whenever `Publication.volume` is present. **b.** Volume and issue form one group, volume first, joined by `, `. **c.** The volume value is printed as supplied with no added designation; «Т.» or any other label is not introduced for this MVP | a: N5 names the element. b: no clause decides the grouping; a human profile convention. c: P37 (the number alone when no designation is given), stated by the S4 restatement for a serial’s own record **Part c is superseded by R2 (8.5); Roman-numeral volume values: O12 (8.6); combined volumes: O16 (8.7).** |
| D10 | Issue | (2026-10-05) **a.** The Ukrainian designation `№` is used for a journal issue. **b.** The issue value is printed as supplied. `№ ` is added only when the supplied value is a simple numeric value or a numeric range; any other form, such as `Suppl 1`, is printed as supplied with no designation added or rewritten | A human product-profile convention. When this was decided «№» was known only from examples; S6 §7.5.1 (p. 38) names it in clause text (Q2). P29 names the element «Номер журналу». P38 (double numbers rewritten with a slash) is not applied **Part b is superseded in part by R3 (8.5) and O11 (8.6).** |
| D11 | Year | (2026-10-05) The year is taken from the first available date in this order: print, issued, published, online. The selected year is printed exactly as supplied; it is not corrected from the retrieval date, plausibility or comparison with the other Crossref dates. If no date is available, D16 applies | P29 («Рік виходу журналу»). The order is a human decision; it closes the precedence left open as HD-6 in DOI resolution without changing the model |
| D12 | Pages and article number | (2026-10-05) **a.** The dash or hyphen in a page range is kept exactly as supplied; dash characters are not normalised. **b.** Page values that are not a plain range, such as `e308` or `S12 - S19`, are printed as supplied with no heuristic rewriting. **c.** When pages are absent, `articleNumber` is printed bare, with no invented designation. Pages take precedence over the article number; the case where both are present is a profile gap (G7) | N10, P33 («С.» before the pages). P34 (a dash between first and last page) is not followed. No source covers article numbers **Part a is superseded by R4 (8.5) and O8 (8.6).** |
| D13 | Language of designation words | (2026-10-05) Ukrainian designation words are used for every entry, independent of `Publication.language`. This is a human product-profile convention: the consulted sources do not normatively determine every designation word | Supported for the page designation only, by P33, itself provisional. No consulted source determines the words for volume or number inside an article record. Titles and names stay in the original language (N17) |
| D14 | Electronic resource and DOI | (2026-10-05) **a.** For this product profile a DOI-resolved journal article is treated as an electronic resource, so that the DOI can be given under S1 §7. This is a product-profile classification; it is not a claim that Crossref shows the reader consulted an electronic manifestation. **b.** The DOI is printed as `DOI: <canonical-doi>`. The label is a product-profile convention; no source supplies one. **c.** No date of access is printed, because the DOI is given as the identifier and not as an electronic address. No retrieval time is added to `Publication`, and the DOI-resolution model is not reopened. **d.** The general material designation is omitted | a: N18. b: N22 (the identifier is recommended instead of the address); the canonical form is the DOI of HD-1. c: N23 requires the date after an electronic address, and S1 is silent when an identifier stands in its place. d: N14. P41 (an access-mode note) is not followed |
| D15 | Zone separator | **Full stop** between zones, used consistently (2026-10-05). The full-stop-and-dash form is not used | N11 (recommended), N12 (uniform). P1 is not followed; P30 agrees |
| D16 | Missing metadata | (2026-10-05) **a.** Field by field. Authors missing: the entry is formatted under the title and is not blocked. Volume missing: omitted. Issue missing: omitted. Pages and article number both missing: omitted. Year missing after the D11 chain: formatting is blocked until it is supplied. Journal title missing: blocked until supplied. Title missing: blocked until supplied. No placeholder, inferred value or textual marker is inserted for a missing field. **b.** Missing metadata is always shown in the workspace from the existing `missingFields` information, including fields that do not block formatting. Formatting has a `cannot format` outcome only for the three critical fields: title, journal title and year. DOI resolution is unchanged: the DOI remains the only field required to construct a `Publication` | P2 for the omitted elements. Recording under the title when there is no author: P43. P35 (an estimated year) is not followed. The blocking rule is a human product decision; no source states it |
| O1 | Terminal full stop after the DOI | (2026-10-05) No extra full stop is appended after the DOI. The DOI is the terminal element of this profile | A human product-profile convention, intended to avoid ambiguity when a DOI suffix itself ends with punctuation. P3 (the description ends with a full stop) is not followed **Superseded by R6 (8.5); see O10 (8.6).** |
| O2 | Punctuation at a zone boundary | (2026-10-05) No duplicate terminal punctuation is emitted at a zone boundary: if the preceding rendered element already ends in `.`, `?`, `!` or `…`, the profile’s zone full stop is not appended | A deterministic human profile convention. It agrees with P5 after a full stop or an ellipsis and departs from P5 after `?` and `!`, where the S4 restatement keeps both signs **Superseded by R7 (8.5) and, for the rest, by O17 (8.7).** |
| O3 | Which issue values take `№ ` | (2026-10-05) A simple numeric issue is digits only. A numeric range is digits separated by one hyphen, en dash or em dash, with optional surrounding spaces; the supplied separator and spacing are kept. Only these forms take `№ `. Any other issue string is printed as supplied without `№` | Refines D10b. A human product-profile convention **Superseded in part by R3 (8.5) and O11 (8.6): a combined issue takes `/` and no longer keeps its separator; see also O14 (8.7).** |
| O4 | Pages and article number both present | (2026-10-05) Pages take precedence: the pages are printed and the article number is left out of the citation. The article number stays in the `Publication` metadata | A human profile decision; no source covers the case. Closes G7 |
| O5 | Kind of electronic data | (2026-10-05) Omitted | N19 permits it |
| O6 | Space after the page designation | (2026-10-05) Exactly one ordinary space follows the Ukrainian page designation: `С. <value>` | A human profile convention; no clause states the spacing |

### 8.2 Open

None. On 2026-10-05 the human closed all product-profile decisions D1–D16
and O1–O21. The dispositions of O7–O12 are in 8.6, of O13–O17 in 8.7, of
O18–O20 in 8.8 and of O21 in 8.9.

By the human’s instruction no further micro-decision is opened unless new
source evidence exposes a concrete unresolved behaviour of the formatter.
Closing the decisions did not approve the profile; the human approved it
separately (1.1).

### 8.3 Human dispositions after the final source audit

The audit of 2026-10-05 found four contradictions between recorded decisions
and the sources. The human kept all four decisions on 2026-10-05.

| Decision | Disposition | What is recorded against it |
|---|---|---|
| D2a | **Kept.** The stored personal-name fields are always rendered in the deterministic family and given form of the profile. Asian or African naming conventions are not inferred from the name of a person or from metadata | P45 is a known limitation and conflict (C9) |
| D14c | **Kept.** No date of access is printed when the DOI is used as the identifier. No retrieval-time state is added | P44 is provisional guidance that a date of access is desirable; it is not mandatory here (C10) |
| D9c, D10b, O3 | **Kept.** Volume and issue values are preserved as supplied. Roman numerals are not converted to Arabic | P46 is a provisional conflict with the preservation policy of the profile (C11) **Superseded in part on 2026-10-05 by R2 and R3 (8.5): the volume takes a designation, a numeric double issue takes a slash, and a Roman-numeral issue is converted. A volume value that is wholly a Roman numeral is converted by the disposition of O12 (8.6); other volume values are preserved.** |
| D2d | **Kept.** Several authors are separated by `; ` | The examples of S1 use commas (section 7), but no normative clause was found that requires the punctuation of the examples (C12) |

### 8.4 Departures from S6 found by the re-audit, and their dispositions

Each decision below was made, and in some cases confirmed in 8.3, when the
rule against it was known only from the S4 restatement. The re-audit of
2026-10-05 found that rule in the clause text of S6, which applies to a
reference through S1 §4.4. The human gave these dispositions on 2026-10-05.

| # | Decision | Normative statement (transcribed from S6) | Locator | Human disposition |
|---|---|---|---|---|
| H1 | D6b: subtitle case as supplied | Все остальные элементы записывают со строчной буквы. | S6 §4.11.1, p. 6 | **Revise** → R1 |
| H2 | D8: journal title as supplied | Основное заглавие идентифицирующего документа сокращают, если это: … б) заглавие периодического документа (журнала или газеты). | S6 §7.3.3, p. 37 | **Keep.** Compatible with the verified normative sources, because abbreviation is optional overall (S6 §4.10, p. 5; S1 §4.5, p. 3) |
| H3 | D9c: volume without a designation | обозначение тома, выпуска, номера и его порядковый номер (для журналов) | S6 §7.5.2, p. 39; Q4 | **Revise** → R2 |
| H4 | D10b and O3: issue value as supplied | Сдвоенный номер тома или выпуска приводят через косую черту. | S6 §7.5.1.1, p. 39; P46 | **Revise** → R3 |
| H5 | D12a: page-range character as supplied | между первой и последней страницами ставят знак тире | S6 §7.4.1, p. 38 | **Revise** → R4 |
| H6 | D3d: `; ` between authors after the slash | Однородные сведения внутри группы отделяют запятыми. | S6 §5.2.6.4, p. 13 | **Revise** → R5, with D3c re-checked (O9) |
| H7 | O1: no full stop after the DOI | В конце библиографического описания ставится точка. | S6 §4.7.1, p. 3 | **Revise** → R6 |
| H8 | O2: zone full stop dropped after `?` and `!` | При сочетании грамматического и предписанного знаков препинания в описании приводят оба знака. | S6 §4.7.11, p. 4 | **Revise** → R7 |

### 8.5 Rules revised after a delegated normative source became available

These rules were set by the human on 2026-10-05. **Each supersedes an
earlier human convention because the text of ДСТУ ГОСТ 7.1:2006 (S6) became
available.** The earlier convention stays in 8.1 as history.

| ID | Rule as revised | Supersedes | Basis | Limits and open details |
|---|---|---|---|---|
| R1 | The subtitle, as title information, begins in lower case where the verified rule applies. No general lower-casing of proper names, acronyms or embedded titles is implemented. A subtitle that cannot be transformed safely is a limitation left to the formatter and to manual correction | D6b: subtitle case always as supplied | S6 §4.11.1, p. 6 | O7. The `Publication` keeps the subtitle as supplied; the change is made when formatting **Under O7 (8.6) and O13 (8.7) the formatter lower-cases no subtitle; it warns.** |
| R2 | The volume carries the Ukrainian designation of the profile: `Т. <volume>` | D9c: the volume value printed bare | S6 §7.5.2, p. 39; Q2; D13 | O12. D9a and D9b are unchanged: the volume is printed when present, before the issue, joined to it by `, ` |
| R3 | A clearly numeric double issue is written with a slash, for example `5/6`. An unambiguous Roman-numeral issue is converted to Arabic numerals where the verified rule requires it. Arbitrary issue strings such as `Suppl 1` are not rewritten | D10b and O3 where they kept the supplied separator and spacing of a numeric range; the disposition in 8.3 where it kept Roman-numeral issues | S6 §7.5.1.1, p. 39; §4.11.4.1, p. 6 | O11. D10a is unchanged: the designation is `№` |
| R4 | A plain page range is written with the dash the verified source requires between the first and the last page, not with the supplied separator. Values that are not a plain range, including electronic locators, stay under D12b | D12a: the supplied dash or hyphen kept | S6 §7.4.1, p. 38 | O8 |
| R5 | Several authors in the statement of responsibility are separated by a comma | D3d: `; ` after the slash | S6 §5.2.6.4, p. 13 | Final with O9 (8.6): direct order after the slash. D2d is unchanged: `; ` between authors in the heading |
| R6 | The bibliographic description ends with a terminal full stop, including when the DOI is the final element | O1: no full stop after the DOI | S6 §4.7.1, p. 3 | O10 |
| R7 | Where the verified rule keeps both a grammatical and a prescribed sign, the prescribed full stop is not dropped after `?` or `!` | O2 for `?` and `!` | S6 §4.7.11, p. 4 | The rest of O2 stands as a human convention: the zone full stop is not doubled after `.` or `…`. S6 drops it only after an ellipsis or the full stop of an abbreviation, which the formatter cannot tell from a sentence end **The rest of O2 was superseded by O17 (8.7).** |

**Re-check of D3c against S6, asked for with H6.** S6 says statements of
responsibility are written «в той форме, в какой они указаны в предписанном
источнике информации» (§5.2.6.2, p. 13). It prescribes no order of name
parts after the slash, so it does not *require* a different order than D3c;
the agent therefore did not change D3c. It does not prescribe the heading
form there either: surname first with a comma is a rule of the heading
standard. As evidence only: where an example of S6 has a personal heading,
the name is inverted with a comma in the heading and mostly stands in direct
order after the slash, with commas between names («Боголюбов, А. Н. … /
А. Н. Боголюбов, А. Л. Делицын, М. Д. Малых», S6 Appendix A, p. 46). Some
examples give the surname first without a comma after the slash
(«Белозеров, И. В. … / Белозеров Иван Валентинович», p. 45). The agent
found no example in S6 with a comma inside a name after the slash. With D3c
unchanged, R5 gave names that could not be told apart, so the pair was opened
as O9. The human decided it on 2026-10-05 (8.6): direct order after the slash.

### 8.6 Human dispositions of the points opened by 8.5

The revisions in 8.5 opened six points. They are kept here as they were
opened:

| ID | Open point | Sources | Why it was open |
|---|---|---|---|
| O7 | Which subtitles may have their first word lower-cased safely (R1) | S6 §4.11.1, p. 6; §5.2.5.7, p. 12 | The clause follows the grammar of the language of the description, so a German noun, a proper name, an acronym or an embedded title keeps its capital. No source gives a mechanical test, and the language of an entry may be unknown |
| O8 | The dash character of a page range, and what counts as a plain range (R4) | S6 §7.4.1, p. 38; C6 | The clause says «знак тире» and names no character. S6 prints a short dash in the examples of §7.4.1 (p. 38) and §7.5.2 (p. 39) and a longer dash in the example of §7.1.11 (p. 35); S1 prints an em dash in its examples. No clause states whether spaces surround it |
| O9 | The form of a name after the responsibility slash (D3c), coupled with R5 | S6 §5.2.6.2, p. 13; §5.2.6.4, p. 13 | S6 requires the form given in the source and prescribes no order of name parts; the surname-first form with a comma belongs to the heading standard. With D3c as decided («family, given»), names separated by commas cannot be told apart. Crossref does not record the order printed in the byline |
| O10 | A DOI that itself ends in a full stop, under R6 | S6 §4.7.1, p. 3; §4.7.11, p. 4; R7 | R6 adds a terminal full stop after the DOI. Whether one is still added after a DOI ending in a full stop is not said by the clause or by R7, which speaks of zone boundaries |
| O11 | The exact issue forms covered by R3 | S6 §7.5.1.1, p. 39; §4.11.4.1, p. 6 | Whether any two numbers joined by a hyphen or dash count as a double issue (for example `1-3`), what makes a Roman numeral unambiguous, and how a double issue in Roman numerals is treated |
| O12 | Volume values under R2 | S6 §6.3.4.5, p. 33; §4.11.4.1, p. 6; 8.3 | S6 gives the ordinal numbers of a serial’s volumes and issues in Arabic numerals («Порядковые номера и годы приводят арабскими цифрами», §6.3.4.5). H4 spoke of issues only, and the disposition in 8.3 keeps volume values as supplied. Under R2 a non-numeric volume string would also take `Т. ` |

The human decided all six on 2026-10-05:

| ID | Human disposition | Supersedes or completes | Kind and basis |
|---|---|---|---|
| O7 | The subtitle is not lower-cased mechanically where that would require guessing whether its first token is a proper name, an acronym, an embedded title or a similar exception. In those cases the supplied subtitle text is preserved and a manual-correction (capitalisation) warning is exposed | Completes R1. For those cases the printed text is the one D6b gave | The deterministic MVP handling of a normative rule (S6 §4.11.1, p. 6) that cannot be safely automated from the available metadata. The warning belongs to the workspace slice. Detail not stated: O13 |
| O8 | A plain numeric page range is written with the em dash `—`, as printed by S1. A plain numeric range is defined narrowly: digits, one hyphen, en dash or em dash, digits, with optional surrounding spaces. `12-18`, `12–18` and `12—18` all give `12—18`. Values with a prefix, a suffix or other text, such as `S12–S19` or `e308`, stay under D12b and are preserved as supplied | Completes R4. D12a stays superseded; D12b is unchanged | The dash is required by S6 §7.4.1 (p. 38). The character is a human choice: no clause names it, and S1 shows the em dash in examples only (§4.9, p. 3; section 10). Closes C6 |
| O9 | After the responsibility slash a personal name is written in direct order: `Given Family`. Authors stay in source order and are separated by the normative comma. The heading form `Family, Given` is not used after the slash, because it is ambiguous when the comma also separates authors. Organisation names stay as supplied | **Supersedes D3c.** Makes R5 final. D2 (the heading form), D3a and D4 are unchanged | A human profile convention. S6 §5.2.6.2 (p. 13) requires the form given in the source, which Crossref does not record, and prescribes no order of name parts; P17 cannot be applied. The comma: S6 §5.2.6.4 (p. 13). It bears only on entries with four or more authors, the only ones with authors after the slash (D3a, N7) |
| O10 | If the canonical DOI already ends in `.`, no second full stop is appended: the rendered entry already ends in a full-stop character. The DOI value itself is not altered | Completes R6 | A punctuation-collision convention of the human. No clause covers the case **Kept on 2026-10-05 against O17 (O19, 8.8).** |
| O11 | A simple numeric combined issue is normalised to slash form: when the entire issue value is two numeric endpoints separated by `/`, a hyphen, an en dash or an em dash, it is written with `/`. `1-3`, `1–3`, `1—3` and `1/3` all give `1/3`. Roman numerals are converted to Arabic only when an entire issue component is an unambiguous valid Roman numeral; Roman-looking text inside an arbitrary value such as `Suppl IV` is not converted. A combined issue whose complete components are valid Roman numerals has each component converted and is written with `/` | Completes R3. **Supersedes O3** where it kept the supplied separator and spacing of a numeric range: every such pair is now a combined issue | The slash: S6 §7.5.1.1 (p. 39). Arabic numerals: S6 §4.11.4.1 (p. 6) and §6.3.4.5 (p. 33). That any two numbers joined by a hyphen or dash are one combined issue is a human convention. Details not stated: O14, O15 |
| O12 | The same Roman-numeral rule applies to the volume: when the entire volume value is an unambiguous valid Roman numeral it is converted to Arabic. Otherwise the supplied volume value is preserved | **Supersedes the disposition in 8.3** for Roman-numeral volume values. Completes R2: `Т. ` precedes every volume value | S6 §6.3.4.5 (p. 33); Q4. Closes C11. Details not stated: O15, O16 **Revised for combined volumes by O16 (8.7).** |

### 8.7 Human dispositions of the details left by 8.6

The dispositions in 8.6 left five details. They are kept here as they were
listed:

| ID | Detail | Sources | What was not stated |
|---|---|---|---|
| O13 | When the subtitle warning is raised, and whether any subtitle is ever lower-cased | O7; S6 §4.11.1, p. 6 | O7 names the cases where lower-casing would require guessing. The agent’s reading, which is not a human decision: the available metadata never shows that a first token is none of the named exceptions, so no subtitle would be lower-cased. The condition that raises the warning, for example every subtitle that begins with a capital letter, is not stated |
| O14 | `№` and spacing for the issue values of O11 | O3, O11 | O3 gave `№ ` to a digits-only value and to a numeric range. Not stated: whether a value that is numeric only after conversion from Roman numerals takes `№ `, and whether spaces around the separator of a combined issue (`1 - 3`) are accepted, as O3 and O8 accept them |
| O15 | Which values are an unambiguous valid Roman numeral | O11, O12 | Not stated: single letters that may be letters and not numerals, and lower-case forms. As evidence only, S6 itself numbers a series «vol. C, N1» (example to §5.7.13, p. 23) |
| O16 | A combined volume | S6 §7.5.1.1, p. 39; O12 | S6 gives a double number «тома или выпуска» with a slash. O11 covers the issue; O12 applies only the Roman-numeral rule to the volume and otherwise preserves it. A volume such as `12-13` is therefore printed as supplied, which departs from the clause |
| O17 | The zone full stop after an element that ends in a full stop | S6 §4.7.11, p. 4; O2; R7 | S6 keeps both signs unless the first is an ellipsis or the full stop of an abbreviation. The part of O2 that stands drops the zone full stop after any `.`, because the formatter cannot tell an abbreviation from the end of a sentence. Recorded under R7; no disposition was given |

The human decided all five on 2026-10-05:

| ID | Human disposition | Supersedes or completes | Kind and basis |
|---|---|---|---|
| O13 | The subtitle text is preserved as supplied. The subtitle-capitalisation warning is raised only when the first cased (alphabetic) character of the supplied subtitle is upper case; when it is already lower case no warning is needed. Upper-case subtitle text is not lower-cased automatically, because the formatter cannot determine from the available metadata whether the token is a proper name, an acronym, an embedded title or another normative exception | Completes O7 and R1: the lower-casing of R1 is never performed by the formatter and is left to manual correction | Deterministic MVP handling. S6 §4.11.1 (p. 6) stays the rule that the warning points to |
| O14 | After an accepted Roman-to-Arabic conversion the result counts as a numeric issue and takes the normal `№ `. Numeric pairs separated by `/`, a hyphen, an en dash or an em dash are combined issues even when optional spaces surround the separator: `1 - 3`, `1–3`, `1—3` and `1/3` all give `№ 1/3` | Completes O11 and O3 | A human convention. The slash: S6 §7.5.1.1 (p. 39) **The parsing of pairs is completed by O20 (8.8).** |
| O15 | An unambiguous Roman numeral is defined conservatively. A value or component is converted only when the whole of it is a canonical upper-case Roman numeral, contains at least two Roman-numeral characters and represents a valid Roman number. Converted: `II`, `IV`, `XII`, `XX`. Not converted: single-letter values such as `C`, `V` and `X`; lower-case forms; Roman-looking text inside an arbitrary value such as `Suppl IV` | Completes O11 and O12 | A deterministic MVP convention, designed to avoid reading ordinary letters or series identifiers as numbers. It leaves S6 §4.11.4.1 (p. 6) unapplied for the forms it does not convert; such an issue value is not numeric and so is printed as supplied without `№` (O3) |
| O16 | A combined numeric volume is written with a slash: a numeric pair separated by `/`, a hyphen, an en dash or an em dash is rendered with `/`. `12-13`, `12–13`, `12—13` and `12/13` all give `Т. 12/13`. Complete components that qualify for Roman conversion under O15 are converted before the combined volume is rendered. Other volume strings stay under the existing preservation rule | **Revises O12** for combined volumes; completes R2 | S6 §7.5.1.1 (p. 39). Removes the departure that was listed as O16 **The parsing of pairs is completed by O20 (8.8).** |
| O17 | The generic full-stop collision rule follows S6. The prescribed zone full stop is not suppressed merely because supplied metadata ends in `.`. It is suppressed only where the verified rule supports suppression, such as after an ellipsis or an abbreviation. After `?` and `!` both the grammatical and the prescribed sign are retained, as already decided (R7). Whether an arbitrary supplied final `.` is an abbreviation is not guessed: where that cannot be determined safely, the normative punctuation is preserved and the case is recorded as a manual-correction or formatting warning; no heuristic is applied | **Supersedes the rest of O2**: the convention of never doubling a full stop no longer stands | S6 §4.7.11 (p. 4); P5. As recorded, the dispositions name no case in which an abbreviation can be determined safely, so an element that ends in a single `.` is followed by the zone full stop and raises a warning. Coupled points: O18, O19 **Applied to the heading by O18 and given its ellipsis forms by O20 (8.8).** |

### 8.8 Human dispositions of the points left by 8.7

The dispositions in 8.7 left three points. They are kept here as they were
listed:

| ID | Point | Sources | What was not stated |
|---|---|---|---|
| O18 | The full stop after the heading when the last given value ends in `.` | P26; O17; D2b, D2c | The heading ends with a full stop only by P26, a provisional row that no decision restates, and O2 spoke of zone boundaries. Not stated: whether this boundary falls under O17, and whether the full stop of initials supplied by Crossref (`K. J.`) is an abbreviation that can be determined safely. If it is not, a heading that ends in initials is printed with two full stops and a warning. As evidence only, S1 prints one («Кабанов В. Г. Кредитування…», §5.4.5, p. 7; section 7) |
| O19 | O10 against O17 | O10; O17 | O10 appends no second full stop after a DOI that ends in `.`. O17 no longer suppresses a full stop merely because supplied metadata ends in `.`, but it speaks of the zone full stop and not of the terminal one. O10 is left as decided; whether it still stands is not stated |
| O20 | Edge cases for the formatter specification | O14, O15, O16, O17 | Not stated: whether optional spaces around the separator are accepted for a combined volume, as O14 accepts them for an issue; a pair with one Roman and one Arabic component; whether a run of three full stops counts as an ellipsis, as `…` does |

The human decided all three on 2026-10-05:

| ID | Human disposition | Supersedes or completes | Kind and basis |
|---|---|---|---|
| O18 | An obvious terminal personal-name initial is treated as an abbreviation for the punctuation at the heading boundary. If the final rendered author name ends in one or more ordinary initials whose final token is a single alphabetic character followed by `.`, no second heading full stop is appended: `Smith, K.` stays `Smith, K.` and `Smith, K. J.` stays `Smith, K. J.`. This is not generalised to arbitrary metadata ending in `.` | Completes O17 for the heading boundary | The heading-specific application of the verified abbreviation collision rule (S6 §4.7.11, p. 4). The heading full stop itself rests on P26, which is provisional. As recorded, a heading that ends in any other `.`, such as a given value abbreviated to several letters or an organisation name, keeps both full stops and raises the warning of O17. Detail not stated: O21 **The detail O21 is decided in 8.9.** |
| O19 | **O10 is kept.** If the canonical DOI itself ends in `.`, no other terminal full stop is appended. The DOI itself is not modified | Confirms O10 beside O17 | A narrow DOI punctuation-collision convention of the human; it is not an abbreviation rule |
| O20 | **Combined numeric volume and issue values.** Optional ordinary spaces are allowed around the recognised separator. The recognised separators are `/`, the hyphen, the en dash and the em dash. The two components are processed independently; each may be Arabic digits or an unambiguous Roman numeral under O15. Qualifying Roman components are converted to Arabic first, and the combined result is rendered with `/`: `12 - 13` gives `12/13`, `II-3` gives `2/3`, `3 – IV` gives `3/4`. **Ellipsis forms.** For punctuation collision both the Unicode ellipsis `…` and exactly three consecutive full stops `...` are ellipsis forms that suppress the additional prescribed full stop. Arbitrary runs such as `..` or `....` are not ellipses | Completes O11, O14 and O16 for the parsing of pairs, and O17 for the ellipsis | Deterministic MVP conventions of the human. The slash: S6 §7.5.1.1 (p. 39). The ellipsis: S6 §4.7.11 (p. 4) |

### 8.9 Human disposition of the point left by 8.8

The dispositions in 8.8 left one point. It is kept here as it was listed:

| ID | Point | Sources | What was not stated |
|---|---|---|---|
| O21 | Initials written without a space or with a hyphen, under O18 | O18; D2c | O18 covers a name whose final token is a single alphabetic character followed by `.`. D2c keeps `K.J.` as supplied, and given values such as `J.-P.` also occur. Not stated: whether the last initial of such a value is that token. The agent’s reading: it is, when the letter stands at the start of the given value or follows a space, a full stop or a hyphen |

The human decided it on 2026-10-05:

| ID | Human disposition | Supersedes or completes | Kind and basis |
|---|---|---|---|
| O21 | **Yes.** A terminal initial counts as an abbreviation even when the initials are written without spaces or are hyphenated. A terminal personal-name initial is recognised when a letter followed by `.` takes part in a sequence of initials, including the forms `K.`, `K. J.`, `K.J.` and `J.-P.`. If the rendered heading ends in such an initial, no second heading full stop is appended. The rule is not generalised to arbitrary dotted strings, acronyms, identifiers, DOIs or other metadata | Completes O18 | The heading-specific application of the verified abbreviation collision rule (S6 §4.7.11, p. 4), as in O18 |

## 9. Source conflicts and gaps

| # | Conflict or gap | Sources | Outcome |
|---|---|---|---|
| C1 | S6 says of itself that it does not cover bibliographic references (Q1); S4, S5 and S3 say the same of the heading standard; S1 applies both to references | S6 §1, p. 1; S4 p. 6; S5 p. 1/3; S3 p. 1/4 vs N4 | S1 governs: it imports the rules of both standards for references, with its own deviations |
| C2 | One author in the heading against one, two or three | P20 vs N7 | S1 governs |
| C3 | Comma after the surname: S4 and S3 show it; S1’s examples do not; S1 has no clause | P23–P25 | Decided in D2a: always a comma. This differs from what S1’s examples show. S5 p. 3/3 calls the comma the main provision of the heading standard |
| C4 | Statement of responsibility mandatory even when the names are in the heading (S4 p. 19), against not repeated | N7, P19 | S1 governs |
| C5 | «та ін.» in square brackets against brackets optional | P18, P40 vs N13 | Moot: the profile does not use «та ін.» (D3) |
| C6 | Dash characters differ between sources | section 7; S6 §7.4.1 | Closed by R4 and O8: a plain numeric page range takes the em dash that S1 prints. The character is a human choice; no clause names it |
| C7 | Without `//`, S4 uses «У:» or «In:» (p. 30); S1 uses a full stop | N9 | S1 governs |
| C8 | S4 cites ДСТУ 3582–97 for abbreviations; S1 cites ДСТУ 3582:2013 | S4 p. 13; S1 §2, p. 1 | Moot for this profile: D8 decides that nothing is abbreviated |
| C9 | Comma in every personal name against no comma in Asian and African names | D2a vs P45 | Human disposition (8.3): D2a kept; a known limitation |
| C10 | No date of access against a date of access that is desirable | D14c vs P44 | Human disposition (8.3): D14c kept |
| C11 | Volume and issue as supplied against Roman numerals converted to Arabic | D9c, D10b, O3 vs P46 | Closed by R3, O11 and O12: an issue or volume value that is wholly a Roman numeral is converted; other values are preserved. The disposition of 8.3 is superseded to that extent |
| C12 | `; ` between authors in a heading against the comma in the examples of S1 | D2d vs S1 §5.4.5, p. 6–7 (examples) | Human disposition (8.3): D2d kept; no clause requires the example punctuation |
| C13 | Source-of-title note mandatory against may be omitted | P47 vs N24 | S1 governs; the note is not printed |
| G1 | Normative text of the delegated standards | S6, S5 | **Closed for ДСТУ ГОСТ 7.1:2006**: S6 is present and 33 of the 47 rows from S4 are verified against it (5.8). **Open for ДСТУ ГОСТ 7.80:2007**: its text is not available, so the heading rows P20–P27, P43 and P45 stay provisional, corroborated in part by S5 |
| G2 | No source for: a volume inside an article record, article numbers, the form of a DOI, a date of access with a DOI, deriving initials | — | Decided as conventions in D2b, D9, D12 and D14 |
| G3 | The exact characters of S1 | section 10 | Closed for spacing: the agent read S1 as page images, the print shows tight colons and slashes, and S7 says such missing spaces are errors of the printing. A human spot check of section 10 remains optional |
| G4 | The cover and title page of S4 are images and were not viewed | section 2 | Of low weight now: S6 replaces S4 as the authority for ДСТУ ГОСТ 7.1. The year and authors of S4 stay unconfirmed |
| G5 | No clause in S1 or S4 states whether initials are separated by a space; spacing is visible only in examples | — | Decided in D2c: spacing is kept as supplied |
| G6 | No clause states what separates several authors in one heading. S1 puts up to three there (N7) without naming a separator; the heading in the S4 restatement holds one person (P20) | N7, P20 | Decided in D2d: `; ` |
| G7 | A record with both pages and an article number: no source says how both are given | — | Closed by the human profile decision O4: pages are printed, the article number is not |
| G8 | The designation words for volume and number were not stated by any clause in the sources first consulted | Q2 | Closed: S6 §7.5.1 (p. 38) names «Т., Вып., №» in clause text. R2 now gives the volume the designation `Т.` |
| G9 | The spaces around the responsibility slash followed the S4 restatement and had no explicit human decision | P4, P16, K1 | Closed: S6 §4.7.5 and §5.2.6.4 state the slash and its spaces in clause text, and S7 explains the tight slashes of S1 as an error |
| G10 | Statements that cannot be followed for lack of data or of a decidable rule | Q8; P31; S4 p. 16, 32 | The title of an issue is optional (Q8): closed. The place of publication when it is needed to identify a periodical (S6 §7.3.10, p. 38) cannot be given: the model has no place. A title wholly in quotation marks written without them is stated only by S4 and was not found in S6 |
| G11 | The text of the official corrections to S1 is not in `references/`. S7 only reports them, and says they cover the removed spaces «та деякі інші» | S7 | Open: the other corrections are unknown. A corrected printing of S1, or page 103 of «Інформаційний покажчик стандартів» 2016, № 12 (408), would close it |
| G12 | Electronic resources in the delegated standards | S6 §5.4.1.6, p. 22; S6 p. III | S6 refers them to ГОСТ 7.82, which its national introduction says is not implemented in Ukraine. P41 and P44 stay provisional. S1 §7 governs references in any case |

## 10. S1 characters: what the print shows

On 2026-10-05 the agent read all 20 pages of S1 as page images. A human spot
check of the same pages remains optional.

What the print shows against the text layer:

- Colons and single slashes are printed tight throughout the examples, as
  the text layer has them (for example §5.3.5, p. 5). The layer shows 48
  colons with no space before and 16 unspaced slashes on printed pages 2–13.
- `//` is printed both tight and spaced, sometimes in neighbouring examples
  (§5.5.11, p. 10; §7.4.4.3.3, p. 12–13).
- Page ranges are printed with an em dash and no spaces («С. 18—20», §4.9,
  p. 3). The space after the dash in the text layer is an artefact.
- «Т. 2» has its full stop in print (§4.6, p. 3; §5.2.5, p. 4); the text
  layer dropped it, as it did in «Кабанов В. Г.» (§5.4.5, p. 6) and
  «Азаренкова Г. М.» (§5.4.6.1.2, p. 7).
- A space follows «№» and «С.» in every example.
- In the example of §4.9.1 (p. 3) the journal name «Освіта» is printed in
  italics, as that clause describes.
- §2 (p. 1) does print the title of ДСТУ ГОСТ 7.80:2007 with the words
  «Бібліографічний опис». S6 §2 (p. 1) and S5 give the title without them.

What S7 changes: the tight colons and slashes are errors of this printing
(K1), so they are not weighed against the profile. The spacing of ` : `
(D6c), ` / ` and ` // ` (D7) rests on the clause text of S6 (P4, P16, P28).
S7 also speaks of other corrections without listing them (G11).

## 11. Out of scope

Short and repeated references (S1 §5.5); in-text and footnote references
(S1 §5.2, §5.3); citation marks in the text (S1 §5.4.5–5.4.6); complex
references (S1 §6); local electronic resources (S1 §7.4.3); archival documents
(S1 §8); every publication type other than a journal article. Numbering and
order of entries in a list (S1 §5.4.1.1, p. 5) belong to the workspace slice.
