import { PageRoot } from '~/PageRoot';
import { initializeCss } from '~/cssInitializer';
import { h, render } from '~/qx';

window.addEventListener('load', () => {
  console.log('start');

  initializeCss();

  render(() => <PageRoot />, document.getElementById('app'));
});
