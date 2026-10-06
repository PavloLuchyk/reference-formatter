<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules — Reference Formatter

DOI metadata in, bibliography entries formatted according to an approved
DSTU 8302:2015 profile out. fwdays Agentic Engineering capstone.

`docs/intent.md` contains the product intent and human-owned decisions.
Read it before planning or changing product behaviour.

## Product

MVP: journal articles resolved through Crossref, normalized `Publication`,
DSTU formatting, manual metadata correction and a bibliography workspace.

Do not add auth, database, scraping, fallback providers, other publication
types/styles, Zotero/Word integrations or AI/RAG without human approval.

## Authority

Work autonomously inside an approved task.

Stop and ask before:
- changing product scope or acceptance criteria;
- making a normative DSTU interpretation;
- adding dependencies;
- changing framework, tooling, hooks, agent settings or CI;
- making a decision explicitly reserved for the human.

Do not ask merely because an approved task touches multiple files.

## Architecture

- Crossref-specific data stays behind the metadata/provider boundary.
- Domain code and formatting use a normalized `Publication`.
- Pure domain logic must not depend on React, Next.js or network access.
- Pure domain code belongs in `lib/` when introduced.
- UI, route and action layers stay thin.
- Missing bibliographic metadata stays explicit; never invent values.

## Sources and decisions

Do not derive DSTU 8302:2015 formatting rules from model memory.
Follow approved sources, fixtures or specifications when they exist.
If authoritative information is missing, ambiguous or conflicting, stop and ask.
Agent recommendations are proposals, not human approvals.

## Repository workflow

Use pnpm only — never npm or yarn.
Use only scripts that currently exist in `package.json`.
Follow the actual repository structure and alias from `tsconfig.json`.
UI copy is Ukrainian; code, comments and commit messages are English.
Prefer meaningful Conventional Commits and one logical state per commit.
Do not commit, rewrite history or force-push unless explicitly asked.

## Verification

`pnpm check` runs typecheck, lint, tests and build; it must be GREEN before
work is reported as done.
Single stages: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
Tests use Vitest in the `node` environment; a test that needs a DOM opts in
with `// @vitest-environment jsdom`.
Record verification runs with `bash scripts/record-run.sh <label>`; records
in `evidence/runs/` are committed and never edited by hand.
Do not weaken tests, ESLint or TypeScript settings to obtain GREEN.

`pnpm e2e` builds the app and runs the Playwright browser E2E of the
primary flow against recorded Crossref answers; it is separate from
`pnpm check` and needs `pnpm exec playwright install chromium` once.
It never contacts live Crossref: do not weaken the fail-closed stub or its
canary to obtain GREEN.

`docs/dstu/rules.md` and `tests/golden/` are HUMAN-APPROVED ORACLES.
Never modify them to make tests pass; propose any change to either and get
explicit human approval first.
Formatter tests consume the approved oracle; never derive expected values
from the formatter implementation.
Documented provisional or source limitations stay limitations; do not
silently "resolve" them in code.

## Agent harness

Respect existing `.claude` settings and hooks.
A blocked action is feedback; never bypass a hook through another tool.
Do not edit `.claude/hooks/` or `.claude/settings.json` without human approval.
Do not touch secrets or `.env*`.
Never manufacture failures, findings or human interventions for evidence.

## Next.js

Use version-matched guidance from `node_modules/next/dist/docs/`.
Server Components are the default; use `'use client'` only when required.
When unsure about a Next.js API or convention, read the local docs first.

## Maintenance

Keep this file small and operational.
Add rules when a real project boundary or recurring failure makes them necessary.
Do not document hypothetical future infrastructure here.
