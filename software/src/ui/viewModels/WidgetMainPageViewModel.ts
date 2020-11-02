import { IKeyboardShape } from '~defs/ProfileData';
import { models } from '~ui/models';
import {
  IKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel
} from '~ui/views/pages/KeyAssignEditPage/KeyboardSection/KeyUnitCardsPart.model';

export class WidgetKeyboardViewViewModel {
  get keyboardShape(): IKeyboardShape {
    return models.editorModel.profileData.keyboardShape;
  }

  get cardsPartVM(): IKeyUnitCardPartViewModel {
    return makeKeyUnitCardsPartViewModel(false);
  }
}

export class WidgetMainPageViewModel {
  keyboardVM = new WidgetKeyboardViewViewModel();

  onOpenButton = () => {
    models.siteModel.setWidgetMode(false);
  };
}
