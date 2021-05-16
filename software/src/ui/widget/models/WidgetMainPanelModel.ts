import { Hook } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { ipcAgent, router, siteModel, usePlayerModel } from '~/ui/common';
import { IWidgetKeyUnitCardViewModel } from '~/ui/common-svg/keyUnitCards/WidgetKeyUnitCard';
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
  const playerModel = usePlayerModel();
  Hook.useEffect(() => {
    (async () => {
      const profileData = await ipcAgent.async.profile_getCurrentProfile();
      playerModel.setProfileData(profileData);
    })();
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
