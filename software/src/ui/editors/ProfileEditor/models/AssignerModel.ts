import {
  compareObjectByJsonStringify,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  getDisplayKeyboardDesignSingleCached,
  IAssignEntry,
  IAssignEntryWithLayerFallback,
  IAssignOperation,
  IPersistKeyboardDesign,
  IProfileAssignType,
  IProfileData,
} from '~/shared';
import { uiReaders } from '~/ui/store';
import {
  changeProfileDataAssignType,
  removeInvalidProfileAssigns,
} from './ProfileDataHelper';

export type IDualModeEditTargetOperationSig = 'pri' | 'sec' | 'ter';
export type IDualModeOperationPath = 'primaryOp' | 'secondaryOp' | 'tertiaryOp';

const dualModeEditTargetOperationSigToOperationPathMap: {
  [key in IDualModeEditTargetOperationSig]: IDualModeOperationPath;
} = {
  pri: 'primaryOp',
  sec: 'secondaryOp',
  ter: 'tertiaryOp',
};

export class AssignerModel {
  // state

  loadedProfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;
  currentLayerId: string = '';
  currentKeyUnitId: string = '';
  slotAddress: string = '';
  dualModeEditTargetOperationSig: IDualModeEditTargetOperationSig = 'pri';

  private preModifiedDesign?: IPersistKeyboardDesign;

  // getters

  get isUserProfileEditorView() {
    return uiReaders.pagePath === '/assigner';
  }

  private get profileAssignType(): IProfileAssignType {
    return this.profileData.settings.assignType;
  }

  get isSingleMode() {
    return this.profileAssignType === 'single';
  }

  get isDualMode() {
    return this.profileAssignType === 'dual';
  }

  get isSlotSelected() {
    const { currentLayerId, currentKeyUnitId } = this;
    return !!(currentLayerId && currentKeyUnitId);
  }

  get assignEntry() {
    return this.profileData.assigns[this.slotAddress];
  }

  get layers() {
    return this.profileData.layers;
  }

  get displayDesign() {
    return getDisplayKeyboardDesignSingleCached(
      this.profileData.keyboardDesign,
    );
  }

  get currentLayer() {
    return this.profileData.layers.find(
      (la) => la.layerId === this.currentLayerId,
    );
  }

  isLayerCurrent = (layerId: string) => {
    return this.currentLayerId === layerId;
  };

  isKeyUnitCurrent = (keyUnitId: string) => {
    return this.currentKeyUnitId === keyUnitId;
  };

  getAssignForKeyUnit = (
    keyUnitId: string,
    targetLayerId?: string,
  ): IAssignEntry | undefined => {
    const layerId = targetLayerId || this.currentLayerId;
    return this.profileData.assigns[`${layerId}.${keyUnitId}`];
  };

  getAssignForKeyUnitWithLayerFallback = (
    keyUnitId: string,
    targetLayerId?: string,
  ): IAssignEntryWithLayerFallback | undefined => {
    const layerId = targetLayerId || this.currentLayerId;
    const assign = this.profileData.assigns[`${layerId}.${keyUnitId}`];
    if (!assign) {
      const defaultScheme = this.currentLayer?.defaultScheme;
      if (defaultScheme === 'transparent') {
        return { type: 'layerFallbackTransparent' };
      }
      if (defaultScheme === 'block') {
        return { type: 'layerFallbackBlock' };
      }
    }
    return assign;
  };

  private get dualModeOperationPath(): IDualModeOperationPath {
    const sig = this.dualModeEditTargetOperationSig;
    return dualModeEditTargetOperationSigToOperationPathMap[sig];
  }

  get editOperation(): IAssignOperation | undefined {
    const assign = this.assignEntry;
    if (assign?.type === 'single') {
      return assign.op;
    }
    if (assign?.type === 'dual') {
      return assign[this.dualModeOperationPath];
    }
    return undefined;
  }

  getLayerById(layerId: string) {
    return this.layers.find((la) => la.layerId === layerId);
  }

  checkDirtyWithCleanupSideEffect(): boolean {
    removeInvalidProfileAssigns(this.profileData);
    return !compareObjectByJsonStringify(
      this.loadedProfileData,
      this.profileData,
    );
  }

  checkDirty(): boolean {
    return !compareObjectByJsonStringify(
      this.loadedProfileData,
      this.profileData,
    );
  }

  // mutations

  loadProfileData = (profileData: IProfileData) => {
    this.loadedProfileData = profileData;
    this.profileData = duplicateObjectByJsonStringifyParse(profileData);
    this.currentLayerId = profileData.layers[0].layerId;

    if (this.preModifiedDesign) {
      this.profileData.keyboardDesign = this.preModifiedDesign;
      this.preModifiedDesign = undefined;
    }
  };

  private updateEditAssignSlot = () => {
    const { currentLayerId, currentKeyUnitId } = this;
    this.slotAddress = `${currentLayerId}.${currentKeyUnitId}`;
  };

  setCurrentLayerId = (layerId: string) => {
    this.currentLayerId = layerId;
    this.updateEditAssignSlot();
  };

  setCurrentKeyUnitId = (keyUnitId: string) => {
    this.currentKeyUnitId = keyUnitId;
    this.dualModeEditTargetOperationSig = 'pri';
    this.updateEditAssignSlot();
  };

  setDualModeEditTargetOperationSig = (
    sig: IDualModeEditTargetOperationSig,
  ) => {
    this.dualModeEditTargetOperationSig = sig;
    const assign = this.assignEntry;
    if (assign?.type === 'block' || assign?.type === 'transparent') {
      this.writeAssignEntry(undefined);
    }
  };

  clearAssignSlotSelection = () => {
    this.setCurrentKeyUnitId('');
  };

  writeAssignEntry = (assign: IAssignEntry | undefined) => {
    this.profileData.assigns[this.slotAddress] = assign;
  };

  writeEditOperation = (op: IAssignOperation | undefined) => {
    const assign = this.assignEntry;
    if (this.profileAssignType === 'single') {
      if (assign?.type === 'single') {
        assign.op = op;
      } else {
        this.writeAssignEntry({ type: 'single', op });
      }
    }
    if (this.profileAssignType === 'dual') {
      if (assign?.type === 'dual') {
        assign[this.dualModeOperationPath] = op;
      } else {
        this.writeAssignEntry({
          type: 'dual',
          [this.dualModeOperationPath]: op,
        });
      }
    }
  };

  changeProfileAssignType = (dstAssignType: IProfileAssignType) => {
    this.profileData = changeProfileDataAssignType(
      this.profileData,
      dstAssignType,
    );
  };

  changeProjectId = (projectId: string) => {
    this.profileData.projectId = projectId;
  };

  translateKeyIndexToKeyUnitId(keyIndex: number): string | undefined {
    const keyEntity = this.displayDesign.keyEntities.find(
      (kp) => kp.keyIndex === keyIndex,
    );
    return keyEntity?.keyId;
  }

  replaceKeyboardDesign(design: IPersistKeyboardDesign) {
    if (this.profileData !== fallbackProfileData) {
      this.profileData.keyboardDesign = design;
    } else {
      this.preModifiedDesign = design;
    }
  }

  restoreOriginalDesign() {
    this.profileData.keyboardDesign = duplicateObjectByJsonStringifyParse(
      this.loadedProfileData.keyboardDesign,
    );
  }
}

export const assignerModel = new AssignerModel();
