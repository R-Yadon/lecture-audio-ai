/**
 * gemini.js — Gemini API 呼び出しモジュール（フェーズ3: 本実装）
 *
 * 変更履歴:
 *   Phase 2 (2026-05-17): ダミー実装
 *   Phase 3 (2026-05-17): Gemini API 本実装に置き換え
 *
 * 参照: https://ai.google.dev/gemini-api/docs/audio
 */

// ══════════════════════════════════════════
//  定数
// ══════════════════════════════════════════

/** 使用するGeminiモデル名 — ここを変えるだけでモデル切り替え可能 */
export const GEMINI_MODEL = "gemini-2.5-flash";

/** APIのベースURL */
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** リクエストタイムアウト（ms）— 長い音声ファイルに対応するため5分 */
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

/** 対応音声MIMEタイプ → 公式ドキュメントに基づく */
export const SUPPORTED_MIME_TYPES = {
  "audio/mp3":  "MP3",
  "audio/mpeg": "MP3",
  "audio/wav":  "WAV",
  "audio/wave": "WAV",
  "audio/aac":  "AAC",
  "audio/flac": "FLAC",
  "audio/ogg":  "OGG",
  "audio/aiff": "AIFF",
};

/** 対応拡張子 → MIMEタイプ推定に使用 */
export const SUPPORTED_EXTENSIONS = {
  ".mp3":  "audio/mp3",
  ".wav":  "audio/wav",
  ".aac":  "audio/aac",
  ".flac": "audio/flac",
  ".ogg":  "audio/ogg",
  ".aif":  "audio/aiff",
  ".aiff": "audio/aiff",
};

/** インライン送信の上限（bytes）— 20MBに安全マージンを加味 */
export const MAX_INLINE_SIZE_BYTES = 18 * 1024 * 1024; // 18 MB

// ══════════════════════════════════════════
//  型定義（JSDoc）
// ══════════════════════════════════════════

/**
 * @typedef {Object} AnalyzeResult
 * @property {string}   transcription - 文字起こしテキスト
 * @property {string}   summary       - 3行要約テキスト（改行区切り）
 * @property {string[]} keyPoints     - 重要ポイントの配列
 */

/**
 * @typedef {Object} GeminiError
 * @property {number} status  - HTTPステータスコード（0=ネットワーク/タイムアウトエラー）
 * @property {string} code    - エラーコード文字列
 * @property {string} message - ユーザー向け日本語メッセージ
 */

// ══════════════════════════════════════════
//  公開ユーティリティ
// ══════════════════════════════════════════

/**
 * FileオブジェクトをBase64文字列に変換する
 * @param {File} file
 * @returns {Promise<string>} "data:...;base64," プレフィックスを除いた文字列
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

/**
 * ファイルのMIMEタイプを特定する（file.type が空の場合は拡張子から推定）
 * @param {File} file
 * @returns {string|null} MIMEタイプ、または null（非対応形式）
 */
export function detectMimeType(file) {
  if (file.type && SUPPORTED_MIME_TYPES[file.type]) return file.type;
  const ext = "." + file.name.split(".").pop().toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] || null;
}

// ══════════════════════════════════════════
//  内部ユーティリティ
// ══════════════════════════════════════════

/**
 * HTTPステータスコードをユーザー向け日本語メッセージに変換する
 * @param {number} status
 * @returns {string}
 */
function _httpStatusToMessage(status) {
  // 401 / 403 はどちらも「APIキーの問題」として統一表示
  // （401: 認証なし、403: 権限なし。ユーザーには同じ対処法）
  if (status === 401 || status === 403) {
    return "APIキーが無効または権限がありません。設定パネルでキーを確認してください。";
  }
  const messages = {
    400: "リクエストに問題があります。音声ファイルの形式やサイズを確認してください。",
    429: "リクエストが多すぎます（レート制限）。しばらく待ってから再試行してください。",
    500: "Googleサーバー内部エラーが発生しました。時間をおいて再試行してください。",
    503: "Googleサーバーが一時的に利用できません。時間をおいて再試行してください。",
  };
  return messages[status] || `APIエラーが発生しました（HTTP ${status}）。`;
}

/**
 * finishReason の異常値に対応するエラーメッセージを返す
 * @param {string} reason
 * @returns {string|null} エラーメッセージ。正常終了（STOP/null）の場合は null
 */
