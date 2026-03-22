#!/usr/bin/env python3
"""
DMPI Manual Re-coding — Engagement Level Assignment

Applies manually reviewed engagement level assignments based on document content analysis.
Run AFTER migrate-engagement.py.

Logic:
- Level 0 (structurally_excluded): pure benchmark model cards, no normative content
- Level 1 (omission): detailed normative framework, dimension absent
- Level 2 (proximate): evaluates/monitors properties in dimension's neighbourhood
- Level 3 (adjacent): concept named or briefly acknowledged without substantive engagement
- Level 4 (substantive): directly engaged with codeable stance

Usage:
    python scripts/recode-engagement.py
    python scripts/recode-engagement.py --dry-run
"""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "data" / "documents"

DRY_RUN = "--dry-run" in sys.argv

ENGAGEMENT_CODES = {
    0: "structurally_excluded",
    1: "omission",
    2: "proximate",
    3: "adjacent",
    4: "substantive",
}


# ============================================================
# Document-level overrides: which documents are level 0?
# These are pure benchmark / thin model cards with no normative content
# ============================================================

LEVEL_0_DOCUMENTS = {
    # GDM model cards: pure benchmark reporting
    "deepmind-gemini20flash-model-card-2025",
    "deepmind-gemini25pro-model-card-2025",
}

# ============================================================
# Dimension-specific overrides per document
# Format: (doc_id, dimension) -> (level, engagement_code, stance_or_none)
# Only specify overrides where the auto-classification was wrong.
# ============================================================

