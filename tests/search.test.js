// js/search.js（教室検索のキーワード照合）のテスト
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts } = require('./helpers');

const { normalizeForSearch, matchesKeyword } = loadScripts(['js/search.js'], ['normalizeForSearch', 'matchesKeyword']);

const item = {
  name: '遠賀ドリームサッカークラブ', category: 'スポーツ', target: '年中〜小学6年生',
  location: '遠賀総合運動公園', address: '広渡23-6', schedule: '毎週水・金 16:30〜18:00',
  phone: '093-293-0000', link: 'https://example.com/ABC'
};

test('normalizeForSearch: 全角英数・カタカナ・大文字をそろえる', () => {
  assert.equal(normalizeForSearch('ＡＢＣ１２３'), 'abc123');
  assert.equal(normalizeForSearch('サッカー'), 'さっかー');
  assert.equal(normalizeForSearch('ｻｯｶｰ'), 'さっかー');
  assert.equal(normalizeForSearch(null), '');
});

test('matchesKeyword: 空のキーワードはすべて一致', () => {
  assert.equal(matchesKeyword(item, ''), true);
  assert.equal(matchesKeyword(item, '　 '), true);
});

test('matchesKeyword: ひらがな・半角カナ・全角英字でも見つかる', () => {
  assert.equal(matchesKeyword(item, 'さっかー'), true);
  assert.equal(matchesKeyword(item, 'ｻｯｶｰ'), true);
  assert.equal(matchesKeyword(item, 'ＡＢＣ'), true);
});

test('matchesKeyword: 対象年齢・日時・住所でも見つかる', () => {
  assert.equal(matchesKeyword(item, '小学'), true);
  assert.equal(matchesKeyword(item, '水'), true);
  assert.equal(matchesKeyword(item, '広渡'), true);
});

test('matchesKeyword: スペース区切りはすべての語を含むものだけ（AND）', () => {
  assert.equal(matchesKeyword(item, 'サッカー　広渡'), true);
  assert.equal(matchesKeyword(item, 'サッカー ダンス'), false);
});

test('matchesKeyword: 電話番号はハイフンの有無に関係なく見つかる', () => {
  assert.equal(matchesKeyword(item, '0932930000'), true);
  assert.equal(matchesKeyword(item, '293-0000'), true);
  assert.equal(matchesKeyword(item, '999'), false);
});
