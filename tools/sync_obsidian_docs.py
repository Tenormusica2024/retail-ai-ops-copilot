#!/usr/bin/env python3
"""Sync Obsidian project docs with the repository mirror."""

from __future__ import annotations

import argparse
import filecmp
import os
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REPO_MIRROR = ROOT / "docs" / "obsidian"
DEFAULT_OBSIDIAN_DIR = DEFAULT_REPO_MIRROR
IGNORED_NAMES = {".DS_Store"}


def iter_files(base: Path) -> list[Path]:
    if not base.exists():
        return []
    return sorted(
        path
        for path in base.rglob("*")
        if path.is_file() and path.name not in IGNORED_NAMES
    )


def copy_tree(source: Path, target: Path) -> None:
    if not source.exists():
        raise FileNotFoundError(f"source directory does not exist: {source}")
    target.mkdir(parents=True, exist_ok=True)
    for source_file in iter_files(source):
        relative = source_file.relative_to(source)
        target_file = target / relative
        target_file.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_file, target_file)


def compare_trees(left: Path, right: Path) -> list[str]:
    left_files = {path.relative_to(left): path for path in iter_files(left)}
    right_files = {path.relative_to(right): path for path in iter_files(right)}
    diffs: list[str] = []

    for relative in sorted(left_files.keys() - right_files.keys()):
        diffs.append(f"missing_in_repo:{relative}")
    for relative in sorted(right_files.keys() - left_files.keys()):
        diffs.append(f"missing_in_obsidian:{relative}")
    for relative in sorted(left_files.keys() & right_files.keys()):
        if not filecmp.cmp(left_files[relative], right_files[relative], shallow=False):
            diffs.append(f"content_diff:{relative}")
    return diffs


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--direction",
        choices=["check", "obsidian-to-repo", "repo-to-obsidian"],
        default="check",
    )
    parser.add_argument(
        "--obsidian-dir",
        default=os.environ.get("RETAIL_AI_OPS_OBSIDIAN_DIR", str(DEFAULT_OBSIDIAN_DIR)),
    )
    parser.add_argument("--repo-mirror", default=str(DEFAULT_REPO_MIRROR))
    args = parser.parse_args()

    obsidian_dir = Path(args.obsidian_dir).expanduser().resolve()
    repo_mirror = Path(args.repo_mirror).expanduser().resolve()

    if args.direction == "obsidian-to-repo":
        copy_tree(obsidian_dir, repo_mirror)
    elif args.direction == "repo-to-obsidian":
        copy_tree(repo_mirror, obsidian_dir)

    diffs = compare_trees(obsidian_dir, repo_mirror)
    if diffs:
        print("obsidian_sync=diff")
        for diff in diffs:
            print(diff)
        return 1

    print("obsidian_sync=ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
