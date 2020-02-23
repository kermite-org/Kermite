import { IKeyAssignEntry } from '~contract/data';
import { KeyAssignToLogicalKeyActionResolver } from './KeyAssignToLogicalKeyActionResolver';
import { LogicalKeyActionDriver } from './LogicalKeyActionDriver';
import {
  IModelKeyAssignsProvider,
  IStrokeEmitterFunction,
  LayerState,
  LogicalKeyAction
} from './Types';

function mapKeyIndexToKeyAssignEntry(
  keyIndex: number,
  keyAssignsProvider: IModelKeyAssignsProvider,
  state: LayerState
): IKeyAssignEntry | undefined {
  const { keyAssigns, keyUnitIdTable } = keyAssignsProvider;
  const { holdLayerId, modalLayerId, oneshotLayerId } = state;
  const keyUnitId = keyUnitIdTable[keyIndex];
  if (keyUnitId === undefined) {
    return undefined;
  }
  let assign: IKeyAssignEntry | undefined = undefined;
  if (oneshotLayerId) {
    assign = keyAssigns[`${keyUnitId}.${oneshotLayerId}.pri`];
  } else if (modalLayerId) {
    assign = keyAssigns[`${keyUnitId}.${modalLayerId}.pri`];
  } else {
    assign = keyAssigns[`${keyUnitId}.${holdLayerId}.pri`];
    // if (!assign && holdLayerId !== 'la0') {
    //   assign = keyAssigns[`${keyUnitId}.la0.pri`];
    // }
  }
  // console.log({ assign });
  return assign;
}

export namespace VirtualStateManager {
  const logicModelState: LayerState = {
    holdLayerId: 'la0',
    modalLayerId: '',
    oneshotLayerId: '',
    oneshotModifierKeyCode: undefined
  };

  interface AssignState {
    boundLogicalKeyActions: {
      [keyIndex: number]: LogicalKeyAction;
    };
  }

  const assignState: AssignState = {
    boundLogicalKeyActions: {}
  };

  // export function setKeyDestinationProc(proc: IStrokeEmitterFunction) {
  //   LogicalKeyActionDriver.setKeyDestinationProc(proc);
  // }

  export function handleHardwareKeyStateEvent(
    keyIndex: number,
    isDown: boolean,
    keyAssignsProvider: IModelKeyAssignsProvider
  ) {
    if (isDown) {
      const assign = mapKeyIndexToKeyAssignEntry(
        keyIndex,
        keyAssignsProvider,
        logicModelState
      );
      if (assign) {
        const action = KeyAssignToLogicalKeyActionResolver.mapKeyAssignEntryToLogicalKeyAction(
          assign
        );
        if (action) {
          LogicalKeyActionDriver.commitLogicalKeyAction(
            logicModelState,
            action,
            true
          );
          assignState.boundLogicalKeyActions[keyIndex] = action;
        }
      }
    } else {
      const action = assignState.boundLogicalKeyActions[keyIndex];
      if (action) {
        LogicalKeyActionDriver.commitLogicalKeyAction(
          logicModelState,
          action,
          false
        );
        delete assignState.boundLogicalKeyActions[keyIndex];
      }
    }
  }
}
