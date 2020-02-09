import { css, jsx } from '@emotion/core';
import { useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { ModifierVirtualKeys, VirtualKey } from '~model/HighLevelDefs';
import { useMapDispatchToProps } from '~ui/hooks';
import { editorSelectors, editorSlice } from '~ui/state/editorSlice';
import { AppState } from '~ui/state/store';
import { BlankSelectionPart } from './parts/BlankSelectionPart';
import { AssignKeySelectionPart } from './parts/AssignKeySelectionPart';
import { ModifierSelectionPart } from './parts/ModifierSelectionPart';

const mapStateToProps = (state: AppState) => ({
  currentAssign: editorSelectors.getCurrentAssign(state.editor),
  isSlotSelected: editorSelectors.isSlotSelected(state.editor)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setCurrentAssign(virtualKey: VirtualKey) {
    dispatch(editorSlice.actions.setKeyAssignToCurrentSlot({ virtualKey }));
  },
  setCurrentModifiers(modifierKey: ModifierVirtualKeys, enabled: boolean) {
    dispatch(
      editorSlice.actions.setModifierForCurrentAssignSlot({
        modifierKey,
        enabled
      })
    );
  },
  clearCurrentAssign() {
    dispatch(editorSlice.actions.clearCurrentSlotAssign());
  }
});

export const AssignSection = () => {
  const { currentAssign, isSlotSelected } = useSelector(mapStateToProps);
  const {
    setCurrentAssign,
    setCurrentModifiers,
    clearCurrentAssign
  } = useMapDispatchToProps(mapDispatchToProps);

  const cssBase = css`
    display: flex;
  `;
  return (
    <div css={cssBase}>
      <BlankSelectionPart
        isSlotSelected={isSlotSelected}
        currentAssign={currentAssign}
        clearCurrentAssign={clearCurrentAssign}
      />
      <AssignKeySelectionPart
        currentAssign={currentAssign}
        setCurrentAssignKey={setCurrentAssign}
      />

      <ModifierSelectionPart
        currentAssign={currentAssign}
        setCurrentModifiers={setCurrentModifiers}
      />
    </div>
  );
};
