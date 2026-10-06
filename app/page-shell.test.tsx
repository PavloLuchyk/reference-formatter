// Tests for the page shell and its wiring: the scenario "Page language" of the requirement Ukrainian interface
// (openspec/changes/bibliography-workspace/specs/bibliography-workspace/spec.md), rows 1 and 2 of the approved copy
// table, and design TD-6 and TD-7. Added after feature review 01 (finding BW-R01-3, accepted by the human on
// 2026-10-06) for behaviour that was already implemented, so these tests were never seen to fail.
// They pin the React elements the layout and the page return; they do not show the page in a browser.
import { readFileSync } from "node:fs";
import { isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { copy } from "@/app/_components/copy";
import { Workspace } from "@/app/_components/workspace";
import { resolveDoiAction } from "@/app/actions";
import RootLayout, { metadata } from "@/app/layout";
import Home from "@/app/page";

// Outside the Next.js compiler `next/font/google` exports nothing; the fonts are not what is tested here.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-sans-variable" }),
  Geist_Mono: () => ({ variable: "font-mono-variable" }),
}));

const layout = () => RootLayout({ params: Promise.resolve({}), children: <p>the page</p> }) as ReactElement<{ lang?: string }>;

const source = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

// The first statement of a module, without leading blank lines or comments.
const firstStatement = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "" && !line.startsWith("//"));

describe("root layout", () => {
  test("declares Ukrainian as the language of the document", () => {
    const element = layout();

    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("uk");
  });

  test("renders the document with that language and the page inside its body", () => {
    const markup = renderToStaticMarkup(layout());

    expect(markup).toMatch(/^<html[^>]*\slang="uk"[\s>]/);
    expect(markup.match(/\slang="/g)).toHaveLength(1);
    expect(markup).toMatch(/<body[^>]*><p>the page<\/p><\/body>/);
  });
});

describe("document title and description", () => {
  test("are the approved ones", () => {
    // Rows 1 and 2 of the approved copy table, written by hand.
    expect(metadata.title).toBe("Перелік посилань за DOI");
    expect(metadata.description).toBe(
      "Бібліографічні посилання на журнальні статті за DOI, оформлені за профілем ДСТУ 8302:2015.",
    );
  });

  test("are taken from the copy module of the workspace", () => {
    expect(metadata.title).toBe(copy.documentTitle);
    expect(metadata.description).toBe(copy.documentDescription);
  });
});

describe("page wiring", () => {
  test("the page renders the workspace and hands it the Server Function for DOI resolution", () => {
    const element = Home() as ReactElement<Record<string, unknown>>;

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(Workspace);
    expect(element.props.resolve).toBe(resolveDoiAction);
    expect(Object.keys(element.props)).toEqual(["resolve"]);
  });

  test("the resolver runs on the server and the workspace in the browser", () => {
    // The two directives decide where each module runs; they have no effect in this test runner, so they are read.
    expect(firstStatement(source("./actions.ts"))).toBe('"use server";');
    expect(firstStatement(source("./_components/workspace.tsx"))).toBe('"use client";');
  });

  test("the page and the layout stay Server Components", () => {
    expect(source("./page.tsx")).not.toMatch(/^\s*["']use client["']/m);
    expect(source("./layout.tsx")).not.toMatch(/^\s*["']use client["']/m);
  });
});
