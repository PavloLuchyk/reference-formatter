// The one place that decides the full stop between two parts of a reference (docs/dstu/rules.md: D15, R6, R7, O10,
// O17, O18, O19, O20, O21). A part is passed without the punctuation that separates it from the next one.

export type Joined = { readonly text: string; readonly collision: boolean };

// O20: an ellipsis is the character U+2026 or exactly three full stops; `..` and `....` are not ellipses.
const endsInEllipsis = (text: string): boolean =>
  text.endsWith("…") || (text.endsWith("...") && !text.endsWith("...."));

// D15: a zone is preceded by a full stop and a space. O17, R7: the full stop is kept after `.`, `?` and `!`, and is
// omitted only after an ellipsis. Whether a supplied final `.` is an abbreviation is not guessed: both full stops are
// printed and the caller is told, so that the outcome can carry the collision warning.
export function joinWithFullStop(before: string, after: string): Joined {
  if (endsInEllipsis(before)) return { text: `${before} ${after}`, collision: false };
  return { text: `${before}. ${after}`, collision: before.endsWith(".") };
}

// P26 (PROVISIONAL in the profile): the heading is followed by a full stop. O18, O21: not after a terminal
// personal-name initial, which is an abbreviation. In every other case the rule of a zone boundary applies.
export function joinHeading(heading: string, endsInInitial: boolean, rest: string): Joined {
  return endsInInitial ? { text: `${heading} ${rest}`, collision: false } : joinWithFullStop(heading, rest);
}

// R6: the reference ends in one full stop. O10, O19: a DOI that itself ends in a full stop gets no second one; this
// is a convention for the DOI only, not an abbreviation rule, and it raises no warning.
export const endReference = (text: string): string => (text.endsWith(".") ? text : `${text}.`);
