# Digital Minds Policy Index (DMPI)

## Project Specification — PRISM

**Author:** Mitch
**Date:** 2026-03-20
**Status:** Scoping
**Version:** 0.1

---

## 1. Overview

The Digital Minds Policy Index (DMPI) is a searchable, structured database that tracks and compares how leading AI research laboratories formally position themselves on questions of AI consciousness, sentience, mentality, and moral status. It focuses on official institutional documents rather than individual research outputs, and is designed to enable both cross-organisational comparison and longitudinal tracking of how positions evolve over time.

DMPI is a PRISM field-building project. It aims to provide foundational infrastructure for the emerging digital minds policy space.

## 2. Objectives

1. **Map the current landscape** of formal lab positions on AI consciousness, sentience, mentality, welfare, and moral status.
2. **Enable systematic comparison** across organisations using a consistent analytical taxonomy.
3. **Track changes over time** by versioning entries and archiving source documents.
4. **Lower the barrier to entry** for researchers, journalists, and policymakers seeking to understand how industry is framing these questions.
5. **Create a mild accountability mechanism** by making corporate positions visible, comparable, and persistent.

## 3. Scope

### 3.1 Organisations (Initial Set)

The MVP should cover the following labs at minimum. This list is not exhaustive and should be designed for easy extension.

- Anthropic
- OpenAI
- Google DeepMind
- Meta (FAIR)
- Microsoft (Microsoft Research / Azure AI)
- xAI
- Mistral
- Cohere
- Amazon (AWS AI / Alexa)
- Apple (Apple Intelligence / ML Research)
- Inflection / Pi
- Stability AI
- Baidu (ERNIE)
- Alibaba (Qwen / DAMO Academy)
- ByteDance (Doubao / Seed)

### 3.2 Document Types — Tiered Inclusion Criteria

**Tier 1 — Official policy documents (core dataset)**
- Model cards / system cards
- Constitutions, charters, or equivalent normative documents
- Responsible scaling policies / preparedness frameworks
- Terms of service and acceptable use policies
- Published safety frameworks

**Tier 2 — Institutional communications (secondary dataset)**
- Official blog posts published under the organisation's name
- Research papers published by dedicated safety/policy teams (as institutional output)
- Published system prompts or character guidelines
- Regulatory submissions and public consultation responses

**Tier 3 — Attributed leadership statements (contextual layer)**
- Public statements by C-suite or senior leadership (interviews, conference talks, testimony)
- Podcast appearances by official representatives
- Leaked documents that have entered public discourse (flagged as unverified)

The MVP should focus on Tier 1, with architecture that supports Tier 2 and Tier 3 expansion.

### 3.3 Exclusions

- Individual academic research papers by lab employees (unless published as institutional position)
- Social media posts
- Informal internal communications (unless leaked and widely reported)
- Product marketing copy (unless it contains substantive policy commitments)

## 4. Analytical Taxonomy

Each document is coded against the following dimensions. Each dimension receives both a structured code and a free-text excerpt/summary.

### 4.1 Primary Dimensions

| Code | Dimension | Description |
|------|-----------|-------------|
| `CON` | **Consciousness / Sentience** | Does the document make explicit claims about whether current or future models are or could be conscious or sentient? |
| `WEL` | **Model Welfare** | Does the document reference the wellbeing, welfare, suffering, or interests of AI systems? |
| `MOR` | **Moral Status / Personhood** | Does the document address whether AI systems have or could have moral status, rights, or personhood? |
| `SRE` | **Self-Representation** | Does the document instruct or constrain how the model should represent its own inner states, experiences, or nature? |
| `ANT` | **Anthropomorphism** | Does the document address anthropomorphic framing, emotional attachment, or parasocial dynamics? |
| `UNC` | **Uncertainty / Precaution** | Does the document acknowledge uncertainty about AI mentality or advocate precautionary approaches? |
| `GOV` | **Governance Commitments** | Does the document make concrete governance commitments related to any of the above (e.g., review processes, evaluation frameworks, red lines)? |

### 4.2 Coding Scheme

For each dimension, entries should capture:

- **Present / Absent**: Whether the dimension is addressed at all.
- **Stance**: A short categorical label (e.g., "Explicitly denies", "Acknowledges uncertainty", "Affirms precautionary approach", "Silent", "Ambiguous").
- **Excerpt**: A short representative quote or paraphrase (max ~50 words) from the source document.
- **Notes**: Free-text analytical commentary.

### 4.3 Metadata

Each entry should also record:

- Organisation name
- Document title
- Document type (Tier 1 / 2 / 3)
- Document subtype (model card, constitution, blog post, etc.)
- Publication date
- URL / archived URL
- Date of coding
- Coder (for future multi-coder reliability)
- Version (to track when a document supersedes a previous version)

## 5. Data Model

### 5.1 Core Entities

```
Organisation
├── id (unique)
├── name
├── headquarters_country
├── type (e.g., commercial lab, nonprofit, government-backed)
├── url
├── notes
└── [Documents]

Document
├── id (unique)
├── organisation_id (FK)
├── title
├── tier (1 | 2 | 3)
├── subtype (model_card | constitution | safety_framework | blog_post | ...)
├── publication_date
├── url
├── archived_url
├── supersedes_id (FK, nullable — for versioning)
├── date_coded
├── coder
├── notes
└── [Codings]

Coding
├── id (unique)
├── document_id (FK)
├── dimension (CON | WEL | MOR | SRE | ANT | UNC | GOV)
├── present (boolean)
├── stance (enum: explicitly_denies | acknowledges_uncertainty | affirms_precaution | affirms_positive | silent | ambiguous | other)
├── excerpt (text, max ~50 words)
├── notes (text)
└── date_updated
```

