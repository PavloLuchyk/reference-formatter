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

// Non-ASCII formatting characters of the approved profile, as escapes, so that a Latin look-alike cannot slip into
// an expected text written by hand: Cyrillic Те and Ес, the numero sign and the em dash.
export const TE = "Т";
export const ES = "С";
export const NUMERO = "№";
export const EM_DASH = "—";
