import { addNumber, showVersion } from '@kermite/shared';
import { initializeCss } from '@kermite/ui';
import { css } from 'goober';
import { h, render } from 'qx';
import { greet } from '~/local';

const cssRoot = css`
  border: solid 4px orange;
  height: 100%;
`;

window.addEventListener('load', () => {
  initializeCss();

  console.log('hello');
  const c = addNumber(100, 200);
  console.log({ c });
  showVersion();
  greet();
  document.body.style.background = '#FFF';

  render(
    () => <div css={cssRoot}>hello qx</div>,
    document.getElementById('app'),
  );
});
