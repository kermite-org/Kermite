import { initializeCss } from '@kermite/ui';
import { css } from 'goober';
import { h, render } from 'qx';

const cssRoot = css`
  border: solid 4px #f6a;
  height: 100%;
`;

window.addEventListener('load', () => {
  initializeCss();
  render(() => <div css={cssRoot}>page2</div>, document.getElementById('app'));
});
