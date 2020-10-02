import { appUi } from '~ui/core';
import { h, render, rerender as qxRerender } from '~lib/qx';
import { ViewRoot } from './views/ViewRoot';
import { thinningListenerCall } from '~funcs/Utils';

export function initialzeRenderer() {
  appUi.rerender = qxRerender;
  render(() => <ViewRoot />, document.getElementById('app'));
  window.addEventListener('resize', thinningListenerCall(appUi.rerender, 100));
}

export function finalizeRenderer() {
  render(() => <div />, document.getElementById('app'));
}
