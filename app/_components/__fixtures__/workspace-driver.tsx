// Test support for the component tests of the workspace: renders the page with a fake resolver and drives it the way
// a user would, through roles and accessible names. Nothing here reaches a server or the network.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { UI } from "@/app/_components/__fixtures__/approved-copy";
import { Workspace } from "@/app/_components/workspace";
import { normalizeDoi, type CanonicalDoi } from "@/lib/doi/normalize-doi";
import type { ResolutionFailure, ResolutionOutcome } from "@/lib/metadata/resolution";
import { createPublication, type Publication } from "@/lib/publication/publication";

export const canonical = (input: string): CanonicalDoi => {
  const normalized = normalizeDoi(input);
  if (!normalized.ok) throw new Error(`Not a DOI: ${input}`);
  return normalized.doi;
};

// A resolver that knows the given publications by their DOI and has no record of any other.
export const resolverFor = (...publications: Publication[]) =>
  vi.fn(async (doi: string): Promise<ResolutionOutcome> => {
    const publication = publications.find((candidate) => candidate.doi === doi);
    return publication === undefined ? { ok: false, failure: { kind: "not-found" } } : { ok: true, publication };
  });

// A resolver that answers any DOI with a record that holds nothing but that DOI.
export const resolverOfBareRecords = () =>
  vi.fn(
    async (doi: string): Promise<ResolutionOutcome> => ({
      ok: true,
      publication: createPublication({ doi: canonical(doi) }),
    }),
  );

export const resolverFailingWith = (failure: ResolutionFailure) =>
  vi.fn(async (doi: string): Promise<ResolutionOutcome> => {
    void doi;
    return { ok: false, failure };
  });

export type Resolver = (doi: string) => Promise<ResolutionOutcome>;

export const renderWorkspace = (resolve: Resolver) => render(<Workspace resolve={resolve} />);

export const doiField = () => screen.getByLabelText(UI.doiLabel) as HTMLInputElement;

export const addButton = () => screen.getByRole("button", { name: UI.add }) as HTMLButtonElement;

export const typeDoi = (text: string) => fireEvent.change(doiField(), { target: { value: text } });

export const submitDoi = (text: string) => {
  typeDoi(text);
  fireEvent.click(addButton());
};

// The entries of the list, in order; an empty list has none.
export const entries = (): HTMLElement[] => {
  const list = screen.queryByRole("list", { name: UI.listHeading });
  return list === null ? [] : within(list).getAllByRole("listitem");
};

export const entryTexts = (): string[] => entries().map((entry) => entry.textContent ?? "");

// Adds each publication by its DOI and waits until its entry is in the list.
export const addPublications = async (...publications: Publication[]) => {
  for (const [index, publication] of publications.entries()) {
    submitDoi(publication.doi);
    await screen.findByRole("button", { name: UI.remove(index + 1) });
  }
};

// Renders the page with a resolver that knows these publications and adds them all, in this order.
export const renderWith = async (...publications: Publication[]) => {
  const resolve = resolverFor(...publications);
  renderWorkspace(resolve);
  await addPublications(...publications);
  return resolve;
};

export const button = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;

export const press = (name: string) => fireEvent.click(button(name));

// The correction that is open, and its fields by their approved labels.
export const correction = () => screen.getByRole("form", { name: UI.correctionHeading });

export const field = (label: string) => within(correction()).getByLabelText(label) as HTMLInputElement;

export const typeInto = (label: string, text: string) => fireEvent.change(field(label), { target: { value: text } });

export const authorRow = (position: number) => within(correction()).getByRole("group", { name: UI.author(position) });

export const authorField = (position: number, label: string) =>
  within(authorRow(position)).getByLabelText(label) as HTMLInputElement;

export const typeIntoAuthor = (position: number, label: string, text: string) =>
  fireEvent.change(authorField(position, label), { target: { value: text } });

export const authorKind = (position: number) =>
  within(authorRow(position)).getByRole("combobox", { name: UI.authorKind }) as HTMLSelectElement;

// Chooses a kind by the text the user sees, whatever value the option carries.
export const chooseAuthorKind = (position: number, kind: string) => {
  const select = authorKind(position);
  const option = within(select).getByRole("option", { name: kind }) as HTMLOptionElement;
  fireEvent.change(select, { target: { value: option.value } });
};

export const save = () => fireEvent.click(within(correction()).getByRole("button", { name: UI.save }));

export const cancel = () => fireEvent.click(within(correction()).getByRole("button", { name: UI.cancel }));
