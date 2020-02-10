import { IEditModel } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { VirtualKeyToWindowsVirtualKeyCodeTable } from '~model/WindowsVirtualKeycodes';
import { callApiKeybdEvent as callApiKeybdEventOriginal } from '~shell/VirtualKeyboardApiBridge';
import { appGlobal } from './appGlobal';
import { fallbackEditModel } from './ProfileManager';
import { VirtualKey } from '~model/HighLevelDefs';

const shiftKeyCode = VirtualKeyToWindowsVirtualKeyCodeTable['K_Shift']!;

function callApiKeybdEvent(keyCode: number, isDown: boolean) {
  console.log(`callApiKeyboardEvent ${keyCode} ${isDown}`);
  callApiKeybdEventOriginal(keyCode, isDown);
}

function getAdhocShiftTransient(curr: boolean, next: boolean): 0 | -1 | 1 {
  if (!curr && next) {
    return 1;
  } else if (curr && !next) {
    return -1;
  } else {
    return 0;
  }
}

interface LogicModelState {
  holdShiftLayerKey: boolean;
  holdShift: boolean;
}

type LogicalKeyAction = { dir: 1 | -1 } & (
  | {
      type: 'keyInput';
      keyCode: number;
      holdShiftTransient: 1 | -1 | 0;
    }
  | { type: 'shiftLayer' }
);

function commitLogicalKeyAction(
  state: LogicModelState,
  action: LogicalKeyAction
): LogicModelState {
  if (action.type === 'keyInput') {
    const { keyCode, holdShiftTransient: adhocShift } = action;
    const isDown = action.dir === 1;
    if (adhocShift) {
      const isAdhocShiftDown = adhocShift * action.dir === 1;
      callApiKeybdEvent(shiftKeyCode, isAdhocShiftDown);
      callApiKeybdEvent(keyCode, isDown);
      return { ...state, holdShift: isAdhocShiftDown };
    } else {
      callApiKeybdEvent(keyCode, isDown);
      return state;
    }
  }
  if (action.type === 'shiftLayer') {
    const isDown = action.dir === 1;
    callApiKeybdEvent(shiftKeyCode, isDown);
    return { ...state, holdShiftLayerKey: isDown, holdShift: isDown };
  }
  return state;
}

function getOsVirtualKey(
  virtualKey: VirtualKey
): {
  vkCode: number;
  withShift: boolean;
} {
  const vkSet = VirtualKeyToWindowsVirtualKeyCodeTable[virtualKey];
  if (vkSet !== undefined) {
    const vkCode = vkSet & 0xff;
    const withShift = (vkSet & 0x100) === 0x100;
    if (vkCode !== 0) {
      return { vkCode, withShift };
    }
  }
  return { vkCode: 0, withShift: false };
}

function getLogicalKeyAction(
  state: LogicModelState,
  vkCode: number,
  withShift: boolean
): LogicalKeyAction {
  if (vkCode === shiftKeyCode) {
    return { type: 'shiftLayer', dir: 1 };
  } else {
    const isAlphabet = 65 <= vkCode && vkCode <= 90;
    const nextHoldShift = withShift || (state.holdShiftLayerKey && isAlphabet);
    const holdShiftTransient = getAdhocShiftTransient(
      state.holdShift,
      nextHoldShift
    );
    return { type: 'keyInput', dir: 1, keyCode: vkCode, holdShiftTransient };
  }
}

let state: LogicModelState = {
  holdShiftLayerKey: false,
  holdShift: false
};

const boundLogicalKeyActions: {
  [keyIndex: number]: LogicalKeyAction;
} = {};

function handlerHardwareKeyStateEvent(
  editModel: IEditModel,
  keyIndex: number,
  isDown: boolean
) {
  if (isDown) {
    const layerId = state.holdShiftLayerKey ? 'la1' : 'la0';
    let assign = editModel.keyAssigns[`ku${keyIndex}.${layerId}.pri`];
    if (!assign) {
      assign = editModel.keyAssigns[`ku${keyIndex}.la0.pri`];
    }
    if (!assign) {
      return;
    }
    if (assign.type === 'keyInput') {
      const { vkCode, withShift } = getOsVirtualKey(assign.virtualKey);
      if (vkCode === 0) {
        return;
      }
      const action = getLogicalKeyAction(state, vkCode, withShift);
      state = commitLogicalKeyAction(state, action);
      // console.log({ action });
      // console.log({ state });
      boundLogicalKeyActions[keyIndex] = action;
    }
  } else {
    const action = boundLogicalKeyActions[keyIndex];
    if (action) {
      action.dir *= -1;
      state = commitLogicalKeyAction(state, action);
      // console.log({ action });
      // console.log({ state });
      delete boundLogicalKeyActions[keyIndex];
    }
  }
}

export class InputLogicSimulator {
  private editModel: IEditModel = fallbackEditModel;

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      console.log(`key ${event.keyIndex} ${event.isDown ? 'down' : 'up'}`);
      handlerHardwareKeyStateEvent(
        this.editModel,
        event.keyIndex,
        event.isDown
      );
    }
    if (event.type === 'layerChanged') {
      console.log(`layer ${event.layerIndex}`);
    }
  };

  async initialize() {
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);

    appGlobal.profileManager.subscribeStatus(partialStatus => {
      if (partialStatus.loadedEditModel) {
        this.editModel = partialStatus.loadedEditModel;
      }
    });
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
  }
}
