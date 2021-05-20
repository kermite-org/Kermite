# Kermite ファームウェア
## 概要

ProMicroを使用した自作キーボード向けのファームウェアです。

## 準備

### AVR

ビルドには

- GNU Make
- AVR 8-bit Toolchain (avr-gcc)

が必要です。

書き込みには avrdude を使用します。
### RP2040

- GNU Make
- GNU ARM Embedded Toolcahin (arm-none-eabi-gcc)
- GNU GCC (g++)

が必要です

依存コードを外部リポジトリに置いているため、
`git submodule update --init`
で取り込んでください。

[環境構築の手順](./docs/build_environment/index.md)
## ビルド

```
  make <project_path>:<variation_name>:build
```

`<project_path>`には`src/projects`以下にあるプロジェクトのフォルダパスを指定します。`<variaton_name>`にはプロジェクトのサブフォルダで、ファームウェアのソースコードを格納しているフォルダ名を指定します。

例
```
  make astelia:atmega:build
```

## 書き込み (AVR)

`Makefile.user.example` を `Makefile.user` にコピーしておきます。
`Makefile.user` の `COM_PORT` で ProMicro のブートローダの仮想 COM ポートを指定しておきます。仮想 COM ポートがわからない場合、ブートローダが使用する仮想 COM ポートの調べ方(後述)を参考にしてください。

キーボードのリセットボタンを 2 回押して、以下のコマンドを実行します。

```
  make <project_path>:<variation_name>:flash
```

## ブートローダが使用する仮想 COM ポートの調べ方

### Windows

デバイスマネージャを開き、キーボードのリセットボタンを 2 回押して、それらしきものを探します。ポート(COM と LPT)以下にあります。

### MacOS

キーボードのリセットボタンを 2 回押して、ターミナルで

```
  ls -l /dev/tty.usb*
```

を打ってそれらしきものを探します。

## 書き込み (RP2040)
### ドラッグ&ドロップによる書き込み
ボードのBOOTSELボタンを押しながらリセットボタンを押して、ブートローダモードにします。RPI-RP2のような名前のリムーバブルメディアがマウントされます。build/<プロジェクトパス>/<プロジェクト名>.uf2をドライブにドラッグ&ドロップします。

KermiteのRP2040用ファームウェアにはpico_bootsel_via_double_resetが組み込んであり、２回目以降は(BOOTSELボタンを押さなくても)リセットボタンを素早く2回押すことでブートローダモードに入れるようになります。

### コマンドでの書き込み(Windows)

ボードをBOOTSELモードにリセットします。D:\RPI-RP2のようなパスにリムーバブルメディアがマウントされます。D:のようなドライブレターの部分をMakefile.userで以下のように指定します。
```
RP2040_UF2_TARGET_DRIVE_PATH = D:
```
ターミナルを開いて、
```
  make <project_path>:<variation_name>:flash
```
を実行するとuf2ファイルがドライブにコピーされます。

### コマンドでの書き込み(MacOS)
ボードをBOOTSELモードにリセットします。RPI-RP2のような名前のリムーバブルメディアがマウントされます。設定は特に必要ありません。ターミナルで
``` 
  make <project_path>:<variation_name>:flash
```
を実行するとuf2ファイルがドライブにコピーされます。
## IDE の設定

VSCode を使う場合, `C/C++`拡張機能を導入します。`.vscode/c_cpp_properties.json` 内に含まれるコンパイラのパスを設定すると、エディタ上での補完やエラー表示が適切に機能するようになります。

## 個別のキーボード向けの対応ファームウェア実装方法

[未対応のキーボードを対応する場合(開発者向け)](./docks/developer_guide.md)
