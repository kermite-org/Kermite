import { HidKeyCodes } from '~defs/HidKeyCodes';
import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import {
  fallbackProfileData,
  IEditModel,
  IKeyAssignEntry
} from '~defs/ProfileData';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import { KeyIndexKeyEvent, TKeyTrigger } from '../InputLogicSimulatorB/common';

interface IKeyBindingInfo {
  assign: IKeyAssignEntry;
  timeStamp: number;
}

type IKeyBindingInfoDict = { [keyId: string]: IKeyBindingInfo };

const logicSimulatorStateC = new (class {
  editModel: IEditModel = fallbackProfileData;
  keyBindingInfoDict: IKeyBindingInfoDict = {};
  currentLayerId: string = 'la0';
})();

namespace Module1 {
  function getModifierBits(modFlags: { [vk in ModifierVirtualKey]: boolean }) {
    let modifierBits = 0;
    modFlags.K_Ctrl && (modifierBits |= 0x01);
    modFlags.K_Shift && (modifierBits |= 0x02);
    modFlags.K_Alt && (modifierBits |= 0x04);
    modFlags.K_OS && (modifierBits |= 0x08);
    return modifierBits;
  }

  function reduceBindingInfosToHidReport(
    bindingInfos: IKeyBindingInfo[]
  ): number[] {
    const modFlags: {
      [vk in ModifierVirtualKey]: boolean;
    } = {
      K_Ctrl: false,
      K_Shift: false,
      K_Alt: false,
      K_OS: false
    };
    const hidKeyCodes: number[] = [];

    for (const info of bindingInfos) {
      const assign = info.assign;
      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;
        if (vk in modFlags) {
          modFlags[vk as ModifierVirtualKey] = true;
        } else {
          const hk = HidKeyCodes[vk];
          if ((hk & 0x100) > 0) {
            modFlags.K_Shift = true;
          } else if ((hk & 0x200) > 0) {
            modFlags.K_Shift = false;
          }
          hidKeyCodes.push(hk & 0xff);
        }
      }
    }

    const modifierBits = getModifierBits(modFlags);
    return [modifierBits, 0, ...[...hidKeyCodes, 0, 0, 0, 0, 0, 0].slice(0, 6)];
  }

  let prevReport: number[] = [];

  export function updateOutputReport() {
    const bindingInfos = Object.values(logicSimulatorStateC.keyBindingInfoDict);
    bindingInfos.sort((a, b) => a.timeStamp - b.timeStamp);
    const hidReport = reduceBindingInfosToHidReport(bindingInfos);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(hidReport));

    //dirty fix for modifier transition delay problem
    if (
      prevReport[0] &&
      !hidReport[0] &&
      hidReport.slice(2).some(val => val > 0)
    ) {
      appGlobal.deviceService.writeSideBrainHidReport([0, 0, 0, 0, 0, 0, 0, 0]);
    }
    appGlobal.deviceService.writeSideBrainHidReport(hidReport);

    prevReport = hidReport;
  }
}

namespace Module0 {
  function getKeyId(keyIndex: number): string | undefined {
    const kp = logicSimulatorStateC.editModel.keyboardShape.keyPositions.find(
      key => key.pk === keyIndex
    );
    return kp && kp.id;
  }

  function isShiftHold() {
    return Object.values(logicSimulatorStateC.keyBindingInfoDict).some(
      it => it.assign.type === 'keyInput' && it.assign.virtualKey === 'K_Shift'
    );
  }

  function getLayerAssign(
    targetLayerId: string,
    keyId: string
  ): IKeyAssignEntry | undefined {
    const { assigns } = logicSimulatorStateC.editModel;
    const assign = assigns[`${targetLayerId}.${keyId}`];
    if (assign && assign?.type === 'single') {
      const op = assign.op;

      //dirty migration fix for next model implementation
      if (op && op.type === 'layerCall' && op.targetLayerId === 'la1') {
        return {
          type: 'keyInput',
          virtualKey: 'K_Shift'
        };
      }

      return op;
    }
    return undefined;
  }

  function getAssign(keyId: string, trigger: TKeyTrigger) {
    const { currentLayerId } = logicSimulatorStateC;
    if (isShiftHold()) {
      return (
        getLayerAssign('la1', keyId) || getLayerAssign(currentLayerId, keyId)
      );
    } else {
      return getLayerAssign(currentLayerId, keyId);
    }
  }

  function commitAssign(assign: IKeyAssignEntry, isDown: boolean) {
    if (isDown) {
      // eslint-disable-next-line no-console
      console.log(assign);
    }

    if (assign.type === 'layerCall') {
      logicSimulatorStateC.currentLayerId = isDown
        ? assign.targetLayerId
        : 'la0';
    }
  }

  function handleKeyIdEvent(keyId: string, isDown: boolean) {
    const { keyBindingInfoDict } = logicSimulatorStateC;

    if (!isDown) {
      const boundInfo = keyBindingInfoDict[keyId];
      if (boundInfo) {
        commitAssign(boundInfo.assign, false);
        delete keyBindingInfoDict[keyId];
      }
    } else {
      const assign = getAssign(keyId, 'down');
      if (assign) {
        commitAssign(assign, true);
        keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
      }
    }

    Module1.updateOutputReport();
  }

  export function processEvents(ev: KeyIndexKeyEvent) {
    const { keyIndex, isDown } = ev;
    const keyId = getKeyId(keyIndex);
    if (keyId) {
      handleKeyIdEvent(keyId, isDown);
    }
  }

  export function processTicker() {
    // updateOutputKeys();
  }
}

export class InputLogicSimulatorC implements IInputLogicSimulator {
  private sorterIntervalTimer = new IntervalTimerWrapper();

  private onProfileStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedEditModel) {
      logicSimulatorStateC.editModel = changedStatus.loadedEditModel;
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      const ev0 = { keyIndex, isDown };
      Module0.processEvents(ev0);
    }
  };

  private processTicker = () => {
    Module0.processTicker();
  };

  async initialize() {
    appGlobal.profileManager.subscribeStatus(this.onProfileStatusChanged);
    appGlobal.deviceService.writeSideBrainMode(true);
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);
    this.sorterIntervalTimer.start(this.processTicker, 10);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
    appGlobal.deviceService.writeSideBrainMode(false);
    this.sorterIntervalTimer.stop();
  }
}
