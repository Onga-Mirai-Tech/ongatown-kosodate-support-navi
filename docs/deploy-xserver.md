# Xserver（独自ドメイン）への移行・デプロイ手順

GitHub Pages から Xserver + 独自ドメインへ移行するための手順書です。

- 公開URL（移行後）: `https://ongatown-kosodate-support-navi.onga-mirai-tech.com/`
- 旧URL（GitHub Pages）: `https://onga-mirai-tech.github.io/ongatown-kosodate-support-navi/`

## 仕組み

```
main へ push
   └─ GitHub Actions（.github/workflows/deploy.yml）
        ├─ scripts/build.sh … 公開ファイルだけを dist/ に集める
        └─ rsync over SSH  … dist/ を Xserver のドキュメントルートへ同期
```

- サーバーに置かれるのは `dist/` の中身だけです（`index.html` / `.htaccess` / `404.html`）。`.git` や `docs/`、`CLAUDE.md` などは公開されません。
- 接続情報や鍵は **GitHub の Environment secrets にだけ**保存します。リポジトリは公開されているため、ファイルには絶対に書かないでください。
- `DEPLOY_ENABLED` が `true` になるまで、main に push してもデプロイは実行されません（ビルドのみ）。

> ドメイン名は `server/.htaccess`、`.github/workflows/deploy.yml`、`pages-redirect/index.html` に書かれています。変更するときは `grep -rn onga-mirai-tech.com` で漏れなく置き換えてください。

---

## 1. Xserver 側の準備

### 1-1. サブドメインの追加

サーバーパネル → **サブドメイン設定** → 対象ドメイン `onga-mirai-tech.com` を選択 → サブドメイン `ongatown-kosodate-support-navi` を追加します。

作成後、パネルに表示される**ドキュメントルート**を控えておいてください。通常は次の形です。

```
/home/<サーバーID>/onga-mirai-tech.com/public_html/ongatown-kosodate-support-navi
```

> `onga-mirai-tech.com` の DNS を Xserver 以外で管理している場合は、サブドメインの A レコード（または CNAME）を Xserver に向けてください。

### 1-2. 無料 SSL の設定

サーバーパネル → **SSL設定** → `ongatown-kosodate-support-navi.onga-mirai-tech.com` に無料独自SSLを追加します。DNS の反映後でないと失敗するので、失敗した場合は時間をおいて再試行してください。

### 1-3. SSH の有効化とデプロイ専用鍵の登録

