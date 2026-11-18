#!/usr/bin/env python3
"""Genera un PDF di test di una pagina con testo, tabella, diagramma di flusso e immagine.

Uso:
    .minicpm-ocr/bin/python test/gen_test_pdf.py            # -> test/Report_Q3_2026.pdf
    .minicpm-ocr/bin/python test/gen_test_pdf.py /tmp/x.pdf # percorso personalizzato

Richiede PyMuPDF e Pillow (presenti nel venv `.minicpm-ocr`).
"""
from __future__ import annotations

import sys
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "Report_Q3_2026.pdf"

# 1) Immagine di test (istogramma semplice)
img = Image.new("RGB", (520, 300), "white")
d = ImageDraw.Draw(img)
x = 60
for label, h in [("Lug", 120), ("Ago", 180), ("Set", 150)]:
    d.rectangle([x, 260 - h, x + 90, 260], fill="#4f81bd", outline="#2f5496")
    d.text((x + 28, 270), label, fill="black")
    d.text((x + 20, 250 - h - 20), str(h), fill="black")
    x += 140
chart_path = OUT.parent / "_test_chart.png"
img.save(chart_path)

# 2) PDF
doc = fitz.open()
page = doc.new_page(width=595, height=842)

# Titolo e sottotitolo
page.insert_text(fitz.Point(200, 70), "Report Trimestrale - Q3 2026", fontsize=18)
page.insert_text(fitz.Point(140, 95), "Andamento vendite e flusso operativo", fontsize=12)

# Paragrafo
body = ("Nel terzo trimestre le vendite sono cresciute del 12% rispetto al "
        "periodo precedente. La tabella riporta il dettaglio per regione, "
        "mentre il diagramma mostra il flusso di approvazione degli ordini.")
page.insert_textbox(fitz.Rect(60, 120, 535, 165), body, fontsize=10)

# Tabella
rows = [
    ["Regione", "Unita vendute", "Ricavo (EUR)"],
    ["Nord",    "120",           "45.000"],
    ["Centro",  "80",            "30.500"],
    ["Sud",     "60",            "22.000"],
]
colw = [200, 135, 140]
y = 180
for row in rows:
    x = 60
    for c, cell in enumerate(row):
        rect = fitz.Rect(x, y, x + colw[c], y + 20)
        page.draw_rect(rect, color=(0, 0, 0), width=0.7)
        page.insert_text(fitz.Point(x + 6, y + 14), cell, fontsize=9)
        x += colw[c]
    y += 20

# Diagramma di flusso (riquadri + frecce grafiche)
flow_y = 300
boxes = ["Richiesta", "Analisi", "Approvazione", "Consegna"]
bx = 60
for i, label in enumerate(boxes):
    rect = fitz.Rect(bx, flow_y, bx + 95, flow_y + 40)
    page.draw_rect(rect, color=(0.2, 0.3, 0.6), width=1.2)
    page.insert_text(fitz.Point(bx + 10, flow_y + 25), label, fontsize=9)
    if i < len(boxes) - 1:
        page.draw_line(fitz.Point(bx + 96, flow_y + 20), fitz.Point(bx + 116, flow_y + 20),
                       color=(0, 0, 0), width=1.0)
        page.draw_line(fitz.Point(bx + 108, flow_y + 16), fitz.Point(bx + 116, flow_y + 20),
                       color=(0, 0, 0), width=1.0)
        page.draw_line(fitz.Point(bx + 108, flow_y + 24), fitz.Point(bx + 116, flow_y + 20),
                       color=(0, 0, 0), width=1.0)
    bx += 120

# Frecce testuali (per il post-processor Mermaid)
page.insert_text(fitz.Point(60, 372),
                 "Pipeline: Acquisizione -> Estrazione -> Validazione -> Archivio", fontsize=10)

# Immagine
page.insert_image(fitz.Rect(60, 400, 420, 610), filename=str(chart_path))

doc.save(OUT)
print(f"PDF creato: {OUT}")
