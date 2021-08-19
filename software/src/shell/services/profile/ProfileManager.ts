import {
  fallbackProfileData,
  ICoreState,
  IProfileData,
  IProfileEditSource,
  IProfileEntry,
} from '~/shared';
import {
  vObject,
  vSchemaOneOf,
  vString,
  vValueEquals,
} from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import {
  commitCoreState,
  coreState,
  coreStateManager,
  profilesReader,
} from '~/shell/global';
import { profileManagerCore } from '~/shell/services/profile/ProfileManagerCore';

function createInternalProfileEditSourceOrFallback(
  profileEntry?: IProfileEntry,
): IProfileEditSource {
  if (profileEntry) {
    return {
      type: 'InternalProfile',
      profileEntry,
    };
  } else {
    return {
      type: 'NoEditProfileAvailable',
    };
  }
}

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
  if (profilesReader.visibleProfileEntries.length === 0) {
    return { type: 'NoEditProfileAvailable' };
  }
  return applicationStorage.readItemSafe<IProfileEditSource>(
    'profileEditSource',
    profileEditSourceLoadingDataSchema,
    { type: 'ProfileNewlyCreated' },
  );
}

function saveEditSource(profileEditSource: IProfileEditSource) {
  if (
    profileEditSource.type !== 'ProfileNewlyCreated' &&
    profileEditSource.type !== 'NoEditProfileAvailable'
  ) {
    applicationStorage.writeItem('profileEditSource', profileEditSource);
  }
}

function fixEditSource(editSource: IProfileEditSource): IProfileEditSource {
  const { globalProjectId } = coreState.globalSettings;
  const { visibleProfileEntries } = profilesReader;
  if (globalProjectId) {
    if (
      editSource.type === 'InternalProfile' &&
      editSource.profileEntry.projectId !== globalProjectId
    ) {
      return createInternalProfileEditSourceOrFallback(
        visibleProfileEntries[0],
      );
    }
  }
  if (editSource.type === 'NoEditProfileAvailable') {
    return createInternalProfileEditSourceOrFallback(visibleProfileEntries[0]);
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
  } else if (editSource.type === 'ExternalFile') {
    return await profileManagerCore.loadExternalProfileFile(
      editSource.filePath,
    );
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

function onCoreStateChange(partialState: Partial<ICoreState>) {
  if (partialState.globalSettings) {
    const {
      globalSettings: { globalProjectId },
    } = partialState;
    if (globalProjectId !== _globalProjectId) {
      patchStatusOnGlobalProjectIdChange();
      _globalProjectId = globalProjectId;
    }
  }
  if (partialState.profileEditSource) {
    const { profileEditSource } = partialState;
    saveEditSource(profileEditSource);
  }
}

let _globalProjectId: string = '';

async function initializeAsync() {
  _globalProjectId = coreState.globalSettings.globalProjectId;
  await profileManagerCore.ensureProfilesDirectoryExists();
  const allProfileEntries = await profileManagerCore.listAllProfileEntries();
  const loadedEditSource = loadInitialEditSource();
  const editSource = fixEditSource(loadedEditSource);
  const profile = await loadProfileByEditSource(editSource);
  commitCoreState({
    allProfileEntries,
    profileEditSource: editSource,
    loadedProfileData: profile,
  });
  coreStateManager.coreStateEventPort.subscribe(onCoreStateChange);
}

function terminate() {
  coreStateManager.coreStateEventPort.unsubscribe(onCoreStateChange);
}

export const profileManager = {
  initializeAsync,
  terminate,
};
