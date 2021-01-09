import { IRealtimeKeyboardEvent } from '@kermite/shared';
import { ipcAgent } from '@kermite/ui';
import { EditorModel } from '../editor/EditorModel';

export class PlayerModel {
  private _keyStates: { [keyId: string]: boolean } = {};
  private _layerActiveFlags: number = 1;
  private _holdKeyIndices: Set<number> = new Set();

  get holdKeyIndices(): number[] {
    return [...this._holdKeyIndices];
  }

  constructor(private editorModel: EditorModel) {}

  // getters
  get keyStates() {
    return this._keyStates;
  }

  private isLayerActive(layerIndex: number) {
    return ((this._layerActiveFlags >> layerIndex) & 1) > 0;
  }

  get layerStackViewSource(): {
    layerId: string;
    layerName: string;
    isActive: boolean;
  }[] {
    return this.editorModel.layers.map((la, index) => ({
      layerId: la.layerId,
      layerName: la.layerName,
      isActive: this.isLayerActive(index),
    }));
  }

  getDynamicKeyAssign = (keyUnitId: string) => {
    const { layers } = this.editorModel;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (this.isLayerActive(i)) {
        const layer = layers[i];
        const assign = this.editorModel.getAssignForKeyUnit(
          keyUnitId,
          layer.layerId,
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
        this._holdKeyIndices.add(keyIndex);
      } else {
        this._holdKeyIndices.delete(keyIndex);
      }

      const keyUnitId = this.editorModel.translateKeyIndexToKeyUnitId(keyIndex);
      if (keyUnitId) {
        this._keyStates[keyUnitId] = isDown;
      }
    } else if (ev.type === 'layerChanged') {
      this._layerActiveFlags = ev.layerActiveFlags;
    }
  };

  initialize() {
    ipcAgent.subscribe2('device_keyEvents', this.handlekeyEvents);
  }

  finalize() {
    ipcAgent.unsubscribe2('device_keyEvents', this.handlekeyEvents);
  }
}
