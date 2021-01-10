import { debounce } from '@kermite/shared';
import { appUi } from '@kermite/ui';
import { h, render } from 'qx';
import { SiteRoot } from '~/views/SiteRoot';

export class Views {
  get appDiv() {
    return document.getElementById('app');
  }

  initialize() {
    render(() => <SiteRoot />, this.appDiv);
    window.addEventListener('resize', debounce(appUi.rerender, 100));
    appUi.startAsyncRenderLoop();
  }

  finalize() {
    render(() => <div />, this.appDiv);
  }
}
