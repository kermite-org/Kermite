import { HidKeyCodes } from '~defs/HidKeyCodes';
import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import {
  fallbackProfileData,
  IEditModel,
  IKeyAssignEntry,
  IAssignOperation
} from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import { KeyIndexKeyEvent, TKeyTrigger } from '../InputLogicSimulatorB/common';
import { AssingTypeSelectionPart } from '~ui2/views/root/ConfiguratorSite/KeyAssingEditPage/AssignEditSection/EntryEditPart/AssignTypeSelectionPart';

interface IKeyBindingInfo {
  assign: IKeyAssignEntry;
  timeStamp: number;
}

type IKeyBindingInfoDict = { [keyId: string]: IKeyBindingInfo };

const logicSimulatorStateC = new (class {
  editModel: IEditModel = fallbackProfileData;
  keyBindingInfoDict: IKeyBindingInfoDict = {};
})();

namespace ModuleZ {
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
      if (assign.type === 'layerCall') {
        const layer = logicSimulatorStateC.editModel.layers.find(
          (la) => la.layerId === assign.targetLayerId
        );
        if (layer?.layerName.includes('shift')) {
          modFlags.K_Shift = true;
        }
      }
      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;
        if (vk in modFlags) {
          modFlags[vk as ModifierVirtualKey] = true;
        } else {
          const mods = assign.attachedModifiers;
          if (mods) {
            mods.forEach((modVk) => {
              modFlags[modVk] = true;
            });
          }
          const hk = HidKeyCodes[vk];
          const withShift = (hk & 0x100) > 0;
          const cancelShift = (hk & 0x200) > 0;
          if (withShift) {
            modFlags.K_Shift = true;
          }
          const hasExModifiers =
            modFlags.K_Ctrl || modFlags.K_Alt || modFlags.K_OS;
          if (!hasExModifiers && cancelShift) {
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

    //dirty fix for modifier transition delay problem
    if (
      prevReport[0] &&
      !hidReport[0] &&
      hidReport.slice(2).some((val) => val > 0)
    ) {
      appGlobal.deviceService.writeSideBrainHidReport([0, 0, 0, 0, 0, 0, 0, 0]);
    }
    appGlobal.deviceService.writeSideBrainHidReport(hidReport);

    prevReport = hidReport;
  }
}

namespace ModuleF {
  type CommitEventType =
    | {
        type: 'down';
        keyId: string;
        assign: IKeyAssignEntry;
        priorityVirtualKey: VirtualKey;
        tick: number;
      }
    | {
        type: 'up';
        keyId: string;
        priorityVirtualKey: VirtualKey;
        tick: number;
      };

  const configs = {
    bypass: false,
    waitTimeMs: 100
  };
  // configs.bypass = true;

  const virtualKeyPriorityOrders: VirtualKey[] = [
    'K_Ctrl',
    'K_Alt',
    'K_OS',
    'K_Shift',

    'K_B',
    'K_C',
    'K_D',
    'K_F',
    'K_G',
    'K_J',
    'K_K',
    'K_M',
    'K_N',
    'K_P',
    'K_Q',
    'K_R',
    'K_S',
    'K_T',
    'K_V',
    'K_W',
    'K_X',
    'K_Z',

    'K_L',
    'K_H',
    'K_Y',

    'K_E',
    'K_A',
    'K_O',
    'K_I',
    'K_U',

    'K_Minus',
    'K_NONE'
  ];

  const local = new (class {
    holdCount: number = 0;
    commitEventQueue: CommitEventType[] = [];
  })();

  function handleCommitEvent(ev: CommitEventType) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      console.log('down', ev.keyId, assign);
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
    }
    if (ev.type === 'up') {
      const { keyId } = ev;
      // console.log('up', ev.keyId);
      delete keyBindingInfoDict[keyId];
    }
  }

  export function pushCommitEvent(ev: CommitEventType) {
    if (configs.bypass) {
      handleCommitEvent(ev);
      return;
    }
    local.commitEventQueue.push(ev);
    if (ev.type === 'down') {
      local.holdCount++;
    } else {
      local.holdCount--;
    }
  }

  export function readQueuedEvents(): boolean {
    const { commitEventQueue: queue, holdCount } = local;
    if (queue.length > 0) {
      const latest = queue[queue.length - 1];
      const curTick = Date.now();
      if (curTick > latest.tick + configs.waitTimeMs || holdCount === 0) {
        queue.sort(
          (a, b) =>
            virtualKeyPriorityOrders.indexOf(a.priorityVirtualKey) -
            virtualKeyPriorityOrders.indexOf(b.priorityVirtualKey)
        );
        const ev = queue.shift()!;
        handleCommitEvent(ev);
        return true;
      }
    }
    return false;
  }
}

namespace ModuleA {
  function getKeyId(keyIndex: number): string | undefined {
    const kp = logicSimulatorStateC.editModel.keyboardShape.keyUnits.find(
      (key) => key.keyIndex === keyIndex
    );
    return kp && kp.id;
  }

  function getLayerHoldStates() {
    const layerHoldStates: { [layerId: string]: boolean } = { la0: true };
    Object.values(logicSimulatorStateC.keyBindingInfoDict).forEach((bi) => {
      if (bi.assign.type === 'layerCall') {
        layerHoldStates[bi.assign.targetLayerId] = true;
      }
    });
    return layerHoldStates;
  }

  function getLayerAssign(
    targetLayerId: string,
    keyId: string
  ): IKeyAssignEntry | undefined {
    const { assigns } = logicSimulatorStateC.editModel;
    const assign = assigns[`${targetLayerId}.${keyId}`];
    if (assign && assign?.type === 'single') {
      return assign.op;
    }
    return undefined;
  }

  function getAssign(keyId: string, trigger: TKeyTrigger): IAssignOperation {
    const layerHoldStates = getLayerHoldStates();

    const activeLayers = logicSimulatorStateC.editModel.layers
      .filter((la) => layerHoldStates[la.layerId])
      .reverse();

    for (const la of activeLayers) {
      const assign = getLayerAssign(la.layerId, keyId);
      if (!assign && la.layerName.endsWith('_b')) {
        //block
        return undefined;
      }
      if (assign) {
        return assign;
      }
    }
    return undefined;
  }

  export function processEvents(ev: KeyIndexKeyEvent) {
    const { keyIndex, isDown } = ev;
    const keyId = getKeyId(keyIndex);
    if (keyId) {
      if (isDown) {
        const assign = getAssign(keyId, 'down');
        if (assign) {
          const sortOrderVirtualKey =
            (assign.type === 'keyInput' && assign.virtualKey) || 'K_NONE';
          ModuleF.pushCommitEvent({
            type: 'down',
            keyId,
            assign,
            priorityVirtualKey: sortOrderVirtualKey,
            tick: Date.now()
          });
        }
      } else {
        ModuleF.pushCommitEvent({
          type: 'up',
          keyId,
          priorityVirtualKey: 'K_NONE',
          tick: Date.now()
        });
      }
    }
  }

  export function processTicker() {
    const needUpdate = ModuleF.readQueuedEvents();
    if (needUpdate) {
      ModuleZ.updateOutputReport();
    }
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
      ModuleA.processEvents(ev0);
    }
  };

  private processTicker = () => {
    ModuleA.processTicker();
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
