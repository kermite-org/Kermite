export interface IInputLogicSimulator {
  initialize(): Promise<void>;
  terminate(): Promise<void>;
}
