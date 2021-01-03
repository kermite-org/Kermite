import { initializeCss } from '@kermite/ui';
import { css } from 'goober';
import { h, render } from 'qx';

const cssPageRoot = css`
  background: #ddd;
  border: solid 2px #f08;
  height: 100%;
`;

const cssIframe = css`
  width: 400px;
  height: 400px;
`;
const PageRoot = () => {
  initializeCss();

  return (
    <div css={cssPageRoot}>
      <div>UI APP ROOT</div>
      <iframe src="./page1/index.html" css={cssIframe}></iframe>
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
  const isDevelopment = (window as any).debugConfig?.isDevelopment;
  console.log({ isDevelopment });

  render(() => <PageRoot />, document.getElementById('app'));
});
