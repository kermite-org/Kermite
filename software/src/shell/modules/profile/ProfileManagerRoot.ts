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
import { profileManagerCore } from '~/shell/modules/profile/ProfileManagerCore';

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

async function loadProfileByEditSource(
  editSource: IProfileEditSource,
): Promise<IProfileData> {
  if (editSource.type === 'NoEditProfileAvailable') {
    return fallbackProfileData;
  } else if (editSource.type === 'ProfileNewlyCreated') {
    return fallbackProfileData;
  } else if (editSource.type === 'InternalProfile') {
    return await profileManagerCore.loadProfile(editSource.profileEntry);
  }
  return fallbackProfileData;
}

async function patchStatusOnGlobalProjectIdChange() {
  const currEditSource = coreState.profileEditSource;
  const modEditSource = fixEditSource(currEditSource);
  if (modEditSource !== currEditSource) {
    const profile = await loadProfileByEditSource(modEditSource);
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

async function initializeAsync() {
  local.globalProjectId = coreState.globalSettings.globalProjectSpec?.projectId;
  await profileManagerCore.ensureProfilesDirectoryExists();
  const allProfileEntries = await profileManagerCore.listAllProfileEntries();
  commitCoreState({ allProfileEntries });
  const loadedEditSource = loadInitialEditSource();
  const editSource = fixEditSource(loadedEditSource);
  const profile = await loadProfileByEditSource(editSource);
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
  initializeAsync,
  terminate,
};
