import {
  IProfileEditSource,
  IProfileEntry,
  parseProfileEntry,
  sortOrderBy,
  stringifyProfileEntry,
} from '~/shared';
import { ISelectorOption, ISelectorSource, texts } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import {
  profilesActions,
  profilesReader,
} from '~/ui/pages/assigner-page/models';
import { projectPackagesReader, uiReaders } from '~/ui/store';
import { getFileNameFromPath } from '~/ui/utils';

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
const selectorValueExternalProfile = '__PROFILE_EXTERNALLY_LOADED__';

const selectorOptionNewlyCreated: ISelectorOption = {
  label: '(untitled)',
  value: selectorValueNewlyCreated,
};

function createSelectorOptionExternalProfile(
  filePath: string,
): ISelectorOption {
  return {
    label: `(file)${getFileNameFromPath(filePath)}`,
    value: selectorValueExternalProfile,
  };
}

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
  } else if (profileEditSource.type === 'ExternalFile') {
    return {
      options: [
        createSelectorOptionExternalProfile(profileEditSource.filePath),
        ...optionsBase,
      ],
      value: selectorValueExternalProfile,
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
  if (editorModel.checkDirty()) {
    const ok = await modalConfirm({
      caption: texts.label_assigner_confirmModal_loadProfile_modalTitle,
      message: texts.label_assigner_confirmModal_loadProfile_modalMessage,
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
