// @vitest-environment jsdom
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import pkg from "@/package.json";

test("harness resolves the alias and renders JSX in jsdom", () => {
  expect(pkg.name).toBe("reference-formatter");

  render(<h1>harness</h1>);
  expect(screen.getByRole("heading", { level: 1, name: "harness" })).toBeDefined();
});
