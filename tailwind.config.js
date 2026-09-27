// Tailwind CSS の設定。以前使っていた Play CDN（cdn.tailwindcss.com, v3.4.17）と同じ見た目になるよう、
// バージョンを 3.4.17 に固定し、設定は既定のまま使っている。
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js', './data/**/*.js'],
  theme: {
    extend: {}
  },
  plugins: []
};
