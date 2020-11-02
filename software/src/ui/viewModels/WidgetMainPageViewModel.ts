import { IKeyboardShape } from '~defs/ProfileData';
import { Models } from '~ui/models';
import {
  IKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel
} from '~ui/viewModels/KeyUnitCardsPartViewModel';

export class WidgetKeyboardViewViewModel {
  constructor(private models: Models) {}

  get keyboardShape(): IKeyboardShape {
    return this.models.editorModel.profileData.keyboardShape;
  }

  get cardsPartVM(): IKeyUnitCardPartViewModel {
    return makeKeyUnitCardsPartViewModel(false, this.models);
  }
}

export class WidgetMainPageViewModel {
  constructor(private models: Models) {}

  keyboardVM = new WidgetKeyboardViewViewModel(this.models);

  onOpenButton = () => {
    this.models.siteModel.setWidgetMode(false);
  };
}
