import { Models } from '~ui/models';
import { FirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';
import { GlobalMenuViewModel } from './GlobalMenuViewModel';
import { NavigationViewModel } from './NavigationViewModel';
import { PresetBrowserViewModel } from './PresetBrowserViewModel';
import { TitleBarViewModel } from './TitleBarViewModel';
import { WidgetMainPageViewModel } from './WidgetMainPageViewModel';

export class ViewModels {
  firmwareUpdation: FirmwareUpdationPageViewModel;
  globalMenu: GlobalMenuViewModel;
  titleBar: TitleBarViewModel;
  navigation: NavigationViewModel;
  wdigetMainPage: WidgetMainPageViewModel;
  presetBrowser: PresetBrowserViewModel;

  constructor(public models: Models) {
    this.firmwareUpdation = new FirmwareUpdationPageViewModel(models);
    this.globalMenu = new GlobalMenuViewModel(models);
    this.titleBar = new TitleBarViewModel(models);
    this.navigation = new NavigationViewModel(models);
    this.wdigetMainPage = new WidgetMainPageViewModel(models);
    this.presetBrowser = new PresetBrowserViewModel(models);
  }

  initialize() {}

  finalize() {}
}
