import { IEditModel, IKeyAssignEntry } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { VirtualKey, ModifierVirtualKeys } from '~model/HighLevelDefs';
import { VirtualKeyToWindowsVirtualKeyCodeTable } from '~model/WindowsVirtualKeycodes';
import { callApiKeybdEvent as callApiKeybdEventOriginal } from '~shell/VirtualKeyboardApiBridge';
import { appGlobal } from './appGlobal';
import { fallbackEditModel } from './ProfileManager';
import { getKeyboardShapeByBreedName } from '~ui/view/WidgetSite/KeyboardShapes';

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
  | { readonly type: 'holdLayer'; readonly targetLayerId: string };

namespace RealWorldKeyStateUpdator {
  const shiftKeyCode = VirtualKeyToWindowsVirtualKeyCodeTable['K_Shift'];

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

  export function handleRawShift(isDown: boolean) {
    outputKeyboardEvent(shiftKeyCode, isDown);
    local.holdRawShift = isDown;
  }
}

namespace VirtualStateManager {
  const state: {
    currentLayerId: string;
    boundLogicalKeyActions: {
      [keyIndex: number]: LogicalKeyAction;
    };
  } = {
    currentLayerId: 'la0',
    boundLogicalKeyActions: {}
  };

  function mapKeyIndexToKeyAssignEntry(
    editModel: IEditModel,
    keyIndex: number
  ): IKeyAssignEntry | undefined {
    const { keyAssigns } = editModel;
    const { currentLayerId } = state;

    const keyboardShape = getKeyboardShapeByBreedName(editModel.breedName);
    const keyUnit = keyboardShape.keyPositions.find(ku => ku.pk === keyIndex);
    if (!keyUnit) {
      return undefined;
    }
    const keyUnitId = keyUnit.id;

    let assign = keyAssigns[`${keyUnitId}.${currentLayerId}.pri`];
    if (!assign && currentLayerId !== 'la0') {
      assign = keyAssigns[`${keyUnitId}.la0.pri`];
    }
    return assign;
  }

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
    modifiers?: ModifierVirtualKeys[]
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
      const { targetLayerId } = assign;
      return { type: 'holdLayer', targetLayerId };
    }
    return undefined;
  }

  function commitLogicalKeyAction(
    action: LogicalKeyAction,
    isDown: boolean
  ): void {
    if (action.type === 'keyInput') {
      const { stroke } = action;
      RealWorldKeyStateUpdator.handleStroke(stroke, isDown);
    }
    if (action.type === 'holdLayer') {
      const { targetLayerId } = action;
      if (targetLayerId === 'la1') {
        RealWorldKeyStateUpdator.handleRawShift(isDown);
      }
      state.currentLayerId = isDown ? targetLayerId : 'la0';
    }
  }

  export function handlerHardwareKeyStateEvent(
    editModel: IEditModel,
    keyIndex: number,
    isDown: boolean
  ) {
    const { boundLogicalKeyActions } = state;
    if (isDown) {
      const assign = mapKeyIndexToKeyAssignEntry(editModel, keyIndex);
      if (assign) {
        const action = mapKeyAssignEntryToLogicalKeyAction(assign);
        if (action) {
          commitLogicalKeyAction(action, true);
          boundLogicalKeyActions[keyIndex] = action;
        }
      }
    } else {
      const action = boundLogicalKeyActions[keyIndex];
      if (action) {
        commitLogicalKeyAction(action, false);
        delete boundLogicalKeyActions[keyIndex];
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

export class InputLogicSimulator {
  private editModel: IEditModel = fallbackEditModel;

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      if (keyIndex === 13) {
        console.log('');
        return;
      }
      console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);
      VirtualStateManager.handlerHardwareKeyStateEvent(
        this.editModel,
        keyIndex,
        isDown
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
