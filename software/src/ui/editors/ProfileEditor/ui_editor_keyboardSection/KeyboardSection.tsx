import { css, FC, jsx } from 'qx';
import { usePlayerModel } from '~/ui/commonModels';
import { EditorKeyboardView } from '~/ui/components/keyboard';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_keyboardSection/EditKeyUnitCardsPartViewModel';
import { ProfileSetupNavigationCardView } from '~/ui/editors/ProfileEditor/ui_editor_keyboardSection/ProfileSetupNavigationCardView';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { LayerStateView } from './LayerStateView';

export const KeyboardSection: FC = () => {
  const playerModel = usePlayerModel();

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = assignerModel;

  playerModel.setProfileData(assignerModel.profileData);

  const cardsPartVm = makeEditKeyUnitCardsPartViewModel(
    playerModel,
    assignerModel,
  );

  if (!profilesReader.isEditProfileAvailable) {
    // Profileが存在しない場合、presetBrowserへの導線を表示
    return <ProfileSetupNavigationCardView />;
  }

  return (
    <div css={cssKeyboardSection} onMouseDown={clearAssignSlotSelection}>
      <EditorKeyboardView
        cards={cardsPartVm.cards}
        showLayerDefaultAssign={cardsPartVm.showLayerDefaultAssign}
        design={assignerModel.displayDesign}
      />
      <LayerStateView playerModel={playerModel} />
    </div>
  );
};