1. サーバーパネル → **SSH設定** → 「ON」にする
2. 手元の Mac で**デプロイ専用**の鍵を作る（普段使いの鍵とは分けます）

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/xserver_onga_deploy -C "github-actions-deploy" -N ""
   ```

3. 公開鍵（`~/.ssh/xserver_onga_deploy.pub`）をサーバーに登録する
   - 初めて SSH を使う場合：サーバーパネル → SSH設定 → **公開鍵登録・更新** に貼り付け
   - すでに別の鍵で SSH を使っている場合：パネルから登録すると既存の鍵が置き換わることがあるため、SSH でログインして `~/.ssh/authorized_keys` に**追記**してください

4. 接続確認（ホスト名はサーバーパネル → サーバー情報 の「ホスト名」、ユーザー名はサーバーID）

   ```bash
   ssh -p 10022 -i ~/.ssh/xserver_onga_deploy <サーバーID>@<ホスト名> 'ls ~/onga-mirai-tech.com/public_html'
   ```

5. サーバーのホスト鍵を取得（GitHub に登録します）

   ```bash
   ssh-keyscan -p 10022 <ホスト名>
   ```

## 2. GitHub 側の設定

リポジトリの **Settings → Environments → New environment** で `production` を作成し、以下を登録します。

**Deployment branches and tags** は「Selected branches and tags」にして `main` のみを許可してください。

### Environment secrets

| 名前 | 値 |
| --- | --- |
| `XSERVER_SSH_HOST` | サーバーのホスト名（例: `sv12345.xserver.jp`） |
| `XSERVER_SSH_USER` | サーバーID |
| `XSERVER_SSH_KEY` | `~/.ssh/xserver_onga_deploy`（**秘密鍵**）の中身すべて |
| `XSERVER_KNOWN_HOSTS` | `ssh-keyscan` の出力すべて |
| `XSERVER_DEPLOY_PATH` | 1-1 で控えたドキュメントルート |

### Environment variables

| 名前 | 値 |
| --- | --- |
| `DEPLOY_ENABLED` | 最初は未設定のまま（3 で設定） |
| `XSERVER_SSH_PORT` | `10022`（省略可） |

秘密鍵の登録が終わったら、手元の秘密鍵ファイルはパスワードマネージャー等に保管するか削除してください。

## 3. 初回デプロイ

1. `DEPLOY_ENABLED` を `true` に設定
2. **Actions → Build & Deploy → Run workflow** で `dry_run` にチェックを入れて実行し、ログで転送予定のファイルを確認
   - `deleting ...` にサーバー上の消えては困るファイルが含まれていないか必ず確認してください（`--delete` で同期するため）
3. 問題なければ `dry_run` なしで再実行

以降は main への push（PR のマージ）で自動デプロイされます。

## 4. 動作確認チェックリスト

- [ ] `https://ongatown-kosodate-support-navi.onga-mirai-tech.com/` が表示される
- [ ] `http://` でアクセスすると `https://` に転送される
- [ ] `https://onga-mirai-tech.com/ongatown-kosodate-support-navi/` が正規URLに転送される
- [ ] 存在しないURL（例: `/xxx`）で 404 ページが表示される
- [ ] ブラウザの開発者ツールのコンソールに CSP（Content-Security-Policy）違反のエラーが出ていない
- [ ] 「子ども向け教室」タブでスプレッドシートの教室情報が読み込まれている（【サンプル】が表示されていない）
- [ ] スマートフォン実機で表示・タブ切替・LINE 送信ボタンが動く

## 5. 旧URL（GitHub Pages）からの転送

移行後の表示確認が済んだら、旧URLを転送ページに切り替えます。

1. **Settings → Pages → Build and deployment → Source** を「GitHub Actions」に変更
2. **Actions → GitHub Pages redirect → Run workflow** を実行
3. 旧URLにアクセスして新URLに転送されることを確認
4. リポジトリの About（Website 欄）を新URLに変更

   ```bash
   gh repo edit Onga-Mirai-Tech/ongatown-kosodate-support-navi --homepage https://ongatown-kosodate-support-navi.onga-mirai-tech.com/
   ```

5. 公式LINE（プロフィール・リッチメニュー・あいさつメッセージ）、SNS、配布物のQRコードなどに旧URLが残っていないか確認

> GitHub Pages ではサーバー側の301転送ができないため、転送ページ（meta refresh + JavaScript）で案内しています。紙のチラシ等で旧URLが配布済みの場合は、転送ページを当面残しておいてください。

## トラブルシューティング

| 症状 | 確認すること |
| --- | --- |
| `Host key verification failed` | `XSERVER_KNOWN_HOSTS` が `ssh-keyscan -p 10022` の出力と一致しているか |
| `Permission denied (publickey)` | 公開鍵がサーバーに登録されているか、`XSERVER_SSH_KEY` に秘密鍵全体（BEGIN/END 行を含む）が入っているか |
| SSH 接続がタイムアウトする | サーバーパネルの SSH 設定が ON か。アクセス制限系の設定（国外IPからの接続制限など）が GitHub Actions からの接続を拒否していないか |
| `XSERVER_DEPLOY_PATH は public_html 配下の…` | 誤ってメインドメインの `public_html` 直下を指定していないか（`--delete` で他サイトを消さないための安全装置です） |
| 画面が崩れる・アイコンが出ない | コンソールの CSP 違反を確認し、`server/.htaccess` の CSP に読み込み元を追加 |
