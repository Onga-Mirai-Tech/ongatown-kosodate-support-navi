# CLAUDE.md

遠賀町 子育て支援ナビ — 福岡県遠賀町の子育て情報（保育施設・小中学校・学童・給付認定の目安・手続き）をまとめた**非公式**の静的 Web アプリ。

## 前提（必ず守る）

- **公開リポジトリ（MIT License）**。コミットするものはすべて全世界に公開され、履歴から消すのは困難。
  - 秘密情報（SSH 鍵、サーバーID、ホスト名、パスワード）は書かない。デプロイ接続情報は GitHub Environment `production` の secrets にある。
  - 個人情報を書かない。教室スプレッドシートには運営者個人の携帯番号が含まれるため、CSV のスナップショットや取得結果をリポジトリに保存しない（`.gitignore` で `*.csv` を除外済み）。
- **完全非公式**。遠賀町役場への許諾・問い合わせは前提にしない。免責事項モーダル・非公式表示・「役場ではサポートしていない」旨の表示は削除しない。
- **行政ルールを推測で書かない**。制度・日付・金額・対象者を変更するときは、遠賀町公式サイト等の公開資料で確認し、出典 URL をコミットメッセージか PR に残す。確認できないものは断定せず、画面上で「要確認」「役場にご確認ください」と表示する。
- 町の公式サイトの文章を丸写ししない（事実は参照、文章は書き直す）。

## 構成

- `index.html` — アプリのすべて（HTML / Tailwind クラス / JS / データ）。ビルド不要。
  - データ: `facilities` / `schools` / `gakudos` / `documentsData` / `reasonDocs`（ファイル上部）、`kidsClasses` は実行時に Google スプレッドシート CSV（`SPREADSHEET_CSV_URL`）で上書き。
  - 画面: `state.activeTab` を切り替え、`renderApp()` が `#main-content` の innerHTML を丸ごと描き直す（`getHomeHTML` / `getFacilityHTML` / `getFlowHTML` / `getClassesHTML` / `getServicesHTML`）。
  - 学年・認定の計算: `getFiscalYearOf()`（4/2〜翌4/1 を1学年）と `getEnrollmentTimeline()`。ここを触るときは境界日（4/1・4/2 生まれ、2/29 生まれ、3歳の誕生日当日）を必ず確認する。
  - ヘッダーの「最終更新」日時は `scripts/build.sh` がデプロイ時に自動で書き込む（`index.html` が最後に main に反映された日時、日本時間）。ソース中の `<!--LAST_UPDATED-->…<!--/LAST_UPDATED-->` は手で書き換えない。
  - リンク共有時のカード（OGP）: `<head>` の `og:*` メタタグと `ogp.png`（1200x630）。画像は `scripts/ogp/ogp.html` を編集し `bash scripts/ogp/generate.sh`（Google Chrome が必要）で作り直す。
- `server/` — 本番（Xserver / Apache）専用の `.htaccess`（HTTPS・正規ホスト統一・CSP 等）と `404.html`。
- `scripts/build.sh` — 公開ファイルだけを `dist/` に集める。公開ファイルを増やしたら `PUBLIC_FILES` に追加する。
- `pages-redirect/` — 旧 GitHub Pages URL から新ドメインへの転送ページ。
- `.github/workflows/deploy.yml` — PR ではビルドのみ、`main` への push で Xserver に rsync(SSH) デプロイ（`DEPLOY_ENABLED=true` のときのみ）。
- `docs/deploy-xserver.md` — 移行・デプロイ手順。

公開URL: `https://ongatown-kosodate-support-navi.onga-mirai-tech.com/`（ドメイン文字列は `index.html`（canonical・OGP）/ `server/.htaccess` / `deploy.yml` / `pages-redirect/index.html` / ドキュメントにある。変更時は `grep -rn onga-mirai-tech.com` で全置換）

## 開発

```bash
python3 -m http.server 8000   # http://localhost:8000/
bash scripts/build.sh         # dist/ の中身を確認
```

- テストはまだ無い。変更後はブラウザでスマホ幅（375px）と PC 幅の両方を確認し、コンソールにエラーが無いことを見る。
- 外部由来の値（スプレッドシート等）を HTML に入れるときは必ず `escapeHtml()` / `sanitizeUrl()` / `sanitizePhoneForHref()` を通す。ハードコードされたデータは信頼済みとして扱っている。
- CDN やデータ取得先を追加・変更したら `server/.htaccess` の CSP も更新する（更新漏れは本番でのみ壊れる）。
- コメント・UI 文言・コミットメッセージは日本語。

## Git 運用

- デフォルトブランチは `main`。`main` への push は本番デプロイになるので、作業はブランチ → PR で行う。
- push・PR 作成・リポジトリ設定の変更は、ユーザーの確認を取ってから行う。
