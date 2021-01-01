import { debounce } from '~shared/funcs/Utils';
import { appUi } from '~ui/core';
import { SiteRoot } from '~ui/views/SiteRoot';
import { h, render } from '~qx';

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
