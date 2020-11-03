import { h, render, rerender as qxRerender } from '~lib/qx';
import { thinningListenerCall } from '~funcs/Utils';
import { appUi } from '~ui/core';
import { ViewModels } from './viewModels';
import { SiteRoot } from './views/SiteRoot';

export function initialzeRenderer(viewModels: ViewModels) {
  appUi.rerender = qxRerender;
  render(
    () => <SiteRoot viewModels={viewModels} />,
    document.getElementById('app')
  );
  window.addEventListener('resize', thinningListenerCall(appUi.rerender, 100));
}

export function finalizeRenderer() {
  render(() => <div />, document.getElementById('app'));
}
