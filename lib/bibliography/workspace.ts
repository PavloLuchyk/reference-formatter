import type { CanonicalDoi } from "@/lib/doi/normalize-doi";
import { isSamePublication, type Publication } from "@/lib/publication/publication";

// The user's ordered list of journal articles for one session. A list is a value: every operation returns a new one.
// An entry is identified by the canonical DOI of its Publication and by nothing else, so no rule of DOI normalization
// or of Publication identity is repeated here. HD…, AS… name decisions and assumptions of the design of the change
// bibliography-workspace.

export type Entry = { readonly publication: Publication };

export type Workspace = { readonly entries: readonly Entry[] };

// A refused addition is a value, as a failed resolution is.
export type AddOutcome =
  | { readonly ok: true; readonly workspace: Workspace }
  | { readonly ok: false; readonly reason: "duplicate" };

export type MoveDirection = "up" | "down";

export const emptyWorkspace: Workspace = { entries: [] };

const positionOf = (workspace: Workspace, doi: CanonicalDoi): number =>
  workspace.entries.findIndex((entry) => entry.publication.doi === doi);

// The position an entry would move to, or null when it is not in the list or stands at that end of it.
const destination = (workspace: Workspace, doi: CanonicalDoi, direction: MoveDirection): number | null => {
  const from = positionOf(workspace, doi);
  if (from === -1) return null;
  const to = direction === "up" ? from - 1 : from + 1;
  return to < 0 || to >= workspace.entries.length ? null : to;
};

// `doi` is a canonical DOI, as normalizeDoi gives it for what the user typed.
export function hasEntry(workspace: Workspace, doi: CanonicalDoi): boolean {
  return positionOf(workspace, doi) !== -1;
}

// HD-8: a new entry goes to the end; nothing is sorted. AS-7: a duplicate leaves the list as it was.
export function addEntry(workspace: Workspace, publication: Publication): AddOutcome {
  if (workspace.entries.some((entry) => isSamePublication(entry.publication, publication))) {
    return { ok: false, reason: "duplicate" };
  }
  return { ok: true, workspace: { entries: [...workspace.entries, { publication }] } };
}

export function removeEntry(workspace: Workspace, doi: CanonicalDoi): Workspace {
  return { entries: workspace.entries.filter((entry) => entry.publication.doi !== doi) };
}

// The first entry cannot move up and the last cannot move down.
export function canMoveEntry(workspace: Workspace, doi: CanonicalDoi, direction: MoveDirection): boolean {
  return destination(workspace, doi, direction) !== null;
}

// A move exchanges the entry with its neighbour and changes nothing else; a move that is not available changes nothing.
export function moveEntry(workspace: Workspace, doi: CanonicalDoi, direction: MoveDirection): Workspace {
  const to = destination(workspace, doi, direction);
  if (to === null) return workspace;
  const from = positionOf(workspace, doi);
  const entries = [...workspace.entries];
  [entries[from], entries[to]] = [entries[to], entries[from]];
  return { entries };
}

// The entry of the same publication takes the corrected Publication and keeps its position.
export function replacePublication(workspace: Workspace, publication: Publication): Workspace {
  return {
    entries: workspace.entries.map((entry) =>
      isSamePublication(entry.publication, publication) ? { publication } : entry,
    ),
  };
}
