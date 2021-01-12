import { initializeCss } from '@kermite/ui';
import { UiLayouterPageComponent } from '@ui-layouter';
import { h, render } from 'qx';

window.addEventListener('load', () => {
  initializeCss();
  render(() => <UiLayouterPageComponent />, document.getElementById('app'));
});
