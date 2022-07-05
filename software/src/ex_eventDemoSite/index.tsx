import { css, domStyled, FC, jsx, render } from 'alumina';
import { TopPageContent } from './TopPageContent';

type IPageSig = 'topPage' | 'editorDemo' | 'webApp' | 'officialSite' | 'server';

const state = {
  currentPageSig: 'topPage' as IPageSig,
};

const actions = {
  setCurrentPageSig(pageSig: IPageSig) {
    state.currentPageSig = pageSig;
  },
};

namespace nsAppStatePersistence {
  const storageKey = 'kermite-event-demo-site-persist-state';

  type IPersistObject = {
    currentPageSig: IPageSig;
  };

  export function load() {
    const text = localStorage.getItem(storageKey);
    if (text) {
      const obj = JSON.parse(text) as IPersistObject;
      if (obj) {
        state.currentPageSig = obj.currentPageSig;
      }
    }
  }
  export function save() {
    const obj: IPersistObject = {
      currentPageSig: state.currentPageSig,
    };
    const text = JSON.stringify(obj);
    localStorage.setItem(storageKey, text);
  }
}

type IPageItem = {
  pageSig: IPageSig;
  title: string;
  contentUrl?: string;
};

const pageItems: IPageItem[] = [
  {
    pageSig: 'topPage',
    title: 'トップ',
  },
  {
    pageSig: 'editorDemo',
    title: '試し\n打ち',
    contentUrl: 'https://app.kermite.org/?editor_demo=1',
  },
  {
    pageSig: 'webApp',
    title: 'Web\nアプリ',
    contentUrl: 'https://app.kermite.org',
  },
  {
    pageSig: 'officialSite',
    title: '公式\nサイト',
    contentUrl: 'https://kermite.org',
  },
  {
    pageSig: 'server',
    title: 'サーバ',
    contentUrl: 'https://server.kermite.org',
  },
];

const uiTheme = {
  // clFrame: '#468',
  clFrame: '#668',
  clNavIcon: '#ac8',
  clNavIconActive: '#6b5',
  // clSideBar: '#def',
  clSideBar: '#fff',
};

const PageIconsPart: FC = () => {
  return domStyled(
    <div>
      {pageItems.map((item) => (
        <div
          key={item.pageSig}
          class={['card', item.pageSig === state.currentPageSig && '--active']}
          onClick={() => actions.setCurrentPageSig(item.pageSig)}
        >
          {item.title}
        </div>
      ))}
    </div>,
    css`
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      > .card {
        background: ${uiTheme.clNavIcon};
        color: #fff;
        display: grid;
        place-items: center;
        text-align: center;
        white-space: pre-wrap;
        font-size: 32px;
        line-height: 1.1em;
        height: 88px;
        cursor: pointer;

        &.--active {
          background: ${uiTheme.clNavIconActive};
        }

        &:hover {
          opacity: 0.7;
        }

        transition: all 0.5s;
      }
    `,
  );
};

const QrCodePart: FC = () => {
  return domStyled(
    <div>
      <p>Kermite公式サイト</p>
      <p>https://kermite.org</p>
      <img src="https://i.imgur.com/ej7rN6f.png" />
    </div>,
    css`
      margin: 10px;
      font-size: 13px;
      > img {
        margin-top: 4px;
        width: 100px;
      }
    `,
  );
};

const SideBar: FC = () => {
  return domStyled(
    <div>
      <PageIconsPart />
      <QrCodePart class="qr-code-part" />
    </div>,
    css`
      width: 136px;
      border: solid 1px ${uiTheme.clFrame};
      background: ${uiTheme.clSideBar};
      display: flex;
      flex-direction: column;

      > .qr-code-part {
        margin-top: auto;
      }
    `,
  );
};

const MainContent: FC = () => {
  const pageItem = pageItems.find((it) => it.pageSig === state.currentPageSig);
  if (pageItem?.contentUrl) {
    return domStyled(
      <iframe src={pageItem.contentUrl} />,
      css`
        width: 100%;
        height: 100%;
        border: none;
      `,
    );
  } else if (pageItem?.pageSig === 'topPage') {
    return <TopPageContent />;
  } else {
    return <div>content not found</div>;
  }
};

const PageRoot: FC = () => {
  return domStyled(
    <div>
      <SideBar class="side-bar" />
      <div class="main-column">
        {/* <div class="url-bar">aaa</div> */}
        <div class="main-area">
          <MainContent />
        </div>
      </div>
    </div>,
    css`
      height: 100%;
      display: flex;
      overflow: hidden;

      > .side-bar {
        flex-shrink: 0;
        overflow-y: auto;
      }

      > .main-column {
        flex-grow: 1;

        > .url-bar {
          border: solid 1px #888;
        }

        > .main-area {
          border: solid 1px ${uiTheme.clFrame};
          flex-grow: 1;
          height: 100%;
        }
      }
    `,
  );
};

window.addEventListener('load', () => {
  console.log(`event_demo_site 220703`);
  nsAppStatePersistence.load();
  render(() => <PageRoot />, document.getElementById('app'));
  window.addEventListener('beforeunload', () => {
    nsAppStatePersistence.save();
  });
});
