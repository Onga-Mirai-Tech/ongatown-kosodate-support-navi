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

- `index.html` — 画面の HTML・Tailwind クラス・JS（手続き・制度の説明文もここ）。
  - データ: 施設・学校・学童の一覧は `data/facilities.js`（`facilities` / `schools` / `gakudos` / `DATA_SOURCES`）。各項目の `source`（出典キー）と `checkedAt`（出典で確認した日）はカードに「出典：〇〇（確認日）」として表示される。**情報を変えたら出典で確認し checkedAt を更新する。確認していない項目は checkedAt: null のままにする**。`documentsData` / `reasonDocs` は index.html。`kidsClasses` は実行時に Google スプレッドシート CSV（`SPREADSHEET_CSV_URL`）で読み込む。
  - 画面: `state.activeTab` を切り替え、`renderApp()` が `#main-content` の innerHTML を丸ごと描き直す（`getHomeHTML` / `getFacilityHTML` / `getFlowHTML` / `getClassesHTML` / `getServicesHTML`）。
  - 描き直しの前後でキーボードの操作位置（フォーカス）を保つ（`captureFocus` / `restoreFocus`）。操作する要素には `id` か `onclick` を付け、描き直しで要素が消える場合（簡易判定の次の質問など）は移動先の入れ物に `data-focus-target tabindex="-1"` を付ける。
  - 免責事項ポップアップは `openDisclaimer()` で毎回表示し、表示中は背景を `inert` にする。
  - URL: 開いている画面を `#タブ/サブタブ`（例 `#flow/school`）で表す。タブを増やしたら `TAB_TITLES`、タブ内の切り替えを増やしたら `SUB_TABS` と `getSubTab`/`setSubTab` に追加する。
  - ピンチ拡大は禁止しない（`user-scalable=no` を戻さない）。iPhone の入力欄タップ時の自動拡大は、スマホ幅で入力欄を16pxにして防いでいる。
  - 学年・認定・日付の計算は `js/enrollment.js`（`getFiscalYearOf()`：4/2〜翌4/1 を1学年、`getEnrollmentTimeline()` など）。境界日（4/1・4/2 生まれ、2/29 生まれ、3歳の誕生日当日）を変えるときは `tests/enrollment.test.js` にテストを追加する。
  - 教室検索のキーワード照合は `js/search.js`（全角半角・カタカナひらがなの違いを吸収、スペース区切りでAND）。
  - 外部ライブラリ（lucide / PapaParse）は `integrity`（SRI）付きで読み込む。バージョンを上げるときは integrity も作り直す（index.html のコメント参照）。
  - サイトのアイコンは `favicon.svg` が元。`bash scripts/icons/generate.sh` で `favicon.ico` / `apple-touch-icon.png` を作り直す。
  - LINE の色は公式色 #06C755 を使う（ユーザーの判断）。免責事項ポップアップは毎回表示のまま残す。
  - 発達支援（`#hattatsu`）: 事業所一覧は `data/hattatsu.js`。**手で編集せず** `python3 scripts/hattatsu/update.py`（要 openpyxl）で福岡県の指定事業所一覧（毎月20日頃更新の Excel）から作り直す。毎月20日に `.github/workflows/update-hattatsu.yml` が自動実行し、変更があれば PR（ブランチ `auto/update-hattatsu`）を作る。県の一覧と町HPで食い違い、町HPを優先すると決めたものは `update.py` の `OVERRIDES` に書く（例: にこにこクラブの電話番号）。範囲は遠賀郡（遠賀町・芦屋町・水巻町・岡垣町）と中間市（町の「遠賀中間地域社会資源マップ」と同じ）。制度の説明は町「障がい者福祉のしおり」に基づく。方針: 空き状況・評判は載せない、判定機能は作らない、利用料の金額は載せない、表記は「障がい」。
  - スクリプトの読み込み順: `data/facilities.js` → `data/hattatsu.js` → `js/enrollment.js` → `js/search.js` → index.html 内のアプリ本体（トップレベルの const / function を共有する通常の script。ES modules ではない）。
  - ヘッダーの「最終更新」日時は `scripts/build.sh` がデプロイ時に自動で書き込む（`index.html` が最後に main に反映された日時、日本時間）。ソース中の `<!--LAST_UPDATED-->…<!--/LAST_UPDATED-->` は手で書き換えない。
  - リンク共有時のカード（OGP）: `<head>` の `og:*` メタタグと `ogp.png`（1200x630）。画像は `scripts/ogp/ogp.html` を編集し `bash scripts/ogp/generate.sh`（Google Chrome が必要）で作り直す。作り直したら `og:image` の URL の `?v=` を更新する（SNS の画像キャッシュ対策）。
- `server/` — 本番（Xserver / Apache）専用の `.htaccess`（HTTPS・正規ホスト統一・CSP 等）と `404.html`。
- `src/tailwind.css` / `tailwind.config.js` — CSS。`npm run build:css` で `assets/app.css`（gitignore）を生成。以前の Play CDN と見た目を揃えるため tailwindcss は 3.4.17 に固定。クラス名は文字列連結で組み立てない（ビルド時に検出できない）。
- `tests/` — `npm test`（Node の標準テストランナー。日本時間と米国時間の2回実行）。`tests/helpers.js` の `loadScripts()` でブラウザ用スクリプトをそのまま読み込む。
- `scripts/build.sh` — CSS をビルドし、公開ファイルだけを `dist/` に集める。公開ファイル・ディレクトリを増やしたら `PUBLIC_FILES` に追加する。
- `pages-redirect/` — 旧 GitHub Pages URL から新ドメインへの転送ページ。
- `.github/workflows/deploy.yml` — PR ではテストとビルドのみ、`main` への push で Xserver に rsync(SSH) デプロイ（`DEPLOY_ENABLED=true` のときのみ）。
- `docs/deploy-xserver.md` — 移行・デプロイ手順。

公開URL: `https://ongatown-kosodate-support-navi.onga-mirai-tech.com/`（ドメイン文字列は `index.html`（canonical・OGP）/ `server/.htaccess` / `deploy.yml` / `pages-redirect/index.html` / ドキュメントにある。変更時は `grep -rn onga-mirai-tech.com` で全置換）

## 開発

```bash
npm install
npm run dev:css               # assets/app.css を生成・監視（Tailwind クラスを変えたら必要）
python3 -m http.server 8000   # http://localhost:8000/
npm test                      # 自動テスト
bash scripts/build.sh         # dist/ の中身を確認
```

- 変更後は `npm test` に加え、ブラウザでスマホ幅（375px）と PC 幅の両方を確認し、コンソールにエラーが無いことを見る。
- 文字色・背景色を変えたら、コントラスト比（通常の文字 4.5:1 以上）を確認する。
- 外部由来の値（スプレッドシート等）を HTML に入れるときは必ず `escapeHtml()` / `sanitizeUrl()` / `sanitizePhoneForHref()` を通す。ハードコードされたデータは信頼済みとして扱っている。
- CDN やデータ取得先を追加・変更したら `server/.htaccess` の CSP も更新する（更新漏れは本番でのみ壊れる）。
- コメント・UI 文言・コミットメッセージは日本語。

## Git 運用

- デフォルトブランチは `main`。`main` への push は本番デプロイになるので、作業はブランチ → PR で行う。
- push・PR 作成・リポジトリ設定の変更は、ユーザーの確認を取ってから行う。
