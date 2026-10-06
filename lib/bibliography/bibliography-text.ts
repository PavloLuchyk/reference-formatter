import type { Workspace } from "@/lib/bibliography/workspace";
import { formatJournalArticle } from "@/lib/dstu/format-journal-article";

// The plain text for copying the whole list. Each reference is formatted here, from the Publication of its entry,
// at the moment it is asked for; no reference text is stored anywhere.

export type BibliographyText =
  | { readonly kind: "ready"; readonly text: string }
  | { readonly kind: "blocked"; readonly unformatted: number }
  | { readonly kind: "empty" };

// HD-2, AS-12: one reference per line, in the order of the list (HD-8), joined by one line feed, with no number and
// no line feed after the last. HD-3: while an entry cannot be formatted there is no text, only the count of such
// entries. Warnings do not block: a reference is given exactly as the formatter returns it.
export function bibliographyText(workspace: Workspace): BibliographyText {
  if (workspace.entries.length === 0) return { kind: "empty" };

  const references: string[] = [];
  let unformatted = 0;
  for (const entry of workspace.entries) {
    const outcome = formatJournalArticle(entry.publication);
    if (outcome.kind === "formatted") references.push(outcome.text);
    else unformatted += 1;
  }

  return unformatted > 0 ? { kind: "blocked", unformatted } : { kind: "ready", text: references.join("\n") };
}
