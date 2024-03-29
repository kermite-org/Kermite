# Kermite

## 概要

自作キーボード用のソフトウェアです。MCU上で動くファームウェアと、キーマッピングを設定するためのユーティリティソフトがあります。RP2040を使用した自作キーボードに対応しています。ユーティリティソフトはブラウザで動作します。

## 機能

### ファームウェアの生成

ユーティリティソフトに、ファームウェアを生成する機能があります。事前にビルドされた共通ファームウェアにピンの定義などを注入してファームウェアを生成します。

### レイアウトの編集

キーの配置を画面上で編集できます。GUIによる操作で、簡単にレイアウトを変更できます。

### キーマッピングの変更

ユーティリティソフトを使用してキーマッピングを視覚的に変更できます。キーマッピングはMCU内蔵のデータ保存領域に格納されます。

### レイヤ状態のリアルタイム表示

使用しているキーボードのレイヤ状態をリアルタイムに表示する機能があります。文字入力時に、画面を見て現在アクティブなレイヤ上のキーマッピングを確認できます。

## 動作環境

### ハードウェア/ファームウェア
- RP2040を使用しているキーボード

### ユーティリティソフト
- Google Chrome 最新版

## フォルダ構成

./firmware ...ファーウェアです。

./software ...ブラウザで動作するユーティリティソフトです。デバイスがなくても配列の検討などに利用できます。

## 開発環境

### ファームウェア
- Raspberry Pi RP2040
- C言語, arm-none-eabi-gcc, GNU Make

### ユーティリティソフト
- Typescript
- alumina

## 使用方法

https://app.kermite.org
にアクセスして使い始められます。トップ画面のウィザードに従ってファームウェアの書き込みやプロファイルの生成を行い、キーボードをセットアップできます。
## 開発状況

2022/06
構成を大幅に変更し、Electronによるデスクトップアプリから、ブラウザで動作するWebアプリになりました。デスクトップアプリは提供を終了し、今後はブラウザ版のみを開発/保守していきます。AVRは互換性を維持するのが難しく、対応MCUはRP2040のみとなっています。
## その他
[KermiteServer](https://server.kermite.org/) キーボード定義やキーマッピングを投稿できるサーバーです。

[Firmwave Build Status](https://assets.kermite.org/firmware-stats/) 対応ファームウェアのビルド状況です。

[Project Id Generator](https://assets.kermite.org/krs/generator/) カスタムファームウェアを新しく作る際に必要なProjectIdのジェネレータです。

## 連絡先
https://discord.gg/PNpEn3Z2kT

Discordのサーバです。バグ報告や機能の相談などはこちらでご相談ください。

## ライセンス
MITライセンスです。

