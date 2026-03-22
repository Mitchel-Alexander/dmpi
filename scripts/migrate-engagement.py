#!/usr/bin/env python3
"""
DMPI Engagement Migration — v0.2 → v0.3

Migrates from binary addressed/not_addressed to graduated engagement scale (0-4).
Archives CWG codings. Outputs a re-coding worksheet for manual review.

Usage:
    python scripts/migrate-engagement.py
    python scripts/migrate-engagement.py --dry-run   # preview without writing
"""

import json
import csv
import sys
import os
from pathlib import Path
from datetime import date

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "data" / "documents"
ARCHIVE_DIR = REPO_ROOT / "data" / "archive"
OUTPUT_DIR = REPO_ROOT / "outputs"

DRY_RUN = "--dry-run" in sys.argv

# Mapping from v0.2 engagement to provisional v0.3 engagement_level
# All not_addressed codings need manual review; this provides initial classification
ENGAGEMENT_MAP = {
    "addressed": ("substantive", 4),
    "not_addressed": None,  # requires classification from notes
}

# Keywords in notes that suggest specific engagement levels
LEVEL_HINTS = {
    0: ["structural exclusion", "structurally excluded", "pure benchmark", "no normative content", "benchmarks only"],
    1: ["omission", "does not mention", "no mention", "silent", "absent", "no reference", "no discussion"],
    2: ["proximate", "evaluates", "monitors", "tests for", "safety framework", "silent within rich framework",
        "delegation", "delegated", "capability evaluation", "deception eval", "scheming eval",
        "situational awareness", "alignment faking"],
    3: ["adjacent", "briefly", "passing mention", "once", "user risk", "in passing",
        "flags anthropomorphism", "user_risk_only"],
}

def classify_not_addressed(coding: dict) -> tuple[str, int, str]:
    """Attempt to classify a not_addressed coding based on notes content."""
    notes = (coding.get("notes") or "").lower()
    dimension = coding.get("dimension", "")

    # Check for level 0 hints first (most specific)
    for level in [0, 3, 2, 1]:  # check specific levels first, fall back to 1
        for hint in LEVEL_HINTS[level]:
            if hint in notes:
                codes = ["structurally_excluded", "omission", "proximate", "adjacent", "substantive"]
                return codes[level], level, f"auto: matched '{hint}'"

    # Default: omission (level 1) — the most common case
    return "omission", 1, "auto: default (no specific markers found)"


