// js/enrollment.js（学年・認定・日付の計算）のテスト。
// npm test では日本時間と米国時間の両方で実行し、端末のタイムゾーンで結果が変わらないことも確認する。
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScripts } = require('./helpers');

const {
  getFiscalYearOf, parseLocalDate, formatDateJp, formatYearMonthJp,
  getEnrollmentTimeline, getDaysInMonth, formatFiscalYearJp
} = loadScripts(['js/enrollment.js'], [
  'getFiscalYearOf', 'parseLocalDate', 'formatDateJp', 'formatYearMonthJp',
  'getEnrollmentTimeline', 'getDaysInMonth', 'formatFiscalYearJp'
]);

// 「今日」を固定して判定する（月は1始まりで書けるようにする）
const day = (y, m, d) => new Date(y, m - 1, d);
const timeline = (birth, today) => getEnrollmentTimeline(birth, today);

test('parseLocalDate: 端末のタイムゾーンに関係なく、その日付として解釈する', () => {
  const d = parseLocalDate('2021-04-02');
  assert.equal(d.getFullYear(), 2021);
  assert.equal(d.getMonth(), 3);
  assert.equal(d.getDate(), 2);
});

test('getFiscalYearOf: 4月2日〜翌年4月1日生まれが同じ学年', () => {
  assert.equal(getFiscalYearOf(parseLocalDate('2021-04-01')), 2020, '4/1生まれは前の学年');
  assert.equal(getFiscalYearOf(parseLocalDate('2021-04-02')), 2021, '4/2生まれから新しい学年');
  assert.equal(getFiscalYearOf(parseLocalDate('2021-03-31')), 2020);
  assert.equal(getFiscalYearOf(parseLocalDate('2021-12-31')), 2021);
  assert.equal(getFiscalYearOf(parseLocalDate('2022-01-01')), 2021);
  assert.equal(getFiscalYearOf(parseLocalDate('2020-02-29')), 2019, 'うるう日生まれ');
});

test('getEnrollmentTimeline: 4/1生まれと4/2生まれで学年（クラス）が1つ違う', () => {
  const today = day(2026, 9, 27);
  assert.equal(timeline('2021-04-01', today).classLabel, '5歳児クラス（年長）');
  assert.equal(timeline('2021-04-02', today).classLabel, '4歳児クラス（年中）');
});

test('getEnrollmentTimeline: クラス区分', () => {
  const today = day(2026, 9, 27);
  const cases = [
    ['2026-06-01', '0歳児クラスになる前', { isInfantClass: true }],
    ['2025-06-01', '0歳児クラス', { isInfantClass: true }],
    ['2024-06-01', '1歳児クラス', { isInfantClass: true }],
    ['2023-06-01', '2歳児クラス', { isTwoYearOldClass: true }],
    ['2022-06-01', '3歳児クラス（年少）', { isOver3Class: true }],
    ['2020-06-01', '5歳児クラス（年長）', { isOver3Class: true }],
    ['2019-06-01', '小学1年生', { isSchoolAge: true }],
    ['2011-06-01', '中学3年生', { isSchoolAge: true }],
    ['2010-06-01', '中学卒業以降', { isSchoolAge: true }]
  ];
  for (const [birth, label, flags] of cases) {
    const t = timeline(birth, today);
    assert.equal(t.classLabel, label, birth);
    for (const [key, value] of Object.entries(flags)) assert.equal(t[key], value, `${birth} ${key}`);
  }
});

test('getEnrollmentTimeline: 3歳の誕生日当日から「3歳になった」扱い', () => {
  // 年齢は誕生日の前日の終わり（=誕生日の0時）に加算される
  assert.equal(timeline('2023-09-27', day(2026, 9, 26)).hasTurnedMan3, false, '誕生日の前日');
  assert.equal(timeline('2023-09-27', day(2026, 9, 27)).hasTurnedMan3, true, '誕生日当日');
  assert.equal(formatDateJp(timeline('2023-09-27', day(2026, 9, 27)).man3Date), '2026年9月27日');
});

test('getEnrollmentTimeline: うるう日（2/29）生まれの3歳は、うるう年でない年の3/1の0時（=2/28の終わり）', () => {
  const t = timeline('2020-02-29', day(2023, 2, 28));
  assert.equal(formatDateJp(t.man3Date), '2023年3月1日');
  assert.equal(t.hasTurnedMan3, false);
  assert.equal(timeline('2020-02-29', day(2023, 3, 1)).hasTurnedMan3, true);
});

test('getEnrollmentTimeline: 2歳児クラス・3歳児クラスになる年月', () => {
  const t = timeline('2023-05-01', day(2026, 9, 27));
  assert.equal(formatYearMonthJp(t.twoYearOldClassStart), '2026年4月');
  assert.equal(formatYearMonthJp(t.threeYearOldClassStart), '2027年4月');
});

test('getDaysInMonth: うるう年の2月を含む月の日数', () => {
  assert.equal(getDaysInMonth(2024, 2), 29);
  assert.equal(getDaysInMonth(2025, 2), 28);
  assert.equal(getDaysInMonth('2025', '4'), 30);
  assert.equal(getDaysInMonth('', ''), 31, '年・月が未選択なら31日まで');
});

test('formatFiscalYearJp: 年度の和暦表示', () => {
  assert.equal(formatFiscalYearJp(2019), '2019（令和元）年度');
  assert.equal(formatFiscalYearJp(2026), '2026（令和8）年度');
  assert.equal(formatFiscalYearJp(2018), '2018（平成30）年度');
  assert.equal(formatFiscalYearJp(1989), '1989（平成元）年度');
  assert.equal(formatFiscalYearJp(1988), '1988年度');
});
