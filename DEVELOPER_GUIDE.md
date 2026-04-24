# TypingForEnjoyWorkStore Developer Guide

このファイルは、このツールを保守・拡張する開発者向けの説明です。

## 1. 概要

このアプリは、TypeScript と Python のコードタイピング練習用ブラウザアプリです。
実装は Vite + TypeScript の最小構成で、UI フレームワークは使っていません。

特徴:

- 1画面完結のコンパクトな UI
- TypeScript / Python を完全分離
- Easy / Normal の難易度切り替え
- 固定問題 + テンプレート式ランダム問題生成
- JIS キーボードに合わせた仮想キーボード表示
- 簡易 IntelliSense 候補表示と `Tab` 補完
- `localStorage` に履歴と設定を保存

## 2. 技術スタック

- TypeScript
- Vite
- プレーン DOM 操作
- プレーン CSS

依存はかなり少なく、主要ロジックは `src/app.ts` に集約されています。

## 3. ファイル構成

```text
.
├─ index.html
├─ package.json
├─ README.md
├─ DEVELOPER_GUIDE.md
└─ src
   ├─ main.ts
   ├─ app.ts
   ├─ style.css
   ├─ types.ts
   └─ data
      └─ snippets.ts
```

役割:

- `src/main.ts`
  - エントリポイントです。`#app` を取得して `TypingForEnjoyApp` を起動します。
- `src/app.ts`
  - アプリ本体です。状態管理、入力処理、描画、キーボード表示、履歴集計が入っています。
- `src/style.css`
  - クラシカルでダークな UI の全スタイルです。
- `src/types.ts`
  - 問題、履歴、キー統計などの型定義です。
- `src/data/snippets.ts`
  - 固定問題とランダム生成問題テンプレートを管理します。

## 4. 開発コマンド

```bash
npm install
npm run dev
npm run build
npm run preview
```

`package.json` の scripts は最小構成です。

- `dev`: Vite 開発サーバー
- `build`: TypeScript コンパイル + 本番ビルド
- `preview`: ビルド結果の確認

## 5. 起動フロー

アプリの起動はとてもシンプルです。

1. `src/main.ts` で `#app` を取得
2. `new TypingForEnjoyApp(root)` を実行
3. `TypingForEnjoyApp` の constructor 内で状態初期化
4. click / keydown のイベントを登録
5. `render()` で画面描画

React や Vue のようなコンポーネント構造はなく、`renderMenu()` / `renderSession()` / `renderResult()` が HTML 文字列を返し、`root.innerHTML` を更新する方式です。

## 6. 画面と状態管理

画面状態は `src/app.ts` 内の `Screen` で管理しています。

```ts
type Screen = "menu" | "session" | "result";
```

主要 state:

- `language`
  - `typescript` / `python`
- `difficulty`
  - `easy` / `normal`
- `intellisenseEnabled`
  - IntelliSense の ON / OFF
- `history`
  - 過去セッション結果
- `session`
  - 実行中セッション
- `result`
  - 直近の結果画面表示用データ

セッション中の `ActiveSession` には、以下も含まれています。

- 現在の問題プール
- シャッフル後の出題キュー
- 現在の問題と進捗
- 正打鍵数 / ミス数 / 総打鍵数
- 補完による文字数 / 補完回数
- 苦手キー分析用の統計

## 7. 画面遷移

基本の流れ:

1. メニュー画面で言語と難易度を選ぶ
2. `startSession()` で問題プールを作成
3. セッション画面でタイピング
4. 問題を完了すると `advanceSnippet()` で次の問題へ
5. `Esc` で終了すると `finishSession()` で結果を保存
6. 結果画面へ遷移

ポイント:

- 制限時間はありません
- `Esc` が終了トリガーです
- 問題を一周すると新しいプールを再生成します

## 8. 問題データの仕組み

問題データは `src/data/snippets.ts` にあります。

### 固定問題

- `SNIPPETS`
  - 初期の固定問題
- `ADDITIONAL_SNIPPETS`
  - 追加固定問題

どちらも `Snippet[]` です。

`Snippet` 型:

```ts
export interface Snippet {
  id: string;
  language: Language;
  difficulty: Difficulty;
  source?: "fixed" | "generated";
  title: string;
  description: string;
  meaning: string;
  notes: string[];
  code: string;
}
```

### ランダム生成問題

ランダム生成は `GENERATED_TEMPLATES` で管理しています。

- 言語ごと
- 難易度ごと
- テンプレート関数配列

各テンプレート関数は `Omit<Snippet, "id" | "source">` を返します。
その後、`generateSnippets()` が `id` と `source: "generated"` を付与します。

### 実際の出題

`getSnippetPool(language, difficulty)` が以下を返します。

- 条件に一致する固定問題
- 指定数の生成問題

現在は固定問題に加えて、生成問題を 8 問ずつ混ぜています。

### 一周後の挙動

`advanceSnippet()` でキューを使い切った場合、`getSnippetPool()` を再実行して新しい問題プールを作り直します。
そのため、生成問題は毎周ランダムに入れ替わります。

## 9. 問題を追加する方法

### 固定問題を追加する

`src/data/snippets.ts` の `SNIPPETS` または `ADDITIONAL_SNIPPETS` に `Snippet` を追加します。

注意点:

- `id` は重複させない
- `language` は `typescript` / `python`
- `difficulty` は `easy` / `normal`
- `meaning` は1〜2文程度の短い説明
- `notes` は最大2個程度に抑えると、現UIで収まりやすい
- `code` は1画面内に収まる長さが望ましい

