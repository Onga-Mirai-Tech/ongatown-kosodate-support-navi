// data/hattatsu.js の新旧を比べて、変更内容を Markdown で出力する（毎月の自動更新 PR の説明文に使う）。
//   node scripts/hattatsu/diff-summary.js <旧ファイル> <新ファイル>
const fs = require('node:fs');
const vm = require('node:vm');

function load(file) {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  return vm.runInContext('HATTATSU_DATA', context);
}

const [oldFile, newFile] = process.argv.slice(2);
const before = load(oldFile);
const after = load(newFile);

const key = f => `${f.name}（${f.area}）`;
const describe = f => `${f.services.join('・')} / ${f.address} / ${f.phones.map(p => p.phone).join('・')}`;
const oldMap = new Map(before.facilities.map(f => [key(f), f]));
const newMap = new Map(after.facilities.map(f => [key(f), f]));

const added = [...newMap.keys()].filter(k => !oldMap.has(k));
const removed = [...oldMap.keys()].filter(k => !newMap.has(k));
const changed = [...newMap.keys()].filter(k => oldMap.has(k) && describe(oldMap.get(k)) !== describe(newMap.get(k)));

const lines = [
  `- 県の一覧の時点: ${before.asOf} → **${after.asOf}**`,
  `- 事業所数: ${before.facilities.length} → **${after.facilities.length}**`,
  ''
];
const section = (title, items, render) => {
  lines.push(`### ${title}（${items.length}件）`);
  lines.push(items.length ? items.map(render).join('\n') : 'なし');
  lines.push('');
};
section('追加', added, k => `- ${k}: ${describe(newMap.get(k))}`);
section('削除（県の一覧から無くなったもの）', removed, k => `- ${k}: ${describe(oldMap.get(k))}`);
section('変更', changed, k => `- ${k}\n  - 変更前: ${describe(oldMap.get(k))}\n  - 変更後: ${describe(newMap.get(k))}`);

process.stdout.write(lines.join('\n'));
