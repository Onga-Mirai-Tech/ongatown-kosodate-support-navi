// ブラウザ用のスクリプト（js/*.js, data/*.js）をそのまま Node で読み込むためのヘルパー。
// 各ファイルはトップレベルで const / function を宣言しているだけなので、
// vm のコンテキストで実行し、宣言された名前を取り出す。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadScripts(files, names) {
  const context = vm.createContext({});
  for (const file of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  return Object.fromEntries(names.map(name => [name, vm.runInContext(name, context)]));
}

module.exports = { loadScripts };
