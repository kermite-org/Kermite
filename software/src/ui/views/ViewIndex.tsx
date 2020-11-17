import { h, render } from '~lib/qx';
import { debounce } from '~funcs/Utils';
import { appUi } from '~ui/core';
import { SiteRoot } from '~ui/views/SiteRoot';

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
