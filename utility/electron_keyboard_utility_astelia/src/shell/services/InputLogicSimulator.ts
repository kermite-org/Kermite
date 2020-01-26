import { IEditModel } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { VirtualKeyToWindowsVirtualKeyCodeTable } from '~model/WindowsVirtualKeycodes';
import { callApiKeybdEvent } from '~shell/VirtualKeyboardApiBridge';
import { appGlobal } from './appGlobal';
import { fallbackEditModel } from './ProfileManager';

export class InputLogicSimulator {
  private editModel: IEditModel = fallbackEditModel;

  private handlerHardwareKeyStateEvent(keyIndex: number, isDown: boolean) {
    console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);

    const addr = `ku${keyIndex}.la0.pri`;
    const assign = this.editModel.keyAssigns[addr];
    if (assign) {
      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;
        const vkCode = VirtualKeyToWindowsVirtualKeyCodeTable[vk];
        console.log(`simulate virtualkey`, { vk, vkCode, isDown });
        if (vkCode !== undefined) {
          callApiKeybdEvent(vkCode, isDown);
        }
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
        console.log(`edit model received`);
        this.editModel = partialStatus.loadedEditModel;
      }
    });
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
  }
}
