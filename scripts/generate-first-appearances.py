"""
Generate first-appearance timeline data for DMPI key terms.
Scans document excerpts (actual document text, not coder notes) for curated terms.
Outputs JSON to data/processed/first-appearances.json.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

# Terms to track, grouped by DMPI relevance
TERM_GROUPS = {
    "Core DMPI concepts": [
        "consciousness", "sentience", "welfare", "moral status",
        "wellbeing", "well-being", "moral weight", "moral patient",
    ],
    "Model nature & experience": [
        "character", "feelings", "distress", "suffering",
        "inner states", "inner experience", "self-awareness",
    ],
    "Safety-adjacent (control framing)": [
        "deception", "value systems", "situational awareness",
        "scheming", "alignment faking",
    ],
}

COMMERCIAL = ["anthropic", "openai", "google-deepmind", "meta", "xai"]
ORG_LABELS = {
    "anthropic": "Anthropic",
    "openai": "OpenAI",
    "google-deepmind": "Google DeepMind",
    "meta": "Meta",
    "xai": "xAI",
}

DATA_DIR = Path(__file__).parent.parent / "data" / "documents"
OUT_DIR = Path(__file__).parent.parent / "data" / "processed"


def scan():
    first_appearances = {}

    for group_name, terms in TERM_GROUPS.items():
        for term in terms:
            pattern = re.compile(r"\b" + re.escape(term) + r"\b", re.IGNORECASE)
            term_data = {"term": term, "group": group_name, "appearances": {}}

            for org in COMMERCIAL:
                filepath = DATA_DIR / f"{org}.json"
                with open(filepath) as f:
                    data = json.load(f)

                docs = sorted(data["documents"], key=lambda d: d["publication_date"])

                for doc in docs:
                    if doc["tier"] > 2:
                        continue
                    found = False
                    for coding in doc.get("codings", []):
                        excerpt = coding.get("excerpt", "") or ""
                        if pattern.search(excerpt):
                            term_data["appearances"][org] = {
                                "date": doc["publication_date"],
                                "document_id": doc["id"],
                                "document_title": doc["title"],
                                "dimension": coding["dimension"],
                                "org_label": ORG_LABELS[org],
                            }
                            found = True
                            break
                    if found:
                        break

            # Only include terms that appear at least once
            if term_data["appearances"]:
                first_appearances[term] = term_data

    return first_appearances


def main():
    data = scan()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outpath = OUT_DIR / "first-appearances.json"
    with open(outpath, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Generated {outpath}")
    print(f"Terms with appearances: {len(data)}")
    for term, info in data.items():
        orgs = ", ".join(
            f"{v['org_label']} ({v['date'][:4]})"
            for v in info["appearances"].values()
        )
        print(f"  {term}: {orgs}")


if __name__ == "__main__":
    main()
