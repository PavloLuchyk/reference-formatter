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
