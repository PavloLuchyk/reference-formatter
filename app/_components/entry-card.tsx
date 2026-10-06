import { copy } from "@/app/_components/copy";
import { CorrectionForm } from "@/app/_components/correction-form";
import { metadataGaps } from "@/lib/bibliography/metadata-gaps";
import type { MoveDirection } from "@/lib/bibliography/workspace";
import { formatJournalArticle } from "@/lib/dstu/format-journal-article";
import type { Publication } from "@/lib/publication/publication";

// One item of the list («запис»). What it shows is computed from its Publication each time it is rendered: the
// reference exactly as the formatter returns it with its warnings, or the fields that block formatting, and the
// gaps in its optional metadata. Nothing is stored and the reference text is never altered here.

export type EntryCardProps = {
  readonly publication: Publication;
  // Position in the list, counted from 1.
  readonly position: number;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly correcting: boolean;
  readonly onCopy: (reference: string) => void;
  readonly onCorrect: () => void;
  readonly onRemove: () => void;
  readonly onMove: (direction: MoveDirection) => void;
  readonly onSave: (publication: Publication) => void;
  readonly onCancel: () => void;
};

const BUTTON =
  "rounded border border-zinc-400 px-2 py-1 text-sm hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40";

export function EntryCard({
  publication,
  position,
  canMoveUp,
  canMoveDown,
  correcting,
  onCopy,
  onCorrect,
  onRemove,
  onMove,
  onSave,
  onCancel,
}: EntryCardProps) {
  const outcome = formatJournalArticle(publication);
  const gaps = metadataGaps(publication);

  return (
    <li className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      {outcome.kind === "formatted" ? (
        <>
          <p className="break-words">{outcome.text}</p>
          {outcome.warnings.map((warning) => (
            <p key={warning} className="text-sm text-amber-700 dark:text-amber-400">
              {copy.warning[warning]}
            </p>
          ))}
        </>
      ) : (
        <>
          <p className="break-words">
            {copy.doi}: {publication.doi}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400">{copy.cannotBeFormed(outcome.blockedBy)}</p>
        </>
      )}

      {gaps.length > 0 && <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.gaps(gaps)}</p>}

      <div className="flex flex-wrap gap-2">
        {/* An entry without a reference offers no copy. */}
        {outcome.kind === "formatted" && (
          <button
            type="button"
            className={BUTTON}
            aria-label={copy.entryControl(copy.copyOne, position)}
            onClick={() => onCopy(outcome.text)}
          >
            {copy.copyOne}
          </button>
        )}
        <button
          type="button"
          className={BUTTON}
          aria-label={copy.entryControl(copy.correct, position)}
          onClick={onCorrect}
        >
          {copy.correct}
        </button>
        <button
          type="button"
          className={BUTTON}
          aria-label={copy.entryControl(copy.moveUp, position)}
          disabled={!canMoveUp}
          onClick={() => onMove("up")}
        >
          {copy.moveUp}
        </button>
        <button
          type="button"
          className={BUTTON}
          aria-label={copy.entryControl(copy.moveDown, position)}
          disabled={!canMoveDown}
          onClick={() => onMove("down")}
        >
          {copy.moveDown}
        </button>
        <button
          type="button"
          className={BUTTON}
          aria-label={copy.entryControl(copy.remove, position)}
          onClick={onRemove}
        >
          {copy.remove}
        </button>
      </div>

      {correcting && <CorrectionForm publication={publication} onSave={onSave} onCancel={onCancel} />}
    </li>
  );
}
