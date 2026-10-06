// Test support: reads the human-approved golden oracle tests/golden/dstu-journal.ts as data.
// A Publication of a fixture is a test input; its approved text is an expected value. Nothing here calls the formatter.
import type { Publication } from "@/lib/publication/publication";
import { goldenFixtures } from "@/tests/golden/dstu-journal";

const fixture = (id: string) => {
  const found = goldenFixtures.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`No golden fixture ${id}`);
  return found;
};

export const goldenPublication = (id: string): Publication => fixture(id).publication;

export const approvedText = (id: string): string => {
  const { expected } = fixture(id);
  if (expected.kind !== "formatted") throw new Error(`Golden fixture ${id} has no approved reference text`);
  return expected.text;
};

// Non-ASCII formatting characters of the approved profile, named once so that an expected text written by hand uses
// the same characters everywhere: Cyrillic Те (U+0422) and Ес (U+0421), the numero sign (U+2116) and the em dash
// (U+2014). They stand here as literal characters, not as escapes, so the notation itself does not exclude a Latin
// look-alike: check the code point when one of them is edited.
export const TE = "Т";
export const ES = "С";
export const NUMERO = "№";
export const EM_DASH = "—";
