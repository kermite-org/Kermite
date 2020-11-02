import { models, Models } from '~ui/models';
import { FirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';
import { ShapePreviewPageViewModel } from './ShapePreviewPageViewModel';

export class ViewModels {
  shapePreview: ShapePreviewPageViewModel;
  firmwareUpdation: FirmwareUpdationPageViewModel;

  constructor(private models: Models) {
    this.shapePreview = new ShapePreviewPageViewModel(models);
    this.firmwareUpdation = new FirmwareUpdationPageViewModel(models);
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
