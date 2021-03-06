import { Hook } from 'qx';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { ipcAgent, router } from '~/ui-common';
import { getAssignEntryTexts } from '~/ui-common-svg/KeyUnitCardModels/KeyUnitCardViewModelCommon';
import { IWidgetKeyUnitCardViewModel } from '~/ui-common-svg/KeyUnitCards/WidgetKeyUnitCard';
import { PlayerModel } from '~/ui-common/sharedModels/PlayerModel';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';

export interface IWidgetMainPageViewModel {
  isWindowActive: boolean;
  keyboardVM: {
    keyboardDesign: IDisplayKeyboardDesign;
    cards: IWidgetKeyUnitCardViewModel[];
  };
  backToConfiguratorView(): void;
}

const playerModel = new PlayerModel();

function makeWidgetKeyUnitCardViewModel(
  ke: IDisplayKeyEntity,
  playerModel: PlayerModel,
): IWidgetKeyUnitCardViewModel {
  const keyUnitId = ke.keyId;
  const pos = { x: ke.x, y: ke.y, r: ke.angle || 0 };
  const assign = playerModel.getDynamicKeyAssign(keyUnitId) || {
    type: 'layerFallbackBlock',
  };
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    playerModel.layers,
  );

  const isHold = playerModel.keyStates[ke.keyId];

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    isLayerFallback: isLayerFallback || false,
    isHold,
    shape: ke.shape,
    shiftHold: playerModel.checkShiftHold(),
  };
}

export function makeWidgetMainPageViewModel(): IWidgetMainPageViewModel {
  Hook.useEffect(() => {
    playerModel.initialize();
    (async () => {
      const profileData = await ipcAgent.async.profile_getCurrentProfile();
      playerModel.setProfileData(profileData);
    })();
    return () => playerModel.finalize();
  }, []);

  return {
    isWindowActive: siteModel.isWindowActive,
    keyboardVM: {
      keyboardDesign: playerModel.displayDesign,
      cards: playerModel.displayDesign.keyEntities.map((kp) =>
        makeWidgetKeyUnitCardViewModel(kp, playerModel),
      ),
    },
    backToConfiguratorView() {
      router.navigateTo('/editor');
    },
  };
}
