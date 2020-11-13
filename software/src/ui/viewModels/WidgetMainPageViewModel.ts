import { IKeyboardShape } from '~defs/ProfileData';
import { models } from '~ui/models';
import {
  IKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel
} from '~ui/viewModels/KeyUnitCardsPartViewModel';

export interface IWidgetKeyboardViewViewModel {
  keyboardShape: IKeyboardShape;
  cardsPartVM: IKeyUnitCardPartViewModel;
}

export interface IWidgetMainPageViewModel {
  isWindowActive: boolean;
  keyboardVM: IWidgetKeyboardViewViewModel;
  onOpenButton(): void;
}

export function makeWidgetMainPageViewModel(): IWidgetMainPageViewModel {
  return {
    isWindowActive: models.siteModel.isWindowActive,
    keyboardVM: {
      keyboardShape: models.editorModel.profileData.keyboardShape,
      cardsPartVM: makeKeyUnitCardsPartViewModel(false, models)
    },
    onOpenButton() {
      models.siteModel.setWidgetMode(false);
    }
  };
}
