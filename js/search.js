// =====================================================================
// 教室検索のキーワード照合（画面に依存しない純粋な関数）
// tests/search.test.js で自動テストしている。
// =====================================================================

// 検索用に文字列をそろえる。
// - 全角英数字・半角カナなどを統一（NFKC）し、英字は小文字に
// - カタカナはひらがなに（「サッカー」を「さっかー」でも見つけられるように）
function normalizeForSearch(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// 検索対象の項目
const CLASS_SEARCH_FIELDS = ['name', 'category', 'target', 'location', 'address', 'schedule', 'phone', 'link'];

// キーワードをスペース（全角・半角）で区切り、すべての語がいずれかの項目に含まれていれば一致とする。
// 電話番号はハイフンの有無にかかわらず一致させる。
function matchesKeyword(item, keyword) {
  const terms = normalizeForSearch(keyword).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = CLASS_SEARCH_FIELDS.map(field => normalizeForSearch(item[field])).join('\n');
  const digits = normalizeForSearch(item.phone).replace(/[^0-9]/g, '');
  return terms.every(term => haystack.includes(term) || (/^[0-9-]+$/.test(term) && digits.includes(term.replace(/-/g, ''))));
}
