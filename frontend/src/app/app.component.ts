import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { TRANSLATIONS, type Lang, type UIStrings } from './translations';

type Health = { status: string; ocr_cli_available: boolean; ocr_server_url: string; ocr_model: string; ocr_device: string; libreoffice_available: boolean };
type Job = { id: string; status: string; message: string; total: number; completed: number; succeeded: number; failed: number; skipped: number; current_file: string | null; pages_done: number; pages_total: number; files: { file: string; status: string }[]; errors: { file: string; error: string }[]; output_dir: string; started_at?: string; finished_at?: string };

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule], template: `
<div class="shell">
  <header class="topbar">
    <div class="brand"><div class="brand-mark">M</div><div><strong>MiniCPM</strong><span>DOCUMENT STUDIO</span></div></div>
    <div class="topbar-actions">
      <div class="local-pill"><i></i> {{ t.localPill }}</div>
      <div class="lang-switch" aria-label="Language">
        <button type="button" [class.active]="lang === 'it'" (click)="setLang('it')">IT</button>
        <button type="button" [class.active]="lang === 'en'" (click)="setLang('en')">EN</button>
      </div>
    </div>
  </header>
  <main>
    <section class="intro"><div class="eyebrow">{{ t.eyebrow }}</div><h1>{{ t.titleBefore }} <em>{{ t.titleEm }}</em></h1><p>{{ t.introText }}</p></section>
    <section class="workspace">
      <div class="panel config-panel">
        <div class="panel-heading"><div><div class="step">{{ t.stepConfig }}</div><h2>{{ t.configTitle }}</h2></div><span class="chip">{{ t.localFilesChip }}</span></div>
        <label for="source">{{ t.sourceLabel }}</label><div class="path-wrap"><span class="path-icon">↳</span><input id="source" [(ngModel)]="sourceDir" placeholder="{{ t.sourcePlaceholder }}" /></div>
        <label for="output">{{ t.outputLabel }}</label><div class="path-wrap"><span class="path-icon">↳</span><input id="output" [(ngModel)]="outputDir" placeholder="{{ t.outputPlaceholder }}" /></div>
        <div class="options"><label class="check"><input type="checkbox" [(ngModel)]="recursive"><span class="checkmark"></span><span><b>{{ t.includeSubfolders }}</b><small>{{ t.includeSubfoldersHint }}</small></span></label><label class="check"><input type="checkbox" [(ngModel)]="overwrite"><span class="checkmark"></span><span><b>{{ t.overwriteFiles }}</b><small>{{ t.overwriteFilesHint }}</small></span></label></div>
        <button class="run-button" (click)="start()" [disabled]="busy || !sourceDir.trim() || !outputDir.trim()"><span>▶</span> {{ busy ? t.processingButton : t.startButton }} <b>→</b></button>
        <p class="hint">{{ t.configHint }}</p>
      </div>
      <div class="right-column">
        <div class="panel status-panel"><div class="panel-heading"><div><div class="step">{{ t.stepMonitor }}</div><h2>{{ t.statusTitle }}</h2></div><span class="status-tag" [class.good]="health?.ocr_cli_available" [class.bad]="health && !health.ocr_cli_available">{{ health?.ocr_cli_available ? t.ocrReady : t.ocrNotConfigured }}</span></div>
          <div class="starting-state" *ngIf="isStarting">
            <div class="spinner"></div>
            <strong>{{ t.startingTitle }}</strong>
            <p>{{ t.startingText }}</p>
            <div class="progress indeterminate"><div></div></div>
          </div>
          <div class="empty-state" *ngIf="!job && !isStarting"><div class="orbit">◎</div><strong>{{ t.readyTitle }}</strong><p>{{ t.readyText }}</p></div>
          <ng-container *ngIf="job && !isStarting">
            <div class="job-state">
              <div class="hero-progress">
                <div class="big-pct">{{ percent }}<small>%</small></div>
                <div class="progress" [class.active]="!isFinished"><div [style.width.%]="percent"></div></div>
                <div class="job-status-line">
                  <span class="live-badge" *ngIf="!isFinished"><i></i> {{ t.processingBadge }}</span>
                  <span class="done-badge" *ngIf="isFinished">✓ {{ t.completedBadge }}</span>
                  <span class="count">{{ job.completed }}/{{ job.total }} {{ t.filesCount }}</span>
                </div>
              </div>

              <div class="job-message" *ngIf="job.message">{{ localizedMessage(job.message) }}</div>

              <div class="subline">
                <span *ngIf="job.current_file" class="current">{{ t.currentFile }} <code>{{ job.current_file }}</code></span>
                <span *ngIf="job.pages_total > 0" class="pages">{{ t.pageLabel }} {{ job.pages_done }}/{{ job.pages_total }}</span>
              </div>

              <div class="timing">
                <div class="timebox"><b>{{ fmtTime(elapsedSeconds) }}</b><small>{{ t.elapsed }}</small></div>
                <div class="timebox" *ngIf="etaSeconds !== null"><b>{{ fmtTime(etaSeconds) }}</b><small>{{ t.eta }}</small></div>
                <div class="timebox"><b>{{ job.completed }}/{{ job.total }}</b><small>{{ t.filesCount }}</small></div>
              </div>

              <div class="metrics"><div><b>{{ job.completed }}/{{ job.total }}</b><small>{{ t.metricAnalyzed }}</small></div><div><b class="success">{{ job.succeeded }}</b><small>{{ t.metricCompleted }}</small></div><div><b class="danger">{{ job.failed }}</b><small>{{ t.metricErrors }}</small></div><div><b>{{ job.skipped }}</b><small>{{ t.metricSkipped }}</small></div></div>

              <div class="feed" *ngIf="job.files.length">
                <b class="feed-title">{{ t.feedTitle }}</b>
                <div class="feed-scroll" #feedScroll>
                  <div class="feed-item" *ngFor="let f of job.files" [class.done]="f.status === 'done'" [class.error]="f.status === 'error'" [class.processing]="f.status === 'processing'" [class.skipped]="f.status === 'skipped'">
                    <span class="dot"></span>
                    <code>{{ f.file }}</code>
                    <small>{{ statusLabel(f.status) }}</small>
                  </div>
                </div>
              </div>

              <div class="error-list" *ngIf="job.errors.length"><b>{{ t.reviewTitle }}</b><div *ngFor="let error of job.errors"><code>{{ error.file }}</code><small>{{ error.error }}</small></div></div>
            </div>
          </ng-container>
        </div>
        <div class="panel capabilities"><div class="step">{{ t.stepOutput }}</div><h2>{{ t.capTitle }}</h2><div class="cap-grid"><div><span class="cap-icon">¶</span><b>{{ t.cap1Title }}</b><small>{{ t.cap1Text }}</small></div><div><span class="cap-icon">▦</span><b>{{ t.cap2Title }}</b><small>{{ t.cap2Text }}</small></div><div><span class="cap-icon">∑</span><b>{{ t.cap3Title }}</b><small>{{ t.cap3Text }}</small></div><div><span class="cap-icon">◇</span><b>{{ t.cap4Title }}</b><small>{{ t.cap4Text }}</small></div></div></div>
      </div>
    </section>
    <section class="bottom-grid"><div class="format-note"><span class="note-icon">i</span><div><b>{{ t.formatsTitle }}</b><p>{{ t.formatsText }}</p></div></div><div class="format-note"><span class="note-icon">⌁</span><div><b>{{ t.mermaidTitle }}</b><p>{{ t.mermaidText }}</p></div></div></section>
    <footer><span>MINICPM DOCUMENT STUDIO <b>·</b> ANGULAR 22</span><span>Powered by OpenBMB MiniCPM-OCR</span></footer>
  </main>

  <div class="modal-backdrop" *ngIf="modalVisible && job">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-icon" [class.err]="job.failed > 0">{{ job.failed ? '!' : '✓' }}</div>
        <div><b>{{ t.modalTitle }}</b><small>{{ job.failed ? t.modalWithErrors : t.modalNoErrors }}</small></div>
      </div>
      <div class="modal-stats">
        <div><b class="success">{{ job.succeeded }}</b><small>{{ t.modalCompleted }}</small></div>
        <div><b class="danger">{{ job.failed }}</b><small>{{ t.modalErrors }}</small></div>
        <div><b>{{ job.skipped }}</b><small>{{ t.modalSkipped }}</small></div>
        <div><b>{{ fmtTime(elapsedSeconds) }}</b><small>{{ t.modalTime }}</small></div>
      </div>
      <div class="modal-out">{{ t.modalOutput }} <code>{{ job.output_dir }}</code></div>
      <div class="modal-errors" *ngIf="job.errors.length"><b>{{ t.reviewTitle }}</b><div *ngFor="let error of job.errors"><code>{{ error.file }}</code><small>{{ error.error }}</small></div></div>
      <button class="modal-close" (click)="closeModal()">{{ t.modalClose }}</button>
    </div>
  </div>
</div>
` })
export class AppComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private poll?: Subscription;
  @ViewChild('feedScroll') private feedScroll?: ElementRef<HTMLElement>;

  lang: Lang = 'it';
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

  get t(): UIStrings { return TRANSLATIONS[this.lang]; }

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

  ngOnInit(): void {
    const saved = localStorage.getItem('mds-lang');
    if (saved === 'it' || saved === 'en') this.setLang(saved);
    this.http.get<Health>('/api/health').subscribe({ next: h => this.health = h, error: () => this.health = null });
  }

  setLang(lang: Lang): void {
    this.lang = lang;
    localStorage.setItem('mds-lang', lang);
    document.documentElement.lang = lang;
  }

  start(): void {
    this.busy = true; this.starting = true; this.job = null; this.modalVisible = false; this.now = Date.now();
    this.http.post<{id: string}>('/api/jobs', { source_dir: this.sourceDir, output_dir: this.outputDir, recursive: this.recursive, overwrite: this.overwrite }).subscribe({
      next: result => { this.poll?.unsubscribe(); this.poll = interval(1000).pipe(startWith(0), switchMap(() => this.http.get<Job>(`/api/jobs/${result.id}`))).subscribe({ next: job => { const wasFinished = this.isFinished; this.job = job; this.starting = false; this.now = Date.now(); this.busy = !this.isFinished; if (this.isFinished && !wasFinished) this.modalVisible = true; setTimeout(() => this.scrollFeed(), 0); if (this.isFinished) this.poll?.unsubscribe(); }, error: () => { this.busy = false; this.starting = false; this.poll?.unsubscribe(); } }); },
      error: err => { this.busy = false; this.starting = false; alert(err.error?.detail ?? this.t.startError); }
    });
  }

  closeModal(): void { this.modalVisible = false; }

  localizedMessage(msg: string | null | undefined): string {
    if (!msg) return '';
    if (this.lang === 'it') return msg;
    return msg
      .replace(/^Job in coda$/, 'Job queued')
      .replace(/^Trovati (\d+) documenti supportati$/, 'Found $1 supported documents')
      .replace(/^Elaborazione (\d+)\/(\d+): /, 'Processing $1/$2: ')
      .replace(/^Elaborazione completata$/, 'Processing completed')
      .replace(/^Nessun documento supportato trovato nella cartella selezionata\.$/, 'No supported documents found in the selected folder.')
      .replace(/^La cartella sorgente non esiste o non è una directory\.$/, 'The source folder does not exist or is not a directory.')
      .replace(/^La cartella di destinazione non può coincidere con la sorgente né trovarsi al suo interno\.$/, 'The destination folder cannot be the same as the source or be inside it.');
  }

  fmtTime(s: number): string {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = this.lang === 'en'
      ? { pending: 'pending', processing: 'processing', done: 'done', error: 'error', skipped: 'skipped' }
      : { pending: 'in attesa', processing: 'in corso', done: 'fatto', error: 'errore', skipped: 'saltato' };
    return labels[status] ?? status;
  }

  private scrollFeed(): void {
    const el = this.feedScroll?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void { this.poll?.unsubscribe(); }
}
