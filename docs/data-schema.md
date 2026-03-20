# Data Schema

Each organisation gets one JSON file in `data/documents/` named `{org-id}.json`.

## File structure

```json
{
  "organisation_id": "anthropic",
  "documents": [
    {
      "id": "anthropic-claude-character-2025",
      "title": "Claude's Character",
      "tier": 1,
      "subtype": "constitution",
      "publication_date": "2025-01-01",
      "url": "https://...",
      "archived_url": null,
      "supersedes_id": null,
      "date_coded": "2026-03-25",
      "coder": "mitchel",
      "notes": "Free-text notes about the document.",
      "codings": [
        {
          "dimension": "CON",
          "present": true,
          "stance": "acknowledges_uncertainty",
          "excerpt": "Max ~50 word quote or close paraphrase from the document.",
          "notes": "Free-text analytical commentary.",
          "date_updated": "2026-03-25"
        }
      ]
    }
  ]
}
```

## ID conventions

- **Document IDs:** `{org-id}-{short-descriptor}-{year}` e.g. `anthropic-claude-character-2025`
- **Organisation IDs:** kebab-case, as defined in `data/organisations.json`

## Stance values

Current enum (subject to refinement after pilot coding):

| Value | Meaning |
|-------|---------|
| `explicitly_denies` | Document explicitly denies or rejects the dimension |
| `acknowledges_uncertainty` | Document acknowledges uncertainty or open questions |
| `affirms_precaution` | Document advocates a precautionary approach |
| `affirms_positive` | Document positively affirms the dimension |
| `silent` | Document does not address the dimension (present=false) |
| `ambiguous` | Document addresses the dimension but stance is unclear |
| `other` | Does not fit existing categories — must include explanatory notes |

## Dimension codes

`CON` | `WEL` | `MOR` | `SRE` | `ANT` | `UNC` | `GOV`

See spec Section 4.1 for full descriptions.

## Document subtypes

`model_card` | `system_card` | `constitution` | `safety_framework` | `scaling_policy` | `terms_of_service` | `acceptable_use` | `blog_post` | `research_paper` | `system_prompt` | `regulatory_submission` | `leadership_statement` | `interview` | `other`
