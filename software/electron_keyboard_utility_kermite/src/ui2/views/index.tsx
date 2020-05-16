import { appUi } from '~ui2/models/appGlobal';
import { h, render, rerender as qxRerender } from './basis/qx';
import { SiteRoot } from './root/SiteRoot';

export function initialzeView() {
  appUi.rerender = qxRerender;
  render(() => <SiteRoot />, document.getElementById('app')!);
}
