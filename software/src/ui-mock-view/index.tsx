/* eslint-disable @typescript-eslint/no-unused-vars */
import { h, render, rerender } from 'qx';
import { debounce } from '~/shared';
import { initializeCss } from '~/ui-common';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { GooberDevelopmentPage } from '~/ui-mock-view/GooberDevelopmentPage';
import { MockPageLoadedDesignDrawing } from '~/ui-mock-view/MockPageLoadedDesignDrawing';
import { MockPageLayouterDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      {/* <MockPageLayouterDevelopment /> */}
      {/* <MockPageLoadedDesignDrawing /> */}
      {/* <UiLayouterPageDevelopmentDummy /> */}
      <UiLayouterPageComponent />
      {/* <GooberDevelopmentPage /> */}
    </div>
  );
};

window.addEventListener('load', () => {
  const appDiv = document.getElementById('app');
  initializeCss();
  render(() => <PageRoot />, appDiv);

  window.addEventListener('resize', debounce(rerender, 300));
  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
  });
});
