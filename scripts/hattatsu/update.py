#!/usr/bin/env python3
"""
福岡県の「指定障がい児通所支援事業所・障がい児相談支援事業所一覧」（毎月更新の Excel）から、
遠賀郡（遠賀町・芦屋町・水巻町・岡垣町）と中間市の事業所を抜き出して data/hattatsu.js を作り直す。

使い方（Python 3 と openpyxl が必要: pip install openpyxl）:
    python3 scripts/hattatsu/update.py

※ data/hattatsu.js はこのスクリプトで自動生成する。手で編集しない（次の更新で上書きされる）。
※ 県の一覧に掲載されている公開情報（事業所名・住所・電話番号・サービス種類）のみを使う。
   空き状況・評判などは掲載しない。
"""
import datetime
import io
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

import openpyxl

PAGE_URL = 'https://www.pref.fukuoka.lg.jp/contents/shougaijishiteijigyousyo.html'
# 県のページ上のリンク文字列（Excel のファイル名は毎月変わるため、リンク文字列から探す）
LISTS = {
    'tsusho': '障がい児通所支援施設・事業所（全域）',
    'soudan': '障がい児相談支援事業所（全域）',
}
# 掲載する地域（町の「遠賀中間地域社会資源マップ」と同じ範囲）。表示順もこの順
AREAS = [('遠賀郡遠賀町', '遠賀町'), ('遠賀郡芦屋町', '芦屋町'), ('遠賀郡水巻町', '水巻町'), ('遠賀郡岡垣町', '岡垣町'), ('中間市', '中間市')]
# 掲載するサービス（入所施設は対象外）。表示順もこの順
SERVICES = ['児童発達支援', '放課後等デイサービス', '保育所等訪問支援', '居宅訪問型児童発達支援', '障害児相談支援']

# 県の一覧と町の公式サイトで情報が異なり、町の公式サイトを優先すると判断したもの（事業所名 → 上書き内容）。
# phoneSource は data/facilities.js の DATA_SOURCES のキー（画面に「電話番号：〇〇より」と表示される）。
OVERRIDES = {
    # 県の一覧は 093-482-8498。町HP「放課後等デイサービス」の番号に合わせる（2026-09-28 判断）
    '特別支援型子育て支援施設 にこにこクラブ': {'phone': '093-293-6588', 'phoneSource': 'townHoukagoDay'},
}

OUT = Path(__file__).resolve().parents[2] / 'data' / 'hattatsu.js'


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'ongatown-kosodate-support-navi (+https://github.com/Onga-Mirai-Tech/ongatown-kosodate-support-navi)'})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def norm(value):
    return unicodedata.normalize('NFKC', str(value or '')).strip()


def main():
    html = fetch(PAGE_URL).decode('utf-8', errors='replace')
    as_of = re.search(r'令和[0-9０-９]+年[0-9０-９]+月[0-9０-９]+日現在', html)
    if not as_of:
        sys.exit('県のページから「〇年〇月〇日現在」が見つかりませんでした')
    as_of = norm(as_of.group(0))

    facilities = {}
    for key, link_text in LISTS.items():
        m = re.search(r'href="([^"]+\.xlsx)"[^>]*>\s*' + re.escape(link_text), html)
        if not m:
            sys.exit(f'県のページに「{link_text}」の Excel が見つかりませんでした')
        wb = openpyxl.load_workbook(io.BytesIO(fetch(urllib.request.urljoin(PAGE_URL, m.group(1)))), read_only=True)
        rows = list(wb.worksheets[0].iter_rows(values_only=True))
        header = [norm(h) for h in rows[1]]
        for row in rows[2:]:
            d = dict(zip(header, row))
            service = norm(d.get('サービス種類'))
            address = norm(d.get('事業所-住所'))
            area = next((label for pattern, label in AREAS if pattern in address), None)
            if service not in SERVICES or not area:
                continue
            name, phone = norm(d.get('事業所-名称')), norm(d.get('事業所-電話番号'))
            # 同じ事業所が別の事業所番号で重複して載っていたり、サービスごとに電話番号が違ったりするため、
            # 名称・住所でまとめ、電話番号ごとに対応するサービスを持たせる
            f = facilities.setdefault((name, address), {
                'name': name,
                'area': area,
                'address': address.removeprefix('福岡県'),
                'services': [],
                'phones': {},
            })
            if service not in f['services']:
                f['services'].append(service)
            f['phones'].setdefault(phone, [])
            if service not in f['phones'][phone]:
                f['phones'][phone].append(service)

    area_order = [label for _, label in AREAS]
    items = sorted(facilities.values(), key=lambda f: (area_order.index(f['area']), f['name']))
    for f in items:
        f['services'].sort(key=SERVICES.index)
        f['phones'] = [{'phone': phone, 'services': sorted(svcs, key=SERVICES.index)} for phone, svcs in f['phones'].items()]
        override = OVERRIDES.get(f['name'])
        if override:
            f['phones'] = [{'phone': override['phone'], 'services': list(f['services'])}]
            f['phoneSource'] = override['phoneSource']

    missing = set(OVERRIDES) - {f['name'] for f in items}
    for name in sorted(missing):
        # 県の一覧から消えた・名称が変わった場合は OVERRIDES の見直しが必要
        print(f'警告: OVERRIDES の「{name}」が県の一覧に見つかりませんでした', file=sys.stderr)

    today = datetime.date.today().isoformat()
    lines = [
        '// =====================================================================',
        '// 遠賀郡・中間市の障がい児通所支援・障がい児相談支援の事業所一覧',
        '// ※ scripts/hattatsu/update.py で自動生成。手で編集しない（次の更新で上書きされる）',
        f'// 出典: 福岡県「指定障がい児通所支援事業所、指定障がい児入所支援施設及び指定障がい児相談支援事業所一覧」（{as_of}）',
        f'//       {PAGE_URL}',
        '// =====================================================================',
        '',
        'const HATTATSU_DATA = ' + json.dumps({
            'source': 'prefShogaiji',
            'asOf': as_of,
            'checkedAt': today,
            'areas': area_order,
            'services': SERVICES,
            'facilities': items,
        }, ensure_ascii=False, indent=2) + ';',
        '',
    ]
    OUT.write_text('\n'.join(lines), encoding='utf-8')
    print(f'{OUT.relative_to(OUT.parents[1])} を更新しました（{as_of}、{len(items)} 事業所）')


if __name__ == '__main__':
    main()
