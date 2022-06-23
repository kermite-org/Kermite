ソースコード上で定義したキーボード定義を標準ファームウェアに埋め込むためのスクリプトです。
標準ファームウェアの開発/デバッグ時に、KermiteのGUIを使わずに手元で動作を確認したい場合に使用します。

(使い方)
KeyboardVariants.tsにキーボード定義を書きます。
Root.tsのforgeStandardKeyboardFirmwareRp()内で参照するキーボード定義を指定します。

以下のコマンドを順に実行します
yarn prepare  //標準ファームウェアをビルドする
yarn build    //ビルドした標準ファームウェアにキーボード定義を埋め込む
yarn flash    //MCUに書き込む