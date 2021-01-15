import { initializeCss } from '@kermite/ui';
import { h, render } from 'qx';
import { UiLayouterDevelopmentComponent } from './UiLayouterDevelopmentComponent';

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <UiLayouterDevelopmentComponent />, appDiv);

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
