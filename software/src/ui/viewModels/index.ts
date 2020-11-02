import { models, Models } from '~ui/models';
import { ShapePreviewPageViewModel } from './ShapePreviewPageViewModel';

export class ViewModels {
  shapePreview: ShapePreviewPageViewModel;

  constructor(private models: Models) {
    this.shapePreview = new ShapePreviewPageViewModel(models);
  }

  initialize() {
    this.shapePreview.initialize();
  }

  finalize() {
    this.shapePreview.finalize();
  }
}

export const viewModels = new ViewModels(models);
