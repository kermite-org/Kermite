import { models, Models } from '~ui/models';
import { FirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';
import { GlobalMenuViewModel } from './GlobalMenuViewModel';
import { NavigationViewModel } from './NavigationViewModel';
import { ShapePreviewPageViewModel } from './ShapePreviewPageViewModel';
import { TitleBarViewModel } from './TitleBarViewModel';

export class ViewModels {
  shapePreview: ShapePreviewPageViewModel;
  firmwareUpdation: FirmwareUpdationPageViewModel;
  globalMenu: GlobalMenuViewModel;
  titleBar: TitleBarViewModel;
  navigation: NavigationViewModel;

  constructor(public models: Models) {
    this.shapePreview = new ShapePreviewPageViewModel(models);
    this.firmwareUpdation = new FirmwareUpdationPageViewModel(models);
    this.globalMenu = new GlobalMenuViewModel(models);
    this.titleBar = new TitleBarViewModel(models);
    this.navigation = new NavigationViewModel(models);
  }

  initialize() {
    this.shapePreview.initialize();
    this.firmwareUpdation.initialize();
  }

  finalize() {
    this.shapePreview.finalize();
    this.firmwareUpdation.finalize();
  }
}

export const viewModels = new ViewModels(models);
