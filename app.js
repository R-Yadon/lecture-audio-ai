/**
 * app.js — メインアプリケーションロジック
 *
 * 責務:
 *   - APIキーの管理（localStorage）
 *   - UI操作イベントのハンドリング
 *   - ファイルバリデーション
 *   - gemini.js を呼び出して結果を表示
 *   - コピーボタン処理
 *
 * ※ フェーズ2: ダミー処理で動作確認
 * ※ フェーズ3: gemini.js の本実装が入ると自動的に繋がる
 */

import {
  analyzeAudio,
  detectMimeType,
  SUPPORTED_MIME_TYPES,
  MAX_INLINE_SIZE_BYTES,
} from "./gemini.js";

// ══════════════════════════════════════════
//  定数
// ══════════════════════════════════════════

const STORAGE_KEY = "lecture_notes_api_key";

// ══════════════════════════════════════════
//  DOM 参照
// ══════════════════════════════════════════

const $ = (id) => document.getElementById(id);

// APIキー
const apikeyToggle            = $("apikey-toggle");
const apikeyBody              = $("apikey-body");
const apikeyInput             = $("apikey-input");
const apikeyStatusBadge       = $("apikey-status-badge");
const apikeySaveBtn           = $("apikey-save-btn");
const apikeyDeleteBtn         = $("apikey-delete-btn");
const apikeyToggleVisibility  = $("apikey-toggle-visibility");

// 入力
const lectureName   = $("lecture-name");
const dropZone      = $("drop-zone");
const fileInput     = $("file-input");
const dropIdle      = $("drop-idle");
const dropSelected  = $("drop-selected");
const fileNameDisp  = $("file-name-display");
const fileMetaDisp  = $("file-meta-display");
const fileRemoveBtn = $("file-remove-btn");
const fileError     = $("file-error");

// アクション
const analyzeBtn    = $("analyze-btn");

// 進捗
const progressSteps = $("progress-steps");
const stepUpload    = $("step-upload");
const stepTranscrib = $("step-transcribe");
const stepSummarize = $("step-summarize");

// エラー
const errorBanner   = $("error-banner");
const errorMessage  = $("error-message");
const errorDismiss  = $("error-dismiss");

// 結果
const resultsSection      = $("results-section");
const resultsMeta         = $("results-meta");
const transcriptionContent = $("transcription-content");
const summaryContent      = $("summary-content");
const keypointsContent    = $("keypoints-content");
const copyAllBtn          = $("copy-all-btn");
const resetBtn            = $("reset-btn");

// ══════════════════════════════════════════
//  状態
// ══════════════════════════════════════════

/** @type {File|null} */
let selectedFile = null;

let isAnalyzing = false;

// ══════════════════════════════════════════
//  初期化
// ══════════════════════════════════════════

function init() {
  loadApiKey();
  bindApiKeyEvents();
  bindDropZoneEvents();
  bindAnalyzeEvents();
  bindResultEvents();
}

// ══════════════════════════════════════════
//  APIキー管理
// ══════════════════════════════════════════

function loadApiKey() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    apikeyInput.value = saved;
    setApiKeyStatus(true);
  } else {
    setApiKeyStatus(false);
  }
}

function saveApiKey() {
  const key = apikeyInput.value.trim();
  if (!key) {
    flashError("APIキーを入力してください");
    return;
  }
  if (!key.startsWith("AIza")) {
    flashError("APIキーが正しくありません（「AIza」で始まる文字列を入力してください）");
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  setApiKeyStatus(true);
  showToast("APIキーを保存しました");
  // パネルを閉じる
  setApikeyPanelOpen(false);
  updateAnalyzeButtonState();
}

function deleteApiKey() {
  localStorage.removeItem(STORAGE_KEY);
  apikeyInput.value = "";
  setApiKeyStatus(false);
  updateAnalyzeButtonState();
  showToast("APIキーを削除しました");
}

/** @param {boolean} saved */
function setApiKeyStatus(saved) {
  apikeyStatusBadge.dataset.saved = String(saved);
  apikeyStatusBadge.textContent = saved ? "設定済み" : "未設定";
}

/** @param {boolean} open */
function setApikeyPanelOpen(open) {
  apikeyToggle.setAttribute("aria-expanded", String(open));
  apikeyBody.hidden = !open;
}

function bindApiKeyEvents() {
  apikeyToggle.addEventListener("click", () => {
    const isOpen = apikeyToggle.getAttribute("aria-expanded") === "true";
    setApikeyPanelOpen(!isOpen);
  });

  apikeySaveBtn.addEventListener("click", saveApiKey);
  apikeyDeleteBtn.addEventListener("click", deleteApiKey);

  apikeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveApiKey();
  });

  // パスワード表示トグル
  apikeyToggleVisibility.addEventListener("click", () => {
    const isPassword = apikeyInput.type === "password";
    apikeyInput.type = isPassword ? "text" : "password";
    apikeyToggleVisibility.setAttribute("aria-label", isPassword ? "APIキーを非表示" : "APIキーを表示");
  });
}

