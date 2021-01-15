import { initializeCss } from '@kermite/ui';
import { css } from 'goober';
import { h, render } from 'qx';
import { ipcExample } from '~/ipcExample';

const cssPageRoot = css`
  background: #ddd;
  border: solid 2px #f08;
  height: 100%;
`;

const cssIframe = css`
  width: 400px;
  height: 400px;
`;

let pageTag = 'page1';

function loadState() {
  const _pageTag = localStorage.getItem('ui-root#pageTag');
  if (_pageTag) {
    pageTag = _pageTag;
  }
}

function saveState() {
  localStorage.setItem('ui-root#pageTag', pageTag);
}

const PageRoot = () => {
  initializeCss();

  return (
    <div css={cssPageRoot}>
      <div>UI APP ROOT</div>
      <div>
        <button onClick={() => (pageTag = 'page1')}>page1</button>
        <button onClick={() => (pageTag = 'page2')}>page2</button>
      </div>
      <iframe src={`./${pageTag}/index.html`} css={cssIframe}></iframe>
      <div>
        <div>
          <a href="./page1/index.html">move to page1</a>
        </div>
        <div>
          <a href="./page1/index.html" target="_blank">
            open page1 in new window
          </a>
        </div>
      </div>
    </div>
  );
};

window.addEventListener('load', () => {
  loadState();

  const isDevelopment = (window as any).debugConfig?.isDevelopment;
  console.log({ isDevelopment });
  ipcExample();
  render(() => <PageRoot />, document.getElementById('app'));

  window.addEventListener('beforeunload', saveState);
});
