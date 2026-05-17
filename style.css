/* ══════════════════════════════════════════════════════════
   大学講義 音声ノートAI — style.css
   Theme: Academic Dark — Deep Navy × Electric Blue
   ══════════════════════════════════════════════════════════ */

/* ── Custom Properties ──────────────────────────────────── */
:root {
  /* Colors */
  --bg:           #0a0f1e;
  --bg-card:      #0f1629;
  --bg-input:     #0d1224;
  --border:       #1a2640;
  --border-hover: #2a4070;
  --accent:       #4a9eff;
  --accent-glow:  rgba(74, 158, 255, 0.15);
  --accent-dim:   rgba(74, 158, 255, 0.5);
  --text:         #d8e4f0;
  --text-sub:     #7a93b8;
  --text-muted:   #3d5070;
  --success:      #3ecf8e;
  --error:        #f06878;
  --warning:      #f0a040;

  /* Typography */
  --font-serif:   'Noto Serif JP', 'Georgia', serif;
  --font-sans:    'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* Spacing */
  --gap-xs:  0.375rem;
  --gap-sm:  0.625rem;
  --gap-md:  1rem;
  --gap-lg:  1.5rem;
  --gap-xl:  2rem;
  --gap-2xl: 3rem;

  /* Borders */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  20px;

  /* Transitions */
  --ease:      cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:   cubic-bezier(0.4, 0, 1, 1);
  --dur-fast:  150ms;
  --dur-base:  250ms;
  --dur-slow:  400ms;
}

/* ── Reset & Base ────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.7;
  color: var(--text);
  background-color: var(--bg);
  min-height: 100dvh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Background Effects ──────────────────────────────────── */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(74, 158, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 158, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* ── Layout ──────────────────────────────────────────────── */
.app-wrapper {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--gap-md) var(--gap-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

/* ── Header ──────────────────────────────────────────────── */
.site-header {
  padding: var(--gap-xl) 0 var(--gap-md);
  animation: fadeSlideDown var(--dur-slow) var(--ease) both;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.logo-mark {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 0 20px var(--accent-glow);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.site-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-subtitle {
  font-size: 0.8rem;
  color: var(--text-sub);
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.header-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(74, 158, 255, 0.08);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 100px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse 2s ease-in-out infinite;
}

.badge-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--accent);
  letter-spacing: 0.02em;
}

/* ── Cards ───────────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  animation: fadeSlideUp var(--dur-slow) var(--ease) both;
  transition: border-color var(--dur-base) var(--ease);
}

.card:hover {
  border-color: var(--border-hover);
}

/* ── API Key Section ─────────────────────────────────────── */
.apikey-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
  padding: var(--gap-md) var(--gap-lg);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  border-radius: var(--radius-lg);
  transition: background var(--dur-fast);
}

.apikey-toggle:hover {
  background: rgba(255,255,255,0.03);
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.apikey-status {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(240, 104, 120, 0.15);
  color: var(--error);
  border: 1px solid rgba(240, 104, 120, 0.3);
  transition: all var(--dur-base);
}

.apikey-status[data-saved="true"] {
  background: rgba(62, 207, 142, 0.12);
  color: var(--success);
  border-color: rgba(62, 207, 142, 0.3);
}

.toggle-chevron {
  color: var(--text-muted);
  transition: transform var(--dur-base) var(--ease);
  flex-shrink: 0;
}

.apikey-toggle[aria-expanded="true"] .toggle-chevron {
  transform: rotate(180deg);
}

.apikey-body {
  padding: 0 var(--gap-lg) var(--gap-lg);
  border-top: 1px solid var(--border);
  animation: fadeSlideDown var(--dur-base) var(--ease) both;
}

.apikey-help {
  font-size: 0.82rem;
  color: var(--text-sub);
  margin: var(--gap-md) 0 var(--gap-sm);
}

.apikey-help a {
  color: var(--accent);
  text-decoration: none;
}

.apikey-help a:hover {
  text-decoration: underline;
}

.apikey-input-row {
  display: flex;
  gap: var(--gap-sm);
  align-items: stretch;
}

.input-wrapper {
  flex: 1;
  position: relative;
  min-width: 0;
}

.apikey-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 0.875rem;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
  outline: none;
}

.apikey-input::placeholder {
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
}

.apikey-input:focus {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-eye-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color var(--dur-fast);
}

.input-eye-btn:hover { color: var(--text-sub); }

.apikey-warning {
  font-size: 0.75rem;
  color: var(--warning);
  margin-top: var(--gap-sm);
  opacity: 0.8;
}

/* ── Input Section ───────────────────────────────────────── */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding: var(--gap-lg);
  animation-delay: 80ms;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}

