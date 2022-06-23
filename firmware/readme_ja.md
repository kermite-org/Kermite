# Kermite ファームウェア
## 概要

RP2040を使用した自作キーボード向けのファームウェアです。

## 開発環境の準備
### RP2040

- GNU Make
- GNU ARM Embedded Toolchain (arm-none-eabi-gcc)
- GNU GCC (g++)

が必要です

環境構築の詳細については、以下のドキュメントを参照してください。

[環境構築の手順](./docs/build_environment/index_ja.md)


## 依存コードの取り込み

依存コードを外部リポジトリに置いているため、
```
git submodule update --init
```
で取り込んでください。
## ビルド

以下に記述してあるコマンドはこのフォルダをカレントディレクトリにして実行します。

```
  make <project_path>:<variation_name>:build
```

`<project_path>`には`src/projects`以下にあるプロジェクトのフォルダパスを指定します。`<variaton_name>`にはプロジェクトのサブフォルダで、ファームウェアのソースコードを格納しているフォルダ名を指定します。

例
```
  make proto/sp2104:rp:build
```

## 書き込み (RP2040)
### ドラッグ&ドロップによる書き込み(Windows, MacOS共通)
ボードのBOOTSELボタンを押しながらリセットボタンを押して、ブートローダモードにします。RPI-RP2のような名前のリムーバブルメディアがマウントされます。build/<プロジェクトパス>/<プロジェクト名>.uf2をドライブにドラッグ&ドロップします。

KermiteのRP2040用ファームウェアにはpico_bootsel_via_double_resetが組み込んであり、２回目以降は(BOOTSELボタンを押さなくても)リセットボタンを素早く2回押すことでブートローダモードに入れるようになります。

### コマンドでの書き込み(Windows)

ボードをBOOTSELモードにリセットします。D:\RPI-RP2のようなパスでリムーバブルメディアがマウントされます。D:のようなドライブレターの部分をMakefile.userで以下のように指定します。
```
RP2040_UF2_TARGET_DRIVE_PATH = D:
```
ターミナルを開いて、
```
  make <project_path>:<variation_name>:flash
```
を実行するとuf2ファイルがドライブにコピーされます。

### コマンドでの書き込み(MacOS)
ボードをBOOTSELモードにリセットします。RPI-RP2という名前のリムーバブルメディアがマウントされます。設定は特に必要ありません。ターミナルで
``` 
  make <project_path>:<variation_name>:flash
```
を実行するとuf2ファイルがドライブにコピーされます。
## IDE の設定

VSCode を使う場合, `C/C++`拡張機能を導入します。


`.vscode`フォルダにある`c_cpp_properties.json.example`と`settings.json.example`を`.example`を外した名前に複製し、環境に応じて調整してください。`c_cpp_properties.json` 内でコンパイラのパスを設定すると、エディタ上での補完やエラー表示が適切に機能するようになります。

## 個別のキーボード向けの対応ファームウェア実装方法

[未対応のキーボードを対応する場合(開発者向け)](./docs/developer_guide_ja.md)
