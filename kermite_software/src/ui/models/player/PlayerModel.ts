import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import { appUi } from '~ui/core';
import { editorModel } from '~ui/models/editor/EditorModel';
import { RealtimeKeyboardEventProvider } from './RealtimeKeyboardEventProvider';

class PlayerModel {
  private keyEventProvider = new RealtimeKeyboardEventProvider();
  private _keyStates: { [keyId: string]: boolean } = {};
  private _currentLayerIndex: number = 0;
  private _layerActiveStates: boolean[] = [true];

  holdKeyIndices: Set<number> = new Set();

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
    const { layers } = editorModel;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (this._layerActiveStates[i]) {
        const layer = layers[i];
        const assign = editorModel.getAssignForKeyUnit(
          keyUnitId,
          layer.layerId
        );

        if (assign?.type === 'transparent') {
          continue;
        }
        if (assign?.type === 'block') {
          return undefined;
        }
        if (!assign && layer.defaultScheme === 'block') {
          return undefined;
        }
        if (assign) {
          return assign;
        }
      }
    }
    return undefined;
  };

  // listeners
  private handlekeyEvents = (ev: IRealtimeKeyboardEvent) => {
    if (ev.type === 'keyStateChanged') {
      const { keyIndex, isDown } = ev;
      if (isDown) {
        this.holdKeyIndices.add(keyIndex);
      } else {
        this.holdKeyIndices.delete(keyIndex);
      }

      const keyUnit = editorModel.profileData.keyboardShape.keyUnits.find(
        (kp) => kp.keyIndex === keyIndex
      );
      if (keyUnit) {
        this._keyStates[keyUnit.id] = isDown;
      }
    } else if (ev.type === 'layerChanged') {
      this._layerActiveStates = ev.layerActiveStates;
      const layerIndex = ev.layerActiveStates.lastIndexOf(true);
      this._currentLayerIndex = layerIndex >= 0 ? layerIndex : 0;
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
