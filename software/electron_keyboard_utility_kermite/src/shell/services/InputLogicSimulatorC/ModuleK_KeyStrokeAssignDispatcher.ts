import { IAssignOperation } from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import {
  createModuleIo,
  IKeyStrokeAssignEvent,
  IVirtualKeyEvent,
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { KeyInputAssignReaderCore } from './ModuleD_KeyInputAssignReader';

const fixedTextPattern: { [vk in VirtualKey]?: VirtualKey[] } = {
  K_NN: ['K_N', 'K_N'],
  K_LTU: ['K_L', 'K_T', 'K_U'],
  K_UU: ['K_U', 'K_U']
};

export namespace ModuleK_KeyStrokeAssignDispatcher {
  export const io = createModuleIo<IKeyStrokeAssignEvent, IVirtualKeyEvent>(
    handleLogicalStroke
  );
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

  function pushVirtualKey(
    virtualKey: VirtualKey,
    attachedModifiers?: ModifierVirtualKey[]
  ) {
    io.emit({ virtualKey, attachedModifiers, isDown: true });
  }

  function removeVirtualKey(virtualKey: VirtualKey) {
    io.emit({ virtualKey, isDown: false });
  }

  function emitFakeStrokes(vks: VirtualKey[]) {
    vks.forEach((vk) => {
      pushVirtualKey(vk);
      removeVirtualKey(vk);
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
        pushVirtualKey(op.virtualKey, op.attachedModifiers);
        local.lastInputVirtualKey = op.virtualKey;
      } else if (op.type === 'layerCall') {
        const { targetLayerId } = op;
        if (isShiftLayer(targetLayerId)) {
          pushVirtualKey('K_Shift');
        }
        holdLayerIds.add(targetLayerId);
        // console.log(`layers`, holdLayerIds);
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
          removeVirtualKey(op.virtualKey);
        }
        if (op.type === 'layerCall' && isShiftLayer(op.targetLayerId)) {
          removeVirtualKey('K_Shift');
        }
        if (op.type === 'layerCall') {
          holdLayerIds.delete(op.targetLayerId);
          // console.log(`layers`, holdLayerIds);
        }
        delete operationBindMap[keyId];
      }
    }
  }

  function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    if (1) {
      //dirty fix for layer + sorter combination problem
      if (ev.type === 'down') {
        const assignType = logicSimulatorStateC.profileData.assignType;
        const op = KeyInputAssignReaderCore.getAssignOperation(
          ev.keyId,
          ev.trigger,
          assignType
        );
        if (op) {
          ev.op = op;
        } else {
          return;
        }
      }
    }
    handleLogicalStrokeDown(ev);
    handleLogicalStrokeUp(ev);
  }
}
