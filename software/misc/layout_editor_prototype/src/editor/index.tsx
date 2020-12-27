import { initializeCss } from '~/base/cssInitializer';
import { debounce } from '~/base/utils';
import { PageRoot } from '~/editor/views/PageRoot';
import { h, render, rerender } from '~/qx';

window.addEventListener('load', () => {
  console.log('start');

  initializeCss();

  render(() => <PageRoot />, document.getElementById('app'));

  window.addEventListener('resize', debounce(rerender, 300));
});
