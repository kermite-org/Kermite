/* eslint-disable @typescript-eslint/no-unused-vars */
import { h, render } from 'qx';
import { initializeCss } from '~/ui-common';
import { MockPageLoadedDesignDrawing } from '~/ui-mock-view/MockPageLoadedDesignDrawing';
import { MockPageLayouterDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      <MockPageLayouterDevelopment />
      {/* <MockPageLoadedDesignDrawing /> */}
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
