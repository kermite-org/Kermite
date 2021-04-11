import { jsx, Hook, css } from 'qx';
import { PlayerModel } from '~/ui/common';
import { EditorKeyboardView } from '~/ui/common-svg/panels/EditorKeyboardView';
import { makeEditKeyUnitCardsPartViewModel } from '~/ui/editor-page/EditorMainPart/EditKeyUnitCardsPartViewModel';
import { editorModel } from '~/ui/editor-page/EditorMainPart/models/EditorModel';
import { LayerStateView } from './views/LayerStateView';

const playerModel = new PlayerModel();

export function KeyboardSection() {
  Hook.useEffect(() => {
    playerModel.initialize();
    return () => playerModel.finalize();
  }, []);

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
