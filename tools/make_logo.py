#!/usr/bin/env python3
"""Draws the AFTERHAUL logo as SVG: the two slashes and the name in Barlow Semi Condensed Medium (SIL OFL), letters converted to outlines.
Layout copies the site's top-left mark: amber slash, sand slash, name in capitals with wide spacing.
Usage: python3 tools/make_logo.py   (needs fonttools). Output: assets/img/brand/"""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from pathlib import Path

R = Path(__file__).resolve().parent.parent
f = TTFont(R / "assets/fonts/barlow-semi-condensed-medium.woff")
gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
cap = f["OS/2"].sCapHeight; SP = 0.3 * upm   # tracking .3em as on the site
AMBER, SAND, FROST = "#f0a202", "#c8b796", "#e8eeee"

def text_path(s, scale, x0, baseline):
    x = 0; d = []
    for ch in s:
        g = gs[cmap[ord(ch)]]; pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (scale, 0, 0, -scale, x0 + x * scale, baseline)))
        d.append(pen.getCommands()); x += g.width + SP
    return " ".join(d), (x - SP) * scale

# slash geometry from the site mark (64-unit box): both slashes span y 14..48, x 14..50
SL_H = 34.0; SL_W = 36.0
capH = SL_H / 1.25                     # cap height is 80% of slash height, as in the header
scale = capH / cap
pad = 8; gap = 12
base_y = pad + (SL_H - capH) / 2 + capH
td, tw = text_path("AFTERHAUL", scale, pad + SL_W + gap, base_y)
W = pad * 2 + SL_W + gap + tw; H = pad * 2 + SL_H
slashes = lambda ox: f'<path d="M{14-14+ox} {pad+SL_H} L{30-14+ox} {pad} h6 L{22-14+ox} {pad+SL_H}z" fill="{AMBER}"/><path d="M{32-14+ox} {pad+SL_H} L{44-14+ox} {pad+8} h6 L{38-14+ox} {pad+SL_H}z" fill="{SAND}"/>'
def svg(w, h, body, bg=None, title="AFTERHAUL"):
    r = f'<rect width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" role="img" aria-label="{title}"><title>{title}</title>{r}{body}</svg>\n'
out = R / "assets/img/brand"
body = slashes(pad) + f'<path d="{td}" fill="{FROST}"/>'
(out / "afterhaul-logo.svg").write_text(svg(W, H, body))                      # for dark backgrounds
(out / "afterhaul-logo-on-dark.svg").write_text(svg(W, H, body, "#14110c"))
dark = slashes(pad) + f'<path d="{td}" fill="#14110c"/>'
(out / "afterhaul-logo-for-light.svg").write_text(svg(W, H, dark.replace(SAND, "#7a6a4a")))  # for light backgrounds
ms = 64; mark = f'<path d="M14 48 L30 14 h6 L22 48z" fill="{AMBER}"/><path d="M32 48 L44 22 h6 L38 48z" fill="{SAND}"/>'
(out / "afterhaul-mark.svg").write_text(svg(ms, ms, mark, "#16130e"))
# Square (GitHub profile picture, 1024 box): slashes above the name, kept inside the central circle so a round crop loses nothing.
S = 1024; ms_ = 380 / SL_H                                  # scale slashes to 380 high
tw_target = 560; sc2 = tw_target / (tw / scale)             # name width 560
td2, tw2 = text_path("AFTERHAUL", sc2, 0, 0)
x0 = (S - tw2) / 2; ty = 747
td2, tw2 = text_path("AFTERHAUL", sc2, x0, ty)
sx = (S - SL_W * ms_) / 2; sy = 277
sq = (f'<g transform="translate({sx - pad * 0:.1f},{sy:.1f}) scale({ms_:.4f})"><path d="M0 {SL_H} L16 0 h6 L8 {SL_H}z" fill="{AMBER}"/><path d="M18 {SL_H} L30 8 h6 L24 {SL_H}z" fill="{SAND}"/></g>'
      f'<path d="{td2}" fill="{FROST}"/>')
(out / "afterhaul-square.svg").write_text(svg(S, S, sq, "#14110c"))
print(f"logo {W:.0f}x{H:.0f}")
