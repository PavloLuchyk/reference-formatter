"use client";

import { useId, useReducer, type FormEvent } from "react";
import { copy } from "@/app/_components/copy";
import { EntryCard } from "@/app/_components/entry-card";
import { bibliographyText } from "@/lib/bibliography/bibliography-text";
import {
  addEntry,
  canMoveEntry,
  emptyWorkspace,
  hasEntry,
  moveEntry,
  removeEntry,
  replacePublication,
  type MoveDirection,
  type Workspace as WorkspaceList,
} from "@/lib/bibliography/workspace";
import { normalizeDoi, type CanonicalDoi } from "@/lib/doi/normalize-doi";
import type { ResolutionFailure, ResolutionOutcome } from "@/lib/metadata/resolution";
import type { Publication } from "@/lib/publication/publication";

// The page of the workspace. It wires controls to the pure functions of lib/: whether input is a DOI is decided by
// normalizeDoi, whether a publication is already in the list by the list itself, what an entry shows by the
// formatter. The list lives in the memory of this page only and is gone when the page is reloaded.

export type WorkspaceProps = {
  // Resolves a canonical DOI. The page passes the Server Function; tests pass a fake.
  readonly resolve: (doi: string) => Promise<ResolutionOutcome>;
};

// Why the last submission added nothing.
type Notice =
  | { readonly kind: "failure"; readonly failure: ResolutionFailure["kind"] }
  | { readonly kind: "request-failed" }
  | { readonly kind: "duplicate" };

type State = {
  readonly workspace: WorkspaceList;
  readonly input: string;
  readonly pending: boolean;
  readonly notice: Notice | null;
  readonly copied: "copied" | "failed" | null;
  readonly correcting: CanonicalDoi | null;
};

type Action =
  | { readonly type: "typed"; readonly text: string }
  | { readonly type: "refused"; readonly notice: Notice }
  | { readonly type: "lookup-started" }
  | { readonly type: "resolved"; readonly outcome: ResolutionOutcome }
  | { readonly type: "request-failed" }
  | { readonly type: "removed"; readonly doi: CanonicalDoi }
  | { readonly type: "moved"; readonly doi: CanonicalDoi; readonly direction: MoveDirection }
  | { readonly type: "correction-opened"; readonly doi: CanonicalDoi }
  | { readonly type: "correction-closed" }
  | { readonly type: "corrected"; readonly publication: Publication }
  | { readonly type: "copy-started" }
  | { readonly type: "copy-finished"; readonly ok: boolean };

const INITIAL: State = {
  workspace: emptyWorkspace,
  input: "",
  pending: false,
  notice: null,
  copied: null,
  correcting: null,
};

// A lookup that ended: a publication is added to the list, unless the list refuses it; a failure adds nothing.
// After a failed attempt the typed text stays in the field; after a success the field is cleared (AS-8).
const resolved = (state: State, outcome: ResolutionOutcome): State => {
  if (!outcome.ok) return { ...state, pending: false, notice: { kind: "failure", failure: outcome.failure.kind } };

  const added = addEntry(state.workspace, outcome.publication);
  if (!added.ok) return { ...state, pending: false, notice: { kind: "duplicate" } };

  return { ...state, workspace: added.workspace, input: "", pending: false, notice: null, copied: null };
};

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "typed":
      return { ...state, input: action.text };
    case "refused":
      return { ...state, notice: action.notice };
    case "lookup-started":
      // A message does not outlive the next submission.
      return { ...state, pending: true, notice: null };
    case "resolved":
      return resolved(state, action.outcome);
    case "request-failed":
      return { ...state, pending: false, notice: { kind: "request-failed" } };
    case "removed":
      return {
        ...state,
        workspace: removeEntry(state.workspace, action.doi),
        correcting: state.correcting === action.doi ? null : state.correcting,
        copied: null,
      };
    case "moved":
      return { ...state, workspace: moveEntry(state.workspace, action.doi, action.direction), copied: null };
    case "correction-opened":
      return { ...state, correcting: action.doi };
    case "correction-closed":
      return { ...state, correcting: null };
    case "corrected":
      return {
        ...state,
        workspace: replacePublication(state.workspace, action.publication),
        correcting: null,
        copied: null,
      };
    case "copy-started":
      return { ...state, copied: null };
    case "copy-finished":
      return { ...state, copied: action.ok ? "copied" : "failed" };
  }
}

const noticeText = (notice: Notice): string => {
  if (notice.kind === "failure") return copy.failure[notice.failure];
  return notice.kind === "duplicate" ? copy.duplicate : copy.requestFailed;
};

