#!/usr/bin/env bash
# favicon.svg から apple-touch-icon.png（180x180）と favicon.ico（16/32/48）を作る。
# Google Chrome（ヘッドレスモード）と Python の Pillow が必要。
#   例) CHROME=/usr/bin/google-chrome bash scripts/icons/generate.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# SVG を余白なしで 512x512 に描画する
cat > "$TMP/icon.html" <<HTML
<!DOCTYPE html><html><head><style>html,body{margin:0;width:512px;height:512px;overflow:hidden}img{display:block;width:512px;height:512px}</style></head>
<body><img src="file://$PWD/favicon.svg"></body></html>
HTML
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --default-background-color=00000000 --window-size=512,512 \
  --screenshot="$TMP/icon-512.png" "file://$TMP/icon.html" >/dev/null 2>&1

python3 - "$TMP/icon-512.png" <<'PY'
import sys
from PIL import Image
src = Image.open(sys.argv[1]).convert('RGBA')
# iPhone のホーム画面用（角丸は iOS 側で付くため、背景を塗りつぶした正方形にする）
bg = Image.new('RGBA', src.size, (234, 88, 12, 255))
bg.alpha_composite(src)
bg.convert('RGB').resize((180, 180), Image.LANCZOS).save('apple-touch-icon.png')
src.save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
PY

echo "apple-touch-icon.png と favicon.ico を作成しました"
