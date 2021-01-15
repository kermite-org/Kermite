import { initializeCss } from '@kermite/ui';
import { h, render } from 'qx';
import { UiLayouterPageComponent } from '@ui-layouter';

window.addEventListener('load', () => {
  initializeCss();
  render(() => <UiLayouterPageComponent />, document.getElementById('app'));
});
