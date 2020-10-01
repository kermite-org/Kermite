import {
  createModuleIo,
  logicSimulatorStateC,
  IKeyIdKeyEvent,
  IKeyIndexKeyEvent
} from './LogicSimulatorCCommon';

export namespace ModuleA_KeyIdReader {
  export const io = createModuleIo<IKeyIndexKeyEvent, IKeyIdKeyEvent>(
    processEvent
  );

  function getKeyId(keyIndex: number): string | undefined {
    const kp = logicSimulatorStateC.profileData.keyboardShape.keyUnits.find(
      (key) => key.keyIndex === keyIndex
    );
    return kp?.id;
  }

  function processEvent(ev: IKeyIndexKeyEvent) {
    const { keyIndex, isDown } = ev;
    const keyId = getKeyId(keyIndex);
    if (keyId) {
      io.emit({ keyId, isDown });
    }
  }
}
