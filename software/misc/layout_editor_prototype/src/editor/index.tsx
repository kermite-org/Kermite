import { initializeCss } from '~/base/cssInitializer';
import { PageRoot } from '~/editor/views/PageRoot';
import { h, render } from '~/qx';

window.addEventListener('load', () => {
  console.log('start');

  initializeCss();

  render(() => <PageRoot />, document.getElementById('app'));
});