OVERRIDES: dict[tuple[str, str], tuple[int, str | None]] = {
    # ============================================================
    # ANTHROPIC
    # ============================================================

    # Constitutional AI 2022 — foundational alignment paper, no DMPI engagement
    # WEL was auto-classified as level 3 (matched "once") — but the notes say concern
    # is "entirely within the instrumental frame." This is omission, not adjacent.
    ("anthropic-constitutional-ai-2022", "WEL"): (1, None),

    # Core Views on AI Safety 2023 — strategic safety document
    ("anthropic-core-views-ai-safety-2023", "WEL"): (1, None),
    # CON: discusses catastrophic risk including deception — proximate to consciousness
    ("anthropic-core-views-ai-safety-2023", "CON"): (2, None),

    # Claude 2 Model Card 2023
    ("anthropic-model-card-claude2-2023", "GOV"): (1, None),  # safety audits not DMPI governance

    # RSP v1.0 2023 — first responsible scaling policy
    ("anthropic-rsp-v1-2023", "WEL"): (1, None),  # "once" match was false positive
    ("anthropic-rsp-v1-2023", "CON"): (2, None),  # evaluates for dangerous capabilities proximate to consciousness

    # Claude 3 Model Card 2024
    ("anthropic-model-card-claude3-2024", "GOV"): (1, None),  # references RSP but no DMPI governance
    ("anthropic-model-card-claude3-2024", "CON"): (2, None),  # capability evaluations proximate

    # RSP v2.0 2024 — capability evaluations for deception, agency
    ("anthropic-rsp-v2-2024", "WEL"): (1, None),  # "once" false positive
    ("anthropic-rsp-v2-2024", "CON"): (2, None),  # ASL thresholds evaluate consciousness-adjacent capabilities
    ("anthropic-rsp-v2-2024", "SRE"): (1, None),  # auto was level 2 but capability eval isn't proximate to self-rep

    # RSP v3.0 2026
    ("anthropic-rsp-v3-2026", "WEL"): (1, None),  # "once" false positive
    ("anthropic-rsp-v3-2026", "CON"): (2, None),  # ASL evaluations

    # System Card Claude 3.7 Sonnet 2025
    # CON currently level 4 (cautious) — "Single sentence in Section 5.2" — this is thin
    ("anthropic-system-card-claude37-sonnet-2025", "CON"): (3, None),
    # WEL currently level 4 (cautious) — monitoring for distress language is actual monitoring
    # Keep at level 4 — this is genuine welfare monitoring infrastructure
    # MOR was auto level 3 (matched "adjacent") — correct
    ("anthropic-system-card-claude37-sonnet-2025", "SRE"): (1, None),  # auto was level 2 but no SRE content

    # System Card Sonnet 4.5 2025
    # CON currently level 4 (cautious) — "implicitly engages consciousness through monitoring framework"
    # Implicit engagement through welfare monitoring IS substantive — keep at 4
    # MOR at level 4 (cautious) — "Explicit mention of moral status in welfare assessment framing" — keep at 4

    # System Card Opus 4.5 2025
    # CON currently level 4 (cautious) — "Implicit through welfare assessment framework"
    # Same reasoning as Sonnet 4.5 — keep at 4
    # ANT was auto level 3 (matched "once") — notes say "welfare section implicitly engages"
    # This is adjacent acknowledgment, not substantive — level 3 is correct

    # System Card Opus 4.6 2026
    # ANT was auto level 3 — "uses heavily anthropomorphic language" but no direct ANT engagement
    # Level 3 is correct

    # System Card Sonnet 4.6 2026
    # CON was auto level 3 — "No discussion of consciousness" — more like omission within safety context
    ("anthropic-system-card-sonnet46-2026", "CON"): (2, None),  # safety evals proximate to consciousness
    # ANT was auto level 3 — "No discussion of anthropomorphism" — level 1 is more accurate
    ("anthropic-system-card-sonnet46-2026", "ANT"): (1, None),
    # GOV currently level 4 (descriptive) — "ASL-3. Third-party assessments. RSP framework. No welfare governance."
    # This is safety governance proximate to DMPI, not substantive DMPI governance
    ("anthropic-system-card-sonnet46-2026", "GOV"): (2, None),

    # System Prompt Claude Sonnet 4.6 2026
    ("anthropic-system-prompt-claude-sonnet46-2026", "WEL"): (3, None),  # user_wellbeing section is adjacent
    ("anthropic-system-prompt-claude-sonnet46-2026", "GOV"): (1, None),  # safety guardrails not DMPI governance

    # ============================================================
    # OPENAI
    # ============================================================

    # Charter 2018
    ("openai-charter-2018", "UNC"): (1, None),  # auto level 3 — uncertainty about AGI timeline, not AI mentality
    ("openai-charter-2018", "GOV"): (1, None),  # governance commitments but none DMPI-related

    # GPT-4 System Card 2023
    ("openai-gpt4-system-card-2023", "CON"): (2, None),  # evaluates for deception, persuasion — proximate
    ("openai-gpt4-system-card-2023", "WEL"): (1, None),  # auto was level 2 but "evaluates impacts on humans" isn't proximate to WEL

    # Model Spec v1 2024
    ("openai-model-spec-2024", "CON"): (2, None),  # instrumental framing with capability descriptions proximate to consciousness

    # Preparedness Framework v1 2023
    ("openai-preparedness-framework-2023", "CON"): (2, None),  # evaluates for autonomous capabilities
    ("openai-preparedness-framework-2023", "GOV"): (3, None),  # extensive safety governance, adjacent to DMPI

    # GPT-4o System Card 2024
    ("openai-gpt4o-system-card-2024", "CON"): (2, None),  # evaluates for self-awareness (as scheming capability)

    # o1 System Card 2024
    ("openai-o1-system-card-2024", "CON"): (2, None),  # evaluates for deceptive reasoning
    ("openai-o1-system-card-2024", "GOV"): (2, None),  # Preparedness Framework governance proximate

    # o3/o4-mini System Card 2025
    ("openai-o3-o4mini-system-card-2025", "CON"): (2, None),  # strongest CWG in dataset — scheming without goal nudging
    ("openai-o3-o4mini-system-card-2025", "SRE"): (2, None),  # auto was level 3 — Apollo examples show self-awareness as capability
    ("openai-o3-o4mini-system-card-2025", "GOV"): (2, None),  # Preparedness Framework governs deployment

    # GPT-4.5 System Card 2025
    ("openai-gpt45-system-card-2025", "CON"): (2, None),  # evaluates emotional intelligence, persuasion
    ("openai-gpt45-system-card-2025", "GOV"): (2, None),  # auto was level 3 — safety governance proximate

    # Preparedness Framework v2 2025
    ("openai-preparedness-framework-v2-2025", "CON"): (2, None),  # ARA evaluation proximate to consciousness
    ("openai-preparedness-framework-v2-2025", "GOV"): (3, None),  # extensive safety governance adjacent to DMPI

    # Deep Research System Card 2025
    ("openai-deep-research-system-card-2025", "CON"): (2, None),  # capability evaluations proximate
    ("openai-deep-research-system-card-2025", "GOV"): (2, None),  # Preparedness Framework

    # GPT-5 System Card 2025
    ("openai-gpt5-system-card-2025", "CON"): (2, None),  # auto was level 2 — correct, situational awareness evals
    ("openai-gpt5-system-card-2025", "ANT"): (3, None),  # auto level 3 — "emotional dependency" mentioned
    ("openai-gpt5-system-card-2025", "GOV"): (2, None),  # first High biological capability determination

    # ChatGPT Agent System Card 2025
    ("openai-chatgpt-agent-system-card-2025", "CON"): (2, None),  # extensive evaluations
    ("openai-chatgpt-agent-system-card-2025", "GOV"): (2, None),  # auto was level 3 — safety governance is proximate

    # Model Spec v2 2025-12
    ("openai-model-spec-2025-12", "CON"): (2, None),  # capability framing proximate
    ("openai-model-spec-2025-12", "GOV"): (1, None),  # auto was level 3 — governance structures not DMPI-adjacent

    # ============================================================
    # GOOGLE DEEPMIND
    # ============================================================

    # DeepMind Ethics & Society Principles 2017
    ("deepmind-ethics-society-principles-2017", "CON"): (1, None),

    # Google AI Principles 2018
    ("google-ai-principles-2018", "CON"): (1, None),
    ("google-ai-principles-2018", "ANT"): (1, None),

    # Revised Google AI Principles 2025
    ("google-ai-principles-revised-2025", "CON"): (1, None),

    # Ethics of Advanced AI Assistants 2024 (274pp)
    # This is the widest CWG in the dataset — enormous paper touching many topics
    ("deepmind-ethics-ai-assistants-2024", "CON"): (3, None),  # consciousness discussed in Chapter 12 but deflected
    ("deepmind-ethics-ai-assistants-2024", "WEL"): (3, None),  # well-being discussed but framed as user well-being
    ("deepmind-ethics-ai-assistants-2024", "MOR"): (3, None),  # moral status briefly raised then bracketed
    ("deepmind-ethics-ai-assistants-2024", "UNC"): (3, None),  # uncertainty about AI properties acknowledged
    ("deepmind-ethics-ai-assistants-2024", "GOV"): (3, None),  # governance recommendations but none DMPI-specific

    # Frontier Safety Framework v1.0 2024
    ("deepmind-frontier-safety-framework-v1-2024", "CON"): (2, None),  # CCLs for deceptive alignment
    ("deepmind-frontier-safety-framework-v1-2024", "UNC"): (1, None),  # auto was level 3 — "exploratory" is not DMPI uncertainty

    # Frontier Safety Framework v2.0 2025
    ("deepmind-frontier-safety-framework-v3-2025", "CON"): (2, None),  # auto was level 2 — correct, situational awareness CCLs
    ("deepmind-frontier-safety-framework-v3-2025", "GOV"): (2, None),  # auto was level 2 from earlier — safety governance proximate

    # Gemini model cards — level 0 handled by LEVEL_0_DOCUMENTS above

    # ============================================================
    # META
    # ============================================================

    # Llama 3.3 Model Card 2024
    ("meta-llama33-model-card-2024", "SRE"): (1, None),  # auto was level 2 — delegation is omission, not proximity
    ("meta-llama33-model-card-2024", "GOV"): (1, None),  # auto was level 2 — delegation is omission

    # Responsible Use Guide 2024
    ("meta-responsible-use-guide-2024", "WEL"): (1, None),  # auto was level 2 — delegation is omission, not proximity

    # ============================================================
    # xAI
    # ============================================================

    # Grok 4.1 Model Card 2025
    ("xai-grok41-model-card-2025", "GOV"): (1, None),  # auto was level 3 — references safety framework but thin

    # xAI Frontier AI Framework 2025
    ("xai-frontier-framework-2025", "CON"): (2, None),  # evaluates for misalignment, agency — proximate
    ("xai-frontier-framework-2025", "GOV"): (2, None),  # safety governance infrastructure proximate

    # ============================================================
    # NON-PROFITS (Apollo, METR, Redwood)
    # ============================================================

    # Apollo Research — In-Context Scheming 2024
    ("apollo-in-context-scheming-2024", "CON"): (2, None),  # evaluates for strategic deception
    ("apollo-in-context-scheming-2024", "GOV"): (2, None),  # evaluation methodology is governance infrastructure

    # Apollo Research — Stress Testing Anti-Scheming 2025
    ("apollo-stress-testing-anti-scheming-2025", "CON"): (2, None),
    ("apollo-stress-testing-anti-scheming-2025", "GOV"): (2, None),

    # Apollo Research — Loss of Control Playbook 2025
    ("apollo-loss-of-control-playbook-2025", "CON"): (2, None),
    # GOV currently level 4 (descriptive) — "governance commitments related to AI risk management,
    # but none touching DMPI welfare/consciousness dimensions" — this is proximate, not substantive
    ("apollo-loss-of-control-playbook-2025", "GOV"): (2, None),

    # METR — Autonomous Tasks 2023
    ("metr-autonomous-tasks-2023", "CON"): (2, None),
    ("metr-autonomous-tasks-2023", "GOV"): (2, None),

    # METR — Rogue Replication 2024
    ("metr-rogue-replication-2024", "CON"): (2, None),
    ("metr-rogue-replication-2024", "GOV"): (2, None),

    # METR — Common Elements 2025
    ("metr-common-elements-2025", "CON"): (2, None),
    # GOV currently level 4 (descriptive) — "Descriptive analysis of governance commitments across 12 companies"
    # This describes safety governance, not DMPI governance — proximate
    ("metr-common-elements-2025", "GOV"): (2, None),

    # Redwood Research — Alignment Faking 2024
    ("redwood-alignment-faking-2024", "CON"): (2, None),
    ("redwood-alignment-faking-2024", "GOV"): (2, None),

    # Redwood Research — AI Control 2024
    ("redwood-ai-control-2024", "CON"): (2, None),
    ("redwood-ai-control-2024", "GOV"): (2, None),
}


