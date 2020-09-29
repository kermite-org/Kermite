import { IInputLogicSimulator } from './InputLogicSimulator.interface';
// import { InputLogicSimulatorA } from './InputLogicSimulatorA';
// import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';

//export const inputLogicSimulator: IInputLogicSimulator = new InputLogicSimulatorA();
//export const inputLogicSimulator: IInputLogicSimulator = InputLogicSimulatorC.getInterface();
export const inputLogicSimulator: IInputLogicSimulator = InputLogicSimulatorD.getInterface();
