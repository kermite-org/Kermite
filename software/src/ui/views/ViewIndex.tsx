import { h, render } from '~lib/qx';
import { debounce } from '~funcs/Utils';
import { appUi } from '~ui/core';
import { ViewModels } from '~ui/viewModels';
import { SiteRoot } from '~ui/views/SiteRoot';

export class Views {
  constructor(private viewModels: ViewModels) {}

  get appDiv() {
    return document.getElementById('app');
  }

  initialize() {
    render(() => <SiteRoot viewModels={this.viewModels} />, this.appDiv);
    window.addEventListener('resize', debounce(appUi.rerender, 100));
    appUi.startAsyncRenderLoop();
  }

  finalize() {
    render(() => <div />, this.appDiv);
  }
}
