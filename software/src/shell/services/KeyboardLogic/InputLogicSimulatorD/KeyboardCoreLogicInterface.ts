export interface KeyboardCoreLogicInterface {
  keyboardCoreLogic_setAssignStorageReaderFunc(
    func: (addr: number) => number
  ): void;
  keyboardCoreLogic_initialize(): void;
  keyboardCoreLogic_getLayerActiveFlags(): number;
  keyboardCoreLogic_getOutputHidReportBytes(): number[];
  keyboardCoreLogic_issuePhysicalKeyStateChanged(
    keyIndex: number,
    isDown: boolean
  ): void;
  keyboardCoreLogic_processTicker(ms: number): void;
}
