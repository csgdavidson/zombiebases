#!/usr/bin/env python3
"""Generate build-time card thumbnail image assets.

The site renders fixed-size thumbnails in card lists. These generated outputs are
kept out of version control and recreated during the build.
"""

from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "images" / "bases"
OUTPUT_DIR = ROOT / "images" / "generated" / "card-thumbs"
PLACEHOLDER = "placeholder.png"


def main() -> int:
    if not SOURCE_DIR.exists():
        raise SystemExit(f"Missing source image directory: {SOURCE_DIR}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sources = {source.name: source for source in SOURCE_DIR.glob("*.png")}

    for stale_output in OUTPUT_DIR.glob("*.png"):
        if stale_output.name not in sources:
            stale_output.unlink()

    count = 0
    for name, source in sorted(sources.items()):
        destination = OUTPUT_DIR / name
        shutil.copy2(source, destination)
        count += 1

    print(f"Generated {count} card thumbnails in {OUTPUT_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
