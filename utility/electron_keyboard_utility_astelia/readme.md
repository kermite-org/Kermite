### 導入
```
yarn install
```

### デバッグビルド/実行
```
(in terminal 1)
  yarn bundle
(in terminal 2)
  yarn start
```

### node-hidのバージョンがおかしいエラーが出る場合のworkaround
```
  npx electron-rebuild -o node-hid -f
```
