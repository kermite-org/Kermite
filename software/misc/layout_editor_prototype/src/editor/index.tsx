import { initializeCss } from '~/base/cssInitializer';
import { debounce } from '~/base/utils';
import { editMutations, saveEditKeyboardDesign } from '~/editor/store';
import { setupKeyboardOperationHander } from '~/editor/store/KeyboardOperationHandler';
import { PageRoot } from '~/editor/views/PageRoot';
import { h, render, rerender } from '~/qx';

window.addEventListener('load', () => {
  console.log('start');

  editMutations.resetSitePosition();

  initializeCss();

  render(() => <PageRoot />, document.getElementById('app'));

  setupKeyboardOperationHander();

  window.addEventListener('resize', debounce(rerender, 300));

  window.addEventListener('beforeunload', saveEditKeyboardDesign);
});
