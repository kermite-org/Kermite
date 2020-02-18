import {
  IEditModel,
  IKeyAssignEntry,
  LayerInvocationMode
} from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { createDictionaryFromKeyValues } from '~funcs/Utils';
import { ModifierVirtualKey, VirtualKey } from '~model/HighLevelDefs';
import { VirtualKeyToWindowsVirtualKeyCodeTable } from '~model/WindowsVirtualKeycodes';
import { callApiKeybdEvent as callApiKeybdEventOriginal } from '~shell/VirtualKeyboardApiBridge';
import { getKeyboardShapeByBreedName } from '~ui/view/WidgetSite/KeyboardShapes';
import { appGlobal } from './appGlobal';
import { fallbackEditModel } from './ProfileManager';

type TAdhocShift = 'down' | 'up' | undefined;

interface IVirtualStroke {
  readonly keyCode: number;
  readonly adhocShift?: TAdhocShift;
  readonly attachedModifierKeyCodes?: number[];
}

type LogicalKeyAction =
  | {
      readonly type: 'keyInput';
      readonly stroke: IVirtualStroke;
    }
  | {
      readonly type: 'holdLayer';
      readonly targetLayerId: string;
      readonly layerInvocationMode: LayerInvocationMode;
    }
  | {
      readonly type: 'holdModifier';
      readonly modifierKeyCode: number;
      readonly isOneShot: boolean;
    };

const shiftKeyCode = VirtualKeyToWindowsVirtualKeyCodeTable['K_Shift'];

namespace RealWorldKeyStateUpdator {
  const local: {
    outputKeyState: { [key: number]: true | undefined };
    holdRawShift: boolean;
  } = {
    outputKeyState: {},
    holdRawShift: false
  };

  function callApiKeybdEvent(keyCode: number, isDown: boolean) {
    console.log(`    callApiKeyboardEvent ${keyCode} ${isDown}`);
    callApiKeybdEventOriginal(keyCode, isDown);
  }

  function outputKeyboardEvent(
    keyCode: number,
    isDown: boolean,
    retriggerIfNeed?: boolean
  ) {
    const prevState = local.outputKeyState[keyCode];
    if (!prevState && isDown) {
      callApiKeybdEvent(keyCode, true);
      local.outputKeyState[keyCode] = true;
    }
    if (prevState && isDown && retriggerIfNeed) {
      callApiKeybdEvent(keyCode, false);
      callApiKeybdEvent(keyCode, true);
      local.outputKeyState[keyCode] = true;
    }
    if (prevState && !isDown) {
      callApiKeybdEvent(keyCode, false);
      delete local.outputKeyState[keyCode];
    }
  }

  export function handleStroke(stroke: IVirtualStroke, isDown: boolean) {
    const { keyCode, adhocShift, attachedModifierKeyCodes } = stroke;
    if (isDown) {
      attachedModifierKeyCodes?.forEach(m => outputKeyboardEvent(m, true));
      if (adhocShift) {
        outputKeyboardEvent(shiftKeyCode, adhocShift === 'down');
      }
      outputKeyboardEvent(keyCode, true, true);
    } else {
      outputKeyboardEvent(keyCode, false);
      if (adhocShift) {
        outputKeyboardEvent(shiftKeyCode, local.holdRawShift);
      }
      attachedModifierKeyCodes?.forEach(m => outputKeyboardEvent(m, false));
    }
  }

  export function handleModifier(keyCode: number, isDown: boolean) {
    outputKeyboardEvent(keyCode, isDown);
    if (keyCode === shiftKeyCode) {
      local.holdRawShift = isDown;
    }
  }
}

type IKeyUnitIdTable = { [key: number]: string };

function extractVkSet(
  vkSet: number | undefined
): { vkCode: number; adhocShift: TAdhocShift } | undefined {
  if (vkSet !== undefined) {
    const vkCode = vkSet & 0xff;
    const adhocShift =
      (vkSet & 0x100) === 0x100
        ? 'down'
        : (vkSet & 0x200) === 0x200
        ? 'up'
        : undefined;
    if (vkCode !== 0) {
      return { vkCode, adhocShift };
    }
  }
  return undefined;
}

function createKeyInputLogicalKeyAction(
  virtualKey: VirtualKey,
  modifiers?: ModifierVirtualKey[]
): LogicalKeyAction | undefined {
  const vkSet = extractVkSet(
    VirtualKeyToWindowsVirtualKeyCodeTable[virtualKey]
  );
  if (vkSet) {
    const { vkCode, adhocShift } = vkSet;
    const attachedModifierKeyCodes = modifiers?.map(
      m => VirtualKeyToWindowsVirtualKeyCodeTable[m]
    );
    return {
      type: 'keyInput',
      stroke: {
        keyCode: vkCode,
        adhocShift,
        attachedModifierKeyCodes
      }
    };
  }
  return undefined;
}

function mapKeyAssignEntryToLogicalKeyAction(
  assign: IKeyAssignEntry
): LogicalKeyAction | undefined {
  if (assign.type === 'keyInput') {
    const { virtualKey, modifiers } = assign;
    return createKeyInputLogicalKeyAction(virtualKey, modifiers);
  } else if (assign.type === 'holdLayer') {
    const { targetLayerId, layerInvocationMode } = assign;
    return {
      type: 'holdLayer',
      targetLayerId,
      layerInvocationMode: layerInvocationMode || 'hold'
    };
  } else if (assign.type === 'holdModifier') {
    const { modifierKey, isOneShot } = assign;
    const modifierKeyCode = VirtualKeyToWindowsVirtualKeyCodeTable[modifierKey];
    return { type: 'holdModifier', modifierKeyCode, isOneShot };
  }
  return undefined;
}

