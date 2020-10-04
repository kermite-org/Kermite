import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import { appUi } from '~ui/core';
import { editorModel } from '~ui/models/editor/EditorModel';
import { RealtimeKeyboardEventProvider } from './RealtimeKeyboardEventProvider';

class PlayerModel {
  private keyEventProvider = new RealtimeKeyboardEventProvider();
  private _keyStates: { [keyId: string]: boolean } = {};
  private _currentLayerIndex: number = 0;
  private _layerActiveStates: boolean[] = [true];

  // getters
  get keyStates() {
    return this._keyStates;
  }

  get currentLayerId(): string {
    return editorModel.layers[this._currentLayerIndex].layerId;
  }

  get layerStackViewSource(): {
    layerId: string;
    layerName: string;
    isActive: boolean;
  }[] {
    return editorModel.layers.map((la, index) => ({
      layerId: la.layerId,
      layerName: la.layerName,
      isActive: this._layerActiveStates[index]
    }));
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
      this._layerActiveStates = ev.layerActiveStates;
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
