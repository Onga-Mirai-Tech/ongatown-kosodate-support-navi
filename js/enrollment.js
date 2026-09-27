// =====================================================================
// 学年・認定・日付の計算（画面に依存しない純粋な関数）
// index.html から読み込まれ、tests/enrollment.test.js で自動テストしている。
// 境界（4/1・4/2生まれ、2/29生まれ、3歳の誕生日当日）を変えるときは、テストも追加すること。
// =====================================================================

// 4月2日〜翌年4月1日を1年度とする、日本の学齢区切りルール。
// （4/1生まれは前年度扱いになる点に注意。民法上、年齢は誕生日の前日に加算されるため）
function getFiscalYearOf(date) {
  let y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  if (m < 3 || (m === 3 && d === 1)) {
    y--;
  }
  return y;
}

// 'YYYY-MM-DD' を端末のローカル日付として解釈する。
// new Date('YYYY-MM-DD') はUTCとして解釈されるため、日本より時刻が遅れているタイムゾーンの端末
// （海外在住・帰国予定の家庭など）では前日扱いになり、4/2生まれが4/1生まれ（=1学年上）と判定されてしまう。
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateJp(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
function formatYearMonthJp(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

// 生年月日から、現在の学年区分・満3歳の誕生日・認定切替日などを算出する共通関数。
// ホーム画面の早見表、シミュレーター（幼稚園・保育園どちらも）から利用する。
function getEnrollmentTimeline(dateStr, todayDate) {
  const birthDate = parseLocalDate(dateStr);
  const today = todayDate || new Date();

  const cohortYear = getFiscalYearOf(birthDate);
  const currentFiscalYear = getFiscalYearOf(today);
  const currentFYAge = currentFiscalYear - cohortYear; // 今年度中に迎える年齢

  // 満3歳の誕生日
  // ※認定の切り替え日（誕生日の翌月から等）や幼稚園に入園できる時期は、町の公開資料で確認できないため算出しない
  const man3Date = new Date(birthDate);
  man3Date.setFullYear(man3Date.getFullYear() + 3);
  const hasTurnedMan3 = today.getTime() >= man3Date.getTime();

  let classLabel = '';
  if (currentFYAge <= 0) classLabel = '0歳児クラスになる前';
  else if (currentFYAge === 1) classLabel = '0歳児クラス';
  else if (currentFYAge === 2) classLabel = '1歳児クラス';
  else if (currentFYAge === 3) classLabel = '2歳児クラス';
  else if (currentFYAge === 4) classLabel = '3歳児クラス（年少）';
  else if (currentFYAge === 5) classLabel = '4歳児クラス（年中）';
  else if (currentFYAge === 6) classLabel = '5歳児クラス（年長）';
  else if (currentFYAge >= 7 && currentFYAge <= 12) classLabel = `小学${currentFYAge - 6}年生`;
  else if (currentFYAge >= 13 && currentFYAge <= 15) classLabel = `中学${currentFYAge - 12}年生`;
  else classLabel = '中学卒業以降';

  const isInfantClass = currentFYAge <= 2;                     // 0〜1歳児クラス（クラス編成前を含む）
  const isTwoYearOldClass = currentFYAge === 3;                // 2歳児クラス
  const isOver3Class = currentFYAge >= 4 && currentFYAge <= 6; // 3〜5歳児クラス
  const isSchoolAge = currentFYAge >= 7;                       // 就学年齢以上（本ツールの対象外）

  // 参考情報として「2歳児クラスになる年度の4月1日」と、
  // 保育園の保育料が無償化される「3歳児クラスになる年度の4月1日」も算出
  const twoYearOldClassStart = new Date(cohortYear + 3, 3, 1);
  const threeYearOldClassStart = new Date(cohortYear + 4, 3, 1);

  return {
    birthDate, cohortYear, currentFYAge, classLabel,
    man3Date, hasTurnedMan3,
    isInfantClass, isTwoYearOldClass, isOver3Class, isSchoolAge,
    twoYearOldClassStart, threeYearOldClassStart
  };
}

function getDaysInMonth(year, month) {
  // month: 1〜12。年・月が未選択の場合は31日まで許容しておく
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

// 年度（4月始まり）ベースの元号表示。
// 令和は2019年度〜、平成は1989年度〜2018年度、それより前は元号を付けない。
// ※厳密には令和への改元は2019年5月1日だが、行政の「年度」表記では
//   2019年度は令和元年度として扱われるのが一般的なため、年度単位で判定する。
function formatFiscalYearJp(y) {
  let eraLabel = '';
  if (y >= 2019) {
    const wareki = y - 2018;
    eraLabel = `令和${wareki === 1 ? '元' : wareki}`;
  } else if (y >= 1989) {
    const wareki = y - 1988;
    eraLabel = `平成${wareki === 1 ? '元' : wareki}`;
  }
  return eraLabel ? `${y}（${eraLabel}）年度` : `${y}年度`;
}
