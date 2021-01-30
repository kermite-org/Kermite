import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { PlayerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import { siteModel } from '~/ui-root/zones/common/commonModels/SiteModel';
import {
  IWidgetKeyUnitCardPartViewModel,
  makeKeyUnitCardsPartViewModel,
} from '~/ui-root/zones/widget/WidgetKeyUnitCardsPartViewModel';

export interface IWidgetKeyboardViewViewModel {
  keyboardDesign: IDisplayKeyboardDesign;
  cardsPartVM: IWidgetKeyUnitCardPartViewModel;
}

export interface IWidgetMainPageViewModel {
  isWindowActive: boolean;
  keyboardVM: IWidgetKeyboardViewViewModel;
  onOpenButton(): void;
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
      cardsPartVM: makeKeyUnitCardsPartViewModel(playerModel),
    },
    onOpenButton() {
      siteModel.setWidgetMode(false);
    },
  };
}
