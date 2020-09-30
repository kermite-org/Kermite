import { appUi } from '~ui/models/appUi';
import { h, render, rerender as qxRerender } from '~lib/qx';
import { ViewRoot } from './ViewRoot';
import { thinningListenerCall } from '~funcs/Utils';

export function initialzeView() {
  appUi.rerender = qxRerender;
  render(() => <ViewRoot />, document.getElementById('app'));
  window.addEventListener('resize', thinningListenerCall(appUi.rerender, 100));
}

export function finalizeView() {
  render(() => <div />, document.getElementById('app'));
}
