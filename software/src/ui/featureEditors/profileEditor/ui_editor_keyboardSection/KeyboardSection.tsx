import { css, FC, jsx } from 'alumina';
import { usePlayerModel } from '~/ui/commonModels';
import { EditorKeyboardView } from '~/ui/elements/keyboard';
import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';
import { ProfileSetupNavigationCardView } from '~/ui/featureEditors/profileEditor/ui_editor_keyboardSection/ProfileSetupNavigationCardView';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/featureEditors/profileEditor/ui_editor_keyboardSection/editKeyUnitCardsPartViewModel';
import { profilesReader } from '~/ui/pages/assignerPage/models';
import { LayerStateView } from './LayerStateView';

export const KeyboardSection: FC = () => {
  const playerModel = usePlayerModel();

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = assignerModel;

  playerModel.setProfileData(assignerModel.profileData);

  const cardsPartVm = makeEditKeyUnitCardsPartViewModel(playerModel);

  if (!profilesReader.isEditProfileAvailable) {
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
