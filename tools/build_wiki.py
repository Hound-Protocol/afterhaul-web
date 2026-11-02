#!/usr/bin/env python3
"""Build the wiki data from wiki/pages/ (the source of the wiki's documents).

Handbook documents: wiki/pages/handbook/*.md. Line 1 is the title (# ...), then these lines:
    Code: HP-GDE-001 · Version 1.0 · Effective 2026-11-02 · Owner: Owner · For: everyone
    Audience: Players
    Summary: One sentence.
Library documents: wiki/pages/library/*.md. Line 1 is the title, then:
    Group: Project
The build writes wiki/content/<name>.md (without the metadata lines), wiki/data/guides.json and wiki/data/docs.json.
Run with --check to fail when the written files are out of date.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES, OUT = ROOT / "wiki" / "pages", ROOT / "wiki"
TYPES = {"GDE": "Guide", "POL": "Policy", "SOP": "Procedure"}
ORDER = ["Player guide", "Project", "Handbook", "Technical", "Community", "Legal"]


def parse(p):
    lines = p.read_text(encoding="utf-8").split("\n")
    title = lines[0].lstrip("# ").strip()
    meta, i = {}, 1
    while i < len(lines) and re.match(r"^(Code|Audience|Summary|Group): ", lines[i]):
        k, v = lines[i].split(": ", 1)
        meta[k] = v.strip(); i += 1
    body = "# " + title + "\n" + "\n".join(lines[i:]).lstrip("\n")
    return title, meta, body


def build():
    files, guides, docs = {}, [], []
    for p in sorted((PAGES / "handbook").glob("*.md")):
        title, m, body = parse(p)
        code_line = m.get("Code", "")
        mm = re.match(r"(HP-(GDE|POL|SOP)-\d{3}) · Version ([\d.]+) · Effective (\d{4}-\d{2}-\d{2}) · Owner: (.+?) · For: (.+)$", code_line)
        if not mm:
            sys.exit(f"{p.name}: bad Code line: {code_line!r}")
        code, kind, ver, eff, owner, who = mm.groups()
        rel = "handbook/" + p.name
        files[rel] = "# " + title + "\n" + body.split("\n", 1)[1]
        guides.append({"id": code.lower(), "code": code, "title": title, "type": TYPES[kind], "audience": m.get("Audience", "Players"),
                       "version": ver, "effective": eff, "owner": owner, "for": who, "summary": m.get("Summary", ""), "path": rel})
    for p in sorted((PAGES / "library").glob("*.md")):
        title, m, body = parse(p)
        rel = "library/" + p.name
        files[rel] = body
        docs.append({"id": p.stem, "title": title, "group": m.get("Group", "Project"), "path": rel})
    docs.sort(key=lambda d: (ORDER.index(d["group"]) if d["group"] in ORDER else 99, d["title"]))
    for g in guides:
        docs.append({"id": g["id"], "title": g["title"], "group": "Handbook", "path": g["path"]})
    out = {"data/guides.json": json.dumps({"note": "Written by tools/build_wiki.py. Do not edit.", "guides": guides}, indent=1, ensure_ascii=False) + "\n",
           "data/docs.json": json.dumps({"note": "Written by tools/build_wiki.py. Do not edit.", "docs": docs}, indent=1, ensure_ascii=False) + "\n"}
    for rel, t in files.items():
        out["content/" + rel] = t
    # Links between pages must point at pages that exist
    known = set(files)
    bad = []
    for rel, t in files.items():
        base = rel.rsplit("/", 1)[0]
        for m in re.finditer(r"\]\(([^)\s]+\.md)(?:#[^)]*)?\)", t):
            u = m.group(1)
            if re.match(r"[a-z]+:", u): continue
            parts = base.split("/")
            for seg in u.split("/"):
                if seg == "..": parts.pop()
                elif seg != ".": parts.append(seg)
            if "/".join(parts) not in known: bad.append(f"{rel} -> {u}")
    if bad:
        print("Broken links:\n  " + "\n  ".join(bad), file=sys.stderr)
    return out


def main():
    out = build()
    if "--check" in sys.argv:
        bad = [r for r, t in out.items() if not (OUT / r).exists() or (OUT / r).read_text(encoding="utf-8") != t]
        if bad:
            sys.exit("Out of date: " + ", ".join(bad[:5]))
        print("wiki data is current"); return
    for r, t in out.items():
        f = OUT / r; f.parent.mkdir(parents=True, exist_ok=True); f.write_text(t, encoding="utf-8")
    print(f"Wrote {len(out)} files: {len(out) - 2} documents")


main()
