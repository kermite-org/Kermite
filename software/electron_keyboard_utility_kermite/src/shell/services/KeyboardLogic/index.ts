import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';

// 画面上のキーボードの状態をデバイスに同期するため、マイコン上でのキー入力ロジックをPC上で再現する
// マイコンのキーボードロジック実装のプロトタイプとしても使用
export const inputLogicSimulator: IInputLogicSimulator = InputLogicSimulatorD.getInterface();
