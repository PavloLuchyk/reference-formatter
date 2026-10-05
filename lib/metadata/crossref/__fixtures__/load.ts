// Reads the recorded Crossref answers in this folder for tests. See provenance.json for where each one came from.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const fixtureText = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");

export const fixtureBody = (file: string): { message: Record<string, unknown> } & Record<string, unknown> =>
  JSON.parse(fixtureText(file));

export const fixtureWork = (file: string): Record<string, unknown> => fixtureBody(file).message;
