import { Models } from '~ui/models';
import { TitleBarViewModel } from './TitleBarViewModel';
import { WidgetMainPageViewModel } from './WidgetMainPageViewModel';

export class ViewModels {
  titleBar: TitleBarViewModel;
  wdigetMainPage: WidgetMainPageViewModel;

  constructor(public models: Models) {
    this.titleBar = new TitleBarViewModel(models);
    this.wdigetMainPage = new WidgetMainPageViewModel(models);
  }

  initialize() {}

  finalize() {}
}
