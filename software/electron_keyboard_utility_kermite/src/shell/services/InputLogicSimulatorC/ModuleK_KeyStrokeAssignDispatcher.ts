import { IAssignOperation, IAssignEntry_Single } from '~defs/ProfileData';
import { VirtualKey } from '~defs/VirtualKeys';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleN_VirtualKeyEventAligner } from './ModuleN_VirtualKeyEventAligner';
import { ModuleD_KeyInputAssignReader } from './ModuleD_KeyInputAssignReader';

type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      op: IAssignOperation;
    }
  | {
      type: 'up';
      keyId: string;
    };

const fixedTextPattern: { [vk in VirtualKey]?: VirtualKey[] } = {
  K_NN: ['K_N', 'K_N'],
  K_LTU: ['K_L', 'K_T', 'K_U'],
  K_UU: ['K_U', 'K_U']
};

export namespace ModuleK_KeyStrokeAssignDispatcher {
  const local = new (class {
    operationBindMap: {
      [keyId: string]: IAssignOperation;
    } = {};
    nextDoubleReserved: boolean = false;
    lastInputVirtualKey: VirtualKey = 'K_NONE';
  })();

  function isShiftLayer(targetLayerId: string) {
    const layer = logicSimulatorStateC.profileData.layers.find(
      (la) => la.layerId === targetLayerId
    );
    return layer?.isShiftLayer;
  }

  function emitFakeStrokes(vks: VirtualKey[]) {
    vks.forEach((vk) => {
      ModuleN_VirtualKeyEventAligner.pushVirtualKey(vk);
      ModuleN_VirtualKeyEventAligner.removeVirtualKey(vk);
    });
  }

  function handleLogicalStrokeDown(ev: IKeyStrokeAssignEvent) {
    const { holdLayerIds } = logicSimulatorStateC;
    const { operationBindMap } = local;
    if (ev.type === 'down') {
      const { keyId, op } = ev;
      // eslint-disable-next-line no-console
      console.log('[K]down', ev.keyId, op);

      if (op.type === 'keyInput') {
        const vk = op.virtualKey;

        if (vk === 'K_NextDouble') {
          local.nextDoubleReserved = true;
          return;
        }

        if (vk === 'K_PostDouble') {
          emitFakeStrokes([local.lastInputVirtualKey]);
          return;
        }
        if (fixedTextPattern[vk]) {
          emitFakeStrokes(fixedTextPattern[vk]!);
          return;
        }

        if (logicSimulatorCConfig.useImmediateDownUp) {
          emitFakeStrokes([op.virtualKey]);
          return;
        }
      }

      if (op.type === 'keyInput') {
        if (local.nextDoubleReserved) {
          emitFakeStrokes([op.virtualKey]);
        }
        ModuleN_VirtualKeyEventAligner.pushVirtualKey(
          op.virtualKey,
          op.attachedModifiers
        );
        local.lastInputVirtualKey = op.virtualKey;
      } else if (op.type === 'layerCall') {
        const { targetLayerId } = op;
        if (isShiftLayer(targetLayerId)) {
          ModuleN_VirtualKeyEventAligner.pushVirtualKey('K_Shift');
        }
        holdLayerIds.add(targetLayerId);
        // console.log(`HL`, holdLayerIds);
      }
      local.nextDoubleReserved = false;
      operationBindMap[keyId] = op;
    }
  }

  function handleLogicalStrokeUp(ev: IKeyStrokeAssignEvent) {
    const { holdLayerIds } = logicSimulatorStateC;
    const { operationBindMap } = local;
    if (ev.type === 'up') {
      const { keyId } = ev;
      // eslint-disable-next-line no-console
      console.log('[K]up', ev.keyId);
      const op = operationBindMap[keyId];
      if (op) {
        if (op.type === 'keyInput') {
          ModuleN_VirtualKeyEventAligner.removeVirtualKey(op.virtualKey);
        }
        if (op.type === 'layerCall' && isShiftLayer(op.targetLayerId)) {
          ModuleN_VirtualKeyEventAligner.removeVirtualKey('K_Shift');
        }
        if (op.type === 'layerCall') {
          holdLayerIds.delete(op.targetLayerId);
          // console.log(`HL`, holdLayerIds);
        }
        delete operationBindMap[keyId];
      }
    }
  }

  export function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    handleLogicalStrokeDown(ev);
    handleLogicalStrokeUp(ev);
  }
}
