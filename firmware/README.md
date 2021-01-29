# Kermite ファームウェア(ProMicro版)

## 概要

ProMicroを使用した自作キーボード向けのファームウェアです。

## 準備

ビルドには

- AVR 8-bit Toolchain
- GNU Make

が必要です。

書き込みには avrdude を使用します。
## ビルド

```
  make <project_path>:build
```

`<project_path>`には`src/projects`以下のプロジェクトのフォルダパスを指定します。

## 書き込み

`Makefile.user.example` を `Makefile.user` にコピーしておきます。
`Makefile.user` の `COM_PORT` で promicro のブートローダの仮想 COM ポートを指定しておきます。仮想 COM ポートがわからない場合、ブートローダが使用する仮想 COM ポートの調べ方(後述)を参考にしてください。

キーボードのリセットボタンを 2 回押して、以下のコマンドを実行します。

```
  make <project_path>:flash
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

## IDE の設定

VSCode を使う場合, `C/C++`拡張機能を導入します。.vscode/c_cpp_properties.json` 内に含まれるコンパイラのパスを設定すると、エディタ上での補完やエラー表示が適切に機能するようになります。

## 個別のキーボード向けの対応ファームウェア実装方法

[未対応のキーボードを対応する場合(開発者向け)](./developer_guide.md)