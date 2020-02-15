import { css, jsx } from '@emotion/core';
import { useSelector } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { ModifierVirtualKey, VirtualKey } from '~model/HighLevelDefs';
import { useMapDispatchToProps } from '~ui/hooks';
import {
  editorSlice,
  editorSelectors,
  AssignCategory,
  getAssignCategoryFromAssign
} from '~ui/state/editor';
import { AppState } from '~ui/state/store';
import { BlankSelectionPart } from './components/BlankSelectionPart';
import { AssignKeySelectionPart } from './components/AssignKeySelectionPart';
import { ModifierSelectionPart } from './components/ModifierSelectionPart';
import { SlotSelectionPart } from './components/SlotSelectionPart';
import { AssingTypeSelectionPart } from './components/AssignTypeSelectionPart';
import React from 'react';
import { HoldSelectionPart } from './components/HoldSelectionPart';

const mapStateToProps = (state: AppState) => ({
  layers: state.editor.editModel.layers,
  currentAssign: editorSelectors.getCurrentAssign(state.editor),
  customLayers: editorSelectors.getCustomLayers(state.editor),
  isSlotSelected: editorSelectors.isSlotSelected(state.editor),
  currentSlotAddress: state.editor.currentAssignSlotAddress,
  currentAssignCategory: state.editor.currentAssignCategory
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setCurrentAssignKey(virtualKey: VirtualKey) {
    dispatch(editorSlice.actions.setKeyAssignToCurrentSlot(virtualKey));
  },
  setCurrentModifiers(modifierKey: ModifierVirtualKey, enabled: boolean) {
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
  },
  selectAssignSlot(keyUnitId: string, isPrimary: boolean) {
    dispatch(editorSlice.actions.selectAssignSlot({ keyUnitId, isPrimary }));
  },
  setAssignCategory(assignCategory: AssignCategory) {
    dispatch(editorSlice.actions.setAssignCategory(assignCategory));
  },
  setAssignForCurrentSlot: bindActionCreators(
    editorSlice.actions.setAssignForCurrentSlot,
    dispatch
  )
});

export const AssignSection = () => {
  const {
    currentAssign,
    isSlotSelected,
    customLayers,
    currentSlotAddress,
    currentAssignCategory
  } = useSelector(mapStateToProps);
  const {
    setCurrentAssignKey,
    setCurrentModifiers,
    clearCurrentAssign,
    setCurrentAssignHoldLayer,
    selectAssignSlot,
    setAssignCategory,
    setAssignForCurrentSlot
  } = useMapDispatchToProps(mapDispatchToProps);

  React.useEffect(() => {
    setAssignCategory(getAssignCategoryFromAssign(currentAssign));
  }, [currentAssign]);

  const cssBase = css`
    display: flex;
    height: 100%;
  `;

  // const showKeySelectionPart = currentAssignCategory === 'input';
  const showKeySelectionPart =
    currentAssignCategory === 'input' || currentAssignCategory === 'none';

  const showHoldSelectionPart = currentAssignCategory === 'hold';

  return (
    <div css={cssBase}>
      <SlotSelectionPart
        isSlotSelected={isSlotSelected}
        currentSlotAddress={currentSlotAddress}
        selectAssignSlot={selectAssignSlot}
      />

      <BlankSelectionPart
        isSlotSelected={isSlotSelected}
        currentAssign={currentAssign}
        clearCurrentAssign={clearCurrentAssign}
      />

      <AssingTypeSelectionPart
        currentAssign={currentAssign}
        isSlotSelected={isSlotSelected}
        currentAssignCategory={currentAssignCategory}
        setAssignCategory={setAssignCategory}
      />

      {showKeySelectionPart && (
        <React.Fragment>
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
        </React.Fragment>
      )}

      {showHoldSelectionPart && (
        <HoldSelectionPart
          currentAssign={currentAssign}
          customLayers={customLayers}
          setCurrentAssignHoldLayer={setCurrentAssignHoldLayer}
          setAssignForCurrentSlot={setAssignForCurrentSlot}
        />
      )}
    </div>
  );
};
