import {
  createFallbackDisplayKeyboardDesign,
  fallbackProfileData,
  IDisplayKeyboardDesign,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent } from '~/ui-common';

class PlayerModelHelper {
  static translateKeyIndexToKeyUnitId(
    keyIndex: number,
    profileData: IProfileData,
  ): string | undefined {
    const keyEntity = profileData.keyboardDesign.keyEntities.find(
      (kp) => kp.keyIndex === keyIndex,
    );
    return keyEntity?.keyId;
  }
}

export class PlayerModel {
  private _profileData: IProfileData = fallbackProfileData;
  private _displayDesign: IDisplayKeyboardDesign = createFallbackDisplayKeyboardDesign();

  private _keyStates: { [keyId: string]: boolean } = {};
  private _layerActiveFlags: number = 1;
  private _holdKeyIndices: Set<number> = new Set();

  get holdKeyIndices(): number[] {
    return this._holdKeyIndices.size > 0 ? [...this._holdKeyIndices] : [];
  }

  get keyStates() {
    return this._keyStates;
  }

  get layers() {
    return this._profileData.layers;
  }

  get displayDesign() {
    return this._displayDesign;
  }

  private isLayerActive(layerIndex: number) {
    return ((this._layerActiveFlags >> layerIndex) & 1) > 0;
  }

  get layerStackViewSource(): {
    layerId: string;
    layerName: string;
    isActive: boolean;
  }[] {
    return this._profileData.layers.map((la, index) => ({
      layerId: la.layerId,
      layerName: la.layerName,
      isActive: this.isLayerActive(index),
    }));
  }

  getDynamicKeyAssign = (keyUnitId: string) => {
    const { layers } = this._profileData;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (this.isLayerActive(i)) {
        const layer = layers[i];
        const assign = this._profileData.assigns[
          `${layer.layerId}.${keyUnitId}`
        ];

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

  private plainShiftPressed: boolean = false;

  checkShiftHold(): boolean {
    const shiftLayerHold = this._profileData.layers.some(
      (layer, layerIndex) =>
        this.isLayerActive(layerIndex) &&
        layer.attachedModifiers?.includes('K_Shift'),
    );
    return shiftLayerHold || this.plainShiftPressed;
  }

  private shiftResolver = (keyUnitId: string, isDown: boolean) => {
    const assign = this.getDynamicKeyAssign(keyUnitId);
    if (assign?.type === 'single') {
      if (
        assign.op?.type === 'keyInput' &&
        assign.op.virtualKey === 'K_Shift'
      ) {
        this.plainShiftPressed = isDown;
      }
    }
  };

  private handlekeyEvents = (ev: IRealtimeKeyboardEvent) => {
    if (ev.type === 'keyStateChanged') {
      const { keyIndex, isDown } = ev;
      if (isDown) {
        this._holdKeyIndices.add(keyIndex);
      } else {
        this._holdKeyIndices.delete(keyIndex);
      }
      const keyUnitId = PlayerModelHelper.translateKeyIndexToKeyUnitId(
        keyIndex,
        this._profileData,
      );
      if (keyUnitId) {
        this._keyStates[keyUnitId] = isDown;
        this.shiftResolver(keyUnitId, isDown);
      }
    } else if (ev.type === 'layerChanged') {
      this._layerActiveFlags = ev.layerActiveFlags;
    }
  };

  setProfileData(profile: IProfileData) {
    if (this._profileData !== profile) {
      this._profileData = profile;
      this._displayDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        profile.keyboardDesign,
      );
    }
  }

  initialize() {
    ipcAgent.events.device_keyEvents.subscribe(this.handlekeyEvents);
  }

  finalize() {
    ipcAgent.events.device_keyEvents.unsubscribe(this.handlekeyEvents);
  }
}
