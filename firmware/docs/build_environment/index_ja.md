# Kermite ファームウェア 開発環境構築

## 必要なもの

| ツール | 説明 |
|:--|:--|
| GNU Make | プロジェクトのビルドに必要です |
| arm-none-eabi-gcc | RP2040のソースコードのビルドに使用します。 |
| g++ | RP2040のユーティリティ(`pioasm`, `elf2uf2`)のビルドに使用します。|

### 備考

* Windowsの場合、Unix互換のコマンドを用意する必要があります。Unix互換の`sh.exe`, `rm.exe`, `mkdir.exe`などが必要です。


## 環境構築

Windows, Macでの環境構築手順を示します。
同等の環境を用意できれば他の構成でも問題ありません。
## Windowsでの環境構築

[Windowsでの環境構築](./win1_default_ja.md)

[OSの環境をなるべく汚染しない構成](./win2_clean_ja.md)

その他、MSYSやWSLによる構成が考えられます(現在未検証です)
## MacOSでの環境構築

[MacOSでの環境構築](./mac_homebrew_ja.md)