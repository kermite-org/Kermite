import {
  IProfileEditSource,
  IProfileEntry,
  parseProfileEntry,
  stringifyProfileEntry,
} from '~/shared';
import { ISelectorOption, ISelectorSource, texts } from '~/ui/base';
import { uiStateReader } from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { getFileNameFromPath } from '~/ui/helpers';
import {
  editorModel,
  profilesActions,
  profilesReader,
} from '~/ui/pages/editor-page/models';

export type IProfileSelectorModel = {
  profileSelectorSource: ISelectorSource;
};

function makeProfileNameSelectorOption(
  profileEntry: IProfileEntry,
): ISelectorOption {
  const omitFolder = !!uiStateReader.globalSettings.globalProjectId;
  const { projectId, profileName } = profileEntry;
  return {
    value: stringifyProfileEntry(profileEntry),
    label: omitFolder ? profileName : `${projectId}/${profileName}`,
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
  const optionsBase = visibleProfileEntries.map(makeProfileNameSelectorOption);

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
