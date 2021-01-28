# Kermite ユーティリティソフトウェア

## 概要
ファームウェアに配列を書き込むためのユーティリティソフトウェアです。
## 動作環境

### 対象 OS

- macOS 10.15 Catalina
- Windows10

### 実行環境

- Node.js
- Electron

## ビルド/実行方法

### 依存環境

ビルドや実行には以下が必要です

- Node.js
- yarn
- node-gyp
### 導入

```
yarn install
```

### 実行

```
yarn start
```
## 構成

以下の言語/フレームワーク/ライブラリなどを使用しています。
- Typescript
- Electron
- estrella ... esbuildをラップしたモジュールバンドラ
- petit-dom ... 仮想DOMライブラリ
- goober ... CSS in JS ライブラリ
- node-hid ... RawHIDによる通信に使用
- node-serialport ... ファームウェア書き込みに使用
