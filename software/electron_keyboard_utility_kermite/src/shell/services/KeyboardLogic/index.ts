import { IInputLogicSimulator } from './InputLogicSimulator.interface';
// import { InputLogicSimulatorA } from './InputLogicSimulatorA';
// import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';

// 画面上のキーボードの状態をデバイスに同期するため、マイコン上でのキー入力ロジックをPC上で再現する
// マイコンのキーボードロジック実装のプロトタイプとしても使用
// export const inputLogicSimulator: IInputLogicSimulator = new InputLogicSimulatorA();
// export const inputLogicSimulator: IInputLogicSimulator = InputLogicSimulatorC.getInterface();
export const inputLogicSimulator: IInputLogicSimulator = InputLogicSimulatorD.getInterface();