// ══════════════════════════════════════════
//  ドロップゾーン & ファイル選択
// ══════════════════════════════════════════

function bindDropZoneEvents() {
  // クリックでファイル選択
  dropZone.addEventListener("click", (e) => {
    // ファイル削除ボタンのクリックは除外（stopPropagation で到達しないが念のため）
    if (e.target.closest("#file-remove-btn")) return;
    // 同じファイルを連続選択しても change が発火するようにリセット
    fileInput.value = "";
    fileInput.click();
  });

  // キーボードアクセシビリティ
  dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.value = "";
      fileInput.click();
    }
  });

  // ファイル選択
  fileInput.addEventListener("change", (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  });

  // ファイル削除ボタン
  // stopPropagation で drop-zone の click イベントに伝播させない
  fileRemoveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearFile();
  });

  // ドラッグ＆ドロップ
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", (e) => {
    // ゾーンの外に出た場合のみ
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove("drag-over");
    }
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  });
}

/**
 * ファイルを受け取り、バリデーション → 表示更新
 * @param {File} file
 */
function handleFileSelect(file) {
  const mimeType = detectMimeType(file);

  // バリデーション: ファイル形式
  if (!mimeType) {
    showFileError(
      `非対応の形式です。対応形式: ${Object.values(SUPPORTED_MIME_TYPES).join(" / ")}`
    );
    return;
  }

  // バリデーション: ファイルサイズ
  if (file.size > MAX_INLINE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    showFileError(
      `ファイルが大きすぎます（${sizeMB} MB）。現在のバージョンは18 MB以下に対応しています。`
    );
    return;
  }

  // バリデーション: ファイルサイズが0
  if (file.size === 0) {
    showFileError("ファイルが空です。別のファイルを選んでください。");
    return;
  }

  // OK
  clearFileError();
  selectedFile = file;
  showFileSelected(file);
  updateAnalyzeButtonState();
}

function showFileSelected(file) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const ext = file.name.split(".").pop().toUpperCase();

  fileNameDisp.textContent = file.name;
  fileMetaDisp.textContent = `${ext} · ${sizeMB} MB`;

  dropIdle.hidden     = true;
  dropSelected.hidden = false;
  dropZone.classList.add("has-file");
}

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  dropIdle.hidden     = false;
  dropSelected.hidden = true;
  dropZone.classList.remove("has-file");
  clearFileError();
  updateAnalyzeButtonState();
}

function showFileError(msg) {
  fileError.textContent = msg;
  fileError.hidden = false;
}

function clearFileError() {
  fileError.textContent = "";
  fileError.hidden = true;
}

// ══════════════════════════════════════════
//  解析ボタン
// ══════════════════════════════════════════

function updateAnalyzeButtonState() {
  const hasKey  = !!localStorage.getItem(STORAGE_KEY);
  const hasFile = !!selectedFile;
  analyzeBtn.disabled = !(hasKey && hasFile) || isAnalyzing;
}

function bindAnalyzeEvents() {
  analyzeBtn.addEventListener("click", startAnalysis);
}

