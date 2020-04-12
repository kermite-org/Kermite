import { testProfileData } from '../defs/testProfileData';
import { editorModel } from './EditorModel';

export const appDomain = new (class {
  initialize() {
    editorModel.loadProfileData(testProfileData);
  }

  terminate() {}
})();
