import { IAssignOperation } from '~defs/ProfileData';
import { VirtualKey } from '~defs/VirtualKeys';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleN_VirtualKeyEventAligner } from './ModuleN_VirtualKeyEventAligner';

type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      assign: IAssignOperation;
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
      const { keyId, assign } = ev;
      // eslint-disable-next-line no-console
      console.log('[K]down', ev.keyId, assign);

      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;

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
          emitFakeStrokes([assign.virtualKey]);
          return;
        }
      }

      if (assign.type === 'keyInput') {
        if (local.nextDoubleReserved) {
          emitFakeStrokes([assign.virtualKey]);
        }
        ModuleN_VirtualKeyEventAligner.pushVirtualKey(
          assign.virtualKey,
          assign.attachedModifiers
        );
        local.lastInputVirtualKey = assign.virtualKey;
      } else if (assign.type === 'layerCall') {
        const { targetLayerId } = assign;
        if (isShiftLayer(targetLayerId)) {
          ModuleN_VirtualKeyEventAligner.pushVirtualKey('K_Shift');
        }
        holdLayerIds.add(targetLayerId);
      }
      local.nextDoubleReserved = false;
      operationBindMap[keyId] = assign;
    }
  }

  function handleLogicalStrokeUp(ev: IKeyStrokeAssignEvent) {
    const { holdLayerIds } = logicSimulatorStateC;
    const { operationBindMap } = local;
    if (ev.type === 'up') {
      const { keyId } = ev;
      const assign = operationBindMap[keyId];
      if (assign) {
        if (assign.type === 'keyInput') {
          ModuleN_VirtualKeyEventAligner.removeVirtualKey(assign.virtualKey);
        }
        if (assign.type === 'layerCall' && isShiftLayer(assign.targetLayerId)) {
          ModuleN_VirtualKeyEventAligner.removeVirtualKey('K_Shift');
        }
        if (assign.type === 'layerCall') {
          holdLayerIds.delete(assign.targetLayerId);
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