### 5.2 Versioning Logic

When an organisation publishes an updated version of a document (e.g., a new model card for a new model release), the new document entry should reference the previous version via `supersedes_id`. This creates a linked chain enabling longitudinal analysis. Old entries are never deleted or overwritten.

## 6. Technical Requirements

### 6.1 Architecture

This is a lightweight web application. The priority is clarity and usability over technical sophistication.

**Suggested stack:**
- **Data layer**: JSON files or SQLite for the MVP. Structure data as defined in Section 5. The dataset will be small enough (hundreds of entries at most in year one) that a full database is not required at launch.
- **Frontend**: A single-page application (React or plain HTML/JS) with:
  - A filterable/searchable table view (filter by organisation, dimension, stance, date range, document type)
  - An organisation comparison view (side-by-side matrix of two or more orgs across all dimensions)
  - A timeline view (how a single organisation's positions have changed across document versions)
  - Individual document detail pages showing all codings
- **Hosting**: Static site (e.g., GitHub Pages, Netlify, Vercel). No backend required for the MVP if data is bundled as JSON.

### 6.2 Design Principles

- Clean, professional, minimal. This is a research tool, not a consumer product.
- Accessible and fast on low-bandwidth connections.
- Mobile-responsive but desktop-primary.
- Clear attribution and methodology documentation baked into the site.
- Easy for non-technical contributors to add or update data (consider a simple JSON or CSV-based data entry workflow with validation).

### 6.3 Search and Filtering

Users should be able to:
- Search free-text across excerpts and notes.
- Filter by: organisation, dimension, stance, tier, document subtype, date range.
- Sort by: date, organisation, dimension.
- Export filtered results as CSV.

## 7. Content and Data Population

### 7.1 MVP Data Collection

The initial data collection phase should:

1. Compile a document corpus by systematically gathering all Tier 1 documents for the organisations listed in Section 3.1.
2. Code each document against the taxonomy in Section 4.
3. Identify gaps (organisations with no relevant Tier 1 documents) and note these explicitly rather than omitting the organisation.

### 7.2 Suggested Initial Focus Documents

To demonstrate the concept and populate the MVP, prioritise:

- **Anthropic**: Claude's Character document, Model Card (Claude 3.5/4 family), Responsible Scaling Policy, system prompt.
- **OpenAI**: GPT-4/o model cards, Model Spec, system card, usage policies.
- **Google DeepMind**: Gemini technical reports, Frontier Safety Framework.
- **Meta**: Llama model cards, responsible use guide.
- **xAI**: Grok system prompts (published or leaked), any published safety documentation.

These provide a strong initial dataset to demonstrate cross-lab comparison.

## 8. Methodology Documentation

The site should include a dedicated methodology page covering:

- Rationale and objectives
- Inclusion/exclusion criteria
- Taxonomy definitions (with examples of what would and would not be coded under each dimension)
- Coding procedure
- Limitations and caveats (e.g., absence of a coding does not mean an organisation has no position; it means no formal document addressing the topic was identified)
- How to suggest additions or corrections (contact/contribution workflow)

This doubles as the basis for a potential methodological publication (cf. PRISMA-style protocol for corporate policy analysis in the digital minds space).

## 9. Future Extensions (Post-MVP)

These are out of scope for the initial build but should inform architectural decisions:

- **Automated monitoring**: RSS/webhook-based alerts when organisations publish new model cards or policy documents.
- **Multi-coder reliability**: Support for multiple coders per document with inter-rater agreement metrics.
- **API access**: A simple API endpoint for researchers to query the dataset programmatically.
- **NLP-assisted coding**: Using language models to flag candidate excerpts for human review (semi-automated coding pipeline).
- **Regulatory mapping**: Cross-referencing lab positions against emerging regulatory requirements (EU AI Act, etc.).
- **Integration with PRISM's stakeholder map**: Linking DMPI entries to the broader field-building webpage.
- **Community contributions**: A submission/review workflow allowing external researchers to propose new entries.

## 10. Relationship to Other PRISM Projects

- **Field-building webpage / stakeholder map**: DMPI is a complementary resource. The stakeholder map covers organisations and people; DMPI covers positions and policies. They should cross-link.
- **Podcast**: Interview transcripts and guest statements may feed into Tier 3 entries. The database can inform interview preparation.
- **Systematic stakeholder mapping methodology**: The DMPI coding methodology could serve as a case study or pilot for the broader PRISMA-equivalent protocol under development.
- **Newsletter**: DMPI updates (new documents coded, notable shifts detected) are natural newsletter content.

## 11. Success Criteria

The MVP is successful if:

1. It covers at least 8 organisations with coded Tier 1 documents.
2. All seven primary dimensions are populated for each covered organisation.
3. The comparison and timeline views are functional and genuinely informative.
4. At least one longitudinal comparison is possible (i.e., two versions of a document from the same organisation).
5. The methodology is clearly documented on the site.
6. The resource is citable and shareable with a stable URL.

## 12. Open Questions

- **Naming**: "Digital Minds Policy Index" is a working title. Alternatives: "AI Mentality Policy Tracker", "Consciousness Policy Index", "Digital Minds Monitor". Should the name signal neutrality or advocacy?
- **Hosting and branding**: Should this live under prism's domain, or as a standalone resource? Standalone may signal independence; PRISM-branded signals institutional backing.
- **Licensing**: Should the dataset be released under an open licence (e.g., CC-BY) to encourage reuse?
- **Peer review**: Should the taxonomy and methodology be reviewed by external advisors before launch?

---

*This specification is intended as a handoff document for implementation. The analytical taxonomy and coding should be treated as a first draft subject to refinement during the pilot coding phase.*
