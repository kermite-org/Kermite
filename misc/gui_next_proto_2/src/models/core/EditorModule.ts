import {
  fallbackProfileData,
  IProfileData,
  ISingleAssignEntry,
} from '~/defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '~funcs/utils';
import { AssignEditSingle2Module } from './AssignEditSingle2Module';
import { AssignEditModule } from './AssignEditModule';

export class EditorModule {
  //modules

  assignEditModule = new AssignEditModule(this);
  assignEditSingle2Module = new AssignEditSingle2Module();

  //state

  loadedPorfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;
  currentLayerId: string = '';
  currentKeyUnitId: string = '';
  slotAddress: string = '';

  //getters

  get isSlotSelected() {
    const { currentLayerId, currentKeyUnitId } = this;
    return currentLayerId && currentKeyUnitId;
  }

  get assignEntry() {
    return this.profileData.assigns[this.slotAddress];
  }

  get layers() {
    return this.profileData.layers;
  }

  get keyPositions() {
    return this.profileData.keyboardShape.keyPositions;
  }

  get bodyPathMarkupText() {
    return this.profileData.keyboardShape.bodyPathMarkupText;
  }

  isLayerCurrent = (layerId: string) => {
    return this.currentLayerId === layerId;
  };

  isKeyUnitCurrent = (keyUnitId: string) => {
    return this.currentKeyUnitId === keyUnitId;
  };

  getAssignForKeyUnit = (keyUnitId: string) => {
    const curLayerId = this.currentLayerId;
    return this.profileData.assigns[`${curLayerId}.${keyUnitId}`];
  };

  get isAssignEntryEditAvailable() {
    return this.assignEntry?.type === 'single2';
  }

  //mutations

  loadProfileData = (profileData: IProfileData) => {
    this.loadedPorfileData = profileData;
    this.profileData = duplicateObjectByJsonStringifyParse(profileData);
    this.currentLayerId = profileData.layers[0].layerId;
  };

  private updateEditAssignSlot = () => {
    const { currentLayerId, currentKeyUnitId } = this;
    const slotAddress = `${currentLayerId}.${currentKeyUnitId}`;
    if (this.slotAddress !== slotAddress) {
      this.slotAddress = slotAddress;
      this.assignEditModule.handleAssignSlotChange();
    }
  };

  setCurrentLayerId = (layerId: string) => {
    this.currentLayerId = layerId;
    this.updateEditAssignSlot();
  };

  setCurrentKeyUnitId = (keyUnitId: string) => {
    this.currentKeyUnitId = keyUnitId;
    this.updateEditAssignSlot();
  };

  clearAssignSlotSelection = () => {
    this.setCurrentKeyUnitId('');
  };

  writeAssignEntry = (assign: ISingleAssignEntry) => {
    this.profileData.assigns[this.slotAddress] = assign;
  };
}
export const editorModule = new EditorModule();
