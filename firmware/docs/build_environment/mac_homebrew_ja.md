
## MacOSでの環境構築例

以下の手順は MacOS 10.15 Catalinaで確認しています。

### Make, GCC
 MakeとGCCはOSにデフォルトで含まれているので、これをそのまま使用します。

### arm-none-eabi-gcc
https://github.com/ARMmbed/homebrew-formulae を使用します。
```
$ brew tap ArmMbed/homebrew-formulae
$ brew install arm-none-eabi-gcc
```

### ビルドの確認

Kermite/firmwareでターミナルを開きます。
```
$ make -v
$ g++ -v
$ arm-none-eabi-gcc -v
$ avrdude -v
```
などのコマンドで、各ツールが使えるようになっていることを確認します。

```
$ make proto/standard:rp:build
```
などのコマンドで、プロジェクトをビルドできることを確認します。