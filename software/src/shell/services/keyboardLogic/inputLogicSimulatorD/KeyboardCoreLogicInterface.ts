export interface KeyboardCoreLogicInterface {
  keyboardCoreLogic_initialize(): void;
  keyboardCoreLogic_getLayerActiveFlags(): number;
  keyboardCoreLogic_getOutputHidReportBytes(): number[];
  keyboardCoreLogic_peekAssignHitResult(): number;
  keyboardCoreLogic_issuePhysicalKeyStateChanged(
    keyIndex: number,
    isDown: boolean,
  ): void;
  keyboardCoreLogic_processTicker(ms: number): void;
  keyboardCoreLogic_halt(): void;
  keyboardCoreLogic_setSystemLayout(layout: number): void;
  keyboardCoreLogic_setWiringMode(mode: number): void;
}
