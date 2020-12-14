import { css } from 'goober';
import { initializeCss } from '~/cssInitializer';
import { h, render } from '~/qx';

const cssPageRoot = css`
  border: solid 2px #f08;
  padding: 10px;
  height: 100%;
`;

const PageRoot = () => {
  return <div css={cssPageRoot}>layout editor proto</div>;
};

window.addEventListener('load', () => {
  console.log('start');

  initializeCss();

  render(() => <PageRoot />, document.getElementById('app'));
});
