import {
  fallbackProfileData,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry,
  IProfileData
} from '~defs/ProfileData';

export interface IPresetKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
}

export interface IPresetKeyboardLayerViewModel {
  layerId: string;
  layerName: string;
}

export interface IPresetKeyboardViewModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkupText: string;
  layers: IPresetKeyboardLayerViewModel[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
  setProfileData(profileData: IProfileData): void;
}

function createKeyUnitViewModel(ku: IKeyUnitEntry): IPresetKeyUnitViewModel {
  const keyUnitId = ku.id;
  const pos = {
    x: ku.x,
    y: ku.y,
    r: ku.r || 0
  };
  const primaryText = 'pri';
  const secondaryText = 'sec';

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText
  };
}

export class PresetKeyboardViewModel implements IPresetKeyboardViewModel {
  private profileData: IProfileData = fallbackProfileData;
  private _currentLayerId: string = '';

  setProfileData(profileData: IProfileData) {
    this.profileData = profileData;
    this._currentLayerId = profileData.layers[0].layerId;
  }

  get currentLayerId() {
    return this._currentLayerId;
  }

  setCurrentLayerId(layerId: string) {
    this._currentLayerId = layerId;
  }

  get displayArea() {
    return this.profileData.keyboardShape.displayArea;
  }

  get bodyPathMarkupText() {
    return this.profileData.keyboardShape.bodyPathMarkupText;
  }

  get layers() {
    return this.profileData.layers.map((la) => ({
      layerId: la.layerId,
      layerName: la.layerName
    }));
  }

  get keyUnits() {
    return this.profileData.keyboardShape.keyUnits.map(createKeyUnitViewModel);
  }
}
