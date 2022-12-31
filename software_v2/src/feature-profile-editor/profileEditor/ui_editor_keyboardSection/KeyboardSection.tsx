import { FC, css, jsx } from 'alumina';
import { IProfileData } from '~/app-shared';
import { EditorKeyboardView } from '~/fe-shared';
import { profileEditorConfig } from '../adapters';
import { assignerModel } from '../models';
import { LayerStateView } from './LayerStateView';
import { ProfileSetupNavigationCardView } from './ProfileSetupNavigationCardView';
import { makeEditKeyUnitCardsPartViewModel } from './editKeyUnitCardsPartViewModel';
// import { ProfileSetupNavigationCardView } from './ProfileSetupNavigationCardView';
// import { usePlayerModel } from '~/ui/commonModels';
// import { profilesReader } from '~/ui/pages/assignerPage/models';
// import { IPlayerModel } from '../adapters';
// import { IProfileData } from '~/app-shared';

const dummyPlayerModel = {
  keyStates: {},
  shiftHold: false,
  setProfileData(_profileData: IProfileData) {},
  getDynamicKeyAssign(_keyUnitId: string) {
    return undefined;
  },
  layerStackItems: [],
};

export const KeyboardSection: FC = () => {
  // const playerModel = usePlayerModel();
  const playerModel = dummyPlayerModel;

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = assignerModel;

  playerModel.setProfileData(assignerModel.profileData);

  const cardsPartVm = makeEditKeyUnitCardsPartViewModel(dummyPlayerModel);

  if (!profileEditorConfig.isEditProfileAvailable) {
    // Profileが存在しない場合、presetBrowserへの導線を表示
    return <ProfileSetupNavigationCardView />;
  }

  return (
    <div class={cssKeyboardSection} onMouseDown={clearAssignSlotSelection}>
      <EditorKeyboardView
        cards={cardsPartVm.cards}
        showLayerDefaultAssign={cardsPartVm.showLayerDefaultAssign}
        design={assignerModel.displayDesign}
      />
      <LayerStateView playerModel={playerModel} />
    </div>
  );
};
