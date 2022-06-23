import {
  IProfileEditSource,
  IProfileEntry,
  parseProfileEntry,
  sortOrderBy,
  stringifyProfileEntry,
} from '~/shared';
import { ISelectorOption, ISelectorSource, texts } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { assignerModel } from '~/ui/featureEditors';
import {
  profilesActions,
  profilesReader,
} from '~/ui/pages/AssignerPage/models';
import { projectPackagesReader, uiReaders } from '~/ui/store';

export type IProfileSelectorModel = {
  profileSelectorSource: ISelectorSource;
};

function getProfileLabel(profileEntry: IProfileEntry) {
  const { projectId, profileName } = profileEntry;
  const addProjectPrefix = !uiReaders.isGlobalProjectSelected;
  if (addProjectPrefix) {
    const projectInfo = projectPackagesReader.findProjectInfo(
      'local',
      projectId,
    );
    const keyboardName = projectInfo?.keyboardName || 'unknown';
    return `${keyboardName} -- ${profileName}`;
  } else {
    return profileName;
  }
}

function makeProfileNameSelectorOption(
  profileEntry: IProfileEntry,
): ISelectorOption {
  return {
    value: stringifyProfileEntry(profileEntry),
    label: getProfileLabel(profileEntry),
  };
}

const selectorValueNewlyCreated = '__PROFILE_NEWLY_CREATED__';

const selectorOptionNewlyCreated: ISelectorOption = {
  label: '(untitled)',
  value: selectorValueNewlyCreated,
};

function makeProfileSelectionSource(
  visibleProfileEntries: IProfileEntry[],
  profileEditSource: IProfileEditSource,
  loadProfile: (profileEntry: IProfileEntry) => void,
): ISelectorSource {
  const optionsBase = visibleProfileEntries
    .map(makeProfileNameSelectorOption)
    .sort(sortOrderBy((it) => `${it.label}`));

  const setValue = (text: string) => {
    const profileEntry = parseProfileEntry(text);
    loadProfile(profileEntry);
  };

  if (profileEditSource.type === 'ProfileNewlyCreated') {
    return {
      options: [selectorOptionNewlyCreated, ...optionsBase],
      value: selectorValueNewlyCreated,
      setValue,
    };
  } else if (profileEditSource.type === 'InternalProfile') {
    return {
      options: optionsBase,
      value: stringifyProfileEntry(profileEditSource.profileEntry),
      setValue,
    };
  }
  return {
    options: optionsBase,
    value: '',
    setValue,
  };
}

const loadProfile = async (profileEntry: IProfileEntry) => {
  if (assignerModel.checkDirty()) {
    const ok = await modalConfirm({
      caption: texts.assignerConfirmModal.loadProfile_modalTitle,
      message: texts.assignerConfirmModal.loadProfile_modalMessage,
    });
    if (!ok) {
      return;
    }
  }
  profilesActions.loadProfile(profileEntry);
};

export function useProfileSelectorModel(): IProfileSelectorModel {
  const { profileEditSource, visibleProfileEntries } = profilesReader;
  return {
    profileSelectorSource: makeProfileSelectionSource(
      visibleProfileEntries,
      profileEditSource,
      loadProfile,
    ),
  };
}
