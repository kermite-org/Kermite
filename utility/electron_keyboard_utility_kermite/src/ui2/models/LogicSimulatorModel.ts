import { app } from './appGlobal';
import { IUiRealtimeKeyboardEvent } from './dataSource/interfaces/IRealtimeKeyboardEventProvider';
import { RealtimeKeyboardEventProvider_RealDevice } from './dataSource/RealtimeKeyboardEventProvider_RealDevice';

export class LogicSimulatorModel {
  private keyEventProvider = new RealtimeKeyboardEventProvider_RealDevice();

  //state
  private _keyStates: boolean[] = [];

  //services
  private handlekeyEvents = (event: IUiRealtimeKeyboardEvent) => {
    const { keyIndex, isDown } = event;
    this._keyStates[keyIndex] = isDown;
    app.rerender();
  };

  initialize = () => {
    this.keyEventProvider.setListener(this.handlekeyEvents);
    this.keyEventProvider.start();
  };

  finalize = () => {
    this.keyEventProvider.stop();
  };

  //getters
  get keyStates() {
    return this._keyStates;
  }

  get inputResultText() {
    // return this.logicSimulator.inputResultText;
    return '';
  }

  //mutations
  clearInputResultText = () => {
    // this.logicSimulator.clearInputResultText();
  };
}
export const logicSimulatorModel = new LogicSimulatorModel();
