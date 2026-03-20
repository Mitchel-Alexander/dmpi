# DMPI — Digital Minds Policy Index

A searchable, structured database tracking how leading AI labs formally position themselves on AI consciousness, sentience, mentality, welfare, and moral status. Part of PRISM's epistemic infrastructure projects.

## Quick orientation

- **Full spec:** `docs/spec.md` — data model, scope, taxonomy, technical requirements, success criteria
- **Research reasoning & analytical decisions:** Obsidian vault at `projects/dmpi/` — see `_overview.md` for taxonomy rationale, design decisions, and coding judgement log
- **Vault path:** `/Users/mitchel/Library/CloudStorage/GoogleDrive-mitchelalexanderpass@gmail.com/My Drive/Obsedian/Claude/projects/dmpi/`

## Project structure

```
dmpi/
├── CLAUDE.md              # You are here
├── docs/
│   └── spec.md            # Project specification (v0.1)
├── data/
│   ├── raw/               # Source documents (archived copies, PDFs)
│   ├── processed/         # Cleaned/structured data
│   ├── documents/         # Document metadata and codings (JSON)
│   └── organisations.json # Organisation registry
├── scripts/               # Data processing, validation, build scripts
├── src/                   # Frontend source code
└── public/                # Static assets for the site
```

## Data model

Three core entities (see spec Section 5 for full schema):

- **Organisation** — id, name, country, type, url, notes
- **Document** — id, org_id, title, tier (1/2/3), subtype, date, url, supersedes_id (versioning chain)
- **Coding** — id, doc_id, dimension (CON/WEL/MOR/SRE/ANT/UNC/GOV), present, stance, excerpt, notes

Data is stored as JSON files. One file per organisation in `data/documents/`, containing that org's documents and their codings.

## Analytical taxonomy — 7 dimensions

| Code | Dimension | What it captures |
|------|-----------|------------------|
| CON | Consciousness / Sentience | Claims about whether models are or could be conscious/sentient |
| WEL | Model Welfare | References to AI wellbeing, welfare, suffering, interests |
| MOR | Moral Status / Personhood | Whether AI systems have or could have moral status or rights |
| SRE | Self-Representation | How the model should represent its own inner states |
| ANT | Anthropomorphism | Anthropomorphic framing, emotional attachment, parasocial dynamics |
| UNC | Uncertainty / Precaution | Uncertainty about AI mentality, precautionary approaches |
| GOV | Governance Commitments | Concrete governance commitments related to any of the above |

## Development

MVP is a static site (no backend). Data bundled as JSON.

```bash
# Local development (once frontend is built)
# TBD — stack decision pending
```

## Conventions

- All data files are JSON, validated against schemas in `docs/`
- Document codings always include an excerpt (max ~50 words) from the source
- When a document supersedes a previous version, link via `supersedes_id` — never delete old entries
- Tier 1 documents only for MVP; architecture supports Tier 2/3 expansion

## Key decisions log

Significant architectural or analytical decisions should be documented in the Obsidian vault `_overview.md`, not here. This file covers only what a developer needs to run and extend the codebase.
