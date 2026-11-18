import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

type Health = { status: string; ocr_cli_available: boolean; ocr_server_url: string; ocr_model: string; ocr_device: string; libreoffice_available: boolean };
type Job = { id: string; status: string; message: string; total: number; completed: number; succeeded: number; failed: number; skipped: number; current_file: string | null; pages_done: number; pages_total: number; files: { file: string; status: string }[]; errors: { file: string; error: string }[]; output_dir: string; started_at?: string; finished_at?: string };

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule], template: `
<div class="shell">
  <header class="topbar"><div class="brand"><div class="brand-mark">M</div><div><strong>MiniCPM</strong><span>DOCUMENT STUDIO</span></div></div><div class="local-pill"><i></i> Elaborazione locale</div></header>
  <main>
    <section class="intro"><div class="eyebrow">DOCUMENT INTELLIGENCE WORKSPACE</div><h1>Da documenti a <em>conoscenza.</em></h1><p>Converti PDF, scansioni e documenti Office in Markdown strutturato con MiniCPM-OCR.</p></section>
    <section class="workspace">
      <div class="panel config-panel">
        <div class="panel-heading"><div><div class="step">01 / CONFIGURAZIONE</div><h2>Cartelle di lavoro</h2></div><span class="chip">LOCAL FILES</span></div>
        <label for="source">Cartella sorgente</label><div class="path-wrap"><span class="path-icon">↳</span><input id="source" [(ngModel)]="sourceDir" placeholder="/Users/utente/Documents" /></div>
        <label for="output">Cartella di destinazione</label><div class="path-wrap"><span class="path-icon">↳</span><input id="output" [(ngModel)]="outputDir" placeholder="/Users/utente/Documents/markdown-output" /></div>
        <div class="options"><label class="check"><input type="checkbox" [(ngModel)]="recursive"><span class="checkmark"></span><span><b>Includi sottocartelle</b><small>Esplora ricorsivamente la cartella sorgente</small></span></label><label class="check"><input type="checkbox" [(ngModel)]="overwrite"><span class="checkmark"></span><span><b>Sovrascrivi file esistenti</b><small>Rigenera i Markdown già presenti</small></span></label></div>
        <button class="run-button" (click)="start()" [disabled]="busy || !sourceDir.trim() || !outputDir.trim()"><span>▶</span> {{ busy ? 'Elaborazione in corso…' : 'Avvia conversione' }} <b>→</b></button>
        <p class="hint">I file originali non vengono modificati. I risultati mantengono la struttura delle sottocartelle.</p>
      </div>
      <div class="right-column">
        <div class="panel status-panel"><div class="panel-heading"><div><div class="step">02 / MONITORAGGIO</div><h2>Stato elaborazione</h2></div><span class="status-tag" [class.good]="health?.ocr_cli_available" [class.bad]="health && !health.ocr_cli_available">{{ health?.ocr_cli_available ? 'OCR READY' : 'OCR NON CONFIGURATO' }}</span></div>
          <div class="starting-state" *ngIf="isStarting">
            <div class="spinner"></div>
            <strong>Avvio elaborazione…</strong>
            <p>Scansione della cartella sorgente e preparazione dei documenti. Il progresso comparirà qui a breve.</p>
            <div class="progress indeterminate"><div></div></div>
          </div>
          <div class="empty-state" *ngIf="!job && !isStarting"><div class="orbit">◎</div><strong>Pronto quando vuoi</strong><p>Configura le cartelle e avvia una nuova conversione per vedere qui il progresso.</p></div>
          <ng-container *ngIf="job && !isStarting">
            <div class="job-state">
              <div class="hero-progress">
                <div class="big-pct">{{ percent }}<small>%</small></div>
                <div class="progress" [class.active]="!isFinished"><div [style.width.%]="percent"></div></div>
                <div class="job-status-line">
                  <span class="live-badge" *ngIf="!isFinished"><i></i> ELABORAZIONE</span>
                  <span class="done-badge" *ngIf="isFinished">✓ COMPLETATO</span>
                  <span class="count">{{ job.completed }}/{{ job.total }} file</span>
                </div>
              </div>

              <div class="job-message" *ngIf="job.message">{{ job.message }}</div>

              <div class="subline">
                <span *ngIf="job.current_file" class="current">In lavorazione: <code>{{ job.current_file }}</code></span>
                <span *ngIf="job.pages_total > 0" class="pages">pagina {{ job.pages_done }}/{{ job.pages_total }}</span>
              </div>

              <div class="timing">
                <div class="timebox"><b>{{ fmtTime(elapsedSeconds) }}</b><small>trascorso</small></div>
                <div class="timebox" *ngIf="etaSeconds !== null"><b>{{ fmtTime(etaSeconds) }}</b><small>stimato rimanente</small></div>
                <div class="timebox"><b>{{ job.completed }}/{{ job.total }}</b><small>file</small></div>
              </div>

              <div class="metrics"><div><b>{{ job.completed }}/{{ job.total }}</b><small>Analizzati</small></div><div><b class="success">{{ job.succeeded }}</b><small>Completati</small></div><div><b class="danger">{{ job.failed }}</b><small>Errori</small></div><div><b>{{ job.skipped }}</b><small>Saltati</small></div></div>

              <div class="feed" *ngIf="job.files.length">
                <b class="feed-title">Avanzamento file</b>
                <div class="feed-scroll" #feedScroll>
                  <div class="feed-item" *ngFor="let f of job.files" [class.done]="f.status === 'done'" [class.error]="f.status === 'error'" [class.processing]="f.status === 'processing'" [class.skipped]="f.status === 'skipped'">
                    <span class="dot"></span>
                    <code>{{ f.file }}</code>
                    <small>{{ statusLabel(f.status) }}</small>
                  </div>
                </div>
              </div>

              <div class="error-list" *ngIf="job.errors.length"><b>File da verificare</b><div *ngFor="let error of job.errors"><code>{{ error.file }}</code><small>{{ error.error }}</small></div></div>
            </div>
          </ng-container>
        </div>
        <div class="panel capabilities"><div class="step">03 / OUTPUT SUPPORTATO</div><h2>Un formato, tanti contenuti.</h2><div class="cap-grid"><div><span class="cap-icon">¶</span><b>Testo e titoli</b><small>Gerarchia e ordine di lettura</small></div><div><span class="cap-icon">▦</span><b>Tabelle</b><small>Strutture tabellari HTML/MD</small></div><div><span class="cap-icon">∑</span><b>Formule e grafici</b><small>LaTeX e contenuti riconosciuti</small></div><div><span class="cap-icon">◇</span><b>Diagrammi</b><small>Mermaid da frecce e diagrammi grafici</small></div></div></div>
      </div>
    </section>
    <section class="bottom-grid"><div class="format-note"><span class="note-icon">i</span><div><b>Formati in ingresso</b><p>PDF, PNG, JPG, TIFF, GIF, BMP, WebP, DOC/DOCX, PPT/PPTX, XLS/XLSX, ODT/ODS/ODP, RTF e file testuali.</p></div></div><div class="format-note"><span class="note-icon">⌁</span><div><b>Nota sui diagrammi Mermaid</b><p>MiniCPM-OCR restituisce contenuti strutturati, ma non garantisce Mermaid. L'app converte in Mermaid le relazioni esplicite con frecce e, se attivato, prova a convertire i diagrammi di flusso grafici; gli altri grafici restano nel Markdown OCR per revisione.</p></div></div></section>
    <footer><span>MINICPM DOCUMENT STUDIO <b>·</b> ANGULAR 22</span><span>Powered by OpenBMB MiniCPM-OCR</span></footer>
  </main>

  <div class="modal-backdrop" *ngIf="modalVisible && job">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-icon" [class.err]="job.failed > 0">{{ job.failed ? '!' : '✓' }}</div>
        <div><b>Elaborazione completata</b><small>{{ job.failed ? 'con alcuni errori' : 'senza errori' }}</small></div>
      </div>
      <div class="modal-stats">
        <div><b class="success">{{ job.succeeded }}</b><small>completati</small></div>
        <div><b class="danger">{{ job.failed }}</b><small>errori</small></div>
        <div><b>{{ job.skipped }}</b><small>saltati</small></div>
        <div><b>{{ fmtTime(elapsedSeconds) }}</b><small>tempo</small></div>
      </div>
      <div class="modal-out">Output: <code>{{ job.output_dir }}</code></div>
      <div class="modal-errors" *ngIf="job.errors.length"><b>File da verificare</b><div *ngFor="let error of job.errors"><code>{{ error.file }}</code><small>{{ error.error }}</small></div></div>
      <button class="modal-close" (click)="closeModal()">Chiudi</button>
    </div>
  </div>
</div>
` })
export class AppComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private poll?: Subscription;
  @ViewChild('feedScroll') private feedScroll?: ElementRef<HTMLElement>;

  sourceDir = '';
  outputDir = '';
  recursive = true;
  overwrite = false;
  health: Health | null = null;
  job: Job | null = null;
  busy = false;
  starting = false;
  modalVisible = false;
  now = Date.now();

  get pageFraction(): number { return this.job && this.job.pages_total > 0 ? this.job.pages_done / this.job.pages_total : 0; }
  get percent(): number {
    if (!this.job?.total) return 0;
    const units = this.job.completed + this.pageFraction;
    return Math.max(0, Math.min(100, Math.round((units / this.job.total) * 100)));
  }
  get isFinished(): boolean { return !!this.job && ['completed', 'completed_with_errors', 'failed'].includes(this.job.status); }
  get isStarting(): boolean { return this.starting || (!!this.job && !this.isFinished && !this.job.total); }
  get elapsedSeconds(): number {
    if (!this.job?.started_at) return 0;
    const start = Date.parse(this.job.started_at);
    const end = this.isFinished && this.job.finished_at ? Date.parse(this.job.finished_at) : this.now;
    return Math.max(0, Math.round((end - start) / 1000));
  }
  get etaSeconds(): number | null {
    if (this.isFinished || !this.job?.total) return null;
    const units = this.job.completed + this.pageFraction;
    if (units <= 0 || this.elapsedSeconds <= 0) return null;
    return Math.max(0, Math.round((this.elapsedSeconds / units) * (this.job.total - units)));
  }

  ngOnInit(): void { this.http.get<Health>('/api/health').subscribe({ next: h => this.health = h, error: () => this.health = null }); }

  start(): void {
    this.busy = true; this.starting = true; this.job = null; this.modalVisible = false; this.now = Date.now();
    this.http.post<{id: string}>('/api/jobs', { source_dir: this.sourceDir, output_dir: this.outputDir, recursive: this.recursive, overwrite: this.overwrite }).subscribe({
      next: result => { this.poll?.unsubscribe(); this.poll = interval(1000).pipe(startWith(0), switchMap(() => this.http.get<Job>(`/api/jobs/${result.id}`))).subscribe({ next: job => { const wasFinished = this.isFinished; this.job = job; this.starting = false; this.now = Date.now(); this.busy = !this.isFinished; if (this.isFinished && !wasFinished) this.modalVisible = true; setTimeout(() => this.scrollFeed(), 0); if (this.isFinished) this.poll?.unsubscribe(); }, error: () => { this.busy = false; this.starting = false; this.poll?.unsubscribe(); } }); },
      error: err => { this.busy = false; this.starting = false; alert(err.error?.detail ?? 'Impossibile avviare il processo. Verifica il backend e i percorsi.'); }
    });
  }

  closeModal(): void { this.modalVisible = false; }

  fmtTime(s: number): string {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'in attesa', processing: 'in corso', done: 'fatto', error: 'errore', skipped: 'saltato' };
    return labels[status] ?? status;
  }

  private scrollFeed(): void {
    const el = this.feedScroll?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
