#!/usr/bin/env python3
"""Generate static clean-URL entry points for hosts without rewrite support."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
CLEAN_PAGES = {
    "field-manual.html": "field-manual/index.html",
    "quiz.html": "quiz/index.html",
}


def main() -> None:
    for source_name, destination_name in CLEAN_PAGES.items():
        source = ROOT / source_name
        destination = ROOT / destination_name
        if not source.exists():
            raise FileNotFoundError(f"Missing clean-page source: {source.relative_to(ROOT)}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        print(f"Generated {destination.relative_to(ROOT)} from {source.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
