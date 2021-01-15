import { initializeCss } from '@kermite/ui';
import { UiLayouterPageComponent } from '@ui-layouter';
import { h, render } from 'qx';

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <UiLayouterPageComponent />, appDiv);

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
