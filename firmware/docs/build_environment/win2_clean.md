# OSの環境をなるべく汚染しない構成

基本的な構成は[CoreUtilsを使う場合](./win1_coreutils.md)と同様です。
開発環境の汚染を防ぐため、全部のツールにはパスを通さず、Makeにだけパスを通している点が異なります。
## OSの環境設定でパスを通すもの
* Make for Windows
## Makefileの中でパスを指定して利用するもの
* AVR-GCC
* arm-none-eabi-gcc
* GOW (or CoreUtils)
* MinGW

GNU Makeをグローバルにインストールしてパスを通し、他のツールはパスを通さずMakefile内だけから参照するようにします。追加するツールのうち、コマンドプロンプトから直接呼び出せるものはmakeだけにします。
他のプロジェクトのビルド環境に影響を与えたくない場合にこの構成を検討してください。
## ツールの導入

ツールの導入手順は[CoreUtilsを使う場合](./win1_coreutils.md)と同様です。Make以外にはパスを通しません。
GnuWin32のCoreUtilsとMakeが同じフォルダにインストールされてしまうため、CoreUtilsは導入せず代わりにGOWを使用するのがよいでしょう。
## Makefile内でのパスの指定
Makefile.user.exampleをコピーしてMakefile.userを作成します。
Makefile.userはビルド時に本体のMakefileから読み込まれる、ユーザ環境での固有の設定などを書いておくためのものです。

ファイルの先頭で、以下のように記述して環境変数のPATHを上書きします。
```
export PATH:=$(PATH);<追加するパス1>;<追加するパス2>;...
```
