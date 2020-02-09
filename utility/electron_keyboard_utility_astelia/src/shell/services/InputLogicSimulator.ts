import { IEditModel } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { VirtualKeyToWindowsVirtualKeyCodeTable } from '~model/WindowsVirtualKeycodes';
import { callApiKeybdEvent as callApiKeybdEventOriginal } from '~shell/VirtualKeyboardApiBridge';
import { appGlobal } from './appGlobal';
import { fallbackEditModel } from './ProfileManager';

const shiftKeyCode = VirtualKeyToWindowsVirtualKeyCodeTable['K_Shift']!;

function callApiKeybdEvent(keyCode: number, isDown: boolean) {
  console.log(`callApiKeyboardEvent ${keyCode} ${isDown}`);
  callApiKeybdEventOriginal(keyCode, isDown);
}

type BoundLogicKeyAction =
  | {
      type: 'keyInput';
      keyCode: number;
      direction: 'down' | 'up';
    }
  | { type: 'pureShift' };

export class InputLogicSimulator {
  private editModel: IEditModel = fallbackEditModel;

  private holdPureShift: boolean = false;

  private boundLogicalKeyActions: {
    [keyIndex: number]: BoundLogicKeyAction[];
  } = {};

  private handlerHardwareKeyStateEvent(keyIndex: number, isDown: boolean) {
    if (isDown) {
      const layerId = this.holdPureShift ? 'la1' : 'la0';
      let assign = this.editModel.keyAssigns[`ku${keyIndex}.${layerId}.pri`];
      if (!assign) {
        assign = this.editModel.keyAssigns[`ku${keyIndex}.la0.pri`];
      }
      if (assign) {
        if (assign.type === 'keyInput') {
          const vkSet =
            VirtualKeyToWindowsVirtualKeyCodeTable[assign.virtualKey];
          if (vkSet) {
            const vkCode = vkSet & 0xff;
            if (vkCode === 0) {
              return;
            }
            const isPureShift = vkCode === shiftKeyCode;
            if (isPureShift) {
              callApiKeybdEvent(shiftKeyCode, true);
              this.boundLogicalKeyActions[keyIndex] = [{ type: 'pureShift' }];
              this.holdPureShift = true;
              return;
            }
            let withShift = (vkSet & 0x100) > 0;

            const isAlphabet = 65 <= vkCode && vkCode <= 90;

            if (this.holdPureShift && isAlphabet) {
              withShift = true;
            }

            if (!withShift) {
              if (!this.holdPureShift) {
                //no shift, shift not required
                callApiKeybdEvent(vkCode, true);
                this.boundLogicalKeyActions[keyIndex] = [
                  { type: 'keyInput', keyCode: vkCode, direction: 'down' }
                ];
              } else {
                //shift hold, shift not required
                callApiKeybdEvent(shiftKeyCode, false);
                callApiKeybdEvent(vkCode, true);
                this.boundLogicalKeyActions[keyIndex] = [
                  { type: 'keyInput', keyCode: shiftKeyCode, direction: 'up' },
                  { type: 'keyInput', keyCode: vkCode, direction: 'down' }
                ];
              }
            } else {
              if (!this.holdPureShift) {
                //no shift, shift required
                callApiKeybdEvent(shiftKeyCode, true);
                callApiKeybdEvent(vkCode, true);
                this.boundLogicalKeyActions[keyIndex] = [
                  {
                    type: 'keyInput',
                    keyCode: shiftKeyCode,
                    direction: 'down'
                  },
                  { type: 'keyInput', keyCode: vkCode, direction: 'down' }
                ];
              } else {
                //shift hold, shift required
                callApiKeybdEvent(vkCode, true);
                this.boundLogicalKeyActions[keyIndex] = [
                  { type: 'keyInput', keyCode: vkCode, direction: 'down' }
                ];
              }
            }
          }
        }
      }
    } else {
      const actions = this.boundLogicalKeyActions[keyIndex];
      if (actions) {
        for (const action of actions) {
          if (action.type === 'keyInput') {
            callApiKeybdEvent(
              action.keyCode,
              action.direction === 'down' ? false : true
            );
          }
          if (action.type === 'pureShift') {
            callApiKeybdEvent(shiftKeyCode, false);
            this.holdPureShift = false;
          }
        }
        delete this.boundLogicalKeyActions[keyIndex];
      }
    }
  }

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      console.log(`key ${event.keyIndex} ${event.isDown ? 'down' : 'up'}`);
      this.handlerHardwareKeyStateEvent(event.keyIndex, event.isDown);
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
