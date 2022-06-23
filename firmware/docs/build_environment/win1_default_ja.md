# Windowsでの環境構築

## ツールの導入

以下のツールを導入します。それぞれファイルを取得してパスを通してください。
ファイルの名前は2021年5月時点のものです。バージョンが更新されている場合は新しいものを選んでください。
### AVR-GCC, Makeなど
| ツール   | [AVR-GCC 11.1.0 for Windows 32 and 64 bit](https://blog.zakkemble.net/avr-gcc-builds/)   | 
| -------- | :------------------------------------------ | 
| ファイル | avr-gcc-11.1.0-x64-windows.zip             | 
| 導入方法 | DL, 解凍, binにパスを通す        | 

Zak Kemble氏のブログで提供されているAVR-GCCのWindows向けのバイナリを使用します。Make, avr-gcc, avrdudeなど、AVRの開発に必要なツール一式が含まれています。

### GNU ARM Toolchain
| ツール   | [GNU Arm Embedded Toolchain](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)    | 
| -------- | :------------------------------------------ | 
| ファイル | gcc-arm-none-eabi-10-2020-q4-major-win32.zip            | 
| 導入方法 | DL, 解凍, binにパスを通す        | 

ARMの公式サイトからコンパイラをダウンロードして導入します。

### CoreUtils for Windows
| ツール   | [CoreUtils for Windows](http://gnuwin32.sourceforge.net/packages/coreutils.htm)    | 
| -------- | :------------------------------------------ | 
| ファイル | coreutils-5.3.0.exe           | 
| 導入方法 | DL, インストール, binにパスを通す        | 

Unix互換の`rm`や`mkdir`などのコマンドが必要なため導入します。
インストーラでのインストール後、`C:\Program Files\GnuWin32\bin`にパスを通します。

(※)CoreUtilsの代わりに[GOW](https://github.com/bmatzelle/gow)を使っても良いです。


### MinGW
| ツール   | [mingw-w64](http://mingw-w64.org/doku.php/download)    | 
| -------- | :------------------------------------------ | 
| ファイル | mingw-w64-install.exe          | 
| 導入方法 | DL, インストール, binにパスを通す        | 

RP2040向けのファームウェアをビルドする場合に必要です。
リンク先のサイトの、'MingW-W64-builds'からリンクをたどってファイルをダウンロードします。
インストール時に出るオプションを設定する画面で、Architectureを`x86_64`にします。その他の項目はデフォルトのままでよいでしょう。
インストールができたら, `C:\Program Files\mingw-w64\<バージョン>\mingw64\bin`にパスを通します。

## ビルドの確認

`Kermite/firmware`でコマンドプロンプトを開きます。
```
> where make
> where mkdir.exe
> where rm.exe
> make -v
> arm-none-eabi-gcc -v
> g++ -v
```
などのコマンドで、各ツールが使えるようになっていることを確認します。

```
> make clean
> make proto/standard:rp:build
```
などのコマンドで、プロジェクトをビルドできることを確認します。