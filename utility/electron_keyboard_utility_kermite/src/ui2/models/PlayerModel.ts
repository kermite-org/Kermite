import { appUi } from './appGlobal';
import { IUiRealtimeKeyboardEvent } from './dataSource/interfaces/IRealtimeKeyboardEventProvider';
import { RealtimeKeyboardEventProvider_RealDevice } from './dataSource/RealtimeKeyboardEventProvider_RealDevice';
import { EditorModel } from './EditorModel';

export class PlayerModel {
  constructor(private editorModel: EditorModel) {}
  private keyEventProvider = new RealtimeKeyboardEventProvider_RealDevice();
  private _keyStates: { [keyId: string]: boolean } = {};

  //getters
  get keyStates() {
    return this._keyStates;
  }

  //listeners
  private handlekeyEvents = (event: IUiRealtimeKeyboardEvent) => {
    const { keyIndex, isDown } = event;
    const keyUnit = this.editorModel.profileData.keyboardShape.keyUnits.find(
      (kp) => kp.keyIndex === keyIndex
    );
    if (keyUnit) {
      this._keyStates[keyUnit.id] = isDown;
    }
    appUi.rerender();
  };

  initialize = () => {
    this.keyEventProvider.setListener(this.handlekeyEvents);
    this.keyEventProvider.start();
  };

  finalize = () => {
    this.keyEventProvider.stop();
  };
}
