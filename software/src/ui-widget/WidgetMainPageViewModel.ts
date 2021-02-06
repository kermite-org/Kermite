import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import {
  IWidgetKeyUnitCardsPartViewModel,
  makeWidgetKeyUnitCardsPartViewModel,
} from '~/ui-common-svg/KeyUnitCardsPart/WidgetKeyUnitCardsPartViewModel';
import { PlayerModel } from '~/ui-common/sharedModels/PlayerModel';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';

export interface IWidgetKeyboardViewViewModel {
  keyboardDesign: IDisplayKeyboardDesign;
  cardsPartVM: IWidgetKeyUnitCardsPartViewModel;
}

export interface IWidgetMainPageViewModel {
  isWindowActive: boolean;
  keyboardVM: IWidgetKeyboardViewViewModel;
  backToConfiguratorView(): void;
}

const playerModel = new PlayerModel();

export function makeWidgetMainPageViewModel(): IWidgetMainPageViewModel {
  Hook.useEffect(() => {
    playerModel.initialize();
    return () => playerModel.finalize();
  }, []);

  return {
    isWindowActive: siteModel.isWindowActive,
    keyboardVM: {
      keyboardDesign: playerModel.displayDesign,
      cardsPartVM: makeWidgetKeyUnitCardsPartViewModel(playerModel),
    },
    backToConfiguratorView() {
      siteModel.setWidgetMode(false);
    },
  };
}
