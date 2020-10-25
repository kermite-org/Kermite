import { h, render, rerender as qxRerender } from '~lib/qx';
import { thinningListenerCall } from '~funcs/Utils';
import { appUi } from '~ui/core';
import { SiteRoot } from './views/SiteRoot';

export function initialzeRenderer() {
  appUi.rerender = qxRerender;
  render(() => <SiteRoot />, document.getElementById('app'));
  window.addEventListener('resize', thinningListenerCall(appUi.rerender, 100));
}

export function finalizeRenderer() {
  render(() => <div />, document.getElementById('app'));
}
