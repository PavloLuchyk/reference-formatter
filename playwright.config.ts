import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Browser E2E of the primary flow, run by `pnpm e2e` after the ordinary production build. It is separate from
// `pnpm check`. In the server started below, every Crossref request is answered from a recorded response or
// refused: see e2e/support/crossref-stub.mjs. That is verified for the pinned Next.js 16.3.8 and its `next start`
// process model, and has to be verified again after a Next.js upgrade.

const PORT = 3100;

// The record of the Crossref boundary: temporary test instrumentation in a file of its own, in a folder newly
// created under the temporary folder of the system for every run. The runner allocates it here and marks it with
// its own process id. The workers it starts load this file again, find the id of their parent and keep the path.
// A value of E2E_CROSSREF_RECORD that the caller had set is never used: nobody but this runner or its parent
// carries that mark.
const allocatedBy = process.env.E2E_CROSSREF_RECORD_OWNER;
const inherited = allocatedBy === String(process.pid) || allocatedBy === String(process.ppid);
const recordFile =
  inherited && process.env.E2E_CROSSREF_RECORD
    ? process.env.E2E_CROSSREF_RECORD
    : join(mkdtempSync(join(tmpdir(), "reference-formatter-e2e-")), "crossref-boundary.jsonl");
process.env.E2E_CROSSREF_RECORD = recordFile;
if (!inherited) process.env.E2E_CROSSREF_RECORD_OWNER = String(process.pid);

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
    // Playwright hands this command to a shell, and the shell starts Node. The preload is an option of that Node
    // process itself, the one that runs Next.js and serves the application: not of `pnpm start`, and not a value
    // taken from the environment. The process does inherit the environment of the caller; nothing here relies on
    // it being empty. If the stub cannot load, the process exits and no test runs. The paths are relative to this
    // folder, so the command holds no absolute path.
    command: `node --import ./e2e/support/crossref-stub.mjs ./node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // A server that is already running has no stub: never use one. A taken port fails the run.
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    env: { E2E_CROSSREF_RECORD: recordFile },
  },
});