def migrate_file(filepath: Path) -> tuple[list[dict], list[dict]]:
    """Migrate a single org JSON file. Returns (cwg_archive, worksheet_rows)."""
    with open(filepath) as f:
        data = json.load(f)

    org_id = data["organisation_id"]
    cwg_archive = []
    worksheet_rows = []

    for doc in data["documents"]:
        new_codings = []

        for coding in doc["codings"]:
            dim = coding["dimension"]

            # Archive and skip CWG codings
            if dim == "CWG":
                cwg_archive.append({
                    "organisation_id": org_id,
                    "document_id": doc["id"],
                    "document_title": doc["title"],
                    **coding,
                })
                continue

            # ONT: retain existing engagement, set engagement_level to null
            if dim == "ONT":
                coding["engagement_level"] = None
                new_codings.append(coding)

                worksheet_rows.append({
                    "org": org_id,
                    "doc_id": doc["id"],
                    "doc_title": doc["title"],
                    "dimension": dim,
                    "old_engagement": coding["engagement"],
                    "new_engagement": coding["engagement"],
                    "engagement_level": "null (ONT)",
                    "stance": coding.get("stance") or "",
                    "classification_method": "ONT: unchanged",
                    "notes_preview": (coding.get("notes") or "")[:120],
                    "needs_review": "no",
                })
                continue

            old_engagement = coding["engagement"]

            if old_engagement == "addressed":
                # Provisionally map to substantive (level 4)
                # But flag for review — some thin "addressed" codings may be level 3
                coding["engagement"] = "substantive"
                coding["engagement_level"] = 4
                new_codings.append(coding)

                # Flag thin codings: cautious stance with short/no excerpt
                excerpt = coding.get("excerpt") or ""
                stance = coding.get("stance") or ""
                needs_review = "yes" if stance in ("cautious", "ambiguous") and len(excerpt) < 40 else "maybe"

                worksheet_rows.append({
                    "org": org_id,
                    "doc_id": doc["id"],
                    "doc_title": doc["title"],
                    "dimension": dim,
                    "old_engagement": old_engagement,
                    "new_engagement": "substantive",
                    "engagement_level": 4,
                    "stance": stance,
                    "classification_method": "auto: addressed → substantive (provisional)",
                    "notes_preview": (coding.get("notes") or "")[:120],
                    "needs_review": needs_review,
                })

            elif old_engagement == "not_addressed":
                new_code, new_level, method = classify_not_addressed(coding)
                coding["engagement"] = new_code
                coding["engagement_level"] = new_level
                coding["stance"] = None  # levels 0-3 have no stance
                new_codings.append(coding)

                worksheet_rows.append({
                    "org": org_id,
                    "doc_id": doc["id"],
                    "doc_title": doc["title"],
                    "dimension": dim,
                    "old_engagement": old_engagement,
                    "new_engagement": new_code,
                    "engagement_level": new_level,
                    "stance": "",
                    "classification_method": method,
                    "notes_preview": (coding.get("notes") or "")[:120],
                    "needs_review": "yes",
                })

            else:
                # Unknown engagement value — preserve as-is with null level
                coding["engagement_level"] = None
                new_codings.append(coding)

                worksheet_rows.append({
                    "org": org_id,
                    "doc_id": doc["id"],
                    "doc_title": doc["title"],
                    "dimension": dim,
                    "old_engagement": old_engagement,
                    "new_engagement": old_engagement,
                    "engagement_level": "null (unknown)",
                    "stance": coding.get("stance") or "",
                    "classification_method": "preserved: unrecognised engagement value",
                    "notes_preview": (coding.get("notes") or "")[:120],
                    "needs_review": "yes",
                })

        doc["codings"] = new_codings

    if not DRY_RUN:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

    return cwg_archive, worksheet_rows


def main():
    all_cwg = []
    all_rows = []

    json_files = sorted(DATA_DIR.glob("*.json"))
    print(f"Migrating {len(json_files)} organisation files...")

    for filepath in json_files:
        print(f"  {filepath.name}")
        cwg, rows = migrate_file(filepath)
        all_cwg.extend(cwg)
        all_rows.extend(rows)

    # Archive CWG codings
    if all_cwg:
        archive_path = ARCHIVE_DIR / "cwg-codings-backup.json"
        if not DRY_RUN:
            ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
            with open(archive_path, "w") as f:
                json.dump(all_cwg, f, indent=2, ensure_ascii=False)
                f.write("\n")
        print(f"\nArchived {len(all_cwg)} CWG codings → {archive_path}")

    # Write re-coding worksheet
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    worksheet_path = OUTPUT_DIR / "engagement-recoding-worksheet.csv"
    if not DRY_RUN:
        with open(worksheet_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "org", "doc_id", "doc_title", "dimension",
                "old_engagement", "new_engagement", "engagement_level",
                "stance", "classification_method", "notes_preview", "needs_review",
            ])
            writer.writeheader()
            writer.writerows(all_rows)

    # Summary
    print(f"\nWorksheet: {worksheet_path}")
    print(f"Total codings processed: {len(all_rows)}")

    level_counts = {}
    for row in all_rows:
        level = row["engagement_level"]
        level_counts[level] = level_counts.get(level, 0) + 1
    print("\nEngagement level distribution:")
    for level in sorted(level_counts.keys(), key=str):
        print(f"  Level {level}: {level_counts[level]}")

    review_count = sum(1 for r in all_rows if r["needs_review"] == "yes")
    maybe_count = sum(1 for r in all_rows if r["needs_review"] == "maybe")
    print(f"\nNeeds manual review: {review_count} (yes) + {maybe_count} (maybe)")

    if DRY_RUN:
        print("\n[DRY RUN — no files were modified]")


if __name__ == "__main__":
    main()
