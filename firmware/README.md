# Kermite ファームウェア(ProMicro版)

## 概要

ProMicroを使用した自作キーボード向けのファームウェアです。

## 対応機種
- Astelia

## 準備

ビルドには

- AVR 8-bit Toolchain
- GNU Make

が必要です。

書き込みには avrdude を使用します。

## Makefile.user の編集

`Makefile.user.example` を `Makefile.user` にコピーして、`PROJECT` と `COM_PORT` を設定してください。

## ビルド

`Makefile.user` の `PROJECT` でビルド対象のプロジェクトを指定しておきます。

```
  make
```

## 書き込み

`Makefile.user` の `COM_PORT` で promicro のブートローダの仮想 COM ポートを指定しておきます。仮想 COM ポートがわからない場合、ブートローダが使用する仮想 COM ポートの調べ方(後述)を参考にしてください。

キーボードのリセットボタンを 2 回押して、以下のコマンドを実行します。

```
  make flash
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
