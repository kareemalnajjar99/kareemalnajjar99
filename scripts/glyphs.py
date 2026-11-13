"""Extracts the outline of a word from a font as JSON: path data plus its anchor and control points."""
import json
import sys

from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

font_path, word, out_path = sys.argv[1:4]
font = TTFont(font_path)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()

glyphs = []
cursor = 0
for char in word:
    name = cmap[ord(char)]
    pen = RecordingPen()
    glyph_set[name].draw(pen)
    glyphs.append({"char": char, "x": cursor, "advance": glyph_set[name].width, "ops": pen.value})
    cursor += glyph_set[name].width

json.dump(
    {
        "unitsPerEm": font["head"].unitsPerEm,
        "capHeight": font["OS/2"].sCapHeight,
        "xHeight": font["OS/2"].sxHeight,
        "width": cursor,
        "glyphs": glyphs,
    },
    open(out_path, "w"),
)
