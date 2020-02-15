import { css, jsx } from '@emotion/core';
import { useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { ModifierVirtualKeys, VirtualKey } from '~model/HighLevelDefs';
import { useMapDispatchToProps } from '~ui/hooks';
import { editorSlice, editorSelectors } from '~ui/state/editor';
import { AppState } from '~ui/state/store';
import { BlankSelectionPart } from './components/BlankSelectionPart';
import { AssignKeySelectionPart } from './components/AssignKeySelectionPart';
import { ModifierSelectionPart } from './components/ModifierSelectionPart';

const mapStateToProps = (state: AppState) => ({
  layers: state.editor.editModel.layers,
  currentAssign: editorSelectors.getCurrentAssign(state.editor),
  customLayers: editorSelectors.getCustomLayers(state.editor),
  isSlotSelected: editorSelectors.isSlotSelected(state.editor)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setCurrentAssignKey(virtualKey: VirtualKey) {
    dispatch(editorSlice.actions.setKeyAssignToCurrentSlot(virtualKey));
  },
  setCurrentModifiers(modifierKey: ModifierVirtualKeys, enabled: boolean) {
    dispatch(
      editorSlice.actions.setModifierForCurrentAssignSlot({
        modifierKey,
        enabled
      })
    );
  },
  setCurrentAssignHoldLayer(layerId: string) {
    dispatch(editorSlice.actions.setHoldLayerForCurrentAssignSlot(layerId));
  },
  clearCurrentAssign() {
    dispatch(editorSlice.actions.clearCurrentSlotAssign());
  }
});

export const AssignSection = () => {
  const { currentAssign, isSlotSelected, customLayers } = useSelector(
    mapStateToProps
  );
  const {
    setCurrentAssignKey,
    setCurrentModifiers,
    clearCurrentAssign,
    setCurrentAssignHoldLayer
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
        setCurrentAssignKey={setCurrentAssignKey}
        customLayers={customLayers}
        setCurrentAssignHoldLayer={setCurrentAssignHoldLayer}
      />

      <ModifierSelectionPart
        currentAssign={currentAssign}
        setCurrentModifiers={setCurrentModifiers}
      />
    </div>
  );
};