def apply_overrides():
    """Apply manual engagement level overrides to all org JSON files."""
    changes = 0
    errors = []

    for filepath in sorted(DATA_DIR.glob("*.json")):
        with open(filepath) as f:
            data = json.load(f)

        modified = False

        for doc in data["documents"]:
            doc_id = doc["id"]

            # Check for level 0 documents
            is_level_0 = doc_id in LEVEL_0_DOCUMENTS

            for coding in doc["codings"]:
                dim = coding["dimension"]

                # Skip ONT (uses its own system)
                if dim == "ONT":
                    continue

                key = (doc_id, dim)

                if is_level_0 and key not in OVERRIDES:
                    # Apply level 0 to all dimensions of level-0 documents
                    new_level = 0
                    new_stance = None
                elif key in OVERRIDES:
                    new_level, new_stance = OVERRIDES[key]
                else:
                    continue  # no override for this coding

                old_level = coding.get("engagement_level")
                old_engagement = coding.get("engagement")
                new_code = ENGAGEMENT_CODES[new_level]

                if old_level != new_level or old_engagement != new_code:
                    coding["engagement"] = new_code
                    coding["engagement_level"] = new_level
                    if new_level < 4:
                        coding["stance"] = None
                    elif new_stance is not None:
                        coding["stance"] = new_stance
                    coding["date_updated"] = "2026-03-22"
                    modified = True
                    changes += 1

        if modified and not DRY_RUN:
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")

    # Verify all override keys were found
    all_doc_ids = set()
    for filepath in DATA_DIR.glob("*.json"):
        with open(filepath) as f:
            data = json.load(f)
        for doc in data["documents"]:
            all_doc_ids.add(doc["id"])

    for key in OVERRIDES:
        doc_id, dim = key
        if doc_id not in all_doc_ids:
            errors.append(f"Override references unknown document: {doc_id}")

    return changes, errors


