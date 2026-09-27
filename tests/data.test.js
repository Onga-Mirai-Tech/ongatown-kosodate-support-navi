// data/*.js（掲載データ）の形式チェック。
// 情報を追加・修正したときの書き漏れ（出典・確認日・電話番号の形式など）を防ぐ。
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts } = require('./helpers');

const { DATA_SOURCES, facilities, schools, gakudos } = loadScripts(
  ['data/facilities.js'],
  ['DATA_SOURCES', 'facilities', 'schools', 'gakudos']
);

const PHONE = /^0\d{1,4}-\d{1,4}-\d{3,4}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

test('DATA_SOURCES: すべて https の URL とラベルを持つ', () => {
  for (const [key, src] of Object.entries(DATA_SOURCES)) {
    assert.match(src.url, /^https:\/\//, key);
    assert.ok(src.label, key);
  }
});

const lists = { facilities, schools, gakudos };
for (const [listName, items] of Object.entries(lists)) {
  test(`${listName}: 必須項目・出典・確認日の形式`, () => {
    assert.ok(items.length > 0);
    const names = new Set();
    for (const item of items) {
      const label = `${listName} / ${item.name}`;
      assert.ok(item.name, label);
      assert.ok(!names.has(item.name), `${label}: 名前が重複しています`);
      names.add(item.name);
      assert.ok(item.address, `${label}: 住所がありません`);
      assert.match(item.phone, PHONE, `${label}: 電話番号の形式`);
      assert.ok(item.source === null || item.source in DATA_SOURCES, `${label}: 出典 ${item.source} が DATA_SOURCES にありません`);
      assert.ok(item.checkedAt === null || DATE.test(item.checkedAt), `${label}: checkedAt は YYYY-MM-DD 形式`);
      assert.ok(!(item.checkedAt && !item.source), `${label}: 確認日があるのに出典がありません`);
    }
  });
}

test('facilities: 公式サイトは https の URL', () => {
  for (const f of facilities) assert.match(f.url, /^https:\/\//, f.name);
});

test('schools: 校区（area）は配列', () => {
  for (const s of schools) {
    assert.ok(Array.isArray(s.area) && s.area.length > 0, s.name);
  }
});
