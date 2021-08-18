import { IProfileEditSource } from '~/shared';
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

function makeProfileNameSelectorOption(profileName: string): ISelectorOption {
  const omitFolder = !!uiStateReader.globalSettings.globalProjectId;
  return {
    value: profileName,
    label: omitFolder ? profileName.replace(/^.*\//, '') : profileName,
  };
}

function makeProfileSelectionSource(
  allProfileNames: string[],
  editSource: IProfileEditSource,
  loadProfile: (profileName: string) => void,
): ISelectorSource {
  if (editSource.type === 'NoEditProfileAvailable') {
    return {
      options: allProfileNames.map(makeProfileNameSelectorOption),
      value: '',
      setValue: loadProfile,
    };
  } else if (editSource.type === 'ProfileNewlyCreated') {
    return {
      options: [
        { label: '(untitled)', value: '__NEWLY_CREATED_PROFILE__' },
        ...allProfileNames.map(makeProfileNameSelectorOption),
      ],
      value: '__NEWLY_CREATED_PROFILE__',
      setValue: loadProfile,
    };
  } else if (editSource.type === 'ExternalFile') {
    return {
      options: [
        {
          label: `(file)${getFileNameFromPath(editSource.filePath)}`,
          value: '__EXTERNALLY_LOADED_PROFILE__',
        },
        ...allProfileNames.map(makeProfileNameSelectorOption),
      ],
      value: '__EXTERNALLY_LOADED_PROFILE__',
      setValue: loadProfile,
    };
  } else {
    return {
      options: allProfileNames.map(makeProfileNameSelectorOption),
      value: editSource.profileName,
      setValue: loadProfile,
    };
  }
}

const loadProfile = async (profileName: string) => {
  if (editorModel.checkDirty(false)) {
    const ok = await modalConfirm({
      caption: texts.label_assigner_confirmModal_loadProfile_modalTitle,
      message: texts.label_assigner_confirmModal_loadProfile_modalMessage,
    });
    if (!ok) {
      return;
    }
  }
  profilesActions.loadProfile(profileName);
};

export function useProfileSelectorModel(): IProfileSelectorModel {
  const { editSource, allProfileEntries } = profilesReader;
  const allProfileNames = allProfileEntries.map((it) => it.profileName);
  return {
    profileSelectorSource: makeProfileSelectionSource(
      allProfileNames,
      editSource,
      loadProfile,
    ),
  };
}
