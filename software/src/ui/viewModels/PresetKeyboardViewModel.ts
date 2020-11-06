import {
  fallbackProfileData,
  IKeyboardShapeDisplayArea,
  IProfileData
} from '~defs/ProfileData';
import {
  makePresetKeyUnitViewModels,
  IPresetKeyUnitViewModel
} from '~ui/viewModels/PresetKeyUnitViewModelCreator';

export interface IPresetKeyboardLayerViewModel {
  layerId: string;
  layerName: string;
}

export interface IPrsetLayerListViewModel {
  layers: IPresetKeyboardLayerViewModel[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
}

export interface IPresetKeyboardViewModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkupText: string;
  layerList: IPrsetLayerListViewModel;
  setProfileData(profileData: IProfileData): void;
}

export class PresetKeyboardViewModel implements IPresetKeyboardViewModel {
  private profileData: IProfileData = fallbackProfileData;
  private _currentLayerId: string = '';

  setProfileData(profileData: IProfileData) {
    this.profileData = profileData;
    this._currentLayerId = profileData.layers[0].layerId;
  }

  get layerList() {
    return {
      layers: this.profileData.layers.map((la) => ({
        layerId: la.layerId,
        layerName: la.layerName
      })),
      currentLayerId: this._currentLayerId,
      setCurrentLayerId: (layerId: string) => {
        this._currentLayerId = layerId;
      }
    };
  }

  get displayArea(): IKeyboardShapeDisplayArea {
    return this.profileData.keyboardShape.displayArea;
  }

  get bodyPathMarkupText(): string {
    return this.profileData.keyboardShape.bodyPathMarkupText;
  }

  get keyUnits(): IPresetKeyUnitViewModel[] {
    return makePresetKeyUnitViewModels(this.profileData, this._currentLayerId);
  }
}
