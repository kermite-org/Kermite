import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { ipcAgent, router } from '~/ui/common';
import { IWidgetKeyUnitCardViewModel } from '~/ui/common-svg/KeyUnitCards/WidgetKeyUnitCard';
import { PlayerModel } from '~/ui/common/sharedModels/PlayerModel';
import { siteModel } from '~/ui/common/sharedModels/SiteModel';
import { useWidgetKeyUnitCardViewModel } from '~/ui/widget/models/WidgetKeyUnitCardViewModel';

export interface IWidgetMainPanelModel {
  isWindowActive: boolean;
  keyboardVM: {
    keyboardDesign: IDisplayKeyboardDesign;
    cards: IWidgetKeyUnitCardViewModel[];
  };
  backToConfiguratorView(): void;
}

export function useWidgetMainPanelModel(): IWidgetMainPanelModel {
  const playerModel = Hook.useMemo(() => new PlayerModel(), []);
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
        useWidgetKeyUnitCardViewModel(kp, playerModel),
      ),
    },
    backToConfiguratorView() {
      router.navigateTo('/editor');
    },
  };
}
