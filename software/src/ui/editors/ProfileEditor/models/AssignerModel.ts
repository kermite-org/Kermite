import produce from 'immer';
import {
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
import { uiReaders, uiState } from '~/ui/store';
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

type IState = {
  loadedProfileData: IProfileData;
  profileData: IProfileData;
  currentLayerId: string;
  currentKeyUnitId: string;
  dualModeEditTargetOperationSig: IDualModeEditTargetOperationSig;
};

const defaultState: IState = {
  loadedProfileData: fallbackProfileData,
  profileData: fallbackProfileData,
  currentLayerId: '',
  currentKeyUnitId: '',
  dualModeEditTargetOperationSig: 'pri',
};

const state: IState = { ...defaultState };

const readers = {
  get loadedProfileData(): IProfileData {
    return state.loadedProfileData;
  },
  get profileData(): IProfileData {
    return state.profileData;
  },
  get currentLayerId(): string {
    return state.currentLayerId;
  },
  get currentKeyUnitId(): string {
    return state.currentKeyUnitId;
  },
  get slotAddress(): string {
    const { currentLayerId, currentKeyUnitId } = state;
    return `${currentLayerId}.${currentKeyUnitId}`;
  },
  get dualModeEditTargetOperationSig(): IDualModeEditTargetOperationSig {
    return state.dualModeEditTargetOperationSig;
  },
  get isUserProfileEditorView(): boolean {
    return (
      uiReaders.pagePath === '/assigner' ||
      uiReaders.pagePath === '/projectQuickSetup/step4'
    );
  },

  get profileAssignType(): IProfileAssignType {
    return state.profileData.settings.assignType;
  },

  get isSingleMode(): boolean {
    return readers.profileAssignType === 'single';
  },

  get isDualMode(): boolean {
    return readers.profileAssignType === 'dual';
  },

  get isSlotSelected(): boolean {
    const { currentLayerId, currentKeyUnitId } = state;
    return !!(currentLayerId && currentKeyUnitId);
  },

  get assignEntry(): IAssignEntry | undefined {
    return state.profileData.assigns[readers.slotAddress];
  },

  get layers(): ILayer[] {
    return state.profileData.layers;
  },

  get displayDesign(): IDisplayKeyboardDesign {
    return getDisplayKeyboardDesignSingleCached(
      state.profileData.keyboardDesign,
    );
  },
  get currentLayer(): ILayer | undefined {
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

  isLayerCurrent(layerId: string): boolean {
    return state.currentLayerId === layerId;
  },

  isKeyUnitCurrent(keyUnitId: string): boolean {
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

  getLayerById(layerId: string): ILayer | undefined {
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
    stateBackingStore = { ...state };
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
    if (
      uiState.core.profileEditSource.type === 'InternalProfile' &&
      state.loadedProfileData === fallbackProfileData
    ) {
      actions.loadProfileData(uiState.core.loadedProfileData);
    }
    if (state.profileData.keyboardDesign !== design) {
      actions.patchEditProfileData(
        (profile) => (profile.keyboardDesign = design),
      );
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

export const assignerModel = mergeModuleObjects(readers, actions);
