import { KeyAssignToLogicalKeyActionResolver } from './KeyAssignToLogicalKeyActionResolver';
import { LogicalKeyActionDriver } from './LogicalKeyActionDriver';
import {
  IModelKeyAssignsProvider,
  IStrokeEmitterFunction,
  LayerState,
  LogicalKeyAction
} from './Types';
import { IKeyAssignEntry, IAssignOperation } from '~defs/ProfileData';

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
  let assign: IAssignOperation | undefined = undefined;
  if (oneshotLayerId) {
    assign = keyAssigns[`${oneshotLayerId}.${keyUnitId}`]?.op;
  } else if (modalLayerId) {
    assign = keyAssigns[`${modalLayerId}.${keyUnitId}`]?.op;
  } else {
    assign = keyAssigns[`${holdLayerId}.${keyUnitId}`]?.op;
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