function _finishReasonToError(reason) {
  // "STOP" または未設定は正常終了
  if (!reason || reason === "STOP") return null;

  const messages = {
    SAFETY:             "安全フィルターにより応答がブロックされました。音声の内容を確認してください。",
    RECITATION:         "著作権保護コンテンツが検出され、処理が中断されました。",
    MAX_TOKENS:         "応答が長すぎて途中で途切れました。より短い音声ファイルで再試行してください。",
    PROHIBITED_CONTENT: "禁止コンテンツとして検出され、処理が中断されました。",
    SPII:               "個人識別情報（SPII）の検出により処理が中断されました。",
    OTHER:              "不明な理由で処理が中断されました。再試行してください。",
  };
  return messages[reason] || `処理が予期せず終了しました（finishReason: ${reason}）。`;
}

/**
 * モデルへ渡すプロンプトを生成する
 * @param {string} lectureName
 * @returns {string}
 */
function _buildPrompt(lectureName) {
  const titleLine = lectureName ? `講義名: 「${lectureName}」` : "講義名: 不明";
  return `
あなたは大学講義の音声を分析する専門AIです。
添付された講義音声ファイルを正確に分析し、以下の指示に従ってJSON形式のみで回答してください。

${titleLine}

【出力形式】
以下のJSONキーを含む有効なJSONオブジェクトのみを出力してください。
前後の説明文やマークダウンコードブロック（\`\`\`json など）は絶対に含めないでください。

{
  "transcription": "音声の文字起こし全文。話し言葉をそのまま書き起こすこと。省略しないこと。",
  "summary": "1文目：講義全体の主題。\\n2文目：最も重要な概念または議論。\\n3文目：結論や次回への展望。",
  "keyPoints": [
    "重要ポイント1（具体的・簡潔に）",
    "重要ポイント2（具体的・簡潔に）",
    "（5〜10項目を目安に列挙）"
  ]
}

【各フィールドの注意事項】
- transcription: 音声を省略なく正確に書き起こすこと。無音・雑音は除いてよい。
- summary: 必ず改行文字 \\n で区切られた3文で構成すること。1文が長くなりすぎないよう注意。
- keyPoints: 各要素は1文で完結させること。5〜10項目が目標。

【言語】
すべての出力を日本語で行うこと。音声が日本語以外の場合も、日本語に翻訳して出力すること。
`.trim();
}

/**
 * APIレスポンスのテキストをJSONとしてパースする
 * モデルが指示に反してコードブロックを付けた場合もフォールバック対応する
 * @param {string} raw
 * @returns {object}
 */
function _parseJson(raw) {
  let text = raw.trim();
  // ```json ... ``` または ``` ... ``` ブロックを除去する（フォールバック）
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(text);
}

/**
 * パース済みオブジェクトから AnalyzeResult を安全に取り出す
 * フィールドの欠損・型違いでもクラッシュしないよう防御する
 * @param {object} parsed
 * @returns {AnalyzeResult}
 */
function _extractResult(parsed) {
  const transcription =
    typeof parsed.transcription === "string" ? parsed.transcription.trim() : "";

  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints
        .filter((item) => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim())
    : [];

  return { transcription, summary, keyPoints };
}

// ══════════════════════════════════════════
//  メイン関数（本実装）
// ══════════════════════════════════════════

/**
 * 音声ファイルを Gemini API で解析し、文字起こし・要約・要点を返す
 *
 * 処理フロー:
 *   Step 1 — MIMEタイプ検証
 *   Step 2 — Base64 エンコード
 *   Step 3 — POST /v1beta/models/gemini-2.5-flash:generateContent
 *             inlineData で音声を送信
 *             generationConfig.responseMimeType: "application/json" でJSON出力を強制
 *   Step 4 — HTTPステータス検証
 *   Step 5 — promptFeedback 確認（送信前ブロック検知）
 *   Step 6 — candidates 検証
 *   Step 7 — finishReason 確認（異常終了検知）
 *   Step 8 — テキスト抽出
 *   Step 9 — JSONパース
 *   Step 10 — 結果の正規化・返却
 *
 * @param {File}   audioFile     - 音声ファイル（File オブジェクト）
 * @param {string} apiKey        - Gemini APIキー
 * @param {string} [lectureName] - 講義名（省略可）
 * @returns {Promise<AnalyzeResult>}
 * @throws {GeminiError}
 */
