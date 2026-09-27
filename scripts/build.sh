#!/usr/bin/env bash
# 公開用ファイルだけを dist/ に集める。
# サーバーへはこの dist/ の中身だけがアップロードされるため、
# .git や docs、CLAUDE.md などリポジトリ管理用のファイルは公開されない。
# 公開ファイルを追加したら、下の PUBLIC_FILES にも追記すること。
set -euo pipefail

cd "$(dirname "$0")/.."

# 公開するファイル・ディレクトリ
PUBLIC_FILES=(
  index.html
  ogp.png
  favicon.svg
  favicon.ico
  apple-touch-icon.png
  js
  data
  assets
)

# Tailwind CSS をビルドして assets/app.css を作る（要 npm ci / npm install）
npm run --silent build:css

rm -rf dist
mkdir -p dist

for f in "${PUBLIC_FILES[@]}"; do
  cp -R "$f" "dist/$f"
done

# ヘッダーの「最終更新」に、index.html が最後に main に反映された日時（日本時間）を書き込む。
# --first-parent により、PR のマージコミットの日時（=公開された日時）になる。
# CI では actions/checkout に fetch-depth: 0 が必要（浅いクローンだと履歴が無く正しく取れない）。
LAST_UPDATED="$(TZ=Asia/Tokyo git log -1 --first-parent --date=format-local:'%Y/%m/%d %H:%M' --format=%cd -- index.html 2>/dev/null || true)"
if [ -z "$LAST_UPDATED" ]; then
  LAST_UPDATED="$(TZ=Asia/Tokyo date '+%Y/%m/%d %H:%M')"
fi
LAST_UPDATED="$LAST_UPDATED" perl -pi -e 's/<!--LAST_UPDATED-->.*?<!--\/LAST_UPDATED-->/$ENV{LAST_UPDATED}/g' dist/index.html
if grep -q 'LAST_UPDATED' dist/index.html; then
  echo "最終更新日時の書き込みに失敗しました" >&2
  exit 1
fi
echo "最終更新: $LAST_UPDATED"

# サーバー（Xserver / Apache）専用の設定・エラーページ
cp server/.htaccess dist/.htaccess
cp server/404.html dist/404.html

echo "dist/ を作成しました:"
find dist -type f | sort
