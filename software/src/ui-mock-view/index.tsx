import { h, render } from 'qx';
import { initializeCss } from '~/ui-common';
import { UiLayouterDevelopmentComponent } from './UiLayouterDevelopmentComponent';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      <UiLayouterDevelopmentComponent />
    </div>
  );
};

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <PageRoot />, appDiv);
  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
