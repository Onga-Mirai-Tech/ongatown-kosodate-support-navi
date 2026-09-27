// =====================================================================
// 施設・学校の一覧データ
// 情報を更新するときは、必ず出典（source）で内容を確認し、checkedAt を確認した日に更新する。
//   source   : 出典。DATA_SOURCES のキー（出典が無い・確認していない場合は null）
//   checkedAt: 出典と照らし合わせて確認した日（YYYY-MM-DD）。未確認は null
// 画面には「出典：〇〇（YYYY年M月D日確認）」として表示される。
// =====================================================================

const DATA_SOURCES = {
  townHoiku: { label: '遠賀町HP「保育施設等情報」', url: 'https://www.town.onga.lg.jp/soshiki/41/1429.html' },
  townGakudo: { label: '遠賀町HP「学童保育」', url: 'https://www.town.onga.lg.jp/soshiki/41/1434.html' },
  townShimado: { label: '遠賀町HP「遠賀町立島門小学校」', url: 'https://www.town.onga.lg.jp/map/11207.html' },
  townHirowatari: { label: '遠賀町HP「遠賀町立広渡小学校」', url: 'https://www.town.onga.lg.jp/map/11209.html' },
  townAsagi: { label: '遠賀町HP「遠賀町立浅木小学校」', url: 'https://www.town.onga.lg.jp/map/11210.html' },
  townOngaJh: { label: '遠賀町HP「遠賀町立遠賀中学校」', url: 'https://www.town.onga.lg.jp/map/11211.html' },
  townOngaMinamiJh: { label: '遠賀町HP「遠賀町立遠賀南中学校」', url: 'https://www.town.onga.lg.jp/map/11212.html' },
  // 発達支援（data/hattatsu.js と「発達支援」画面で使う）
  prefShogaiji: { label: '福岡県「指定障がい児通所支援事業所・障がい児相談支援事業所一覧」', url: 'https://www.pref.fukuoka.lg.jp/contents/shougaijishiteijigyousyo.html' },
  townShogaiShiori: { label: '遠賀町「障がい者福祉のしおり」', url: 'https://www.town.onga.lg.jp/soshiki/10/1520.html' },
  townHoukagoDay: { label: '遠賀町HP「放課後等デイサービス」', url: 'https://www.town.onga.lg.jp/soshiki/10/1457.html' },
  townShakaiShigenMap: { label: '遠賀中間地域社会資源マップ（遠賀町HP）', url: 'https://www.town.onga.lg.jp/soshiki/10/44632.html' },
  cfaMushouka: { label: 'こども家庭庁「幼児教育・保育の無償化」', url: 'https://www.cfa.go.jp/policies/kokoseido/mushouka' }
};

// 保育施設
// ※町HPで確認できるのは名称・住所・電話番号・開所時間・受入年齢。定員は町HPに記載が無い（各施設の情報）。
const facilities = [
  { name: '遠賀川保育園', type: '保育園', address: '遠賀川二丁目6番22号', capacity: '140名', age: '生後3ヶ月〜', time: '7:00〜18:00 (延長19:00)', phone: '093-293-0184', url: 'https://www.ongagawa-hoikuen.com/', source: 'townHoiku', checkedAt: '2026-09-27' },
  { name: '南部保育園', type: '保育園', address: '浅木二丁目19番27号', capacity: '160名', age: '生後3ヶ月〜', time: '7:00〜18:00 (延長19:00)', phone: '093-293-2256', url: 'https://www.ans.co.jp/n/nanbuhoikuen/', source: 'townHoiku', checkedAt: '2026-09-27' },
  { name: '山びこ保育園', type: '保育園', address: '島門1番13号', capacity: '140名', age: '生後6ヶ月〜', time: '7:00〜18:00 (延長19:00)', phone: '093-293-2227', url: 'https://yamabiko-onga.com/', source: 'townHoiku', checkedAt: '2026-09-27' },
  { name: '遠賀中央幼稚園', type: '幼稚園型認定こども園', address: '島門3番1号', capacity: '170名', age: '1歳児〜(保育)/2歳児〜(教育)', time: '7:30〜18:30(保育)/10:00〜14:00(教育)', phone: '093-293-0097', url: 'https://www.ongachuou.com/', source: 'townHoiku', checkedAt: '2026-09-27' },
  { name: '愛あい保育園', type: '事業所内保育所', address: '木守1185番地 (健愛記念病院内)', capacity: '19名', age: '生後8ヶ月〜2歳児', time: '7:30〜18:30 (延長なし)', phone: '093-293-1915', url: 'https://www.kenai.or.jp/facilities/aiai.html', source: 'townHoiku', checkedAt: '2026-09-27' },
  // 企業主導型保育施設は町HPの一覧に掲載が無いため未確認
  { name: 'モクセイ保育園', type: '企業主導型保育施設', address: '若松438番地の1', capacity: '31名', age: '生後5ヶ月〜', time: '7:00〜20:00 (365日開園)', phone: '093-482-8620', url: 'https://www.instagram.com/mokuseihoikuen/', source: null, checkedAt: null }
];

