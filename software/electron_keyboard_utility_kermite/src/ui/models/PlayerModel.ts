import { appUi } from './appUi';
import { RealtimeKeyboardEventProvider_RealDevice } from './dataSource/RealtimeKeyboardEventProvider_RealDevice';
import { EditorModel } from './EditorModel';
import { IRealtimeKeyboardEvent } from '~defs/IpcContract';

export class PlayerModel {
  constructor(private editorModel: EditorModel) {}
  private keyEventProvider = new RealtimeKeyboardEventProvider_RealDevice();
  private _keyStates: { [keyId: string]: boolean } = {};
  private _currentLayerIndex: number = 0;

  //getters
  get keyStates() {
    return this._keyStates;
  }

  get currentLayerId(): string {
    return this.editorModel.layers[this._currentLayerIndex].layerId;
  }

  getDynamicKeyAssign = (keyUnitId: string) => {
    const layer = this.editorModel.getLayerById(this.currentLayerId);
    if (layer) {
      let assign = this.editorModel.getAssignForKeyUnit(
        keyUnitId,
        layer.layerId
      );
      if (!assign && layer.defaultScheme === 'transparent') {
        assign = this.editorModel.getAssignForKeyUnit(keyUnitId, 'la0');
      }
      return assign;
    }
    return undefined;
  };

  //listeners
  private handlekeyEvents = (ev: IRealtimeKeyboardEvent) => {
    if (ev.type === 'keyStateChanged') {
      const { keyIndex, isDown } = ev;
      const keyUnit = this.editorModel.profileData.keyboardShape.keyUnits.find(
        (kp) => kp.keyIndex === keyIndex
      );
      if (keyUnit) {
        this._keyStates[keyUnit.id] = isDown;
      }
    } else if (ev.type === 'layerChanged') {
      this._currentLayerIndex = ev.layerIndex;
    }

    appUi.rerender();
  };

  async initialize() {
    this.keyEventProvider.setListener(this.handlekeyEvents);
    this.keyEventProvider.start();
  }

  async finalize() {
    this.keyEventProvider.stop();
  }
}