export async function analyzeAudio(audioFile, apiKey, lectureName = "") {

  // ── Step 1: MIMEタイプの検証 ──────────────────────────────────
  const mimeType = detectMimeType(audioFile);
  if (!mimeType) {
    throw {
      status:  0,
      code:    "UNSUPPORTED_FORMAT",
      message: `非対応の音声形式です。対応形式: ${Object.values(SUPPORTED_MIME_TYPES).join(" / ")}`,
    };
  }

  // ── Step 2: Base64 エンコード ──────────────────────────────────
  let base64Audio;
  try {
    base64Audio = await fileToBase64(audioFile);
  } catch {
    throw {
      status:  0,
      code:    "READ_ERROR",
      message: "ファイルの読み込みに失敗しました。ファイルが壊れていないか確認してください。",
    };
  }

  // ── Step 3: APIリクエスト ──────────────────────────────────────

  // タイムアウト: 長い音声でも5分待つ
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const endpoint    = `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          // プロンプトを先に配置（Geminiのマルチモーダル推奨順序）
          { text: _buildPrompt(lectureName) },
          // 音声データをインライン送信
          { inlineData: { mimeType, data: base64Audio } },
        ],
      },
    ],
    generationConfig: {
      // ★ モデルレベルでJSON出力を強制する
      //    これにより ```json ``` などのマークダウンが付かず、パースが安定する
      responseMimeType: "application/json",
    },
  };

  let response;
  try {
    response = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(requestBody),
      signal:  controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw {
        status:  0,
        code:    "TIMEOUT",
        message: `リクエストがタイムアウトしました（上限${REQUEST_TIMEOUT_MS / 60000}分）。短いファイルで再試行するか、ファイルサイズを確認してください。`,
      };
    }
    throw {
      status:  0,
      code:    "NETWORK_ERROR",
      message: "ネットワークに接続できませんでした。インターネット接続を確認してください。",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  // ── Step 4: HTTPステータスの検証 ──────────────────────────────
  if (!response.ok) {
    throw {
      status:  response.status,
      code:    "HTTP_ERROR",
      message: _httpStatusToMessage(response.status),
    };
  }

  // ── Step 5: レスポンスJSONの取得 ──────────────────────────────
  let data;
  try {
    data = await response.json();
  } catch {
    throw {
      status:  0,
      code:    "RESPONSE_PARSE_ERROR",
      message: "APIからの応答を読み取れませんでした。再試行してください。",
    };
  }

  // ── Step 6: promptFeedback の確認 ─────────────────────────────
  // 音声がリクエスト送信前にブロックされた場合、candidates が空になる
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw {
      status:  0,
      code:    `BLOCKED_${blockReason}`,
      message: `コンテンツが安全フィルターによりブロックされました（理由: ${blockReason}）。`,
    };
  }

  // ── Step 7: candidates の存在確認 ─────────────────────────────
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    throw {
      status:  0,
      code:    "NO_CANDIDATES",
      message: "APIから有効な応答が返されませんでした。再試行してください。",
    };
  }

  // ── Step 8: finishReason の確認 ───────────────────────────────
  // STOP 以外は処理が途中で終わっている
  const finishError = _finishReasonToError(candidate.finishReason);
  if (finishError) {
    throw {
      status:  0,
      code:    `FINISH_${candidate.finishReason}`,
      message: finishError,
    };
  }

  // ── Step 9: テキスト抽出 ──────────────────────────────────────
  // responseMimeType: "application/json" 指定時は parts[0].text に JSON 文字列が入る
  const rawText = (candidate?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    throw {
      status:  0,
      code:    "EMPTY_RESPONSE",
      message: "AIから空の応答が返されました。別の音声ファイルで再試行してください。",
    };
  }

  // ── Step 10: JSONパース ───────────────────────────────────────
  let parsed;
  try {
    parsed = _parseJson(rawText);
  } catch {
    // パース失敗時: 生レスポンスをコンソールに出力してデバッグに役立てる
    console.error("[gemini.js] JSONパース失敗。生レスポンス:\n", rawText);
    throw {
      status:  0,
      code:    "JSON_PARSE_ERROR",
      message: "AIの応答を解析できませんでした。再試行してください（問題が続く場合はブラウザのコンソールを確認してください）。",
    };
  }

  // ── Step 11: 結果の正規化・返却 ──────────────────────────────
  return _extractResult(parsed);
}