namespace VirtualStateManager {
  interface LogicModelState {
    holdLayerId: string;
    boundLogicalKeyActions: {
      [keyIndex: number]: LogicalKeyAction;
    };
    modalLayerId: string;
    oneshotLayerId: string;
    oneshotModifierKeyCode: number | undefined;
  }

  function mapKeyIndexToKeyAssignEntry(
    keyIndex: number,
    editModel: IEditModel,
    keyUnitIdTable: IKeyUnitIdTable,
    state: LogicModelState
  ): IKeyAssignEntry | undefined {
    const { keyAssigns } = editModel;
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

  function commitLogicalKeyAction(
    state: LogicModelState,
    action: LogicalKeyAction,
    isDown: boolean
  ): void {
    if (action.type === 'keyInput') {
      const { stroke } = action;
      RealWorldKeyStateUpdator.handleStroke(stroke, isDown);
      if (isDown) {
        if (state.oneshotLayerId) {
          // console.log(`oneshot layer end`);
          state.oneshotLayerId = '';
        }
        if (state.oneshotModifierKeyCode) {
          // console.log(`oneshot modifier end`);
          RealWorldKeyStateUpdator.handleModifier(
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
          RealWorldKeyStateUpdator.handleModifier(shiftKeyCode, isDown);
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
        RealWorldKeyStateUpdator.handleModifier(action.modifierKeyCode, isDown);
      } else {
        if (isDown) {
          // console.log(`oneshot modifier start`);
          RealWorldKeyStateUpdator.handleModifier(action.modifierKeyCode, true);
          state.oneshotModifierKeyCode = action.modifierKeyCode;
        }
      }
    }
  }

  const logicModelState: LogicModelState = {
    holdLayerId: 'la0',
    boundLogicalKeyActions: {},
    modalLayerId: '',
    oneshotLayerId: '',
    oneshotModifierKeyCode: undefined
  };

  export function handleHardwareKeyStateEvent(
    keyIndex: number,
    isDown: boolean,
    editModel: IEditModel,
    keyUnitIdTable: IKeyUnitIdTable
  ) {
    const state = logicModelState;
    if (isDown) {
      const assign = mapKeyIndexToKeyAssignEntry(
        keyIndex,
        editModel,
        keyUnitIdTable,
        state
      );
      if (assign) {
        const action = mapKeyAssignEntryToLogicalKeyAction(assign);
        if (action) {
          commitLogicalKeyAction(state, action, true);
          state.boundLogicalKeyActions[keyIndex] = action;
        }
      }
    } else {
      const action = state.boundLogicalKeyActions[keyIndex];
      if (action) {
        commitLogicalKeyAction(state, action, false);
        delete state.boundLogicalKeyActions[keyIndex];
      }
    }
  }
}

namespace EditModelFixer {
  const alphabetVirtualKeys: VirtualKey[] = [
    'K_A',
    'K_B',
    'K_C',
    'K_D',
    'K_E',
    'K_F',
    'K_G',
    'K_H',
    'K_I',
    'K_J',
    'K_K',
    'K_L',
    'K_M',
    'K_N',
    'K_O',
    'K_P',
    'K_Q',
    'K_R',
    'K_S',
    'K_T',
    'K_U',
    'K_V',
    'K_W',
    'K_X',
    'K_Y',
    'K_Z'
  ];

  export function completeEditModelForShiftLayer(
    editModel: IEditModel
  ): IEditModel {
    const keyAssigns = { ...editModel.keyAssigns };
    for (let i = 0; i < 48; i++) {
      const addr0 = `ku${i}.la0.pri`;
      const addr1 = `ku${i}.la1.pri`;

      const assign = keyAssigns[addr0];
      if (
        assign &&
        assign.type === 'keyInput' &&
        alphabetVirtualKeys.includes(assign.virtualKey) &&
        assign.modifiers === undefined &&
        keyAssigns[addr1] === undefined
      ) {
        keyAssigns[addr1] = { ...assign, modifiers: ['K_Shift'] };
      }
    }
    // console.log(JSON.stringify(keyAssigns, null, ' '));
    return { ...editModel, keyAssigns };
  }
}

function createKeyIndexToKeyUnitIdTable(editModel: IEditModel) {
  const keyboardShape = getKeyboardShapeByBreedName(editModel.breedName);
  return createDictionaryFromKeyValues(
    keyboardShape.keyPositions.map(ku => [ku.pk, ku.id])
  );
}

export class InputLogicSimulator {
  private editModel: IEditModel = fallbackEditModel;

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      if (keyIndex === 12) {
        console.log('');
        return;
      }
      console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);

      const keyUnitIdTable = createKeyIndexToKeyUnitIdTable(this.editModel);
      VirtualStateManager.handleHardwareKeyStateEvent(
        keyIndex,
        isDown,
        this.editModel,
        keyUnitIdTable
      );
    }
    if (event.type === 'layerChanged') {
      console.log(`layer ${event.layerIndex}`);
    }
  };

  async initialize() {
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);

    appGlobal.profileManager.subscribeStatus(changedStatus => {
      if (changedStatus.loadedEditModel) {
        this.editModel = EditModelFixer.completeEditModelForShiftLayer(
          changedStatus.loadedEditModel
        );
      }
    });
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
  }
}
