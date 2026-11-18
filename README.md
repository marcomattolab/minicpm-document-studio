# MiniCPM Document Studio

App local-first per la conversione di documenti: UI Angular 22 + backend FastAPI + SDK CLI ufficiale `minicpm-ocr`.

## Funzionalità

- Scegli una cartella sorgente locale e una cartella di destinazione per i Markdown.
- Scansione ricorsiva o solo primo livello; la struttura delle sottocartelle viene preservata.
- PDF e immagini vengono letti da MiniCPM-OCR.
- DOC/DOCX, PPT/PPTX, XLS/XLSX, ODT/ODS/ODP e RTF vengono convertiti in PDF con LibreOffice, poi letti da MiniCPM-OCR.
- TXT, Markdown, CSV, JSON, XML, HTML e LOG vengono convertiti direttamente in Markdown.
- Progresso per file, contatori di successo/errore/saltati e dettaglio degli errori.
- Non modifica i file sorgente. Il backend ascolta su `127.0.0.1` di default.
- Preserva l'output di MiniCPM-OCR (testo, tabelle, formule, grafici e riferimenti immagine). Un piccolo post-processore converte le relazioni esplicite `A -> B` / `A → B` in flowchart Mermaid.
- **Diagrammi grafici → Mermaid** (opzionale): una seconda passata invia i blocchi immagine al servizio di inferenza e, se riconosce un diagramma di flusso (riquadri collegati da frecce), lo aggiunge come Mermaid accanto all'immagine. Attivabile con `MINICPM_DIAGRAM_MERMAID=1` (già attiva con `start_backend.sh`).

> **Nota Mermaid**: l'output documentato di MiniCPM-OCR è Markdown con testo, tabelle HTML e formule LaTeX; non promette flowchart Mermaid. L'app converte le frecce già presenti nel testo OCR e, con la seconda passata opzionale `MINICPM_DIAGRAM_MERMAID=1`, prova a convertire anche i **diagrammi di flusso grafici** (riquadri + frecce) chiedendo al servizio di inferenza di produrre Mermaid. È un best-effort: la qualità dipende dal modello usato per il riconoscimento.

## Architettura

```text
Angular 22 (localhost:4200)
        | HTTP /api
FastAPI backend (localhost:8000)
        | scansione cartelle / conversione Office
minicpmvocr parse <file> -o <file>.md
        |
MiniCPM-OCR SDK -> servizio di inferenza locale OpenAI-compatibile
        |
        |-- Apple Silicon (macOS): llama.cpp (Metal)   <-- il tuo caso
        \-- Linux x86_64 + NVIDIA GPU: vLLM / SGLang / llama.cpp / Ollama
```

SDK e servizio di inferenza sono due componenti separati: il backend esegue il CLI dell'SDK (layout detection + assemblaggio), mentre il servizio di inferenza esegue il riconoscimento. Possono girare sulla stessa macchina o su macchine diverse.

## Prerequisiti

| Componente | Requisito | Nota |
|---|---|---|
| Python | ≥ 3.10 (consigliato 3.12) | per backend e SDK |
| Node.js / npm | ≥ 22.12 | per Angular 22 |
| LibreOffice | `libreoffice` o `soffice` | solo per i file Office/RTF |
| MiniCPM-OCR SDK | venv isolato `.minicpm-ocr` | layout detection |
| Servizio di inferenza | llama.cpp (Mac) o vLLM (Linux/NVIDIA) | riconoscimento modello |
| Modelli | ~2 GB di file GGUF | scaricati dallo script di setup |
| Disco | ~10 GB liberi | venv + modelli + cache |

Su **Apple Silicon** (M1/M2/M3/M4/M5) il servizio di inferenza usa **llama.cpp con Metal**; su **Linux x86_64 con GPU NVIDIA** si usa **vLLM**. vLLM non è supportato su macOS.

---

## Installazione

Tutta l'installazione è automatizzata da `scripts/setup.sh` (idempotente: non riscarica ciò che è già presente).

### Fase 1 — Dipendenze di base

```bash
# macOS (consigliato installare prima Homebrew e Python 3.12)
brew install python@3.12 node

# backend + frontend
./scripts/setup.sh backend
./scripts/setup.sh frontend
```

A questo punto l'app funziona **per i file testuali** (`.txt`, `.md`, `.csv`, `.json`, `.xml`, `.html`, `.log`), senza OCR.

### Fase 2 — OCR (SDK + servizio di inferenza + modelli)

```bash
./scripts/setup.sh sdk     # MiniCPM-OCR SDK in .minicpm-ocr (PaddlePaddle CPU su Mac)
./scripts/setup.sh llm     # llama.cpp + modelli GGUF (~2 GB)
```

### Fase 3 — LibreOffice (solo se converti file Office)

```bash
./scripts/setup.sh office
```

### Tutto in un colpo

```bash
./scripts/setup.sh all
```

### Fasi singole

| Comando | Cosa installa |
|---|---|
| `./scripts/setup.sh backend` | venv FastAPI in `backend/.venv` |
| `./scripts/setup.sh frontend` | `npm install` in `frontend/` |
| `./scripts/setup.sh office` | LibreOffice |
| `./scripts/setup.sh sdk` | SDK MiniCPM-OCR in `.minicpm-ocr` |
| `./scripts/setup.sh llm` | llama.cpp in `tools/` + modelli GGUF in `models/` |
| `./scripts/setup.sh all` | tutto quanto sopra |

---

## Avvio

Servono **tre processi** (tre terminali):

```bash
# Terminale 1 — servizio di inferenza OCR (llama.cpp, porta 18499)
./scripts/start_ocr.sh

# Terminale 2 — backend FastAPI (porta 8000)
./scripts/start_backend.sh

# Terminale 3 — frontend Angular (porta 4200)
./scripts/start_frontend.sh
```

