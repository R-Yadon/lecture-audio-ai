# API_NOTES.md — Gemini API 仕様メモ（音声処理）

> **参照元:** https://ai.google.dev/gemini-api/docs/audio  
> **最終確認日:** 2026-05-17（公式ドキュメント Last updated: 2026-03-25）  
> **対象:** フロントエンド（HTML/JS）からの直接呼び出し

---

## 1. 使用モデル

| 項目 | 内容 |
|------|------|
| 推奨モデル（安定版） | `gemini-2.5-flash` |
| 旧モデル（非推奨） | `gemini-1.5-flash` ← **ご要件記載のモデルは旧世代のため変更推奨** |
| プレビュー版 | `gemini-3-flash-preview`（公式サンプルに記載。実験的） |

> **なぜ変更するのか？**  
> `gemini-1.5-flash` は2024年世代のモデルで、現在は `gemini-2.5-flash` が  
> コスト・性能のバランスに優れた標準モデルです。  
> モデル名は `gemini.js` の定数として定義するため、後から1行変更するだけで切り替え可能にします。

---

## 2. 音声ファイルの制限

### 2.1 対応フォーマット

| 形式 | MIMEタイプ | 備考 |
|------|-----------|------|
| MP3 | `audio/mp3` | 最も一般的。推奨 |
| WAV | `audio/wav` | 非圧縮。ファイルサイズ大 |
| AAC | `audio/aac` | iPhone録音のデフォルト |
| FLAC | `audio/flac` | 可逆圧縮。高音質 |
| OGG Vorbis | `audio/ogg` | オープンソース形式 |
| AIFF | `audio/aiff` | Mac系の形式 |

### 2.2 サイズ・長さの制限

| 制限項目 | 上限値 | 備考 |
|---------|-------|------|
| インライン送信のリクエスト全体サイズ | **20 MB** | プロンプト文字列含む合計 |
| Files API使用時の音声長 | **9.5時間** | 単一プロンプト内の合計 |
| トークン換算レート | 1秒 = 32トークン | 1分の音声 ≒ 1,920トークン |
| サンプリングレート（内部変換） | 16 Kbps | Geminiが自動でダウンサンプリング |
| チャンネル数 | 自動モノラル変換 | 複数チャンネルは自動合成 |

### 2.3 実装上の判断ロジック

```
ファイルサイズ < 約18MB（安全マージン）
  → インライン送信（base64エンコード）を使用
  
ファイルサイズ ≥ 約18MB
  → Files API でアップロードしてからURLで参照
```

> 本アプリのフェーズ1では **インライン送信のみ実装**し、  
> 20MB超のファイルはエラーメッセージで案内する設計とします。

---

## 3. APIエンドポイント

### 3.1 テキスト生成（メイン処理）

```
POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent
```

| パラメータ | 値 |
|-----------|---|
| `{MODEL}` | `gemini-2.5-flash` |
| 認証方式 | URLクエリパラメータ `?key=YOUR_API_KEY` |
| Content-Type | `application/json` |

**リクエスト例（JavaScript fetch）:**

```javascript
const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          { text: "（プロンプト文字列）" },
          {
            inlineData: {
              mimeType: "audio/mp3",   // ← ファイルの種類
              data: base64AudioString  // ← base64エンコードされた音声データ
            }
          }
        ]
      }
    ]
  })
});
```

**レスポンス構造（成功時）:**

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "モデルの回答テキスト"
          }
        ]
      }
    }
  ]
}
```

取得方法: `data.candidates[0].content.parts[0].text`

### 3.2 Files API（大容量ファイル用・フェーズ2以降）

```
POST https://generativelanguage.googleapis.com/upload/v1beta/files
```

アップロード後に返ってくる `file.uri` を `generateContent` の `file_data.file_uri` として使用。  
（フェーズ1では実装しない）

---

## 4. 音声データのBase64変換（フロントエンド実装）

```javascript
// FileオブジェクトをBase64文字列に変換する関数
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // "data:audio/mp3;base64,XXXXXX" → "XXXXXX" のみ抽出
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 5. プロンプト設計

本アプリでは1回のAPI呼び出しで3つの結果をまとめて取得します。

```javascript
const PROMPT = `
以下の講義音声を分析し、必ず下記のJSON形式のみで回答してください。

{
  "transcription": "（音声の文字起こし全文）",
  "summary": "（講義内容の3行要約。改行で区切る）",
  "keyPoints": [
    "（重要ポイント1）",
    "（重要ポイント2）",
    "（重要ポイント3〜10個程度）"
  ]
}

注意:
- 日本語で回答してください
- JSONのみ出力し、前後に余計な文章を入れないでください
- 文字起こしは省略せず正確に書き起こしてください
`;
```

> **JSONで受け取る理由:** テキストをそのまま受け取ると  
> 文字起こし・要約・要点の境界がわかりにくいため、  
> 構造化データで受け取り、UIの各エリアに分けて表示します。

---

## 6. エラーハンドリング

| HTTPステータス | 原因 | ユーザーへの表示メッセージ |
|--------------|------|--------------------------|
| 400 | リクエスト不正（形式エラーなど） | 「ファイル形式またはリクエストに問題があります」 |
| 403 | APIキー無効 | 「APIキーが無効です。設定を確認してください」 |
| 429 | レート制限超過 | 「リクエストが多すぎます。しばらく待ってから再試行してください」 |
| 500 | Googleサーバーエラー | 「Googleサーバーでエラーが発生しました。時間をおいて再試行してください」 |
| ネットワークエラー | オフライン等 | 「ネットワーク接続を確認してください」 |
| JSONパースエラー | モデルが非JSON回答 | 「解析結果の読み込みに失敗しました。再試行してください」 |

---

## 7. APIキーの取得方法

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Get API key」→「Create API key」をクリック
4. 表示されたキーをコピー（`AIza...` から始まる文字列）
5. アプリのAPIキー設定欄に貼り付けて「保存」

> **無料枠（2026年5月時点の参考情報）**  
> Gemini 2.5 Flash は1日あたり一定回数まで無料で利用可能です。  
> 最新の制限は [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing) を確認してください。

---

## 8. フロントエンドから呼び出す際の注意点

| 注意点 | 内容 |
|--------|------|
| CORS | Gemini APIはブラウザ直接呼び出し対応済み（問題なし） |
| APIキー露出 | DevTools Networkタブに表示される。共有PCに注意 |
| タイムアウト | 長い音声（30分〜）はレスポンスに時間がかかる場合あり |
| 文字起こし精度 | リアルタイム文字起こし非対応。録音後のファイル処理のみ |

---

## 9. 実装チェックリスト（フェーズ2へのインプット）

- [ ] `gemini.js`: APIキーをパラメータとして受け取る関数を実装
- [ ] `app.js`: APIキーをlocalStorageに保存・読込・削除する処理
- [ ] `app.js`: ファイル選択時にMIMEタイプ・サイズをバリデーション
- [ ] `app.js`: FileオブジェクトをBase64に変換してAPIへ送信
- [ ] `app.js`: JSON レスポンスをパースして各UIエリアに表示
- [ ] `index.html`: ローディング表示・エラー表示の領域を用意
- [ ] `style.css`: モバイル対応レイアウト
