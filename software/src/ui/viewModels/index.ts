import { models, Models } from '~ui/models';
import { FirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';
import { GlobalMenuViewModel } from './GlobalMenuViewModel';
import { ShapePreviewPageViewModel } from './ShapePreviewPageViewModel';
import { TitleBarViewModel } from './TitleBarViewModel';

export class ViewModels {
  shapePreview: ShapePreviewPageViewModel;
  firmwareUpdation: FirmwareUpdationPageViewModel;
  globalMenu: GlobalMenuViewModel;
  titleBar: TitleBarViewModel;

  constructor(models: Models) {
    this.shapePreview = new ShapePreviewPageViewModel(models);
    this.firmwareUpdation = new FirmwareUpdationPageViewModel(models);
    this.globalMenu = new GlobalMenuViewModel(models);
    this.titleBar = new TitleBarViewModel(models);
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
