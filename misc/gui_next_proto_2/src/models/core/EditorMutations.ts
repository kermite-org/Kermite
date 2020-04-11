import { editorState } from './EditorState';
import { IProfileData } from '~defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '~funcs/utils';

export const editorMutations = new (class {
  loadProfileData(profileData: IProfileData) {
    editorState.loadedPorfileData = profileData;
    editorState.profileData = duplicateObjectByJsonStringifyParse(profileData);
    editorState.currentLayerId = profileData.layers[0].layerId;
  }

  setCurrentLayerId(layerId: string) {
    editorState.currentLayerId = layerId;
  }

  setCurrentKeyUnitId(keyUnitId: string) {
    editorState.currentKeyUnitId = keyUnitId;
  }
})();
