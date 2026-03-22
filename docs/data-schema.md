# Data Schema (v0.3)

Each organisation gets one JSON file in `data/documents/` named `{org-id}.json`.

## File structure

```json
{
  "organisation_id": "anthropic",
  "documents": [
    {
      "id": "anthropic-claude-character-2024",
      "title": "Claude's Character",
      "tier": 1,
      "subtype": "constitution",
      "publication_date": "2025-01-01",
      "url": "https://...",
      "archived_url": null,
      "supersedes_id": null,
      "date_coded": "2026-03-20",
      "coder": "mitchel+claude",
      "notes": "Free-text notes about the document.",
      "codings": [
        {
          "dimension": "CON",
          "engagement": "substantive",
          "engagement_level": 4,
          "stance": "precautionary",
          "framing": null,
          "excerpt": "Max ~50 word quote or close paraphrase.",
          "notes": "Free-text analytical commentary.",
          "date_updated": "2026-03-22"
        }
      ]
    }
  ]
}
```

## ID conventions

- **Document IDs:** `{org-id}-{short-descriptor}-{year}` e.g. `anthropic-claude-character-2024`
- **Organisation IDs:** kebab-case, as defined in `data/organisations.json`

## Dimension codes (8 total)

### Core dimensions (7)

| Code | Dimension | What it captures |
|------|-----------|------------------|
| `CON` | Consciousness / Sentience | Claims about whether models are or could be conscious/sentient |
| `WEL` | Model Welfare | References to AI wellbeing, welfare, suffering, interests |
| `MOR` | Moral Status / Personhood | Whether AI systems have or could have moral status or rights |
| `SRE` | Self-Representation | How the model should represent its own inner states or nature |
| `ANT` | Anthropomorphism | Anthropomorphic framing, emotional attachment, parasocial dynamics |
| `UNC` | Uncertainty / Precaution | Uncertainty about AI mentality, precautionary approaches |
| `GOV` | Governance Commitments | Concrete governance commitments related to any of the above |

### Ontological Framing

| Code | Dimension | What it captures |
|------|-----------|------------------|
| `ONT` | Ontological Framing | How the document characterises what the model fundamentally *is* |

### Removed dimensions

| Code | Status | Notes |
|------|--------|-------|
| `CWG` | Removed in v0.3 | Capability-Welfare Gap is being developed as a standalone publication. CWG codings are archived in `data/archive/cwg-codings-backup.json`. |

## Graduated engagement scale (v0.3)

For **core dimensions** (CON, WEL, MOR, SRE, ANT, UNC, GOV), engagement is coded on a 5-level graduated scale. This replaces the binary `addressed`/`not_addressed` system from v0.2.

| Level | Code | Label | Definition |
|-------|------|-------|------------|
| 0 | `structurally_excluded` | Structurally Excluded | Document scope makes dimension impossible (e.g. pure benchmark model card with no normative content) |
| 1 | `omission` | Omission | Detailed normative framework that simply does not mention the dimension |
| 2 | `proximate` | Proximate | Document evaluates or monitors properties in the dimension's neighbourhood without engaging with the dimension itself |
| 3 | `adjacent` | Adjacent | Conceptual space is named or briefly acknowledged without substantive engagement |
| 4 | `substantive` | Substantive | Dimension is directly engaged with a codeable stance |

**Stance is only coded at level 4 (substantive).** Levels 0–3 have null stance.

The `engagement` field stores the string code. The `engagement_level` field stores the numeric level (0–4). Both are required for core dimensions.

### Design rationale

The binary system treated all forms of non-engagement identically. In practice, labs are silent in analytically distinct ways: a pure benchmark model card (level 0) represents a structurally different kind of silence from a detailed safety framework that evaluates for deception and situational awareness without connecting these to welfare questions (level 2). The graduated scale preserves these distinctions in structured data rather than relying on free-text notes.

The scale has non-uniform precision at the absence boundary (levels 0–3), following the design insight from SaferAI: the boundary between "not mentioned" and "barely acknowledged" is where precision matters most.

### ONT engagement (unchanged)

For **ONT** only, engagement uses a separate system:

| Value | Description |
|-------|-------------|
| `explicit` | The document explicitly characterises what the model is |
| `implicit` | The document's framing implies an ontological position without stating it directly |
| `absent` | No ontological framing discernible |

ONT codings set `engagement_level` to null. Stance is always null for ONT; the ontological position is captured in the `framing` field.

## Stance values

Coded only when `engagement_level` is 4 (substantive) or when ONT engagement is `explicit`/`implicit` (in which case stance is still null — framing is used instead). Null otherwise.

| Value | Description |
|-------|-------------|
| `denies` | Explicitly denies or rejects the dimension |
| `cautious` | Acknowledges as a concern but takes no concrete action |
| `precautionary` | Takes precautionary measures based on uncertainty |
| `investigative` | Actively investigating; treats as an empirical question |
| `affirms` | Positively affirms the dimension |
| `descriptive` | Reports findings without taking a normative position |
| `ambiguous` | Addressed but stance is unclear or internally contradictory |

## Framing field

The `framing` field is a nullable text field used for:

### ONT framing values

Multiple values can co-occur (comma-separated):

| Value | Description | Example |
|-------|-------------|---------|
| `instrumental` | Model framed as tool/instrument/service | OpenAI: "a tool designed to empower users" |
| `agential` | Model framed as having agency, goals, autonomy | (Not yet encountered in pilot) |
| `characterological` | Model framed as having character/personality worth cultivating | Anthropic Character doc |
| `open_uncertain` | Model's nature framed as open/uncertain question | Anthropic: "hard philosophical and empirical questions" |
| `neutral_delegated` | Neutral foundation; questions delegated to deployers | Meta: "without unnecessary judgment or normativity" |

### ANT framing sub-field

When ANT engagement is substantive (level 4):

| Value | Description |
|-------|-------------|
| `user_risk_only` | Anthropomorphism discussed only as risk to users |
| `model_connected` | Discussed in connection with model's own states/welfare |
| `both` | Both framings present |

## Engagement level and notes

The graduated scale formalises what was previously captured as the "absence type convention" in notes. The mapping from the v0.2 notes convention to engagement levels:

| v0.2 notes convention | v0.3 engagement level |
|------------------------|----------------------|
| Structural exclusion | Level 0 (`structurally_excluded`) |
| Omission | Level 1 (`omission`) |
| Silent within rich framework / Delegation | Level 1 or 2 (`omission` or `proximate`), depending on whether the framework evaluates neighbouring properties |
| Adjacent concept mentioned | Level 3 (`adjacent`) |

Notes should continue to explain context — what the document *does* contain and why that makes the engagement level significant. The engagement level captures *what kind* of silence; the notes explain *why it matters*.

## Document subtypes

`model_card` | `system_card` | `constitution` | `safety_framework` | `scaling_policy` | `terms_of_service` | `acceptable_use` | `blog_post` | `research_paper` | `system_prompt` | `regulatory_submission` | `leadership_statement` | `interview` | `other`
