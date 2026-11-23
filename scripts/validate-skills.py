#!/usr/bin/env python3
"""Validate the SKILL.md files used by ARTEX's norma skill loader.

The Go runtime loads skills straight from the filesystem: one subdirectory of
ARTEX_SKILL_DIR per skill, each containing a SKILL.md with YAML frontmatter.
A malformed or misnamed frontmatter block silently degrades that skill (empty
description / wrong registry key), so this script catches the common mistakes
before they reach a running agent.

Usage:
    python scripts/validate-skills.py [--skill-dir DIR] [--strict-links]

Requires: PyYAML (pip install pyyaml).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover - environment dependent
    print("ERROR: PyYAML is required. Install it with: pip install pyyaml", file=sys.stderr)
    raise SystemExit(2)


NAME_RE = re.compile(r"^[^\W\d_][\w-]*$", re.UNICODE)
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
PLACEHOLDER_RE = re.compile(r"[<>${\}]|\.\.\.")


def valid_skill_name(name: str) -> bool:
    """Mirror the repo's server.validSkillName rules (server_mgmt.go)."""
    if not name or len(name) > 64 or name != name.strip():
        return False
    if not NAME_RE.match(name):
        return False
    if name.startswith("-") or name.endswith("-") or "--" in name:
        return False
    if any(ch in name for ch in "/\\."):  # no path separators or dots
        return False
    return True


def broken_links(skill_dir: Path, body: str) -> list[str]:
    """Relative markdown links whose target does not exist.

    Many skills intentionally contain example links to files that do not ship
    with the repo, so these are warnings unless --strict-links is used.
    """
    out: list[str] = []
    for raw in MARKDOWN_LINK_RE.findall(body):
        target = raw.strip().split()[0] if raw.strip() else ""
        target = target.strip("<>\"'")
        if not target or PLACEHOLDER_RE.search(target):
            continue
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target):  # http:, mailto:, ...
            continue
        if target.startswith("#"):
            continue
        rel = target.split("#", 1)[0].split("?", 1)[0]
        if rel and not (skill_dir / rel).exists():
            out.append(rel)
    return out


def frontmatter(text: str) -> tuple[dict | None, str, list[str]]:
    """Return (parsed frontmatter, body, parse errors)."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, "", ["does not start with a '---' frontmatter block"]
    end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if end is None:
        return None, "", ["frontmatter block is not closed with '---'"]
    try:
        fm = yaml.safe_load("\n".join(lines[1:end]))
    except yaml.YAMLError as exc:
        return None, "", [f"invalid YAML frontmatter: {exc}"]
    if not isinstance(fm, dict):
        return None, "", ["frontmatter must be a YAML mapping (key: value)"]
    return fm, "\n".join(lines[end + 1 :]).strip(), []


def validate(skill_md: Path, strict_links: bool) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        text = skill_md.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        return [f"cannot read as UTF-8: {exc}"], []

    fm, body, parse_errors = frontmatter(text)
    errors.extend(parse_errors)
    if fm is None:
        return errors, warnings

    name = fm.get("name")
    description = fm.get("description")
    if not isinstance(name, str) or not name.strip():
        errors.append("missing or non-string 'name' in frontmatter")
    else:
        n = name.strip()
        if not valid_skill_name(n):
            errors.append(f"invalid 'name' for the loader: {name!r}")
        elif n != skill_md.parent.name:
            errors.append(
                f"name {n!r} does not match directory {skill_md.parent.name!r}"
            )
    if not isinstance(description, str) or not description.strip():
        errors.append("missing or non-string 'description' in frontmatter")
    if not body:
        errors.append("no instruction body after the frontmatter")

    for rel in broken_links(skill_md.parent, body):
        msg = f"broken relative link: {rel}"
        (errors if strict_links else warnings).append(msg)
    return errors, warnings


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--skill-dir", type=Path, default=root / "skills",
        help="skill root directory (default: <repo>/skills)",
    )
    parser.add_argument(
        "--strict-links", action="store_true",
        help="treat broken relative markdown links as errors",
    )
    args = parser.parse_args()

    skill_root: Path = args.skill_dir
    if not skill_root.is_dir():
        print(f"ERROR: skill directory not found: {skill_root}", file=sys.stderr)
        return 2
    files = sorted(skill_root.glob("*/SKILL.md"))
    if not files:
        print(f"ERROR: no */SKILL.md files under {skill_root}", file=sys.stderr)
        return 2

    errors_total = warnings_total = 0
    names: dict[str, str] = {}
    for skill_md in files:
        rel = str(skill_md.relative_to(skill_root.parent))
        errors, warnings = validate(skill_md, args.strict_links)
        try:
            fm, _, _ = frontmatter(skill_md.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError):
            fm = None
        if fm and isinstance(fm.get("name"), str) and fm["name"].strip():
            n = fm["name"].strip()
            if n in names:
                errors.append(f"duplicate name {n!r}, also used by {names[n]}")
            else:
                names[n] = rel
        for msg in errors:
            print(f"ERROR {rel}: {msg}")
        for msg in warnings:
            print(f"WARN  {rel}: {msg}")
        errors_total += len(errors)
        warnings_total += len(warnings)

    print(
        f"\nChecked {len(files)} skills: {len(files) - errors_total} clean, "
        f"{errors_total} error(s), {warnings_total} warning(s)."
    )
    return 1 if errors_total else 0


if __name__ == "__main__":
    raise SystemExit(main())