const BUTTON =
  "rounded border border-zinc-400 px-3 py-1 hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40";

export function Workspace({ resolve }: WorkspaceProps) {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const doiId = useId();
  const hintId = useId();
  const listHeadingId = useId();

  // One DOI at a time: while a lookup is in progress no other submission is accepted.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.pending) return;

    const normalized = normalizeDoi(state.input);
    if (!normalized.ok) {
      dispatch({ type: "refused", notice: { kind: "failure", failure: "invalid-input" } });
      return;
    }
    if (hasEntry(state.workspace, normalized.doi)) {
      dispatch({ type: "refused", notice: { kind: "duplicate" } });
      return;
    }

    dispatch({ type: "lookup-started" });
    let outcome: ResolutionOutcome;
    try {
      outcome = await resolve(normalized.doi);
    } catch {
      // No outcome arrived at all; nothing is known about the cause.
      dispatch({ type: "request-failed" });
      return;
    }
    dispatch({ type: "resolved", outcome });
  };

  // The one way of copying. A missing clipboard and a refused write end the same way; nothing else is tried.
  const copyText = async (text: string) => {
    dispatch({ type: "copy-started" });
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    dispatch({ type: "copy-finished", ok });
  };

  const { entries } = state.workspace;
  const whole = bibliographyText(state.workspace);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{copy.pageHeading}</h1>
        <p>{copy.introduction}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.sessionNotice}</p>
      </header>

      <form className="flex flex-col gap-2" noValidate onSubmit={(event) => void submit(event)}>
        <label htmlFor={doiId} className="font-medium">
          {copy.doiLabel}
        </label>
        <div className="flex gap-2">
          <input
            id={doiId}
            type="text"
            className="min-w-0 flex-1 rounded border border-zinc-400 bg-white px-2 py-1 text-zinc-900"
            value={state.input}
            aria-describedby={hintId}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => dispatch({ type: "typed", text: event.target.value })}
          />
          <button
            type="submit"
            className="rounded bg-foreground px-4 py-1 text-background disabled:cursor-not-allowed disabled:opacity-40"
            disabled={state.pending}
          >
            {copy.add}
          </button>
        </div>
        <p id={hintId} className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.doiHint}
        </p>
        {state.pending && <p role="status">{copy.lookupInProgress}</p>}
        {state.notice !== null && (
          <p role="alert" className="text-red-700 dark:text-red-400">
            {noticeText(state.notice)}
          </p>
        )}
      </form>

      <section className="flex flex-col gap-4" aria-labelledby={listHeadingId}>
        <h2 id={listHeadingId} className="text-xl font-semibold">
          {copy.listHeading}
        </h2>

        <div className="flex flex-col gap-2">
          <div>
            {/* Always shown; disabled while the list is empty or an entry cannot be formatted (HD-3). */}
            <button
              type="button"
              className={BUTTON}
              disabled={whole.kind !== "ready"}
              onClick={() => {
                if (whole.kind === "ready") void copyText(whole.text);
              }}
            >
              {copy.copyAll}
            </button>
          </div>
          {whole.kind === "blocked" && <p className="text-sm">{copy.copyAllBlocked(whole.unformatted)}</p>}
          {state.copied === "copied" && <p role="status">{copy.copied}</p>}
          {state.copied === "failed" && (
            <p role="alert" className="text-red-700 dark:text-red-400">
              {copy.copyFailed}
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <p>{copy.emptyList}</p>
        ) : (
          // Not a numbered list: the workspace adds no number to a reference (HD-2).
          <ul role="list" aria-labelledby={listHeadingId} className="flex list-none flex-col gap-4">
            {entries.map(({ publication }, index) => (
              <EntryCard
                key={publication.doi}
                publication={publication}
                position={index + 1}
                canMoveUp={canMoveEntry(state.workspace, publication.doi, "up")}
                canMoveDown={canMoveEntry(state.workspace, publication.doi, "down")}
                correcting={state.correcting === publication.doi}
                onCopy={(reference) => void copyText(reference)}
                onCorrect={() => dispatch({ type: "correction-opened", doi: publication.doi })}
                onRemove={() => dispatch({ type: "removed", doi: publication.doi })}
                onMove={(direction) => dispatch({ type: "moved", doi: publication.doi, direction })}
                onSave={(corrected) => dispatch({ type: "corrected", publication: corrected })}
                onCancel={() => dispatch({ type: "correction-closed" })}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