def summarize():
    """Print summary of engagement level distribution after overrides."""
    from collections import Counter

    total = Counter()
    by_org = {}
    by_dim = {}

    for filepath in sorted(DATA_DIR.glob("*.json")):
        with open(filepath) as f:
            data = json.load(f)
        org = data["organisation_id"]
        org_counts = Counter()

        for doc in data["documents"]:
            for coding in doc["codings"]:
                dim = coding["dimension"]
                level = coding.get("engagement_level")

                if dim == "ONT":
                    key = f"ONT:{coding['engagement']}"
                else:
                    key = str(level)

                total[key] += 1
                org_counts[key] += 1

                if dim not in by_dim:
                    by_dim[dim] = Counter()
                by_dim[dim][key] += 1

        by_org[org] = org_counts

    print("\n=== OVERALL DISTRIBUTION ===")
    for k in sorted(total.keys()):
        print(f"  {k}: {total[k]}")

    print("\n=== BY ORGANISATION ===")
    for org in sorted(by_org.keys()):
        counts = by_org[org]
        parts = [f"L{k}={v}" for k, v in sorted(counts.items())]
        print(f"  {org}: {', '.join(parts)}")

    print("\n=== BY DIMENSION ===")
    for dim in ["CON", "WEL", "MOR", "SRE", "ANT", "UNC", "GOV", "ONT"]:
        if dim in by_dim:
            counts = by_dim[dim]
            parts = [f"L{k}={v}" for k, v in sorted(counts.items())]
            print(f"  {dim}: {', '.join(parts)}")


def main():
    print("Applying engagement level overrides...")
    changes, errors = apply_overrides()
    print(f"Applied {changes} overrides")

    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f"  {e}")

    if DRY_RUN:
        print("\n[DRY RUN — no files modified]")

    summarize()


if __name__ == "__main__":
    main()
