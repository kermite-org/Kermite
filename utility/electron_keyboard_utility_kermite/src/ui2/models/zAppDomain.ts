import { IProfileManagerStatus } from '~defs/ipc';
import { ProfileProvider2 } from './dataSource/ProfileProvider2';
import { editorModel } from './EditorModel';
import { logicSimulatorModel } from './LogicSimulatorModel';
import { testProfileData } from '~defs/testProfileData';

export const appDomain = new (class {
  private profileProvider = new ProfileProvider2();

  initialize() {
    logicSimulatorModel.initialize();
    // editorModel.loadProfileData(testProfileData);
    this.profileProvider.setListener(editorModel.loadProfileData);
    this.profileProvider.initialize();
  }

  terminate() {
    logicSimulatorModel.finalize();
    this.profileProvider.saveProfileOnClosing(editorModel.profileData);
    this.profileProvider.finalize();
  }
})();
