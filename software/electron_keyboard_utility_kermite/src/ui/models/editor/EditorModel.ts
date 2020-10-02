import {
  fallbackProfileData,
  IProfileData,
  IAssignEntry,
  IAssignOperation,
  IProfileAssignType
} from '~/defs/ProfileData';
import {
  duplicateObjectByJsonStringifyParse,
  compareObjectByJsonStringify
} from '~funcs/Utils';
import {
  changeProfileDataAssignType,
  removeInvalidProfileAssigns
} from './ProfileDataHelper';

export type IDualModeEditTargetOperationSig = 'pri' | 'sec' | 'ter';
export type IDualModeOperationPath = 'primaryOp' | 'secondaryOp' | 'tertiaryOp';

const dualModeEditTargetOperationSigToOperationPathMap: {
  [key in IDualModeEditTargetOperationSig]: IDualModeOperationPath;
} = {
  pri: 'primaryOp',
  sec: 'secondaryOp',
  ter: 'tertiaryOp'
};

class EditorModel {
  // state

  loadedPorfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;
  currentLayerId: string = '';
  currentKeyUnitId: string = '';
  slotAddress: string = '';
  dualModeEditTargetOperationSig: IDualModeEditTargetOperationSig = 'pri';

  // getters

  private get profileAssignType(): IProfileAssignType {
    return this.profileData.assignType;
  }

  get isDualMode() {
    return this.profileAssignType === 'dual';
  }

  get isSlotSelected() {
    const { currentLayerId, currentKeyUnitId } = this;
    return !!(currentLayerId && currentKeyUnitId);
  }

  private get assignEntry() {
    return this.profileData.assigns[this.slotAddress];
  }

  get layers() {
    return this.profileData.layers;
  }

  get keyPositions() {
    return this.profileData.keyboardShape.keyUnits;
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

  getAssignForKeyUnit = (keyUnitId: string, targetLayerId?: string) => {
    const layerId = targetLayerId || this.currentLayerId;
    return this.profileData.assigns[`${layerId}.${keyUnitId}`];
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

  checkDirty(): boolean {
    removeInvalidProfileAssigns(this.profileData);
    return !compareObjectByJsonStringify(
      this.loadedPorfileData,
      this.profileData
    );
  }

  // mutations

  loadProfileData = (profileData: IProfileData) => {
    this.loadedPorfileData = profileData;
    this.profileData = duplicateObjectByJsonStringifyParse(profileData);
    this.currentLayerId = profileData.layers[0].layerId;
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
    this.updateEditAssignSlot();
  };

  setDualModeEditTargetOperationSig = (
    sig: IDualModeEditTargetOperationSig
  ) => {
    this.dualModeEditTargetOperationSig = sig;
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
          [this.dualModeOperationPath]: op
        });
      }
    }
  };

  changeProfileAssignType = (dstAssignType: IProfileAssignType) => {
    this.profileData = changeProfileDataAssignType(
      this.profileData,
      dstAssignType
    );
  };
}

export const editorModel = new EditorModel();
