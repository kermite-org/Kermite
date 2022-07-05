import { FC, domStyled, jsx, css } from 'alumina';

const textContents = {
  aboutKermite_block1: `Kermiteというキーボードエコシステムを開発しています。
GUIによる設定だけでキーボードの運用ができることを目標としています。
対応MCUはRP2040で、ファームウェアは既存のものに依存しない独自の実装になっています。`,

  aboutKermite_block2: `ブラウザ上で動作するWebアプリで、現在以下のような機能が実装されています。
・ファームウェアの作成
・キーレイアウトの編集
・キーマッピングの設定
・レイヤのリアルタイム表示
`,
  aboutKermite_block3: `このページでは、Kermiteに関連するWebサイトの閲覧と、Webアプリの動作をお試しいただけます。
`,
};

export const TopPageContent: FC = () => {
  return domStyled(
    <div>
      <h1>Kermite 展示用デモサイト</h1>
      <div class="section">
        <h2>Kermiteについて</h2>
        <div class="intro-part">
          <div class="text-block">{textContents.aboutKermite_block1}</div>
          <div class="text-block">{textContents.aboutKermite_block2}</div>
          <div class="text-block">{textContents.aboutKermite_block3}</div>
        </div>
      </div>
      <div class="section">
        <h2>各ページの概要</h2>
        <div class="pages-summary-part">
          <h3>試し打ち</h3>
          <div>
            展示用PCに接続されているキーボードを試し打ちする際にご利用ください。レイヤのリアルタイム表示機能を確認できます。
          </div>
          <h3>Webアプリ</h3>
          <div>
            Kermiteのアプリ本体です。キーマッピングやレイアウトの変更などを機能を実際に使って試すことができます。
          </div>
          <h3>公式サイト</h3>
          <div>ランディングページです。Kermiteの概要を紹介しています。</div>
          <h3>サーバ</h3>
          <div>キーボード定義やキーマッピングを管理しているサーバです。</div>
        </div>
      </div>
    </div>,
    css`
      height: 100%;
      padding: 10px 20px;
      overflow-y: auto;
      color: #456;

      display: flex;
      flex-direction: column;
      gap: 15px;

      > h1 {
        font-size: 32px;
      }

      > .section {
        > h2 {
          display: flex;
          align-items: center;
          font-size: 23px;
          &:before {
            font-family: 'Material Icons';
            content: 'local_offer';
            margin-top: 3px;
            margin-right: 3px;
          }
          margin-bottom: 5px;
        }

        > .page-infos-table {
          display: grid;
          grid-template-columns: auto 1fr;

          > * {
            border: solid 1px #8888;
            padding: 10px;
          }
        }

        > .intro-part {
          display: flex;
          flex-direction: column;
          gap: 10px;

          > .text-block {
            white-space: pre-wrap;
            line-height: 1.5em;
          }
        }

        > .pages-summary-part {
          > h3 {
            display: flex;
            align-items: center;
            font-size: 18px;
            &:before {
              font-family: 'Material Icons';
              content: 'web';
              font-size: 22px;
              margin-top: 2px;
            }
            margin-bottom: 2px;
          }
          > div {
            line-height: 1.5em;
          }
          > div + h3 {
            margin-top: 10px;
          }
        }
      }
    `,
  );
};
