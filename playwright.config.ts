import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Browser E2E of the primary flow, run by `pnpm e2e` after the ordinary production build. It is separate from
// `pnpm check`. Crossref is answered from recorded responses and is never reached live: see
// e2e/support/crossref-stub.mjs.

const PORT = 3100;

// The record of the Crossref boundary: temporary test instrumentation in a file outside the repository, new for
// every run. The runner chooses the name here; its workers load this file again and keep the name they inherit.
process.env.E2E_CROSSREF_RECORD ??= join(
  tmpdir(),
  "reference-formatter-e2e",
  `crossref-boundary-${Date.now()}-${process.pid}.jsonl`,
);

export default defineConfig({
  testDir: "./e2e",
  // Not *.test.* or *.spec.*: Vitest must not pick these files up.
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  // A retry would hide a result that differs between runs.
  retries: 0,
  forbidOnly: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The application writes to the clipboard; nothing reads it.
    permissions: ["clipboard-write"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The production server as ONE Node process with the stub preloaded into it by an option of that process:
    // no `pnpm start`, no wrapper process, nothing inherited from the environment. If the stub cannot load, this
    // process exits and no test runs. The paths are relative to this folder, so the command holds no absolute path.
    command: `node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // A server that is already running has no stub: never use one. A taken port fails the run.
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    env: { E2E_CROSSREF_RECORD: process.env.E2E_CROSSREF_RECORD },
  },
});
