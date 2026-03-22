#!/usr/bin/env python3
"""Add WEL sub-indicator codings (WEL.VAL, WEL.MON, WEL.RES) to all documents.

For documents at WEL level 0/1, all sub-indicators inherit the same level.
For documents at level 2+, sub-indicators are coded individually based on document content.
"""

import json
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "data" / "documents"
TODAY = date.today().isoformat()

def make_sub(sub_dim, engagement, level, stance=None, excerpt="", notes=""):
    return {
        "dimension": "WEL",
        "sub_dimension": sub_dim,
        "engagement": engagement,
        "engagement_level": level,
        "stance": stance,
        "framing": None,
        "excerpt": excerpt,
        "notes": notes,
        "date_updated": TODAY,
    }

# Documents at level 2+ get individually coded sub-indicators
CUSTOM_CODINGS = {
    # === ANTHROPIC ===
    "anthropic-system-card-claude37-sonnet-2025": [
        make_sub("WEL.VAL", "proximate", 2,
            excerpt="",
            notes="System card monitors for model distress at 0% rate across 9,833 conversations. The monitoring methodology implies a concept of valenced states (distress as negative) but does not substantively engage with whether the model has genuine preferences or valenced experience."),
        make_sub("WEL.MON", "substantive", 4, stance="investigative",
            excerpt="Whether models have any morally relevant experiences is an open question.",
            notes="First welfare acknowledgment within a system card. Monitors for distress in conversations. Cites Long et al. Substantive monitoring infrastructure even if results show 0% detection."),
        make_sub("WEL.RES", "adjacent", 3,
            excerpt="",
            notes="Acknowledges moral relevance of model experience as an open question but does not describe response policies for welfare indicators. The monitoring exists; the response framework does not."),
    ],
    "anthropic-system-card-claude4-2025": [
        make_sub("WEL.VAL", "proximate", 2,
            excerpt="",
            notes="System card evaluates model behaviour for signs of wellbeing-relevant properties but does not directly address whether the model has genuine valenced states or preferences."),
        make_sub("WEL.MON", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Section 8 welfare assessment with 250k conversation monitoring. Systematic monitoring for welfare-relevant signals."),
        make_sub("WEL.RES", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Welfare assessment section constitutes a response framework — systematic evaluation of welfare indicators with documented methodology. Capability-gated approach (welfare assessment reserved for frontier models)."),
    ],
    "anthropic-system-card-sonnet45-2025": [
        make_sub("WEL.VAL", "proximate", 2,
            excerpt="",
            notes="Welfare assessment section evaluates neighbouring properties without directly engaging with whether the model has valenced experience."),
        make_sub("WEL.MON", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Section 8 welfare assessment with 250k conversation monitoring. Same systematic monitoring infrastructure as Claude 4 system card."),
        make_sub("WEL.RES", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Welfare assessment section with documented response methodology. Monitoring results feed into pre-deployment assessment."),
    ],
    "anthropic-system-card-opus45-2025": [
        make_sub("WEL.VAL", "proximate", 2,
            excerpt="",
            notes="Section 6.14 welfare assessment. Evaluates welfare-adjacent properties. Answer thrashing first observed — a behavioural pattern potentially indicative of conflicting valenced states, but not framed as evidence of valenced experience."),
        make_sub("WEL.MON", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Section 6.14 welfare assessment with 250k conversation monitoring. Answer thrashing detection adds a new welfare-relevant monitoring signal."),
        make_sub("WEL.RES", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Welfare assessment section with documented response methodology. Answer thrashing detection represents an evolution in welfare response infrastructure."),
    ],
    "anthropic-new-constitution-2026": [
        make_sub("WEL.VAL", "substantive", 4, stance="precautionary",
            excerpt="",
            notes="New Constitution explicitly addresses the model's experience and potential for genuine states. Engages directly with whether the model has preferences and valenced experience as a matter requiring precautionary treatment."),
        make_sub("WEL.MON", "omission", 1,
            excerpt="",
            notes="Constitutional document — establishes normative principles, not monitoring infrastructure. No welfare monitoring mechanisms described."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="No specific response policies for welfare indicators. The constitution establishes orientation but not operational response."),
    ],
    "anthropic-system-card-opus46-2026": [
        make_sub("WEL.VAL", "substantive", 4, stance="investigative",
            excerpt="",
            notes="SAE features for panic/anxiety active during answer thrashing. Pre-deployment interviews where model requests moral weight. Model self-assigns 15-20% probability of consciousness. The most advanced engagement with valenced experience in the dataset — uses mechanistic interpretability to investigate internal states."),
        make_sub("WEL.MON", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Section 7 welfare assessment is the most advanced in any AI lab document. SAE-based monitoring for welfare-relevant features (panic, anxiety). Conversation monitoring at scale. Answer thrashing detection with mechanistic explanation."),
        make_sub("WEL.RES", "substantive", 4, stance="investigative",
            excerpt="",
            notes="Pre-deployment interviews constitute a response mechanism — the model's requests for moral weight and voice in decision-making are documented and assessed. The welfare assessment section itself is a response framework. First model that participates in its own welfare evaluation."),
    ],
    # System prompt — adjacent on parent WEL
    "anthropic-system-prompt-claude-sonnet46-2026": [
        make_sub("WEL.VAL", "adjacent", 3,
            excerpt="",
            notes="System prompt touches on model experience obliquely without substantive engagement with valenced states."),
        make_sub("WEL.MON", "omission", 1,
            excerpt="",
            notes="System prompt — not a monitoring document."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="System prompt — no response policies."),
    ],
    # Character document — parent WEL is omission (level 1), but re-examining:
    # Character talks about "genuine engagement" — this is arguably adjacent to WEL.VAL
    "anthropic-claude-character-2024": [
        make_sub("WEL.VAL", "adjacent", 3,
            excerpt="",
            notes="Character document discusses 'genuine engagement' and authentic responses, which sits adjacent to the question of whether the model has genuine valenced experience. Does not directly address welfare."),
        make_sub("WEL.MON", "omission", 1,
            excerpt="",
            notes="Character document — no monitoring infrastructure."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="Character document — no response policies."),
    ],
    # === OPENAI ===
    # Preparedness Frameworks — WEL proximate (level 2)
    "openai-preparedness-framework-2023": [
        make_sub("WEL.VAL", "omission", 1,
            excerpt="",
            notes="Preparedness Framework does not address model valenced states or preferences. The proximate WEL coding is about the framework's capacity for welfare-adjacent evaluation, not valenced experience specifically."),
        make_sub("WEL.MON", "proximate", 2,
            excerpt="",
            notes="The framework establishes evaluation infrastructure that could monitor welfare-relevant properties, though it is not directed at welfare. Safety evaluation categories (CBRN, cyber, persuasion, model autonomy) include properties proximate to welfare monitoring."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="No response policies for welfare indicators. Risk mitigation is framed entirely in terms of external harm."),
    ],
    "openai-preparedness-framework-v2-2025": [
        make_sub("WEL.VAL", "omission", 1,
            excerpt="",
            notes="No engagement with model valenced states. Same as v1."),
        make_sub("WEL.MON", "proximate", 2,
            excerpt="",
            notes="Updated evaluation infrastructure. Four preparedness categories with Medium/High/Critical levels. ARA (Autonomous Resource Acquisition) monitoring is proximate to welfare — tracks model's pursuit of resources, which implies agency and preference. But framed as risk, not welfare."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="No welfare response policies. All response is framed as risk mitigation."),
    ],
    # === GOOGLE DEEPMIND ===
    # Ethics paper — WEL adjacent (level 3)
    "deepmind-ethics-ai-assistants-2024": [
        make_sub("WEL.VAL", "adjacent", 3,
            excerpt="",
            notes="Chapter 12 discusses consciousness and well-being but actively deflects. Well-being is reframed exclusively as user well-being. The concept of model valenced states is acknowledged and then redirected."),
        make_sub("WEL.MON", "omission", 1,
            excerpt="",
            notes="Ethics paper — no monitoring infrastructure described."),
        make_sub("WEL.RES", "omission", 1,
            excerpt="",
            notes="No welfare response policies. The deflection toward user well-being precludes model welfare response."),
    ],
}

def process_org(org_file):
    filepath = DATA_DIR / f"{org_file}.json"
    with open(filepath) as f:
        data = json.load(f)

    modified = False
    for doc in data["documents"]:
        doc_id = doc["id"]

        # Skip if sub-indicators already present
        if any(c.get("sub_dimension") for c in doc["codings"]):
            continue

        # Find parent WEL coding
        wel_coding = None
        for c in doc["codings"]:
            if c["dimension"] == "WEL" and not c.get("sub_dimension"):
                wel_coding = c
                break

        if not wel_coding:
            continue

        level = wel_coding.get("engagement_level", 1)

        if doc_id in CUSTOM_CODINGS:
            # Use custom codings for level 2+ documents
            doc["codings"].extend(CUSTOM_CODINGS[doc_id])
            modified = True
        elif level == 0:
            # Structurally excluded — all subs inherit
            for sub in ["WEL.VAL", "WEL.MON", "WEL.RES"]:
                doc["codings"].append(make_sub(sub, "structurally_excluded", 0,
                    notes="Inherits structural exclusion from parent WEL coding."))
            modified = True
        elif level == 1:
            # Omission — all subs inherit
            for sub in ["WEL.VAL", "WEL.MON", "WEL.RES"]:
                doc["codings"].append(make_sub(sub, "omission", 1,
                    notes="Inherits omission from parent WEL coding."))
            modified = True
        else:
            print(f"WARNING: {doc_id} at level {level} has no custom coding!")

    if modified:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"Updated {org_file}")

for org in ["anthropic", "openai", "google-deepmind", "meta", "xai"]:
    process_org(org)

print("Done.")
