import { InputLogicSimulator } from './logic/InputLogicSimulator';
import { IInputLogicSimulator } from './logic/InputLogicSimulator.interface';
import { editorModel } from './EditorModel';
import {
  IRealtimeKeyboardEventProvider,
  RealtimeKeyboardEventProvider_DomKeyboardSimulator,
  IRealtimeKeyboardEvent,
} from './dataSource';
import { app } from './appGlobal';

export class LogicSimulatorModel {
  private logicSimulator!: IInputLogicSimulator;
  private keyEventProvider!: IRealtimeKeyboardEventProvider;

  //state
  private _keyStates: boolean[] = [];

  //services
  private handlekeyEvents = (event: IRealtimeKeyboardEvent) => {
    const { keyIndex, isDown } = event;
    this._keyStates[keyIndex] = isDown;
    this.logicSimulator.handleKeyInput(keyIndex, isDown);
    app.rerender();
  };

  initialize = () => {
    this.logicSimulator = new InputLogicSimulator();
    this.keyEventProvider = new RealtimeKeyboardEventProvider_DomKeyboardSimulator();
    this.keyEventProvider.setListener(this.handlekeyEvents);
    this.keyEventProvider.start();
    this.logicSimulator.setEditModel(editorModel);
    this.logicSimulator.start();
  };

  finalize = () => {
    this.keyEventProvider.stop();
    this.logicSimulator.stop();
  };

  //getters
  get keyStates() {
    return this._keyStates;
  }

  get inputResultText() {
    return this.logicSimulator.inputResultText;
  }

  //mutations
  clearInputResult = () => {
    this.logicSimulator.clearInputResultText();
  };
}
export const logicSimulatorModel = new LogicSimulatorModel();
