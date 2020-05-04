## 動作環境

### 対象 OS

- macOS 10.15 Catalina
- Windows10

### 実行環境

- node.js
- Electron

## 環境構築

ビルド/実行には以下が必要です

- node.js 13
- yarn

## 導入

```
yarn install
```

### ビルド/実行

```
yarn start
```

## デバッグビルド/実行

```
yarn start:dev
```

### 起動時に node-hid のバージョンがおかしいエラーが出る場合の workaround

```
  yarn fixlib
```
