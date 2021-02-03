# Kermite ファームウェア 開発者向け資料

このドキュメントでは、個別のキーボード向けのファームウェアを作成する場合に必要な情報をまとめています。

## ファームウェアのフォルダ階層
<pre>
src
├── modules
└── projects
    ├── keyboard1
    ├── keyboard2
    └── csp
        ├── keyboard3
        ├── keyboard4
        └── ...
</pre>
`Kermite/firmware`の`src`配下では以下のようなフォルダ構成になっています。
* `modules`以下では共通で使われる機能を提供しています。
* `projects`以下に各キーボードの実装を配置しています。
  * キット開発者による公式の実装は`projects`直下に配置
  * 有志による非公式の対応は`projects/csp`以下に配置(CSPはCommunity Supported Projectsの略です)

新たなキーボードのプロジェクトを追加する場合、`projects`以下にキーボード名でフォルダを作ってコードや設定ファイルを配置してください。

## プロジェクトの内容構成

各キーボードのファームウェア実装のことをプロジェクトと呼んでいます。プロジェクトは以下のようなファイルで構成されます。

<pre>
 keyboard1
  ├── config.h
  ├── layout.json
  ├── main.c
  ├── presets
  │   └── preset1.json
  ├── project.json
  └── rules.mk
</pre>

| ファイル名 |　説明 |
| :--- | :--- |
| config.h | ファームウェア内で参照する値を定義します。 |
| layout.json | キーの配置とキーボードの外形を定義します。 |
| main.c | プログラムのエントリポイントです。 | 
| presets | プリセットプロファイルをここに格納します。 | 
| project.json | プロジェクト固有の情報を記述します。 | 
| rules.mk | ビルド時に親のMakefileから呼ばれます。 | 

(※) レイアウトやプリセットのJSONは、ユーティリティソフトを使って作成できます。

## プロジェクトID
各プロジェクトは、英数字8桁の重複しないIDを持っています。このIDはマイコンのROMに格納され、ユーティリティソフトがキーボードを検出した際に品種を判定するために使用されます。新しいプロジェクトを作成する場合、以下のジェネレータで生成してください。

https://yahiro07.github.io/KermiteResourceStore/generator



## ブランチ構成, リポジトリ構成
ファームウェアの共通モジュールやユーティリティソフトウェアの実装を`master`ブランチ,`develop`ブランチで行っています。

これとは別に各キーボードのファームウェア対応用の`variants`ブランチがあります。`variants`ブランチにマージされたファームウェアのソースコードはCI(github actions)でビルドされ、ビルドされたバイナリが
<a href="https://github.com/yahiro07/KermiteResourceStore">KermiteResourceStore</a>
リポジトリに保存されます。Kermiteのユーティリティソフトは、実行時にこのリポジトリから最新のファームウェアや各キーボードのレイアウト定義を取得します。

新たにキーボードの対応を行った場合、`variants`ブランチに向けてプルリクエストを作成してください。PRが`variants`ブランチにマージされた時点でユーティリティソフトから対象のプロジェクトが利用できるようになります。


