import { HidKeyCodes } from '~defs/HidKeyCodes';
import { OutputKeyStateUpdator } from './OutputKeyStateUpdator';
import { IStrokeEmitterFunction, LogicalKeyAction, LayerState } from './Types';

export namespace LogicalKeyActionDriver {
  const outputKeyStateUpdator = OutputKeyStateUpdator.getInterface();
  export function setKeyDestinationProc(proc: IStrokeEmitterFunction) {
    outputKeyStateUpdator.setKeyDestinationProc(proc);
  }
  export function commitLogicalKeyAction(
    state: LayerState,
    action: LogicalKeyAction,
    isDown: boolean
  ): void {
    if (action.type === 'keyInput') {
      const { stroke } = action;
      outputKeyStateUpdator.handleStroke(stroke, isDown);
      if (isDown) {
        if (state.oneshotLayerId) {
          // console.log(`oneshot layer end`);
          state.oneshotLayerId = '';
        }
        if (state.oneshotModifierKeyCode) {
          // console.log(`oneshot modifier end`);
          outputKeyStateUpdator.handleModifier(
            state.oneshotModifierKeyCode,
            false
          );
          state.oneshotModifierKeyCode = undefined;
        }
      }
    } else if (action.type === 'holdLayer') {
      const { targetLayerId } = action;
      if (action.layerInvocationMode === 'hold') {
        if (targetLayerId === 'la1') {
          outputKeyStateUpdator.handleModifier(HidKeyCodes.K_Shift, isDown);
        }
        state.holdLayerId = isDown ? targetLayerId : 'la0';
      } else if (action.layerInvocationMode === 'modal') {
        if (isDown) {
          // console.log(`modal ${action.targetLayerId}`);
          state.modalLayerId = action.targetLayerId;
        }
      } else if (action.layerInvocationMode === 'unmodal') {
        if (isDown) {
          // console.log(`unmodal`);
          state.modalLayerId = '';
        }
      } else if (action.layerInvocationMode === 'oneshot') {
        if (isDown) {
          // console.log(`oneshot layer start`);
          state.oneshotLayerId = action.targetLayerId;
        }
      }
    } else if (action.type === 'holdModifier') {
      if (!action.isOneShot) {
        outputKeyStateUpdator.handleModifier(action.modifierKeyCode, isDown);
      } else {
        if (isDown) {
          // console.log(`oneshot modifier start`);
          outputKeyStateUpdator.handleModifier(action.modifierKeyCode, true);
          state.oneshotModifierKeyCode = action.modifierKeyCode;
        }
      }
    }
  }
}
