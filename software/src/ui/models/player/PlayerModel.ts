import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import { appUi } from '~ui/core';
import { EditorModel } from '../editor/EditorModel';
import { RealtimeKeyboardEventProvider } from './RealtimeKeyboardEventProvider';

export class PlayerModel {
  private keyEventProvider = new RealtimeKeyboardEventProvider();
  private _keyStates: { [keyId: string]: boolean } = {};
  private _layerActiveFlags: number = 1;

  holdKeyIndices: Set<number> = new Set();

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
      isActive: this.isLayerActive(index)
    }));
  }

  getDynamicKeyAssign = (keyUnitId: string) => {
    const { layers } = this.editorModel;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (this.isLayerActive(i)) {
        const layer = layers[i];
        const assign = this.editorModel.getAssignForKeyUnit(
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

      const keyUnit = this.editorModel.profileData.keyboardShape.keyUnits.find(
        (kp) => kp.keyIndex === keyIndex
      );
      if (keyUnit) {
        this._keyStates[keyUnit.id] = isDown;
      }
    } else if (ev.type === 'layerChanged') {
      this._layerActiveFlags = ev.layerActiveFlags;
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
