import { testProfileData } from '../../defs/testProfileData';
import { editorModule } from './EditorModule';

export const appDomain = new (class {
  initialize() {
    editorModule.loadProfileData(testProfileData);
  }

  terminate() {}
})();