Verifica rapida:

```bash
./scripts/health.sh
```

Apri http://127.0.0.1:4200.

> Gli script di avvio configurano automaticamente il backend per usare il CLI dell'SDK isolato, il backend `llamacpp`, il device `cpu` (su Mac) e centralizzano modelli/artefatti in `models/` e `.runs/`.

## Utilizzo

1. Inserisci un percorso assoluto in **Cartella sorgente**.
2. Inserisci un percorso assoluto in **Cartella di destinazione** (deve essere fuori dalla cartella sorgente).
3. Scegli se includere le sottocartelle e se sovrascrivere i `.md` esistenti.
4. Clicca **Avvia conversione**.

L'output usa la stessa struttura relativa e un `.md` per ogni file di input.

## Formati supportati

| Categoria | Estensioni | Elaborazione |
|---|---|---|
| PDF e immagini | `.pdf`, `.png`, `.jpg`, `.jpeg`, `.bmp`, `.webp`, `.tif`, `.tiff`, `.gif` | MiniCPM-OCR |
| Office / OpenDocument | `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`, `.odt`, `.ods`, `.odp`, `.rtf` | LibreOffice → PDF, poi MiniCPM-OCR |
| Testo | `.txt`, `.md`, `.markdown`, `.csv`, `.json`, `.xml`, `.html`, `.htm`, `.log` | conversione diretta in Markdown |

## API

- `GET /api/health` — verifica disponibilità CLI e configurazione runtime.
- `POST /api/jobs` — body: `{ "source_dir": "/path/in", "output_dir": "/path/out", "recursive": true, "overwrite": false }`.
- `GET /api/jobs/{job_id}` — progresso ed errori per file.

## Variabili d'ambiente (backend)

| Variabile | Default | Descrizione |
|---|---|---|
| `APP_HOST` / `APP_PORT` | `127.0.0.1` / `8000` | ascolto del backend |
| `MINICPM_OCR_COMMAND` | `minicpmvocr` | percorso del CLI SDK |
| `MINICPM_OCR_SERVER_URL` | `http://127.0.0.1:18499` | servizio di inferenza |
| `MINICPM_OCR_MODEL` | `minicpm-ocr` | nome modello esposto dal servizio |
| `MINICPM_OCR_DEVICE` | `cpu` | device per la layout detection |
| `MINICPM_OCR_BACKEND` | (vuoto = `vllm`) | `llamacpp`, `ollama`, `openai` o `vllm` |
| `MINICPM_DIAGRAM_MERMAID` | `0` | seconda passata: diagrammi grafici → Mermaid (`1` = attiva) |
| `MINICPM_DIAGRAM_TIMEOUT` | `120` | timeout (sec) per ogni richiesta diagramma → Mermaid |
| `MINICPM_DIAGRAM_SERVER_URL` | = `MINICPM_OCR_SERVER_URL` | endpoint per la passata diagrammi (se diverso dall'OCR) |
| `MINICPM_DIAGRAM_MODEL` | = `MINICPM_OCR_MODEL` | modello per la passata diagrammi (se diverso dall'OCR) |

L'app **non carica automaticamente file `.env`**: esporta le variabili nella shell oppure usa gli script di avvio.

## Installazione manuale (senza script)

Se preferisci non usare gli script:

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py

# frontend
cd frontend
npm install
npm start

# SDK OCR (ambiente isolato, macOS Apple Silicon)
python3 -m venv .minicpm-ocr && source .minicpm-ocr/bin/activate
pip install "minicpm-ocr[all]"
pip install "paddlepaddle==3.3.0" "pypdfium2>=4"

# llama.cpp (macOS arm64)
mkdir -p tools && curl -fL \
  https://github.com/ggml-org/llama.cpp/releases/download/b11901/llama-b11901-bin-macos-arm64.tar.gz \
  | tar xz -C tools

# modelli GGUF (~2 GB) in models/MiniCPM-OCR-1.0-gguf/
#   MiniCPM-OCR-1_0-Q8_0.gguf         (main, 0.81 GB)
#   mmproj-model-f16-4x.gguf           (projector, 0.90 GB)
#   dspark-MiniCPM-OCR-1_0-Q8_0.gguf   (draft DSpark, 0.33 GB)
# vedi scripts/start_ocr.sh per il comando completo di avvio di llama-server
```

Riferimenti upstream MiniCPM-OCR:

- Guida installazione/inferenza: <https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md>
- SDK CLI/API: <https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_sdk_api_en.md>
- Deploy llama.cpp (GGUF): <https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy.md>
- Deploy Ollama: <https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/ollama_deploy.md>

## Note / limitazioni

- Il servizio di inferenza va avviato separatamente; l'app non scarica automaticamente i pesi multi-gigabyte (lo fa `setup.sh llm`, una tantum).
- La conversione Office richiede LibreOffice. Documenti cifrati/protetti possono fallire.
- Un PDF o un'immagine può contenere elementi visivi la cui struttura semantica esatta non è recuperabile perfettamente dall'OCR: rivedi sempre tabelle, diagrammi e numeri critici.
- La UI accetta percorsi assoluti del filesystem. Un selettore di cartelle nativo può essere aggiunto in seguito con Electron o Tauri (i browser non concedono accesso arbitrario al filesystem da un percorso digitato).
- Su macOS la layout detection gira su CPU (PaddlePaddle non ha build CUDA per Mac); il riconoscimento del modello è accelerato da Metal via llama.cpp.
- Questo è uno starter di sviluppo locale, non un server multi-utente robusto. Non esporre l'API pubblicamente senza autenticazione, allowlist di percorsi e limiti sulle risorse.
