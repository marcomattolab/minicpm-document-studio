export type Lang = 'it' | 'en';

export interface UIStrings {
  localPill: string;
  eyebrow: string;
  titleBefore: string;
  titleEm: string;
  introText: string;
  stepConfig: string;
  configTitle: string;
  localFilesChip: string;
  sourceLabel: string;
  sourcePlaceholder: string;
  outputLabel: string;
  outputPlaceholder: string;
  includeSubfolders: string;
  includeSubfoldersHint: string;
  overwriteFiles: string;
  overwriteFilesHint: string;
  startButton: string;
  processingButton: string;
  configHint: string;
  stepMonitor: string;
  statusTitle: string;
  ocrReady: string;
  ocrNotConfigured: string;
  readyTitle: string;
  readyText: string;
  startingTitle: string;
  startingText: string;
  processingBadge: string;
  completedBadge: string;
  filesCount: string;
  currentFile: string;
  pageLabel: string;
  elapsed: string;
  eta: string;
  metricAnalyzed: string;
  metricCompleted: string;
  metricErrors: string;
  metricSkipped: string;
  feedTitle: string;
  reviewTitle: string;
  stepOutput: string;
  capTitle: string;
  cap1Title: string;
  cap1Text: string;
  cap2Title: string;
  cap2Text: string;
  cap3Title: string;
  cap3Text: string;
  cap4Title: string;
  cap4Text: string;
  formatsTitle: string;
  formatsText: string;
  mermaidTitle: string;
  mermaidText: string;
  modalTitle: string;
  modalWithErrors: string;
  modalNoErrors: string;
  modalCompleted: string;
  modalErrors: string;
  modalSkipped: string;
  modalTime: string;
  modalOutput: string;
  modalClose: string;
  startError: string;
}

