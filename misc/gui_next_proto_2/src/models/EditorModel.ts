import {
  fallbackProfileData,
  IProfileData,
  ILayer,
  ISingleAssignEntry,
  IKeyboardShape,
} from '~/defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '~/funcs/utils';

export class LayerModel {
  profile: ProfileModel;
  layerId: string;
  layerName: string;
  isShiftLayer?: boolean;

  constructor(layer: ILayer, profile: ProfileModel) {
    this.profile = profile;
    this.layerId = layer.layerId;
    this.layerName = layer.layerName;
    this.isShiftLayer = layer.isShiftLayer;
  }

  get isCustomLayer() {
    return this.layerId !== 'la0' || false;
  }

  get isCurrent() {
    return this.profile.currentLayerId === this.layerId;
  }

  private canShiftLayerOrder = (dir: -1 | 1): boolean => {
    const layers = this.profile.layers;
    if (this.isCustomLayer) {
      const index = layers.indexOf(this);
      const nextIndex = index + dir;
      return 2 <= nextIndex && nextIndex < layers.length;
    } else {
      return false;
    }
  };

  get canShiftBack() {
    return this.canShiftLayerOrder(-1);
  }

  get canShiftForward() {
    return this.canShiftLayerOrder(1);
  }

  get canModify() {
    return this.isCustomLayer;
  }

  setCurrent() {
    this.profile.currentLayerId = this.layerId;
  }

  shiftBack() {}

  shiftForward() {}

  rename(newName: string) {
    this.layerName = newName;
  }

  delete() {}

  toData(): ILayer {
    const { layerId, layerName, isShiftLayer } = this;
    return {
      layerId,
      layerName,
      isShiftLayer,
    };
  }
}

class ProfileModel {
  layers: LayerModel[];
  keyboardShape: IKeyboardShape;
  assigns: {
    [address: string]: ISingleAssignEntry | undefined;
  };

  currentLayerId: string;

  get currentLayer(): LayerModel {
    return this.layers.find((la) => la.layerId === this.currentLayerId)!;
  }

  constructor(profileData: IProfileData) {
    this.layers = profileData.layers.map((la) => new LayerModel(la, this));
    this.assigns = profileData.assigns;
    this.keyboardShape = profileData.keyboardShape;
    this.currentLayerId = this.layers[0].layerId;
  }

  toData(): IProfileData {
    return {
      revision: 'PRF02',
      keyboardShape: this.keyboardShape,
      assigns: this.assigns,
      layers: this.layers.map((la) => la.toData()),
    };
  }

  // static fromData(data: IProfileData) {}
}
export class EditorModel {
  loadedPorfileData: IProfileData = fallbackProfileData;
  // profileData: IProfileData = fallbackProfileData;
  profileModel: ProfileModel = new ProfileModel(fallbackProfileData);

  setProfileData(profileData: IProfileData) {
    this.loadedPorfileData = profileData;
    //this.profileData =
    const clonedProfileData = duplicateObjectByJsonStringifyParse(profileData);
    this.profileModel = new ProfileModel(clonedProfileData);
  }
}
