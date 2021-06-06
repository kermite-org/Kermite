import { css, jsx } from 'qx';
import { usePlayerModel } from '~/ui/common';
import { EditorKeyboardView } from '~/ui/common-svg/panels/EditorKeyboardView';
import { editorModel } from '~/ui/editor-page/models/EditorModel';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/editor-page/ui_editor_keyboardSection/EditKeyUnitCardsPartViewModel';
import { LayerStateView } from './LayerStateView';

export function KeyboardSection() {
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
}
