import { IDisplayKeyboardDesign } from '~/shared';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import {
  IKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel,
} from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/KeyUnitCardsPartViewModel';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';

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
    isWindowActive: siteModel.isWindowActive,
    keyboardVM: {
      keyboardDesign: editorModel.displayDesign,
      cardsPartVM: makeKeyUnitCardsPartViewModel(false),
    },
    onOpenButton() {
      siteModel.setWidgetMode(false);
    },
  };
}
