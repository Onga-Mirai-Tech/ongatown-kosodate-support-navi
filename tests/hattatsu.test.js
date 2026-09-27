// data/hattatsu.js（発達支援の事業所一覧。scripts/hattatsu/update.py で自動生成）の形式チェック
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts } = require('./helpers');

const { DATA_SOURCES, HATTATSU_DATA } = loadScripts(
  ['data/facilities.js', 'data/hattatsu.js'],
  ['DATA_SOURCES', 'HATTATSU_DATA']
);

test('出典・時点・確認日がある', () => {
  assert.ok(HATTATSU_DATA.source in DATA_SOURCES);
  assert.match(HATTATSU_DATA.asOf, /^令和\d+年\d+月\d+日現在$/);
  assert.match(HATTATSU_DATA.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test('事業所: 地域・サービス・住所・電話番号の形式', () => {
  const { facilities, areas, services } = HATTATSU_DATA;
  assert.ok(facilities.length > 0);
  for (const f of facilities) {
    assert.ok(f.name, JSON.stringify(f));
    assert.ok(areas.includes(f.area), `${f.name}: 地域 ${f.area}`);
    assert.ok(f.address.includes(f.area), `${f.name}: 住所に地域名が含まれていない`);
    assert.ok(f.services.length > 0 && f.services.every(s => services.includes(s)), `${f.name}: サービス種類`);
    assert.ok(f.phones.length > 0, `${f.name}: 電話番号がない`);
    for (const p of f.phones) {
      assert.match(p.phone, /^0\d{1,4}-\d{1,4}-\d{3,4}$/, `${f.name}: 電話番号`);
      assert.ok(p.services.every(s => f.services.includes(s)), `${f.name}: 電話番号に対応するサービス`);
    }
  }
});

test('事業所: 同じ名称・住所の重複が無い', () => {
  const keys = HATTATSU_DATA.facilities.map(f => f.name + '|' + f.address);
  assert.equal(new Set(keys).size, keys.length);
});
