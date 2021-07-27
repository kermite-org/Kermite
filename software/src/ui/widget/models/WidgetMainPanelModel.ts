import { useEffect } from 'qx';
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
  isWidgetAlwaysOnTop: boolean;
  toggleWidgetAlwaysOnTop(): void;
}

export function useWidgetMainPanelModel(): IWidgetMainPanelModel {
  const playerModel = usePlayerModel();
  useEffect(() => {
    (async () => {
      const profileData = await ipcAgent.async.profile_getCurrentProfile();
      playerModel.setProfileData(profileData);
    })();
  }, []);

  const { isWindowActive, isWidgetAlwaysOnTop } = siteModel;

  const toggleWidgetAlwaysOnTop = async () => {
    await ipcAgent.async.window_setWidgetAlwaysOnTop(!isWidgetAlwaysOnTop);
  };

  return {
    isWindowActive,
    keyboardVM: {
      keyboardDesign: playerModel.displayDesign,
      cards: playerModel.displayDesign.keyEntities.map((kp) =>
        useWidgetKeyUnitCardViewModel(kp, playerModel),
      ),
    },
    backToConfiguratorView() {
      router.navigateTo('/editor');
    },
    isWidgetAlwaysOnTop,
    toggleWidgetAlwaysOnTop,
  };
}
