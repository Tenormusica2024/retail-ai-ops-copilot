from pathlib import Path

from tools import sync_obsidian_docs


def test_compare_trees_detects_content_diff(tmp_path: Path) -> None:
    left = tmp_path / "left"
    right = tmp_path / "right"
    left.mkdir()
    right.mkdir()
    (left / "note.md").write_text("left\n", encoding="utf-8")
    (right / "note.md").write_text("right\n", encoding="utf-8")

    assert sync_obsidian_docs.compare_trees(left, right) == ["content_diff:note.md"]


def test_copy_tree_copies_nested_docs(tmp_path: Path) -> None:
    source = tmp_path / "source"
    target = tmp_path / "target"
    (source / "nested").mkdir(parents=True)
    (source / "nested" / "note.md").write_text("# Note\n", encoding="utf-8")

    sync_obsidian_docs.copy_tree(source, target)

    assert (target / "nested" / "note.md").read_text(encoding="utf-8") == "# Note\n"
