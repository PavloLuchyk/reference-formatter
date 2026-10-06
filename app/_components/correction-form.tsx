import { useId, useState, type FormEvent } from "react";
import { copy } from "@/app/_components/copy";
import {
  addAuthor,
  applyCorrection,
  canMoveAuthor,
  draftFromPublication,
  moveAuthor,
  removeAuthor,
  type AuthorDraft,
  type CorrectionDraft,
} from "@/lib/bibliography/correction";
import type { Publication } from "@/lib/publication/publication";

// The form for correcting the metadata of one entry. It holds a draft of strings and knows no rule: what a draft
// holds, how it is applied and what is rejected are decided in lib/bibliography/correction.

export type CorrectionFormProps = {
  readonly publication: Publication;
  readonly onSave: (publication: Publication) => void;
  readonly onCancel: () => void;
};

type ScalarField = Exclude<keyof CorrectionDraft, "authors">;

const INPUT = "w-full rounded border border-zinc-300 bg-white px-2 py-1 text-zinc-900";
const SMALL_BUTTON =
  "rounded border border-zinc-400 px-2 py-1 text-sm hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40";

type TextFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly describedBy?: string;
  readonly invalid?: boolean;
};

// A labelled single-line field; without `onChange` it is shown and cannot be edited.
function TextField({ label, value, onChange, describedBy, invalid }: TextFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={`${INPUT} ${onChange ? "" : "bg-zinc-100 text-zinc-600"}`}
        value={value}
        readOnly={onChange === undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={onChange && ((event) => onChange(event.target.value))}
      />
    </div>
  );
}

type AuthorRowProps = {
  readonly author: AuthorDraft;
  readonly position: number;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly onChange: (author: AuthorDraft) => void;
  readonly onRemove: () => void;
  readonly onMove: (direction: "up" | "down") => void;
};

function AuthorRow({ author, position, canMoveUp, canMoveDown, onChange, onRemove, onMove }: AuthorRowProps) {
  const kindId = useId();
  return (
    <fieldset className="flex flex-col gap-2 rounded border border-zinc-200 p-3">
      <legend className="px-1 text-sm font-medium">{copy.author(position)}</legend>
      <div className="flex flex-col gap-1">
        <label htmlFor={kindId} className="text-sm font-medium">
          {copy.authorKind}
        </label>
        <select
          id={kindId}
          className={INPUT}
          value={author.kind}
          onChange={(event) => onChange({ ...author, kind: event.target.value as AuthorDraft["kind"] })}
        >
          <option value="person">{copy.person}</option>
          <option value="organisation">{copy.organisation}</option>
        </select>
      </div>
      {author.kind === "person" ? (
        <>
          <TextField label={copy.family} value={author.family} onChange={(family) => onChange({ ...author, family })} />
          <TextField label={copy.given} value={author.given} onChange={(given) => onChange({ ...author, given })} />
        </>
      ) : (
        <TextField label={copy.organisationName} value={author.name} onChange={(name) => onChange({ ...author, name })} />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className={SMALL_BUTTON}
          aria-label={copy.authorControl(copy.moveUp, position)}
          disabled={!canMoveUp}
          onClick={() => onMove("up")}
        >
          {copy.moveUp}
        </button>
        <button
          type="button"
          className={SMALL_BUTTON}
          aria-label={copy.authorControl(copy.moveDown, position)}
          disabled={!canMoveDown}
          onClick={() => onMove("down")}
        >
          {copy.moveDown}
        </button>
        <button
          type="button"
          className={SMALL_BUTTON}
          aria-label={copy.authorControl(copy.remove, position)}
          onClick={onRemove}
        >
          {copy.remove}
        </button>
      </div>
    </fieldset>
  );
}

export function CorrectionForm({ publication, onSave, onCancel }: CorrectionFormProps) {
  const headingId = useId();
  const yearErrorId = useId();
  const [draft, setDraft] = useState(() => draftFromPublication(publication));
  const [yearRejected, setYearRejected] = useState(false);

  const setField = (field: ScalarField) => (value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const setAuthor = (index: number) => (author: AuthorDraft) =>
    setDraft((current) => ({
      ...current,
      authors: current.authors.map((existing, position) => (position === index ? author : existing)),
    }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const outcome = applyCorrection(publication, draft);
    if (outcome.ok) onSave(outcome.publication);
    else setYearRejected(outcome.errors.some((error) => error.field === "year"));
  };

  return (
    <form
      aria-labelledby={headingId}
      className="mt-3 flex flex-col gap-3 rounded border border-zinc-300 bg-zinc-50 p-4 text-zinc-900"
      noValidate
      onSubmit={submit}
    >
      <h3 id={headingId} className="text-base font-semibold">
        {copy.correctionHeading}
      </h3>

      <TextField label={copy.doi} value={publication.doi} />
      <TextField label={copy.title} value={draft.title} onChange={setField("title")} />
      <TextField label={copy.subtitle} value={draft.subtitle} onChange={setField("subtitle")} />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">{copy.authorsHeading}</legend>
        {draft.authors.length === 0 && <p className="text-sm text-zinc-600">{copy.noAuthors}</p>}
        {draft.authors.map((author, index) => (
          // The rows have no identity of their own; their position is what the user sees and acts on.
          <AuthorRow
            key={index}
            author={author}
            position={index + 1}
            canMoveUp={canMoveAuthor(draft, index, "up")}
            canMoveDown={canMoveAuthor(draft, index, "down")}
            onChange={setAuthor(index)}
            onRemove={() => setDraft((current) => removeAuthor(current, index))}
            onMove={(direction) => setDraft((current) => moveAuthor(current, index, direction))}
          />
        ))}
        <div>
          <button type="button" className={SMALL_BUTTON} onClick={() => setDraft((current) => addAuthor(current))}>
            {copy.addAuthor}
          </button>
        </div>
      </fieldset>

      <TextField label={copy.journalTitle} value={draft.journalTitle} onChange={setField("journalTitle")} />
      <TextField
        label={copy.year}
        value={draft.year}
        onChange={setField("year")}
        describedBy={yearRejected ? yearErrorId : undefined}
        invalid={yearRejected}
      />
      {yearRejected && (
        <p id={yearErrorId} role="alert" className="text-sm text-red-700">
          {copy.invalidYear}
        </p>
      )}
      <TextField label={copy.volume} value={draft.volume} onChange={setField("volume")} />
      <TextField label={copy.issue} value={draft.issue} onChange={setField("issue")} />
      <TextField label={copy.pages} value={draft.pages} onChange={setField("pages")} />
      <TextField label={copy.articleNumber} value={draft.articleNumber} onChange={setField("articleNumber")} />

      <div className="flex gap-2">
        <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-700">
          {copy.save}
        </button>
        <button type="button" className={SMALL_BUTTON} onClick={onCancel}>
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}