// 小・中学校（area は校区内の行政区）
const schools = [
  {
    name: '広渡小学校', type: '小学校', address: '大字広渡1930番地', phone: '093-293-3711',
    area: ['旧停(旧停一丁目〜二丁目)', '広渡(広渡一丁目、大字広渡、道官)', '新町(遠賀川二丁目〜三丁目)', '中央(広渡一丁目)', '遠賀川(遠賀川一丁目〜二丁目)', '松の本(松の本一丁目〜七丁目)'],
    source: 'townHirowatari', checkedAt: '2026-09-27'
  },
  {
    name: '浅木小学校', type: '小学校', address: '浅木二丁目3番7号', phone: '093-293-0009',
    area: ['木守(大字木守)', '浅木(大字浅木、浅木二丁目〜三丁目)', '老良(大字老良)', '芙蓉(芙蓉一丁目〜二丁目)', '東和苑(浅木一丁目〜二丁目)', '虫生津(大字虫生津、虫生津南)', '上別府(大字上別府、蓮角)', '若葉台(若葉台)', '緑ヶ丘(虫生津南)', '駅みなみ(駅みなみ一丁目〜四丁目)'],
    source: 'townAsagi', checkedAt: '2026-09-27'
  },
  {
    name: '島門小学校', type: '小学校', address: '大字鬼津1058番地', phone: '093-293-0004',
    area: ['島津(大字島津)', '若松(大字若松)', '鬼津(大字鬼津)', '別府(大字別府、島門、千代丸)', '尾崎(大字尾崎)', '今古賀(大字今古賀)', '田園北(田園三丁目)', '田園南(田園一丁目〜二丁目)'],
    source: 'townShimado', checkedAt: '2026-09-27'
  },
  {
    name: '遠賀中学校', type: '中学校', address: '大字別府200番地', phone: '093-293-0043',
    area: ['広渡小学校区、島門小学校区'],
    source: 'townOngaJh', checkedAt: '2026-09-27'
  },
  {
    name: '遠賀南中学校', type: '中学校', address: '大字上別府652番地', phone: '093-293-5757',
    area: ['浅木小学校区'],
    source: 'townOngaMinamiJh', checkedAt: '2026-09-27'
  }
];

// 学童保育（各小学校内。児童数に応じて第2・第3クラブがある）
const gakudos = [
  { name: '広小ひまわりクラブ', desc: '広渡小学校内（第2広小ひまわりクラブもあります）', address: '大字広渡1930番地', phone: '093-293-1910', source: 'townGakudo', checkedAt: '2026-09-27' },
  { name: '遠賀南学童保育クラブ', desc: '浅木小学校内（第2遠賀南学童保育クラブもあります）', address: '浅木二丁目2番1号', phone: '093-293-0079', source: 'townGakudo', checkedAt: '2026-09-27' },
  { name: '遠賀北学童保育クラブ', desc: '島門小学校内（第2・第3遠賀北学童保育クラブもあります）', address: '大字鬼津1031番地の1', phone: '093-293-6531', source: 'townGakudo', checkedAt: '2026-09-27' }
];

// 学童保育の運営団体（令和2年4月から町内すべての学童を運営。入会の申し込み・問い合わせ先）
// ※利用料は掲載しない方針（金額の誤りによる不利益を避けるため。町HPへのリンクで案内する）
const gakudoOperator = {
  name: 'NPO法人遠賀学童クラブ', address: '浅木2丁目31番1号（遠賀町ふれあいの里内）', phone: '093-482-8366',
  source: 'townGakudo', checkedAt: '2026-09-27'
};
