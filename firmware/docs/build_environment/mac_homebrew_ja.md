
## MacOSでの環境構築例

以下の手順は MacOS 10.15 Catalinaで確認しています。

### Make, GCC
 MakeとGCCはOSにデフォルトで含まれているので、これをそのまま使用します。

### AVR-GCC
https://github.com/osx-cross/homebrew-avr にHomebrewでインストールできるAVRのツールチェインがあり、これを利用します。

```
$ xcode-select --install
$ brew tap osx-cross/avr
$ brew install avr-gcc
```

### avrdude
https://formulae.brew.sh/formula/avrdude を使用します。
```
$ brew install avrdude
```

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
$ avr-gcc -v
$ g++ -v
$ arm-none-eabi-gcc -v
$ avrdude -v
```
などのコマンドで、各ツールが使えるようになっていることを確認します。

```
$ make astelia:atmega:build
$ make proto/minivers:rev2_rp:build
```
などのコマンドで、プロジェクトをビルドできることを確認します。