export const TRANSLATIONS: Record<Lang, UIStrings> = {
  it: {
    localPill: 'Elaborazione locale',
    eyebrow: 'WORKSPACE DI INTELLIGENZA DOCUMENTALE',
    titleBefore: 'Da documenti a',
    titleEm: 'conoscenza.',
    introText: 'Converti PDF, scansioni e documenti Office in Markdown strutturato con MiniCPM-OCR.',
    stepConfig: '01 / CONFIGURAZIONE',
    configTitle: 'Cartelle di lavoro',
    localFilesChip: 'FILE LOCALI',
    sourceLabel: 'Cartella sorgente',
    sourcePlaceholder: '/Users/utente/Documents',
    outputLabel: 'Cartella di destinazione',
    outputPlaceholder: '/Users/utente/Documents/markdown-output',
    includeSubfolders: 'Includi sottocartelle',
    includeSubfoldersHint: 'Esplora ricorsivamente la cartella sorgente',
    overwriteFiles: 'Sovrascrivi file esistenti',
    overwriteFilesHint: 'Rigenera i Markdown già presenti',
    startButton: 'Avvia conversione',
    processingButton: 'Elaborazione in corso…',
    configHint: 'I file originali non vengono modificati. I risultati mantengono la struttura delle sottocartelle.',
    stepMonitor: '02 / MONITORAGGIO',
    statusTitle: 'Stato elaborazione',
    ocrReady: 'OCR PRONTO',
    ocrNotConfigured: 'OCR NON CONFIGURATO',
    readyTitle: 'Pronto quando vuoi',
    readyText: 'Configura le cartelle e avvia una nuova conversione per vedere qui il progresso.',
    startingTitle: 'Avvio elaborazione…',
    startingText: 'Scansione della cartella sorgente e preparazione dei documenti. Il progresso comparirà qui a breve.',
    processingBadge: 'ELABORAZIONE',
    completedBadge: 'COMPLETATO',
    filesCount: 'file',
    currentFile: 'In lavorazione:',
    pageLabel: 'pagina',
    elapsed: 'trascorso',
    eta: 'stimato rimanente',
    metricAnalyzed: 'Analizzati',
    metricCompleted: 'Completati',
    metricErrors: 'Errori',
    metricSkipped: 'Saltati',
    feedTitle: 'Avanzamento file',
    reviewTitle: 'File da verificare',
    stepOutput: '03 / OUTPUT SUPPORTATO',
    capTitle: 'Un formato, tanti contenuti.',
    cap1Title: 'Testo e titoli',
    cap1Text: 'Gerarchia e ordine di lettura',
    cap2Title: 'Tabelle',
    cap2Text: 'Strutture tabellari HTML/MD',
    cap3Title: 'Formule e grafici',
    cap3Text: 'LaTeX e contenuti riconosciuti',
    cap4Title: 'Diagrammi',
    cap4Text: 'Mermaid da frecce e diagrammi grafici',
    formatsTitle: 'Formati in ingresso',
    formatsText: 'PDF, PNG, JPG, TIFF, GIF, BMP, WebP, DOC/DOCX, PPT/PPTX, XLS/XLSX, ODT/ODS/ODP, RTF e file testuali.',
    mermaidTitle: 'Nota sui diagrammi Mermaid',
    mermaidText: 'MiniCPM-OCR restituisce contenuti strutturati, ma non garantisce Mermaid. L\'app converte in Mermaid le relazioni esplicite con frecce e, se attivato, prova a convertire i diagrammi di flusso grafici; gli altri grafici restano nel Markdown OCR per revisione.',
    modalTitle: 'Elaborazione completata',
    modalWithErrors: 'con alcuni errori',
    modalNoErrors: 'senza errori',
    modalCompleted: 'completati',
    modalErrors: 'errori',
    modalSkipped: 'saltati',
    modalTime: 'tempo',
    modalOutput: 'Output:',
    modalClose: 'Chiudi',
    startError: 'Impossibile avviare il processo. Verifica il backend e i percorsi.'
  },
  en: {
    localPill: 'Local processing',
    eyebrow: 'DOCUMENT INTELLIGENCE WORKSPACE',
    titleBefore: 'From documents to',
    titleEm: 'knowledge.',
    introText: 'Convert PDFs, scans and Office documents into structured Markdown with MiniCPM-OCR.',
    stepConfig: '01 / CONFIGURATION',
    configTitle: 'Working folders',
    localFilesChip: 'LOCAL FILES',
    sourceLabel: 'Source folder',
    sourcePlaceholder: '/Users/user/Documents',
    outputLabel: 'Destination folder',
    outputPlaceholder: '/Users/user/Documents/markdown-output',
    includeSubfolders: 'Include subfolders',
    includeSubfoldersHint: 'Recursively scan the source folder',
    overwriteFiles: 'Overwrite existing files',
    overwriteFilesHint: 'Regenerate existing Markdown files',
    startButton: 'Start conversion',
    processingButton: 'Processing…',
    configHint: 'Original files are not modified. Results keep the subfolder structure.',
    stepMonitor: '02 / MONITORING',
    statusTitle: 'Processing status',
    ocrReady: 'OCR READY',
    ocrNotConfigured: 'OCR NOT CONFIGURED',
    readyTitle: 'Ready when you are',
    readyText: 'Configure the folders and start a new conversion to see the progress here.',
    startingTitle: 'Starting processing…',
    startingText: 'Scanning the source folder and preparing documents. Progress will appear here shortly.',
    processingBadge: 'PROCESSING',
    completedBadge: 'COMPLETED',
    filesCount: 'files',
    currentFile: 'Processing:',
    pageLabel: 'page',
    elapsed: 'elapsed',
    eta: 'estimated remaining',
    metricAnalyzed: 'Analyzed',
    metricCompleted: 'Completed',
    metricErrors: 'Errors',
    metricSkipped: 'Skipped',
    feedTitle: 'File progress',
    reviewTitle: 'Files to review',
    stepOutput: '03 / SUPPORTED OUTPUT',
    capTitle: 'One format, many contents.',
    cap1Title: 'Text and headings',
    cap1Text: 'Hierarchy and reading order',
    cap2Title: 'Tables',
    cap2Text: 'HTML/MD table structures',
    cap3Title: 'Formulas and charts',
    cap3Text: 'LaTeX and recognized content',
    cap4Title: 'Diagrams',
    cap4Text: 'Mermaid from arrows and graphical diagrams',
    formatsTitle: 'Input formats',
    formatsText: 'PDF, PNG, JPG, TIFF, GIF, BMP, WebP, DOC/DOCX, PPT/PPTX, XLS/XLSX, ODT/ODS/ODP, RTF and text files.',
    mermaidTitle: 'A note on Mermaid diagrams',
    mermaidText: 'MiniCPM-OCR returns structured content but does not guarantee Mermaid. The app converts explicit arrow relations to Mermaid and, when enabled, tries to convert graphical flowcharts; other charts remain in the OCR Markdown for review.',
    modalTitle: 'Processing completed',
    modalWithErrors: 'with some errors',
    modalNoErrors: 'without errors',
    modalCompleted: 'completed',
    modalErrors: 'errors',
    modalSkipped: 'skipped',
    modalTime: 'time',
    modalOutput: 'Output:',
    modalClose: 'Close',
    startError: 'Unable to start the process. Check the backend and the paths.'
  }
};