.field-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-sub);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.field-required {
  font-size: 0.65rem;
  padding: 1px 6px;
  background: rgba(74, 158, 255, 0.12);
  color: var(--accent);
  border-radius: 4px;
  letter-spacing: 0.02em;
  text-transform: none;
}

.field-optional {
  font-size: 0.65rem;
  padding: 1px 6px;
  background: rgba(122, 147, 184, 0.12);
  color: var(--text-sub);
  border-radius: 4px;
  letter-spacing: 0.02em;
  text-transform: none;
}

.text-input {
  padding: 0.7rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
  outline: none;
  width: 100%;
}

.text-input::placeholder { color: var(--text-muted); }

.text-input:focus {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* ── Drop Zone ───────────────────────────────────────────── */
.drop-zone {
  position: relative;
  border: 1.5px dashed var(--border-hover);
  border-radius: var(--radius-md);
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color var(--dur-base) var(--ease),
    background var(--dur-base) var(--ease),
    box-shadow var(--dur-base) var(--ease);
  overflow: hidden;
}

.drop-zone:hover,
.drop-zone:focus-visible {
  border-color: var(--accent);
  background: var(--accent-glow);
  box-shadow: 0 0 24px var(--accent-glow);
  outline: none;
}

.drop-zone.drag-over {
  border-color: var(--accent);
  background: rgba(74, 158, 255, 0.1);
  box-shadow: 0 0 40px var(--accent-glow);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: rgba(62, 207, 142, 0.4);
  background: rgba(62, 207, 142, 0.05);
}

.file-input-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.drop-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--gap-xl);
  pointer-events: none;
}

.drop-icon {
  margin-bottom: var(--gap-xs);
  transition: transform var(--dur-base) var(--ease);
}

.drop-zone:hover .drop-icon {
  transform: translateY(-4px);
}

.drop-main {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
}

.drop-sub {
  font-size: 0.82rem;
  color: var(--text-sub);
}

.drop-link {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.drop-selected {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: var(--gap-lg);
  width: 100%;
}

.file-info-icon {
  flex-shrink: 0;
  color: var(--success);
}

.file-info-text {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-sub);
  margin-top: 2px;
}

.file-remove-btn {
  flex-shrink: 0;
  background: none;
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all var(--dur-fast);
}

.file-remove-btn:hover {
  border-color: var(--error);
  color: var(--error);
  background: rgba(240, 104, 120, 0.1);
}

.drop-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--gap-xs);
  letter-spacing: 0.01em;
}

.field-error {
  font-size: 0.8rem;
  color: var(--error);
  margin-top: var(--gap-xs);
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background var(--dur-fast),
    border-color var(--dur-fast),
    color var(--dur-fast),
    box-shadow var(--dur-fast),
    transform var(--dur-fast);
  white-space: nowrap;
  text-decoration: none;
  line-height: 1;
}

.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

.btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 2px 16px rgba(74, 158, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #6aaeff;
  box-shadow: 0 4px 24px rgba(74, 158, 255, 0.5);
}

.btn-secondary {
  background: rgba(74, 158, 255, 0.1);
  color: var(--accent);
  border-color: rgba(74, 158, 255, 0.25);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.18);
  border-color: var(--accent-dim);
}

.btn-ghost {
  background: none;
  color: var(--text-sub);
  border-color: var(--border);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border-color: var(--border-hover);
}

/* ── Analyze Button ──────────────────────────────────────── */
.btn-analyze {
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  animation: fadeSlideUp var(--dur-slow) var(--ease) both;
  animation-delay: 160ms;
}

.btn-icon { flex-shrink: 0; }

.btn-loader {
  display: none;
}

.btn-analyze.loading .btn-icon,
.btn-analyze.loading .btn-text { display: none; }

.btn-analyze.loading .btn-loader {
  display: flex;
  align-items: center;
}

