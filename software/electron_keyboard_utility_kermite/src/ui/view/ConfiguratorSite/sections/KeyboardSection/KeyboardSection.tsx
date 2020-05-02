import { jsx } from '@emotion/core';
import { useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { useMapDispatchToProps } from '~ui/hooks';
import { editorSlice } from '~ui/state/editor';
import { AppState } from '~ui/state/store';
import { AutoScaledBox } from '~ui/view/SizeMonitoredBox';
import { KeyboardBasePlane } from './components/KeyboardBasePlane';
import { KeyboardBodyShape } from './components/KeyboardBodyShape';
import { KeyUnitCard } from './components/KeyUnitCard';
import { useKeyUnitCardViewModels } from './Data';

const mapStateToProps = (state: AppState) => ({
  keyAssigns: state.editor.editModel.assigns,
  layers: state.editor.editModel.layers,
  currentLayerId: state.editor.currentLayerId,
  currentSlotAddress: state.editor.currentAssignSlotAddress,
  pressedKeyFlags: state.player.pressedKeyFlags,
  keyboardShape: state.editor.editModel.keyboardShape
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    selectAssignSlot(keyUnitId: string, isPrimary: boolean) {
      dispatch(editorSlice.actions.selectAssignSlot({ keyUnitId, isPrimary }));
    },
    clearAssignSlotSelection() {
      dispatch(editorSlice.actions.clearAssignSlotSelection());
    }
  };
};

export function KeyboardSection() {
  const {
    keyAssigns,
    layers,
    currentLayerId,
    currentSlotAddress,
    pressedKeyFlags,
    keyboardShape
  } = useSelector(mapStateToProps);

  const { clearAssignSlotSelection, selectAssignSlot } = useMapDispatchToProps(
    mapDispatchToProps
  );

  const cardViewModels = useKeyUnitCardViewModels({
    keyAssigns,
    layers,
    currentLayerId,
    currentSlotAddress,
    pressedKeyFlags,
    selectAssignSlot,
    keyboardShape
  });

  return (
    <AutoScaledBox contentWidth={600} contentHeight={240}>
      <KeyboardBasePlane clearAssignSlotSelection={clearAssignSlotSelection}>
        <KeyboardBodyShape pathMarkupText={keyboardShape.bodyPathMarkupText} />
        {cardViewModels.map((vm) => (
          <KeyUnitCard keyUnit={vm} key={vm.keyUnitId} />
        ))}
      </KeyboardBasePlane>
    </AutoScaledBox>
  );
}
