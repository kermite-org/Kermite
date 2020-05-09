import { VirtualKey } from '~defs/VirtualKeys';
import {
  IKeyStrokeAssignEvent,
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleN_KeyBindUpdator } from './ModuleN_KeyBindUpdator';

namespace StrokeSequenceEmitter {
  export function emitFakeStrokes(vks: VirtualKey[]) {
    vks.forEach((vk) => {
      ModuleN_KeyBindUpdator.pushHoldKeyBind(vk);
      ModuleN_KeyBindUpdator.removeHoldKeyBind(vk);
    });
  }

  export async function emitImmediateDownUp(vk: VirtualKey) {
    ModuleN_KeyBindUpdator.pushHoldKeyBind(vk);
    ModuleN_KeyBindUpdator.removeHoldKeyBind(vk);
  }
}

export namespace ModuleK_KeyStrokeAssignGate {
  // function releaseSpecificKeyHoldBind(virtualKey: VirtualKey) {
  //   const { holdKeyBinds } = logicSimulatorStateC;
  //   const target = holdKeyBinds.find((hk) => hk.virtualKey === virtualKey);
  //   if (target) {
  //     Arrays.remove(holdKeyBinds, target);
  //     ModuleP_OutputKeyStateCombiner.updateOutputReport();
  //   }
  // }

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

  let nextDoubleReserved: boolean = false;
  let lastInputVirtualKey: VirtualKey = 'K_NONE';

  export function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      // eslint-disable-next-line no-console
      console.log('[K]down', ev.keyId, assign);

      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;

        if (vk === 'K_NextDouble') {
          nextDoubleReserved = true;
          return;
        }

        if (vk === 'K_PostDouble') {
          StrokeSequenceEmitter.emitFakeStrokes([lastInputVirtualKey]);
          return;
        }
        if (fixedTextPattern[vk]) {
          StrokeSequenceEmitter.emitFakeStrokes(fixedTextPattern[vk]!);
          return;
        }

        if (logicSimulatorCConfig.useImmediateDownUp) {
          StrokeSequenceEmitter.emitImmediateDownUp(assign.virtualKey);
          return;
        }
      }

      if (assign.type === 'keyInput') {
        if (nextDoubleReserved) {
          StrokeSequenceEmitter.emitFakeStrokes([assign.virtualKey]);
        }
        ModuleN_KeyBindUpdator.pushHoldKeyBind(
          assign.virtualKey,
          assign.attachedModifiers
        );
        lastInputVirtualKey = assign.virtualKey;
      } else if (assign.type === 'layerCall') {
        if (isShiftLayer(assign.targetLayerId)) {
          ModuleN_KeyBindUpdator.pushHoldKeyBind('K_Shift');
        }
      }
      nextDoubleReserved = false;
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
    } else {
      const { keyId } = ev;
      const info = keyBindingInfoDict[keyId];
      if (info) {
        const { assign } = info;
        if (assign.type === 'keyInput') {
          ModuleN_KeyBindUpdator.removeHoldKeyBind(assign.virtualKey);
        }
        if (assign.type === 'layerCall' && isShiftLayer(assign.targetLayerId)) {
          ModuleN_KeyBindUpdator.removeHoldKeyBind('K_Shift');
        }
        delete keyBindingInfoDict[keyId];
      }
      // console.log('[K]up', keyId);
      // ModuleN_KeyBindUpdator.removeHoldKeyBind(keyId);
    }
  }
}
