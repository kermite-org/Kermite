import { KeyIndexKeyEvent } from '../InputLogicSimulatorB/common';
import { logicSimulatorStateC } from './LogicSimulatorCCommon';
import { ModuleC_InputTriggerDetector } from './ModuleC_InputTriggerDetector';

export namespace ModuleA_KeyIdReader {
  function getKeyId(keyIndex: number): string | undefined {
    const kp = logicSimulatorStateC.profileData.keyboardShape.keyUnits.find(
      (key) => key.keyIndex === keyIndex
    );
    return kp && kp.id;
  }

  export function processEvent(ev: KeyIndexKeyEvent) {
    const { keyIndex, isDown } = ev;
    const keyId = getKeyId(keyIndex);
    if (keyId) {
      ModuleC_InputTriggerDetector.handleKeyInput(keyId, isDown);
    }
  }
}
