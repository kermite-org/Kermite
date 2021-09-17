import { css, FC, jsx } from 'qx';
import { usePlayerModel } from '~/ui/commonModels';
import { EditorKeyboardView } from '~/ui/components/keyboard';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/features/ProfileEditor/ui_editor_keyboardSection/EditKeyUnitCardsPartViewModel';
import { ProfileSetupNavigationCardView } from '~/ui/features/ProfileEditor/ui_editor_keyboardSection/ProfileSetupNavigationCardView';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { LayerStateView } from './LayerStateView';

export const KeyboardSection: FC = () => {
  const playerModel = usePlayerModel();

  const cssKeyboardSection = css`
    position: relative;
    height: 100%;
  `;
  const { clearAssignSlotSelection } = editorModel;

  playerModel.setProfileData(editorModel.profileData);

  const cardsPartVm = makeEditKeyUnitCardsPartViewModel(
    playerModel,
    editorModel,
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
        design={editorModel.displayDesign}
      />
      <LayerStateView playerModel={playerModel} />
    </div>
  );
};
