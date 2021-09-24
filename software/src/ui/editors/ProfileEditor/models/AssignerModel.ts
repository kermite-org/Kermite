import produce from 'immer';
import {
  cloneObject,
  compareObjectByJsonStringify,
  copyObjectProps,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  getDisplayKeyboardDesignSingleCached,
  IAssignEntry,
  IAssignEntryWithLayerFallback,
  IAssignOperation,
  IDisplayKeyboardDesign,
  ILayer,
  IPersistKeyboardDesign,
  IProfileAssignType,
  IProfileData,
  IProfileSettings,
  IProfileSettings_Dual,
  mergeModuleObjects,
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
interface IAssignerModel {
  // readers
  loadedProfileData: IProfileData;
  profileData: IProfileData;
  currentLayerId: string;
  currentKeyUnitId: string;
  slotAddress: string;
  dualModeEditTargetOperationSig: IDualModeEditTargetOperationSig;

  isUserProfileEditorView: boolean;
  isSingleMode: boolean;
  isDualMode: boolean;
  isSlotSelected: boolean;
  assignEntry: IAssignEntry | undefined;
  layers: ILayer[];
  displayDesign: IDisplayKeyboardDesign;
  currentLayer: ILayer | undefined;
  editOperation: IAssignOperation | undefined;

  // preModifiedDesign: IPersistKeyboardDesign | undefined;
  // profileAssignType: IProfileAssignType;
  // dualModeOperationPath: IDualModeOperationPath;

  isLayerCurrent: (layerId: string) => boolean;
  isKeyUnitCurrent: (keyUnitId: string) => boolean;
  getAssignForKeyUnit: (
    keyUnitId: string,
    targetLayerId?: string,
  ) => IAssignEntry | undefined;
  getAssignForKeyUnitWithLayerFallback: (
    keyUnitId: string,
    targetLayerId?: string,
  ) => IAssignEntryWithLayerFallback | undefined;
  getLayerById: (layerId: string) => ILayer | undefined;
  checkDirtyWithCleanupSideEffect: () => boolean;
  checkDirty: () => boolean;

  // actions
  patchEditProfileData: (recipe: (draft: IProfileData) => void) => void;
  loadProfileData: (profileData: IProfileData) => void;
  setCurrentLayerId: (layerId: string) => void;
  setCurrentKeyUnitId: (keyUnitId: string) => void;
  setDualModeEditTargetOperationSig: (
    sig: IDualModeEditTargetOperationSig,
  ) => void;
  clearAssignSlotSelection: () => void;
  writeAssignEntry: (assign: IAssignEntry | undefined) => void;
  writeEditOperation: (op: IAssignOperation | undefined) => void;
  changeProfileAssignType: (dstAssignType: IProfileAssignType) => void;
  changeProjectId: (projectId: string) => void;
  translateKeyIndexToKeyUnitId: (keyIndex: number) => string | undefined;
  replaceKeyboardDesign: (design: IPersistKeyboardDesign) => void;
  restoreOriginalDesign: () => void;
  writeSettingsValue<K extends keyof IProfileSettings>(
    key: K,
    value: IProfileSettings[K],
  ): void;
  writeSettingsValueDual<K extends keyof IProfileSettings_Dual>(
    key: K,
    value: IProfileSettings_Dual[K],
  ): void;
  preserveEditData(): void;
  restoreEditData(): void;
}

type IState = {
  loadedProfileData: IProfileData;
  profileData: IProfileData;
  currentLayerId: string;
  currentKeyUnitId: string;
  dualModeEditTargetOperationSig: IDualModeEditTargetOperationSig;
  preModifiedDesign: IPersistKeyboardDesign | 'none';
};

const defaultState: IState = {
  loadedProfileData: fallbackProfileData,
  profileData: fallbackProfileData,
  currentLayerId: '',
  currentKeyUnitId: '',
  dualModeEditTargetOperationSig: 'pri',
  preModifiedDesign: 'none',
};

const state: IState = cloneObject(defaultState);

const readers = {
  get loadedProfileData() {
    return state.loadedProfileData;
  },
  get profileData() {
    return state.profileData;
  },
  get currentLayerId() {
    return state.currentLayerId;
  },
  get currentKeyUnitId() {
    return state.currentKeyUnitId;
  },
  get slotAddress() {
    const { currentLayerId, currentKeyUnitId } = state;
    return `${currentLayerId}.${currentKeyUnitId}`;
  },
  get dualModeEditTargetOperationSig() {
    return state.dualModeEditTargetOperationSig;
  },
  get preModifiedDesign() {
    return state.preModifiedDesign;
  },

  get isUserProfileEditorView() {
    return uiReaders.pagePath === '/assigner';
  },

  get profileAssignType(): IProfileAssignType {
    return state.profileData.settings.assignType;
  },

  get isSingleMode() {
    return readers.profileAssignType === 'single';
  },

  get isDualMode() {
    return readers.profileAssignType === 'dual';
  },

  get isSlotSelected() {
    const { currentLayerId, currentKeyUnitId } = state;
    return !!(currentLayerId && currentKeyUnitId);
  },

  get assignEntry() {
    return state.profileData.assigns[readers.slotAddress];
  },

  get layers() {
    return state.profileData.layers;
  },

  get displayDesign() {
    return getDisplayKeyboardDesignSingleCached(
      state.profileData.keyboardDesign,
    );
  },
  get currentLayer() {
    return state.profileData.layers.find(
      (la) => la.layerId === state.currentLayerId,
    );
  },
  get editOperation(): IAssignOperation | undefined {
    const assign = readers.assignEntry;
    if (assign?.type === 'single') {
      return assign.op;
    }
    if (assign?.type === 'dual') {
      return assign[readers.dualModeOperationPath];
    }
    return undefined;
  },

  isLayerCurrent(layerId: string) {
    return state.currentLayerId === layerId;
  },

  isKeyUnitCurrent(keyUnitId: string) {
    return state.currentKeyUnitId === keyUnitId;
  },

  getAssignForKeyUnit(
    keyUnitId: string,
    targetLayerId?: string,
  ): IAssignEntry | undefined {
    const layerId = targetLayerId || state.currentLayerId;
    return state.profileData.assigns[`${layerId}.${keyUnitId}`];
  },

  getAssignForKeyUnitWithLayerFallback(
    keyUnitId: string,
    targetLayerId?: string,
  ): IAssignEntryWithLayerFallback | undefined {
    const layerId = targetLayerId || state.currentLayerId;
    const assign = state.profileData.assigns[`${layerId}.${keyUnitId}`];
    if (!assign) {
      const defaultScheme = readers.currentLayer?.defaultScheme;
      if (defaultScheme === 'transparent') {
        return { type: 'layerFallbackTransparent' };
      }
      if (defaultScheme === 'block') {
        return { type: 'layerFallbackBlock' };
      }
    }
    return assign;
  },

  get dualModeOperationPath(): IDualModeOperationPath {
    const sig = state.dualModeEditTargetOperationSig;
    return dualModeEditTargetOperationSigToOperationPathMap[sig];
  },

  getLayerById(layerId: string) {
    return readers.layers.find((la) => la.layerId === layerId);
  },

  checkDirtyWithCleanupSideEffect(): boolean {
    removeInvalidProfileAssigns(state.profileData);
    return !compareObjectByJsonStringify(
      state.loadedProfileData,
      state.profileData,
    );
  },

  checkDirty(): boolean {
    return !compareObjectByJsonStringify(
      state.loadedProfileData,
      state.profileData,
    );
  },

  translateKeyIndexToKeyUnitId(keyIndex: number): string | undefined {
    const keyEntity = readers.displayDesign.keyEntities.find(
      (kp) => kp.keyIndex === keyIndex,
    );
    return keyEntity?.keyId;
  },
};

let stateBackingStore: IState | undefined;

const actions = {
  patchEditProfileData(recipe: (draft: IProfileData) => void) {
    state.profileData = produce(state.profileData, (draft) => {
      recipe(draft);
    });
  },
  preserveEditData() {
    stateBackingStore = cloneObject(state);
    copyObjectProps(state, defaultState);
  },
  restoreEditData() {
    if (stateBackingStore) {
      copyObjectProps(state, stateBackingStore);
      stateBackingStore = undefined;
    }
  },
  loadProfileData(profileData: IProfileData) {
    state.loadedProfileData = profileData;
    state.profileData = duplicateObjectByJsonStringifyParse(profileData);
    state.currentLayerId = profileData.layers[0].layerId;

    if (state.preModifiedDesign !== 'none') {
      state.profileData.keyboardDesign = state.preModifiedDesign;
      state.preModifiedDesign = 'none';
    }
  },
  setCurrentLayerId(layerId: string) {
    state.currentLayerId = layerId;
  },

  setCurrentKeyUnitId(keyUnitId: string) {
    state.currentKeyUnitId = keyUnitId;
    state.dualModeEditTargetOperationSig = 'pri';
  },

  setDualModeEditTargetOperationSig(sig: IDualModeEditTargetOperationSig) {
    state.dualModeEditTargetOperationSig = sig;
    const assign = readers.assignEntry;
    if (assign?.type === 'block' || assign?.type === 'transparent') {
      actions.writeAssignEntry(undefined);
    }
  },

  clearAssignSlotSelection() {
    actions.setCurrentKeyUnitId('');
  },

  writeAssignEntry(assign: IAssignEntry | undefined) {
    actions.patchEditProfileData(
      (profileData) => (profileData.assigns[readers.slotAddress] = assign),
    );
  },

  writeEditOperation(op: IAssignOperation | undefined) {
    const assign = readers.assignEntry;
    if (readers.profileAssignType === 'single') {
      if (assign?.type === 'single') {
        actions.writeAssignEntry({ ...assign, op });
      } else {
        actions.writeAssignEntry({ type: 'single', op });
      }
    }
    if (readers.profileAssignType === 'dual') {
      if (assign?.type === 'dual') {
        actions.writeAssignEntry({
          ...assign,
          [readers.dualModeOperationPath]: op,
        });
      } else {
        actions.writeAssignEntry({
          type: 'dual',
          [readers.dualModeOperationPath]: op,
        });
      }
    }
  },

  changeProfileAssignType(dstAssignType: IProfileAssignType) {
    state.profileData = changeProfileDataAssignType(
      state.profileData,
      dstAssignType,
    );
  },

  changeProjectId(projectId: string) {
    actions.patchEditProfileData((profile) => (profile.projectId = projectId));
  },

  replaceKeyboardDesign(design: IPersistKeyboardDesign) {
    if (state.profileData !== fallbackProfileData) {
      if (state.profileData.keyboardDesign !== design) {
        actions.patchEditProfileData(
          (profile) => (profile.keyboardDesign = design),
        );
      }
    } else {
      state.preModifiedDesign = design;
    }
  },

  restoreOriginalDesign() {
    actions.patchEditProfileData(
      (profile) =>
        (profile.keyboardDesign = duplicateObjectByJsonStringifyParse(
          state.loadedProfileData.keyboardDesign,
        )),
    );
  },
  writeSettingsValue<K extends keyof IProfileSettings>(
    key: K,
    value: IProfileSettings[K],
  ) {
    actions.patchEditProfileData((profile) => (profile.settings[key] = value));
  },
  writeSettingsValueDual<K extends keyof IProfileSettings_Dual>(
    key: K,
    value: IProfileSettings_Dual[K],
  ) {
    actions.patchEditProfileData((profile) => {
      if (profile.settings.assignType === 'dual') {
        profile.settings[key] = value;
      }
    });
  },
};

export const assignerModel: IAssignerModel = mergeModuleObjects(
  readers,
  actions,
);
