# Kermite ユーティリティソフトウェア

## 概要
ファームウェアに配列を書き込むためのユーティリティソフトウェアです。
ブラウザで動作します。

## ビルド/実行方法

### 依存環境

ビルドや実行には以下が必要です

- Node.js
- yarn
### 導入

```
yarn install
```

### 実行

```
yarn start
```
## 技術要素

以下の言語/フレームワーク/ライブラリなどを使用しています。
- Typescript
- vite ... モジュールバンドラ
- alumina ... 仮想DOMライブラリ

## IDEの設定

VSCodeの場合、`.vscode`フォルダにある`settings.example.json`をコピーして`settings.json`を追加して下さい。

以下の拡張機能の使用を推奨します。
* ESLint
* Prettier
* vscode-styled-components
* stylelint