import { testProfileData } from '../defs/testProfileData';
import { editorModule } from './core/EditorModule';

export const appDomain = new (class {
  initialize() {
    editorModule.loadProfileData(testProfileData);
  }

  terminate() {}
})();
