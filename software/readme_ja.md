# Kermite ユーティリティソフトウェア

## 概要
ファームウェアに配列を書き込むためのユーティリティソフトウェアです。

## ビルド/実行方法

### 依存環境

ビルドや実行には以下が必要です

- Node.js
- yarn
- node-gyp

`node-hid`, `node-serialport`などのネイティブモジュールを使用しており、`node-gyp`でC言語のソースコードをビルドするための環境(`GCC`, `Make`, `Python`など)が必要です。Windowsの場合`windows-build-tools`, MacOSの場合`xcode-select`を使って導入してください。
### 導入

note: M1プロセッサ搭載のMac環境でデバッグする場合、package.jsonを以下のように書き換えてください。
```
-  "postinstall": "electron-rebuild",
+  "postinstall": "electron-rebuild --arch=arm64",
```

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
- Electron
- estrella ... esbuildをラップしたモジュールバンドラ
- node-hid ... RawHIDによる通信に使用
- node-serialport ... ファームウェア書き込みに使用

## IDEの設定

VSCodeの場合、`.vscode`フォルダにある`settings.example.json`と`launch.example.json`をコピーして`settings.json`と`launch.json`を追加して下さい。

以下の拡張機能の使用を推奨します。
* ESLint
* Prettier
* vscode-styled-components
* stylelint