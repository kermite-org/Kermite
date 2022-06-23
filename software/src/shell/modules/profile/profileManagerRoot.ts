import {
  checkProfileEntryEquality,
  fallbackProfileData,
  ICoreState,
  IProfileData,
  IProfileEditSource,
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import {
  commitCoreState,
  coreState,
  coreStateManager,
  profilesReader,
} from '~/shell/modules/core';
import { profileManagerCore } from '~/shell/modules/profile/profileManagerCore';

const profileEditSourceLoadingDataSchema = vSchemaOneOf([
  vObject({
    type: vValueEquals('InternalProfile'),
    profileEntry: vObject({
      projectId: vString(),
      profileName: vString(),
    }),
  }),
  vObject({
    type: vValueEquals('ExternalFile'),
    filePath: vString(),
  }),
]);

function loadInitialEditSource(): IProfileEditSource {
  return applicationStorage.readItemSafe<IProfileEditSource>(
    'profileEditSource',
    profileEditSourceLoadingDataSchema,
    { type: 'NoEditProfileAvailable' },
  );
}

function saveEditSource(profileEditSource: IProfileEditSource) {
  applicationStorage.writeItem('profileEditSource', profileEditSource);
}

function createInternalProfileEditSourceOrFallback(): IProfileEditSource {
  const { visibleProfileEntries } = profilesReader;
  if (visibleProfileEntries.length > 0) {
    return { type: 'InternalProfile', profileEntry: visibleProfileEntries[0] };
  } else {
    return { type: 'NoEditProfileAvailable' };
  }
}

function fixEditSource(editSource: IProfileEditSource): IProfileEditSource {
  const { visibleProfileEntries } = profilesReader;
  if (editSource.type === 'InternalProfile') {
    const includedInList = visibleProfileEntries.some((it) =>
      checkProfileEntryEquality(it, editSource.profileEntry),
    );
    if (!includedInList) {
      return createInternalProfileEditSourceOrFallback();
    }
  }
  if (editSource.type === 'ProfileNewlyCreated') {
    const {
      loadedProfileData,
      globalSettings: { globalProjectSpec },
    } = coreState;
    if (
      globalProjectSpec &&
      loadedProfileData.projectId !== globalProjectSpec.projectId
    ) {
      return createInternalProfileEditSourceOrFallback();
    }
  }
  if (editSource.type === 'NoEditProfileAvailable') {
    return createInternalProfileEditSourceOrFallback();
  }
  return editSource;
}

function loadProfileByEditSource(editSource: IProfileEditSource): IProfileData {
  if (editSource.type === 'NoEditProfileAvailable') {
    return fallbackProfileData;
  } else if (editSource.type === 'ProfileNewlyCreated') {
    return fallbackProfileData;
  } else if (editSource.type === 'InternalProfile') {
    return profileManagerCore.loadProfile(editSource.profileEntry);
  }
  return fallbackProfileData;
}

function patchStatusOnGlobalProjectIdChange() {
  const currEditSource = coreState.profileEditSource;
  const modEditSource = fixEditSource(currEditSource);
  if (modEditSource !== currEditSource) {
    const profile = loadProfileByEditSource(modEditSource);
    commitCoreState({
      profileEditSource: modEditSource,
      loadedProfileData: profile,
    });
  }
}

const local: { globalProjectId: string | undefined } = {
  globalProjectId: undefined,
};

function onCoreStateChange(partialState: Partial<ICoreState>) {
  if (partialState.globalSettings) {
    const {
      globalSettings: { globalProjectSpec },
    } = partialState;
    if (globalProjectSpec?.projectId !== local.globalProjectId) {
      patchStatusOnGlobalProjectIdChange();
      local.globalProjectId = globalProjectSpec?.projectId;
    }
  }
  if (partialState.profileEditSource) {
    const { profileEditSource } = partialState;
    if (profileEditSource.type === 'InternalProfile') {
      saveEditSource(profileEditSource);
    }
  }
}

function initialize() {
  local.globalProjectId = coreState.globalSettings.globalProjectSpec?.projectId;
  profileManagerCore.ensureProfilesDirectoryExists();
  profileManagerCore.migrateOldProfileFolderNames();
  const allProfileEntries = profileManagerCore.listAllProfileEntries();
  commitCoreState({ allProfileEntries });
  const loadedEditSource = loadInitialEditSource();
  const editSource = fixEditSource(loadedEditSource);
  const profile = loadProfileByEditSource(editSource);
  commitCoreState({
    profileEditSource: editSource,
    loadedProfileData: profile,
  });
  coreStateManager.coreStateEventPort.subscribe(onCoreStateChange);
}

function terminate() {
  coreStateManager.coreStateEventPort.unsubscribe(onCoreStateChange);
}

export const profileManagerRoot = {
  initialize,
  terminate,
};
