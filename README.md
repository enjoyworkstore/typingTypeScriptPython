# TypingForEnjoyWorkStore

TypeScript と Python の学習用コードタイピングツールです。

## 特徴

- TypeScript / Python を完全に分離
- `Easy` / `Normal` の 2 難易度
- 固定問題に加えて、テンプレート式のランダム生成問題を出題
- 制限時間なしで、好きなタイミングで `Esc` 終了
- 仮想キーボード表示つき
- セッション結果と苦手キー分析を `localStorage` に保存

## 開発

```bash
npm install
npm run dev
npm run build
npm run preview
```

開発者向けの保守メモは [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) を参照してください。

## 操作

- メニュー画面: `Tab` で移動、`Enter` で決定、`Arrow` で選択切り替え
- セッション中: そのままタイピング、`Esc` で終了
- IntelliSense: `ArrowUp` / `ArrowDown` で候補選択、`Tab` で補完
- 結果画面: `Enter` で同条件リトライ、`Esc` でメニューへ戻る

## 公開

GitHub Pages 向けの公開設定を同梱しています。

- 公開URL想定: `https://enjoyworkstore.github.io/typingTypeScriptPython/`
- `vite.config.ts` で GitHub Pages 用の `base` を設定
- `.github/workflows/deploy.yml` で `main` push 時に自動デプロイ

初回のみ、GitHub リポジトリの `Settings -> Pages` で `Build and deployment` の `Source` を `GitHub Actions` に設定してください。

リポジトリ名を変更する場合は、以下も合わせて更新してください。

- `vite.config.ts` の `REPOSITORY_NAME`
- `index.html` の公開URLメタ情報
- `public/404.html` のリダイレクト先
