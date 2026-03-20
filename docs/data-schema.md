# Data Schema (v0.2)

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
          "engagement": "addressed",
          "stance": "precautionary",
          "framing": null,
          "excerpt": "Max ~50 word quote or close paraphrase.",
          "notes": "Free-text analytical commentary.",
          "date_updated": "2026-03-20"
        }
      ]
    }
  ]
}
```

## ID conventions

- **Document IDs:** `{org-id}-{short-descriptor}-{year}` e.g. `anthropic-claude-character-2024`
- **Organisation IDs:** kebab-case, as defined in `data/organisations.json`

## Dimension codes (9 total)

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

### New dimensions (v0.2)

| Code | Dimension | What it captures |
|------|-----------|------------------|
| `ONT` | Ontological Framing | How the document characterises what the model fundamentally *is* |
| `CWG` | Capability-Welfare Gap | Welfare-adjacent capability claims not connected to welfare questions |

## Engagement values

For **core dimensions** (CON, WEL, MOR, SRE, ANT, UNC, GOV) and **CWG**:

| Value | Description |
|-------|-------------|
| `addressed` | The dimension is explicitly discussed |
| `not_addressed` | The dimension is not discussed — silence |

For **ONT** only:

| Value | Description |
|-------|-------------|
| `explicit` | The document explicitly characterises what the model is |
| `implicit` | The document's framing implies an ontological position without stating it directly |
| `absent` | No ontological framing discernible |

## Stance values

Coded only when engagement ≠ `not_addressed` / `absent`. Null otherwise.

| Value | Description |
|-------|-------------|
| `denies` | Explicitly denies or rejects the dimension |
| `cautious` | Acknowledges as a concern but takes no concrete action |
| `precautionary` | Takes precautionary measures based on uncertainty |
| `investigative` | Actively investigating; treats as an empirical question |
| `affirms` | Positively affirms the dimension |
| `descriptive` | Reports findings without taking a normative position |
| `ambiguous` | Addressed but stance is unclear or internally contradictory |

**Note:** For ONT, `stance` is null — the ontological position is captured in `framing` instead. For CWG, `stance` is typically `descriptive` (capabilities described without normative connection to welfare).

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

When ANT is addressed:

| Value | Description |
|-------|-------------|
| `user_risk_only` | Anthropomorphism discussed only as risk to users |
| `model_connected` | Discussed in connection with model's own states/welfare |
| `both` | Both framings present |

### CWG framing

For CWG, the `framing` field captures the capability claimed (e.g., "emotional intelligence", "self-awareness", "character traits").

## Document subtypes

`model_card` | `system_card` | `constitution` | `safety_framework` | `scaling_policy` | `terms_of_service` | `acceptable_use` | `blog_post` | `research_paper` | `system_prompt` | `regulatory_submission` | `leadership_statement` | `interview` | `other`
