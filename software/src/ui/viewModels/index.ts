import { models, Models } from '~ui/models';
import { FirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';
import { GlobalMenuViewModel } from './GlobalMenuViewModel';
import { ShapePreviewPageViewModel } from './ShapePreviewPageViewModel';

export class ViewModels {
  shapePreview: ShapePreviewPageViewModel;
  firmwareUpdation: FirmwareUpdationPageViewModel;
  globalMenu: GlobalMenuViewModel;

  constructor(models: Models) {
    this.shapePreview = new ShapePreviewPageViewModel(models);
    this.firmwareUpdation = new FirmwareUpdationPageViewModel(models);
    this.globalMenu = new GlobalMenuViewModel(models);
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
