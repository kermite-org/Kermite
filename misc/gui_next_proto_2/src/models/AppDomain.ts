import { testProfileData } from '../defs/testProfileData';
import { editorMutations } from './core/EditorMutations';

export const appDomain = new (class {
  initialize() {
    editorMutations.loadProfileData(testProfileData);
  }

  terminate() {}
})();
