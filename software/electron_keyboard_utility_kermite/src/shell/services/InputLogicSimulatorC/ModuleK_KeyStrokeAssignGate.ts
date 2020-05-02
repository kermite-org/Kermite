import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  IKeyStrokeAssignEvent,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';

export namespace KeyStrokeAssignGate {
  function isShiftLayer(targetLayerId: string) {
    const layer = logicSimulatorStateC.editModel.layers.find(
      (la) => la.layerId === targetLayerId
    );
    return layer?.layerName.includes('shift');
  }

  function pushHoldKeyBind(
    keyId: string,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[]
  ) {
    logicSimulatorStateC.holdKeyBinds.push({
      keyId,
      virtualKey,
      attachedModifiers
    });
  }

  function removeHoldKeyBind(keyId: string) {
    Arrays.removeIf(
      logicSimulatorStateC.holdKeyBinds,
      (hk) => hk.keyId === keyId
    );
  }

  export function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      console.log('down', ev.keyId, assign);
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
      if (assign.type === 'keyInput') {
        pushHoldKeyBind(
          keyId,
          assign.virtualKey,
          assign.attachedModifiers || []
        );
      } else if (assign.type === 'layerCall') {
        if (isShiftLayer(assign.targetLayerId)) {
          pushHoldKeyBind(keyId, 'K_Shift', []);
        }
      }
    } else {
      const { keyId } = ev;
      // console.log('up', ev.keyId);
      removeHoldKeyBind(keyId);
      delete keyBindingInfoDict[keyId];
    }
    ModuleP_OutputKeyStateCombiner.updateOutputReport();
  }
}
