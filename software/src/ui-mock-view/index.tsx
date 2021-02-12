/* eslint-disable @typescript-eslint/no-unused-vars */
import { h, render, rerender } from 'qx';
import { debounce } from '~/shared';
import { initializeCss } from '~/ui-common';
import { UiLayouterPageComponent } from '~/ui-layouter-page';
import { GooberDevelopmentPage } from '~/ui-mock-view/GooberDevelopmentPage';
import { MockPageComponentDevelopment } from '~/ui-mock-view/MockPageComponentDevelopment';
import { MockPageLoadedDesignDrawing } from '~/ui-mock-view/MockPageLoadedDesignDrawing';
import { RoutingDevelopmentPage } from '~/ui-mock-view/RoutingDevelopmentPage';
import { MockPageLayouterDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      {/* <MockPageLayouterDevelopment /> */}
      {/* <MockPageLoadedDesignDrawing /> */}
      <UiLayouterPageComponent />
      {/* <GooberDevelopmentPage /> */}
      {/* <RoutingDevelopmentPage /> */}
      {/* <MockPageComponentDevelopment /> */}
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