async function startAnalysis() {
  if (isAnalyzing || !selectedFile) return;

  const apiKey = localStorage.getItem(STORAGE_KEY);
  if (!apiKey) {
    flashError("APIキーが設定されていません。設定パネルから入力してください。");
    return;
  }

  isAnalyzing = true;
  hideError();
  hideResults();
  setAnalyzingUI(true);

  // ── 進捗ステップのアニメーション ──
  showProgressSteps();
  await setStep(stepUpload, "active");

  try {
    // gemini.js の analyzeAudio を呼ぶ
    // フェーズ2: ダミー実装が呼ばれる
    // フェーズ3: 本実装が自動的に動く
    const startTime = Date.now();

    // ステップ1 → ステップ2 の切り替えをタイミングよく
    setTimeout(() => setStep(stepUpload, "done").then(() => setStep(stepTranscrib, "active")), 800);
    setTimeout(() => setStep(stepTranscrib, "done").then(() => setStep(stepSummarize, "active")), 2300);

    const result = await analyzeAudio(
      selectedFile,
      apiKey,
      lectureName.value.trim()
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    await setStep(stepSummarize, "done");

    // 結果を表示
    showResults(result, elapsed);

  } catch (err) {
    // エラー表示
    const msg = err.message || "予期しないエラーが発生しました。再試行してください。";
    showError(msg);
    setAllStepsIdle();
  } finally {
    isAnalyzing = false;
    setAnalyzingUI(false);
    hideProgressSteps();
    updateAnalyzeButtonState();
  }
}

// ══════════════════════════════════════════
//  進捗ステップ UI
// ══════════════════════════════════════════

function showProgressSteps() {
  progressSteps.hidden = false;
  setAllStepsIdle();
}

function hideProgressSteps() {
  // 少し遅延してから非表示（完了アニメを見せるため）
  setTimeout(() => { progressSteps.hidden = true; }, 600);
}

function setAllStepsIdle() {
  [stepUpload, stepTranscrib, stepSummarize].forEach((s) => {
    s.dataset.status = "idle";
  });
}

/**
 * @param {HTMLElement} stepEl
 * @param {"idle"|"active"|"done"} status
 */
function setStep(stepEl, status) {
  stepEl.dataset.status = status;
  return Promise.resolve();
}

// ══════════════════════════════════════════
//  結果表示
// ══════════════════════════════════════════

/**
 * @param {import('./gemini.js').AnalyzeResult} result
 * @param {string} elapsedSec
 */
function showResults(result, elapsedSec) {
  resultsSection.hidden = false;

  // メタ情報
  const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  resultsMeta.textContent = `${now} · ${elapsedSec}秒`;

  // 文字起こし
  transcriptionContent.textContent = result.transcription;
  transcriptionContent.classList.remove("loading");

  // 要約
  summaryContent.textContent = result.summary;
  summaryContent.classList.remove("loading");

  // 要点リスト
  keypointsContent.innerHTML = "";
  (result.keyPoints || []).forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    keypointsContent.appendChild(li);
  });
  keypointsContent.classList.remove("loading");

  // スムーズスクロール
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideResults() {
  resultsSection.hidden = true;
  transcriptionContent.textContent = "";
  summaryContent.textContent = "";
  keypointsContent.innerHTML = "";
}

// ══════════════════════════════════════════
//  ローディング UI
// ══════════════════════════════════════════

function setAnalyzingUI(loading) {
  analyzeBtn.classList.toggle("loading", loading);
  analyzeBtn.disabled = loading;
}

// ══════════════════════════════════════════
//  エラー表示
// ══════════════════════════════════════════

function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.hidden = true;
  errorMessage.textContent = "";
}

function flashError(msg) {
  showError(msg);
  setTimeout(hideError, 5000);
}

// ══════════════════════════════════════════
//  コピー & リセット
// ══════════════════════════════════════════

function bindResultEvents() {
  // 各カードのコピーボタン
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.dataset.target;
      const targetEl = $(targetId);
      if (!targetEl) return;

      let text;
      if (targetEl.tagName === "UL") {
        // keypoints リスト
        text = Array.from(targetEl.querySelectorAll("li"))
          .map((li) => `・${li.textContent}`)
          .join("\n");
      } else {
        text = targetEl.textContent;
      }

      await copyToClipboard(text, btn);
    });
  });

  // すべてコピー
  copyAllBtn.addEventListener("click", async () => {
    const lecture = lectureName.value.trim();
    const title   = lecture ? `# ${lecture}\n\n` : "";
    const parts   = [
      `${title}## 文字起こし\n\n${transcriptionContent.textContent}`,
      `## 3行要約\n\n${summaryContent.textContent}`,
      `## 重要ポイント\n\n` +
        Array.from(keypointsContent.querySelectorAll("li"))
          .map((li) => `・${li.textContent}`)
          .join("\n"),
    ];
    await copyToClipboard(parts.join("\n\n---\n\n"), copyAllBtn);
  });

  // エラーバナーを閉じる
  errorDismiss.addEventListener("click", hideError);

  // リセット
  resetBtn.addEventListener("click", () => {
    clearFile();
    hideResults();
    hideError();
    hideProgressSteps();
    lectureName.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/**
 * テキストをクリップボードにコピーし、ボタンを一時的に変化させる
 * @param {string}      text
 * @param {HTMLElement} btn
 */
async function copyToClipboard(text, btn) {
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
    const labelEl = btn.querySelector(".copy-label");
    const prev = labelEl?.textContent || "";
    btn.classList.add("copied");
    if (labelEl) labelEl.textContent = "コピー済み";
    setTimeout(() => {
      btn.classList.remove("copied");
      if (labelEl) labelEl.textContent = prev;
    }, 2000);
  } catch {
    // clipboard API 非対応ブラウザのフォールバック
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

// ══════════════════════════════════════════
//  トースト通知（軽量）
// ══════════════════════════════════════════

function showToast(msg) {
  // 既存トーストがあれば削除
  document.querySelector(".toast")?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: #1e2d4a;
    color: #d8e4f0;
    border: 1px solid #2a4070;
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 0.82rem;
    font-family: 'Noto Sans JP', sans-serif;
    opacity: 0;
    transition: all 250ms cubic-bezier(0.16,1,0.3,1);
    z-index: 1000;
    pointer-events: none;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  // フェードイン
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  // 2秒後にフェードアウト＆削除
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ── 起動 ──
init();
