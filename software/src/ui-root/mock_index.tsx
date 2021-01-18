import { h, render } from 'qx';
import { initializeCss } from '~/ui-common';
import { UiLayouterDevelopmentComponent } from './UiLayouterDevelopmentComponent';

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <UiLayouterDevelopmentComponent />, appDiv);

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
