#!/usr/bin/env python3
"""Builds the optimized copy of the site that is deployed. Source files stay readable and are never changed.
Nothing visible changes: CSS and JS are minified, PNGs are recompressed without loss, fonts gain a smaller woff2 form (woff stays as fallback).
Usage: python3 tools/optimize.py OUT_DIR   (needs: npx esbuild, pip install fonttools brotli pyoxipng)"""
import re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]); shutil.rmtree(out, ignore_errors=True); out.mkdir(parents=True)
for f in ("index.html", "404.html", "robots.txt"):
    if (ROOT / f).exists(): shutil.copy(ROOT / f, out / f)
shutil.copytree(ROOT / "assets", out / "assets")

def sz(p): return sum(f.stat().st_size for f in Path(p).rglob("*") if f.is_file())
before = sz(ROOT / "assets") + (ROOT / "index.html").stat().st_size

# minify CSS and JS in place (esbuild keeps behaviour identical; no renaming of globals, no bundling)
for f in [out / "assets/css/afterhaul.css", out / "assets/js/afterhaul.js"]:
    subprocess.run(["npx", "--yes", "esbuild", str(f), "--minify", "--allow-overwrite", f"--outfile={f}", "--target=es2019", "--log-level=error"], check=True)

# lossless PNG
import oxipng
for p in (out / "assets/img").glob("*.png"):
    p.write_bytes(oxipng.optimize_from_memory(p.read_bytes(), level=4))

# woff2 next to woff; CSS lists woff2 first with woff as fallback
from fontTools.ttLib import TTFont
css = out / "assets/css/afterhaul.css"; c = css.read_text(encoding="utf-8")
for w in (out / "assets/fonts").glob("*.woff"):
    t = TTFont(w); t.flavor = "woff2"; t.save(w.with_suffix(".woff2"))
    c = re.sub(rf'url\("?\.\./fonts/{re.escape(w.name)}"?\) ?format\("woff"\)', f'url(../fonts/{w.stem}.woff2) format("woff2"),url(../fonts/{w.name}) format("woff")', c)
css.write_text(c, encoding="utf-8")
h = out / "index.html"; s = h.read_text(encoding="utf-8")
s = s.replace('barlow-semi-condensed-extralight.woff" as="font" type="font/woff"', 'barlow-semi-condensed-extralight.woff2" as="font" type="font/woff2"')
h.write_text(s, encoding="utf-8")
assert "woff2" in c, "font rewrite failed"
print(f"optimized: {before} -> {sz(out / 'assets') + h.stat().st_size} bytes (before gzip)")