### 生成問題テンプレートを追加する

`GENERATED_TEMPLATES` の該当配列に関数を追加します。

テンプレート追加時のコツ:

- 毎回変化させるのは「変数名」「文字列」「数値」くらいに留める
- コード構造まで大きく変えると学習難度が跳ねやすい
- `meaning` と `notes` も、生成される値に合わせて返す
- 現在の仮想キーボードで自然に案内できる記号を優先する

## 10. 入力処理

入力処理の中心は `handleTypingInput()` です。

やっていること:

- `Esc` でセッション終了
- `ArrowUp` / `ArrowDown` で IntelliSense 候補選択
- `Tab` で候補補完
- `Backspace` は無効化
- 通常入力は、現在期待している1文字と比較
- 正解なら進捗を進める
- 不正解ならミス統計を更新

問題を完了すると `completedSnippets` を増やして `advanceSnippet()` を呼びます。

## 11. IntelliSense の仕組み

VS Code の完全な IntelliSense ではなく、問題文に沿った簡易補完です。

主な構成:

- `INTELLISENSE_CANDIDATES`
  - 言語別の候補辞書
- `getCurrentTokenContext()`
  - 現在入力中の単語プレフィックスを取得
- `getTargetToken()`
  - 問題文上の現在トークンを取得
- `getIntelliSenseSuggestions()`
  - 現在位置で成立する候補だけを返す
- `applySelectedSuggestion()`
  - `Tab` 補完を適用

制約:

- 問題文の正解列に合う候補しか補完しません
- 自由入力補完ではなく、正解誘導型です
- 補完文字数は `assistedCharacters` に加算されます

## 12. 仮想キーボードの仕組み

仮想キーボードは JIS 配列前提です。

関連要素:

- `KEYBOARD_LAYOUT`
  - 表示レイアウト
- `BASE_SYMBOL_CODES`
  - 通常入力時の記号対応
- `SHIFT_SYMBOL_CODES`
  - Shift 入力時の記号対応
- `describeExpectedKey()`
  - 次に押すキーの表示文言を作る
- `getExpectedCodes()`
  - ハイライト対象キーコードを返す

現在は次のような JIS 配列差分を考慮しています。

- `8` の Shift は `(`
- `9` の Shift は `)`
- `@` は `P` の右
- `[` は Enter の左ではなく上段右側
- `]` はその下段
- `¥` / `|` も JIS 配列に合わせて表示

配列を変える場合は、表示だけでなく `resolveExpectedKey()` 側も一緒に見直してください。

## 13. 履歴と設定の保存

`localStorage` を使っています。

保存キー:

- 履歴: `typing-for-enjoy-workstore:v1`
- 設定: `typing-for-enjoy-workstore:settings:v1`

保存内容:

- `history`
  - セッション記録配列
- `intellisenseEnabled`
  - 補完 ON / OFF

履歴は `MAX_HISTORY = 20` 件まで保持します。

履歴リセットはメニューから実行できます。

## 14. 結果分析の仕組み

苦手キー分析は `keyStats` に集約しています。

各キーについて:

- 何を期待していたか
- 何回成功したか
- 何回失敗したか
- 何を誤入力したか

結果画面やメニュー画面では、この集計から次を表示しています。

- 累積の苦手キー
- セッション単位の苦手キー
- よくある誤入力ペア

今後「苦手な入力の重点出題」を実装するなら、この `keyStats` をそのまま利用できます。

## 15. UI / CSS の考え方

`src/style.css` に全スタイルがあります。

方向性:

- ダーク
- クラシカル
- シンプル
- 太字に頼らない
- 1画面で完結

調整時の注意:

- 説明領域を増やしすぎると、セッション画面が縦に崩れやすい
- 問題文は長くしすぎない
- `meaning` / `notes` は説明密度より収まりを優先したほうが全体品質が高い

## 16. 拡張しやすいポイント

今後の拡張候補:

- 苦手キーに応じた出題重み付け
- 問題カテゴリ分類
- 言語追加
- 難易度追加
- セッション別詳細統計
- 履歴のエクスポート / インポート
- IntelliSense 候補の文脈強化

比較的触りやすい場所:

- 問題追加: `src/data/snippets.ts`
- 表示調整: `src/style.css`
- 入力仕様変更: `src/app.ts`
- 型変更: `src/types.ts`

## 17. 保守時の注意

- 現在のアプリは `app.ts` にロジックが集中しています
- 機能が増える場合は、描画 helper とロジック helper の分離を先に進めると保守しやすくなります
- 問題生成を増やしすぎると、画面レイアウトより先に学習品質が崩れることがあります
- 1画面完結 UI を優先しているため、情報量は常に抑えめに考えるのが安全です

## 18. 変更後の確認チェックリスト

変更後は最低限ここを確認してください。

1. `npm run build` が通る
2. TypeScript / Python の両方で開始できる
3. Easy / Normal の両方で問題が出る
4. 問題を一周した後に新しい生成問題へ切り替わる
5. `Esc` で正常終了できる
6. 仮想キーボードのハイライトがずれていない
7. `meaning` と `notes` が1画面に収まる
8. 履歴保存と履歴リセットが動く
9. IntelliSense の ON / OFF と `Tab` 補完が動く

## 19. 補足

ユーザー向けの概要は `README.md`、このファイルは開発者向けの保守メモです。
もし今後ファイル分割を進める場合は、このガイドも一緒に更新してください。
