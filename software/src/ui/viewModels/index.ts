import { Models } from '~ui/models';
import { TitleBarViewModel } from './TitleBarViewModel';

export class ViewModels {
  titleBar: TitleBarViewModel;

  constructor(public models: Models) {
    this.titleBar = new TitleBarViewModel(models);
  }

  initialize() {}

  finalize() {}
}
