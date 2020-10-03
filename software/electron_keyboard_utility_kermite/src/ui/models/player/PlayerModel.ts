import { appUi } from '~ui/core';
import { RealtimeKeyboardEventProvider } from './RealtimeKeyboardEventProvider';
import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import { editorModel } from '~ui/models/editor/EditorModel';

class PlayerModel {
  private keyEventProvider = new RealtimeKeyboardEventProvider();
  private _keyStates: { [keyId: string]: boolean } = {};
  private _currentLayerIndex: number = 0;

  // getters
  get keyStates() {
    return this._keyStates;
  }

  get currentLayerId(): string {
    return editorModel.layers[this._currentLayerIndex].layerId;
  }

  getDynamicKeyAssign = (keyUnitId: string) => {
    const layer = editorModel.getLayerById(this.currentLayerId);
    if (layer) {
      let assign = editorModel.getAssignForKeyUnit(keyUnitId, layer.layerId);
      if (!assign && layer.defaultScheme === 'transparent') {
        assign = editorModel.getAssignForKeyUnit(keyUnitId, 'la0');
      }
      return assign;
    }
    return undefined;
  };

  // listeners
  private handlekeyEvents = (ev: IRealtimeKeyboardEvent) => {
    if (ev.type === 'keyStateChanged') {
      const { keyIndex, isDown } = ev;
      const keyUnit = editorModel.profileData.keyboardShape.keyUnits.find(
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

  initialize() {
    this.keyEventProvider.setListener(this.handlekeyEvents);
    this.keyEventProvider.start();
  }

  finalize() {
    this.keyEventProvider.stop();
  }
}

export const playerModel = new PlayerModel();
