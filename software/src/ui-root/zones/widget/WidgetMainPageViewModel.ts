import { IDisplayKeyboardDesign } from '~/shared';
import { models } from '~/ui-root/zones/common/commonModels';
import {
  IKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel,
} from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/KeyUnitCardsPartViewModel';

export interface IWidgetKeyboardViewViewModel {
  keyboardDesign: IDisplayKeyboardDesign;
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
      keyboardDesign: models.editorModel.displayDesign,
      cardsPartVM: makeKeyUnitCardsPartViewModel(false, models),
    },
    onOpenButton() {
      models.siteModel.setWidgetMode(false);
    },
  };
}
