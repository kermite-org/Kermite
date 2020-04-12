import { fallbackProfileData, IProfileData } from '~/defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '~funcs/utils';
import { assignEditSingle2Module } from './AssignEditSingle2Module';
import { assignEditModule } from './AssignEditModule';

interface IEditorState {
  loadedPorfileData: IProfileData;
  profileData: IProfileData;
  currentLayerId: string;
  currentKeyUnitId: string;
  slotAddress: string;
}

export const editorState: IEditorState = {
  loadedPorfileData: fallbackProfileData,
  profileData: fallbackProfileData,
  currentLayerId: '',
  currentKeyUnitId: '',
  slotAddress: '',
};

export class EditorModule {
  //state

  loadedPorfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;
  currentLayerId: string = '';
  currentKeyUnitId: string = '';
  slotAddress: string = '';

  //getters

  get isSlotSelected() {
    const { currentLayerId, currentKeyUnitId } = editorState;
    return currentLayerId && currentKeyUnitId;
  }

  get assignEntry() {
    return editorState.profileData.assigns[editorState.slotAddress];
  }

  get layers() {
    return editorState.profileData.layers;
  }

  get keyPositions() {
    return editorState.profileData.keyboardShape.keyPositions;
  }

  get bodyPathMarkupText() {
    return editorState.profileData.keyboardShape.bodyPathMarkupText;
  }

  isLayerCurrent(layerId: string) {
    return editorState.currentLayerId === layerId;
  }

  isKeyUnitCurrent(keyUnitId: string) {
    return editorState.currentKeyUnitId === keyUnitId;
  }

  getAssignForKeyUnit(keyUnitId: string) {
    const curLayerId = editorState.currentLayerId;
    return editorState.profileData.assigns[`${curLayerId}.${keyUnitId}`];
  }

  get isAssignEntryEditAvailable() {
    return this.assignEntry?.type === 'single2';
  }

  //mutations

  loadProfileData = (profileData: IProfileData) => {
    editorState.loadedPorfileData = profileData;
    editorState.profileData = duplicateObjectByJsonStringifyParse(profileData);
    editorState.currentLayerId = profileData.layers[0].layerId;
  };

  private updateEditAssignSlot = () => {
    const { currentLayerId, currentKeyUnitId } = editorState;
    const slotAddress = `${currentLayerId}.${currentKeyUnitId}`;
    if (editorState.slotAddress !== slotAddress) {
      editorState.slotAddress = slotAddress;
      const assign = editorState.profileData.assigns[slotAddress];
      assignEditModule.loadAssignSlot(assign);
    }
  };

  setCurrentLayerId = (layerId: string) => {
    editorState.currentLayerId = layerId;
    this.updateEditAssignSlot();
  };

  setCurrentKeyUnitId = (keyUnitId: string) => {
    editorState.currentKeyUnitId = keyUnitId;
    this.updateEditAssignSlot();
  };

  clearAssignSlotSelection = () => {
    this.setCurrentKeyUnitId('');
  };
}
export const editorModule = new EditorModule();
