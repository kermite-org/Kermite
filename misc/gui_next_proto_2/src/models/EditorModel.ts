import { fallbackProfileData, IProfileData } from '~/defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '~/funcs/utils';
import { LayerManagementModel } from './LayerManagementModel';
import { LayerListModel } from './LayerListModel';

export class EditorModel {
  loadedPorfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;

  readonly layerManagementModel: LayerManagementModel = new LayerManagementModel();

  get layerListModels() {
    //todo: layerIdでキャッシュする
    return this.profileData.layers.map((la) => new LayerListModel(la, this));
  }

  setProfileData(profileData: IProfileData) {
    this.loadedPorfileData = profileData;
    this.profileData = duplicateObjectByJsonStringifyParse(profileData);
    this.layerManagementModel.setProfileData(this.profileData);
  }
}
