import { h, render } from 'qx';
import { initializeCss } from '~/ui-common';
import { MockPageLayouterDevelopment } from './MockPageLayouterDevelopment';

const PageRoot = () => {
  return (
    <div style={{ height: '100%' }}>
      <MockPageLayouterDevelopment />
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
