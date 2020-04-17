import { testProfileData } from '../defs/testProfileData';
import { editorModel } from './EditorModel';
import { logicSimulatorModel } from './LogicSimulatorModel';
import { IProfileProvider, ProfileProvider_LocalStorage } from './dataSource';

export const appDomain = new (class {
  private profileProvider: IProfileProvider;

  constructor() {
    this.profileProvider = new ProfileProvider_LocalStorage();
  }

  initialize() {
    editorModel.loadProfileData(testProfileData);
    const profile = this.profileProvider.loadProfile();
    profile && editorModel.loadProfileData(profile);
    logicSimulatorModel.initialize();
  }

  terminate() {
    logicSimulatorModel.finalize();
    this.profileProvider.saveProfile(editorModel.profileData);
  }
})();
