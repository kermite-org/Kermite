import { IAssignOperation, IKeyAssignEntry } from '~defs/ProfileData';
import { KeyIndexKeyEvent, TKeyTrigger } from '../InputLogicSimulatorB/common';
import {
  IKeyStrokeAssignEvent,
  logicSimulatorStateC,
  PrioritySorterConfig
} from './LogicSimulatorCCommon';
import { KeyEventPrioritySorter } from './ModuleF_KeyEventPrioritySorter';
import { KeyStrokeAssignGate } from './ModuleK_KeyStrokeAssignGate';

export namespace ModuleA_KeyInputAssignBinder {
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

  function pushStrokeEvent(ev: IKeyStrokeAssignEvent) {
    if (PrioritySorterConfig.bypass) {
      KeyStrokeAssignGate.handleLogicalStroke(ev);
    } else {
      KeyEventPrioritySorter.pushStrokeAssignEvent(ev);
    }
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
          pushStrokeEvent({
            type: 'down',
            keyId,
            assign,
            priorityVirtualKey: sortOrderVirtualKey,
            tick: Date.now()
          });
        }
      } else {
        pushStrokeEvent({
          type: 'up',
          keyId,
          priorityVirtualKey: 'K_NONE',
          tick: Date.now()
        });
      }
    }
  }

  export function processTicker() {
    const ev = KeyEventPrioritySorter.readQueuedEventOne();
    if (ev) {
      KeyStrokeAssignGate.handleLogicalStroke(ev);
    }
  }
}
