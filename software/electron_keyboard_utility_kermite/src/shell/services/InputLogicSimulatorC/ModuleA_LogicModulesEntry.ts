import { KeyIndexKeyEvent } from '../InputLogicSimulatorB/common';
import { logicSimulatorStateC } from './LogicSimulatorCCommon';
import { ModuleC_InputTriggerDetector } from './ModuleC_InputTriggerDetector';
import { ModuleF_KeyEventPrioritySorter } from './ModuleF_KeyEventPrioritySorter';
import { ModuleK_KeyStrokeAssignGate } from './ModuleK_KeyStrokeAssignGate';

export namespace ModuleA_LogicModulesEntry {
  function getKeyId(keyIndex: number): string | undefined {
    const kp = logicSimulatorStateC.editModel.keyboardShape.keyUnits.find(
      (key) => key.keyIndex === keyIndex
    );
    return kp && kp.id;
  }

  export function processEvents(ev: KeyIndexKeyEvent) {
    const { keyIndex, isDown } = ev;
    const keyId = getKeyId(keyIndex);
    if (keyId) {
      ModuleC_InputTriggerDetector.handleKeyInput(keyId, isDown);
    }
  }

  export function processTicker() {
    ModuleC_InputTriggerDetector.handleTicker();

    const ev = ModuleF_KeyEventPrioritySorter.readQueuedEventOne();
    if (ev) {
      ModuleK_KeyStrokeAssignGate.handleLogicalStroke(ev);
    }
  }
}
