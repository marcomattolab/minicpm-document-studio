# Test

PDF di esempio per verificare la pipeline di conversione.

- `Report_Q3_2026.pdf` — PDF di una pagina con titolo, testo, tabella, diagramma di flusso e immagine.
- `gen_test_pdf.py` — script per rigenerare il PDF (richiede PyMuPDF + Pillow, presenti in `.minicpm-ocr`).

## Uso

1. Avvia i servizi: `make dev`
2. Nella UI (http://127.0.0.1:4200) imposta:
   - **Cartella sorgente**: percorso assoluto di `test/`
   - **Cartella di destinazione**: una cartella di output esterna
3. Clicca **Avvia conversione**.
