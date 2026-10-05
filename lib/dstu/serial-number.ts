// Normalisation of a volume or issue value under the approved profile (docs/dstu/rules.md: O11, O12, O14, O15, O16, O20).
// A value is normalised to a number or to two numbers joined by a slash; every other value is printed as supplied.

// O15, conservative on purpose: a canonical upper-case Roman numeral of at least two characters. Single letters,
// lower-case forms and non-canonical spellings are left alone, so that ordinary letters are not read as numbers.
const CANONICAL_ROMAN = /^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
const ROMAN_DIGITS: Readonly<Record<string, number>> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

const romanToArabic = (numeral: string): string | null => {
  if (numeral.length < 2 || !CANONICAL_ROMAN.test(numeral)) return null;
  let total = 0;
  for (let index = 0; index < numeral.length; index += 1) {
    const value = ROMAN_DIGITS[numeral[index]];
    const next = ROMAN_DIGITS[numeral[index + 1]] ?? 0;
    total += value < next ? -value : value;
  }
  return String(total);
};

// One component: Arabic digits as supplied, or a qualifying Roman numeral in Arabic digits.
const toNumber = (component: string): string | null => (/^[0-9]+$/.test(component) ? component : romanToArabic(component));

// O20: two components around one slash, hyphen, en dash or em dash, with optional ordinary spaces around it.
const PAIR = /^([0-9A-Z]+) *[/\-–—] *([0-9A-Z]+)$/;

// Returns the normalised form, or null when the value must be printed exactly as supplied.
export function normaliseSerialNumber(value: string): string | null {
  const single = toNumber(value);
  if (single !== null) return single;

  const pair = PAIR.exec(value);
  if (pair === null) return null;
  const first = toNumber(pair[1]);
  const second = toNumber(pair[2]);
  return first === null || second === null ? null : `${first}/${second}`;
}
