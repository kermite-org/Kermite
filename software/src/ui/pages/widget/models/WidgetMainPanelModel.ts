import { useEffect } from 'qx';
import { fallbackProfileData, IDisplayKeyboardDesign } from '~/shared';
import { ipcAgent, IWidgetKeyUnitCardViewModel } from '~/ui/base';
import { usePlayerModel } from '~/ui/commonModels';
import { dispatchCoreAction, siteModel, uiActions } from '~/ui/commonStore';
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
      playerModel.setProfileData(profileData || fallbackProfileData);
    })();
  }, []);

  const { isWindowActive, isWidgetAlwaysOnTop } = siteModel;

  const toggleWidgetAlwaysOnTop = () => {
    dispatchCoreAction({ window_setWidgetAlwaysOnTop: !isWidgetAlwaysOnTop });
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
      uiActions.navigateTo('/editor');
    },
    isWidgetAlwaysOnTop,
    toggleWidgetAlwaysOnTop,
  };
}
