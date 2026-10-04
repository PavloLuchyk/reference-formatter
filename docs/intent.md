# Reference Formatter — Product Intent

## Problem

Creating bibliography entries according to DSTU 8302:2015 manually is repetitive
and error-prone.

Reference Formatter should resolve bibliographic metadata from a DOI and produce
a citation according to an explicitly approved DSTU 8302:2015 profile, while
keeping missing or ambiguous metadata visible and editable by the user.

## Target users

Students, postgraduate students and researchers who need bibliography entries
for journal articles.

## Core flow

DOI
→ normalize DOI
→ resolve metadata through Crossref
→ normalized `Publication`
→ manual metadata correction
→ DSTU formatter
→ bibliography workspace
→ copy one citation or the complete bibliography

## MVP

The MVP supports:

- journal articles only;
- Crossref as the only metadata provider;
- bare DOI, `doi:` and `https://doi.org/...` input forms;
- mapping provider metadata to a normalized `Publication`;
- formatting according to an approved DSTU 8302:2015 journal-article profile;
- explicit handling of missing metadata without invented values;
- manual correction of bibliographic metadata;
- multiple bibliography entries;
- duplicate DOI prevention;
- removing entries;
- reordering entries;
- copying one citation;
- copying the complete bibliography.

## Out of scope

The MVP does not include:

- authentication or user accounts;
- database or cloud persistence;
- publisher or Google Scholar scraping;
- DataCite or other metadata-provider fallback;
- books, book chapters or conference proceedings;
- APA, MLA, Chicago or other citation styles;
- Zotero or Microsoft Word integration;
- AI-generated metadata correction;
- RAG, embeddings or semantic search.

## Architecture

The main application boundary is:

DOI
→ metadata provider
→ normalized `Publication`
→ formatter
→ bibliography workspace

Crossref-specific DTOs must remain inside the metadata/provider layer.

The normalized `Publication` model is the boundary between metadata resolution
and citation formatting.

The formatter must be deterministic and must not depend on Crossref DTOs,
network access, React or Next.js.

Missing metadata must remain explicit. The system must never invent authors,
titles, journal names, dates, pages or other bibliographic values.

## Feature slices

### 1. DOI Resolution

Normalize DOI input, resolve metadata through Crossref and map the provider
response into a normalized `Publication`.

### 2. DSTU Journal Article Formatter

Format a normalized `Publication` according to the human-approved
DSTU 8302:2015 journal-article profile.

The approved profile will be established from reviewed sources before
formatter implementation.

Expected formatting values must have independent provenance from sources or
explicit human decisions.

### 3. Bibliography Workspace

Allow the user to add journal articles by DOI, correct metadata manually,
prevent duplicates, remove and reorder entries, and copy one citation or the
complete bibliography.

Editing metadata updates the normalized `Publication`; the formatted citation
is recomputed from it.

## Human-owned decisions

Human approval is required for:

- MVP scope changes;
- DOI normalization and identity policy;
- metadata policies where several reasonable alternatives exist;
- required and optional publication fields;
- normative interpretation of DSTU 8302:2015;
- the accepted citation profile;
- fixture expected values that depend on interpretation;
- specification changes;
- reviewer finding disposition;
- final product acceptance.

Agent recommendations are proposals, not approvals.

## Intended engineering workflow

Accepted behaviour should be specified before implementation.

The verification harness will be introduced separately before the first
feature implementation.

For important feature slices, the intended workflow is:

accepted criteria
→ behavioural RED
→ implementation
→ GREEN
→ independent review
→ human disposition of findings

Tests, fixtures or accepted criteria must not be weakened merely to obtain GREEN.

Evidence must describe events that actually happened.
Do not manufacture failures, reviewer findings, human disagreements,
repair iterations or agent mistakes.

## Initial persistence scope

The initial MVP may keep the bibliography only in browser memory.

Persistence across page reloads is not required unless explicitly approved later.
This limitation must be documented in the final product documentation.

## Definition of Done

The MVP is complete when:

- all three feature slices are implemented;
- project verification is GREEN;
- the primary browser flow has deterministic E2E verification;
- DSTU expected values have independent source or human-decision provenance;
- relevant completed slices have received independent review;
- findings have explicit human dispositions;
- evidence points to actual repository states and verification runs;
- known product and verification limitations are documented;
- the repository can be set up and verified from its README.
