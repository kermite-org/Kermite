### 導入

```
yarn install
```

### ビルド/実行

```
yarn start
```

### デバッグビルド/実行

```
(in terminal 1)
yarn bundle
(in terminal 2)
yarn serve
```

### 起動時に node-hid のバージョンがおかしいエラーが出る場合の workaround

```
  npx electron-rebuild -o node-hid -f
```
