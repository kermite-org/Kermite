import { useEffect } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { ipcAgent, IWidgetKeyUnitCardViewModel, router } from '~/ui/base';
import { siteModel, usePlayerModel } from '~/ui/commonModels';
import { useWidgetKeyUnitCardViewModel } from '~/ui/pages/widget/models/WidgetKeyUnitCardViewModel';

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
