# 遠賀町 子育て支援ナビ

福岡県遠賀町の保育施設・小中学校・学童保育の情報や、教育・保育給付認定の目安、入園・入学の手続きの流れをまとめた Web アプリです。

**公開URL:** https://ongatown-kosodate-support-navi.onga-mirai-tech.com/

> [!IMPORTANT]
> このアプリは**個人開発の非公式アプリ**です。遠賀町役場が提供・運営しているものではなく、遠賀町役場ではこのアプリについてのサポートを行っていません。
> 掲載情報は町の配布資料や公式ホームページを基にした**目安**です。最新・正確な情報は各施設および遠賀町役場にご確認ください。

## 主な機能

- **学年（クラス）早見表** — 生年月日から、0歳児クラス〜中学3年生までの該当年度を表示
- **施設・学校一覧** — 保育園・認定こども園・学童保育・小中学校（校区）の情報
- **給付認定の簡易判定** — いくつかの質問に答えると、1号〜3号認定と無償化の目安を表示
- **手続きの流れ** — 保育施設・幼稚園・小中学校・学童保育の申込スケジュールと必要書類
- **子ども向け教室** — 町内と町周辺の習い事情報（Google スプレッドシートから読み込み）
- **その他の行政支援** — 一時預かり、こども誰でも通園制度、子育て支援ひろば など

## 技術構成

静的サイトです。CSS だけ Tailwind CSS でビルドします。

| 用途 | ライブラリ |
| --- | --- |
| スタイル | [Tailwind CSS](https://tailwindcss.com/) v3（ビルド時に `assets/app.css` を生成） |
| アイコン | [Lucide](https://lucide.dev/) |
| CSV 読み込み | [Papa Parse](https://www.papaparse.com/) |

## ローカルで動かす

Node.js 20 以上が必要です。

```bash
git clone https://github.com/Onga-Mirai-Tech/ongatown-kosodate-support-navi.git
cd ongatown-kosodate-support-navi
npm install
npm run dev:css            # CSS を生成し、変更を監視（別のターミナルで起動したままにする）
python3 -m http.server 8000
```

ブラウザで http://localhost:8000/ を開きます。

```bash
npm test                   # 自動テスト（学年計算・掲載データの形式）
bash scripts/build.sh      # 公開用ファイルを dist/ に作成
```

## ディレクトリ構成

```
index.html                 アプリ本体（画面の HTML / JavaScript）
data/facilities.js         施設・学校・学童の一覧データ（出典・確認日つき）
data/hattatsu.js           発達支援の事業所一覧（scripts/hattatsu/update.py で福岡県の一覧から自動生成）
js/enrollment.js           学年・認定・日付の計算
js/search.js               教室検索のキーワード照合
favicon.svg                サイトのアイコン（scripts/icons/ で PNG・ICO を作成）
src/tailwind.css           CSS（Tailwind）の元ファイル
tests/                     自動テスト（npm test）
server/                    本番サーバー（Xserver）専用の .htaccess と 404 ページ
ogp.png                    リンク共有時のカード画像（scripts/ogp/ で作成）
scripts/build.sh           公開ファイルを dist/ に集め、最終更新日時を書き込むスクリプト
scripts/ogp/               カード画像の元デザインと作成スクリプト
pages-redirect/            旧URL（GitHub Pages）から新URLへの転送ページ
docs/deploy-xserver.md     デプロイ・移行手順
.github/workflows/         ビルド・デプロイの GitHub Actions
```

## 掲載情報について

- 施設・学校・学童の一覧は `data/facilities.js` にあり、項目ごとに出典（`source`）と確認日（`checkedAt`）を持っています。画面の各カードにも「出典：〇〇（確認日）」として表示されます。
- 発達支援（児童発達支援・放課後等デイサービスなど）の事業所一覧は、福岡県の指定事業所一覧（毎月更新）から `python3 scripts/hattatsu/update.py` で `data/hattatsu.js` を作り直します（手で編集しないでください）。毎月20日に GitHub Actions が自動で実行し、変更があれば Pull Request を作ります。
- 手続きや制度の説明は `index.html` に書かれています。
- 子ども向け教室の情報は、公開 Google スプレッドシートを CSV として実行時に読み込んでいます。スプレッドシートには教室運営者の連絡先が含まれるため、**CSV をリポジトリにコミットしないでください**。
- 教室の掲載希望は、アプリ内のフォームから公式LINEで受け付けています。

## コントリビュート

情報の誤りの報告や改善提案を歓迎します。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

- 情報の誤り・古い情報 → [Issue（情報の修正）](https://github.com/Onga-Mirai-Tech/ongatown-kosodate-support-navi/issues/new/choose)
- GitHub アカウントをお持ちでない方 → アプリ下部の公式LINEからご連絡ください
- セキュリティ上の問題 → [SECURITY.md](SECURITY.md)

## デプロイ

`main` ブランチへのマージで、GitHub Actions から Xserver に自動デプロイされます。設定手順は [docs/deploy-xserver.md](docs/deploy-xserver.md) を参照してください。

## ライセンス

[MIT License](LICENSE) © 2026 Onga-Mirai-Tech

他の自治体向けに改変して公開することも自由です。その際は、元の自治体名や「遠賀町」の情報を必ず置き換え、非公式である旨の表示を残してください。