.btn-analyze.loading .btn-loader::after {
  content: "解析中…";
  margin-left: 8px;
  font-size: 0.95rem;
}

.spinner {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

/* ── Progress Steps ──────────────────────────────────────── */
.progress-steps {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  padding: var(--gap-md) var(--gap-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  animation: fadeSlideUp var(--dur-base) var(--ease) both;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  opacity: 0.4;
  transition: opacity var(--dur-base);
}

.progress-step[data-status="active"] { opacity: 1; }
.progress-step[data-status="done"]   { opacity: 0.7; }

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
  transition: background var(--dur-base);
}

.progress-step[data-status="active"] .step-dot {
  background: var(--accent);
  animation: pulse 1s ease-in-out infinite;
}

.progress-step[data-status="done"] .step-dot {
  background: var(--success);
}

.step-label {
  font-size: 0.82rem;
  color: var(--text-sub);
}

.progress-step[data-status="active"] .step-label {
  color: var(--text);
}

/* ── Error Banner ────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
  padding: var(--gap-md) var(--gap-lg);
  background: rgba(240, 104, 120, 0.08);
  border: 1px solid rgba(240, 104, 120, 0.3);
  border-radius: var(--radius-md);
  animation: fadeSlideUp var(--dur-base) var(--ease) both;
}

.error-icon { color: var(--error); flex-shrink: 0; margin-top: 1px; }
.error-message { flex: 1; font-size: 0.85rem; color: var(--error); }
.error-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--error);
  opacity: 0.6;
  padding: 2px;
  display: flex;
  flex-shrink: 0;
}
.error-dismiss:hover { opacity: 1; }

/* ── Results Section ─────────────────────────────────────── */
.results-section {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  animation: fadeSlideUp var(--dur-slow) var(--ease) both;
}

.results-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gap-md);
}

.results-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

.results-meta {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ── Result Cards ────────────────────────────────────────── */
.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--dur-base);
}

.result-card:hover { border-color: var(--border-hover); }

.result-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-sm) var(--gap-lg);
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.01);
}

.result-card-title-group {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.result-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
}

.result-card-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-sub);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: var(--font-sans);
  transition: all var(--dur-fast);
}

.copy-btn:hover {
  border-color: var(--accent-dim);
  color: var(--accent);
  background: var(--accent-glow);
}

.copy-btn.copied {
  border-color: rgba(62, 207, 142, 0.4);
  color: var(--success);
  background: rgba(62, 207, 142, 0.1);
}

.result-body {
  padding: var(--gap-lg);
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}

/* スケルトンローダー */
.result-body.loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-body.loading::before,
.result-body.loading::after {
  content: '';
  display: block;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--border) 25%, var(--border-hover) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.result-body.loading::before { width: 100%; }
.result-body.loading::after  { width: 70%; }

.summary-body { line-height: 2; }

.keypoints-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  padding: var(--gap-lg);
}

.keypoints-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text);
}

.keypoints-list li::before {
  content: '';
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 0.6em;
}

/* ── Results Actions ─────────────────────────────────────── */
.results-actions {
  display: flex;
  gap: var(--gap-sm);
  padding-top: var(--gap-xs);
}

/* ── Footer ──────────────────────────────────────────────── */
.site-footer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: var(--gap-md) 0;
  border-top: 1px solid var(--border);
  margin-top: var(--gap-sm);
}

.site-footer a {
  color: var(--text-sub);
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--accent);
}

/* ── Icon utility ────────────────────────────────────────── */
.icon { display: inline-flex; align-items: center; }

/* ── Animations ──────────────────────────────────────────── */
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Focus Visible ───────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ── Utility ─────────────────────────────────────────────── */
[hidden] { display: none !important; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 600px) {
  :root {
    --gap-lg: 1.125rem;
    --gap-xl: 1.5rem;
    --gap-2xl: 2rem;
  }

  .site-title { font-size: 1.25rem; }

  .header-badge .badge-label {
    display: none;
  }

  .apikey-input-row {
    flex-wrap: wrap;
  }

  .apikey-input-row .input-wrapper {
    flex: 1 1 100%;
  }

  .drop-zone { min-height: 130px; }

  .results-actions {
    flex-direction: column;
  }

  .results-actions .btn {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .apikey-toggle { padding: var(--gap-sm) var(--gap-md); }
  .input-section  { padding: var(--gap-md); }
}
