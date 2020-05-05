import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  IKeyStrokeAssignEvent,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';
import { delayMs } from '../DeviceService/Helpers';

namespace KeyBindUpdator {
  export function pushHoldKeyBind(
    keyId: string,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    logicSimulatorStateC.holdKeyBinds.push({
      keyId,
      virtualKey,
      attachedModifiers
    });
    ModuleP_OutputKeyStateCombiner.updateOutputReport();
  }

  export function removeHoldKeyBind(keyId: string) {
    const { holdKeyBinds } = logicSimulatorStateC;
    const target = holdKeyBinds.find((hk) => hk.keyId === keyId);
    if (target) {
      Arrays.remove(holdKeyBinds, target);
      ModuleP_OutputKeyStateCombiner.updateOutputReport();
    }
  }
}

namespace StrokeSequenceEmitter {
  function releaseSpecificKeyHoldBind(virtualKey: VirtualKey) {
    const { holdKeyBinds } = logicSimulatorStateC;
    const target = holdKeyBinds.find((hk) => hk.virtualKey === virtualKey);
    if (target) {
      Arrays.remove(holdKeyBinds, target);
      ModuleP_OutputKeyStateCombiner.updateOutputReport();
    }
  }

  export async function emitFakeStrokes(vks: VirtualKey[]) {
    const exKeyId = `FakeStroke`;
    for (const vk of vks) {
      releaseSpecificKeyHoldBind(vk);
      KeyBindUpdator.pushHoldKeyBind(exKeyId, vk);
      await delayMs(50);
      KeyBindUpdator.removeHoldKeyBind(exKeyId);
    }
  }
}

export namespace KeyStrokeAssignGate {
  function isShiftLayer(targetLayerId: string) {
    const layer = logicSimulatorStateC.editModel.layers.find(
      (la) => la.layerId === targetLayerId
    );
    return layer?.isShiftLayer;
  }

  const fixedTextPattern: { [vk in VirtualKey]?: VirtualKey[] } = {
    K_NN: ['K_N', 'K_N'],
    K_LTU: ['K_L', 'K_T', 'K_U'],
    K_UU: ['K_U', 'K_U']
  };

  export function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      // eslint-disable-next-line no-console
      console.log('down', ev.keyId, assign);

      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;
        if (fixedTextPattern[vk]) {
          StrokeSequenceEmitter.emitFakeStrokes(fixedTextPattern[vk]!);
          return;
        }
      }

      if (assign.type === 'keyInput') {
        KeyBindUpdator.pushHoldKeyBind(
          keyId,
          assign.virtualKey,
          assign.attachedModifiers
        );
      } else if (assign.type === 'layerCall') {
        if (isShiftLayer(assign.targetLayerId)) {
          KeyBindUpdator.pushHoldKeyBind(keyId, 'K_Shift');
        }
      }
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
    } else {
      const { keyId } = ev;
      KeyBindUpdator.removeHoldKeyBind(keyId);
      delete keyBindingInfoDict[keyId];
    }
  }
}
