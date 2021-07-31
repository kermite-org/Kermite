import { IPresetSpec, IProfileData, IProjectResourceInfo } from '~/shared';
import { createPresetKey } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getSelectionValueCorrected,
  ISelectorOption,
  ISelectorSource,
} from '~/ui/base';
import { useProjectResourceInfosBasedOnGlobalSettings } from '~/ui/commonModels';
import { fieldSetter, usePersistState } from '~/ui/helpers';
import { editSelectedProjectPreset as editSelectedProjectPresetOriginal } from '~/ui/pages/preset-browser-page/models/ProfileCreator';
import { useProfileDataLoaded } from '~/ui/pages/preset-browser-page/models/ProfileDataLoader';

export interface IPresetSelectionModel {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  currentProjectKey: string;
  currentPresetKey: string;
  selectProject(projectKey: string): void;
  loadedProfileData: IProfileData;
  editSelectedProjectPreset(): void;
}

function makeProjectOptions(infos: IProjectResourceInfo[]): ISelectorOption[] {
  return infos
    .filter((it) => it.presetNames.length > 0 || it.layoutNames.length > 0)
    .map((it) => ({
      value: it.sig,
      label: `${it.origin === 'local' ? '(local) ' : ''}${it.keyboardName} (${
        it.projectPath
      })`,
    }));
}

type IPresetSelectorOption = ISelectorOption & {
  spec: IPresetSpec;
};

function makePresetOptions(
  resouceInfos: IProjectResourceInfo[],
  projectSig: string,
): IPresetSelectorOption[] {
  const projectInfo = resouceInfos.find((info) => info.sig === projectSig);
  if (!projectInfo) {
    return [];
  }
  return [
    ...projectInfo.layoutNames.map((layoutName) => ({
      value: createPresetKey('blank', layoutName),
      label: `[blank]${layoutName}`,
      spec: {
        type: 'blank' as const,
        layoutName,
      },
    })),
    ...projectInfo.presetNames.map((presetName) => ({
      value: createPresetKey('preset', presetName),
      label: `[preset]${presetName}`,
      spec: {
        type: 'preset' as const,
        presetName,
      },
    })),
  ];
}

export function usePresetSelectionModel(): IPresetSelectionModel {
  const sel = usePersistState(`presetSelecionModel__sel`, {
    projectKey: '', // ${origin}#${projectId}
    presetKey: '', // blank:${layoutName} or preset:${presetName}
  });
  const resourceInfos = useProjectResourceInfosBasedOnGlobalSettings();
  const projectOptions = makeProjectOptions(resourceInfos);
  const presetOptions = makePresetOptions(resourceInfos, sel.projectKey);

  const modProjectKey = getSelectionValueCorrected(
    projectOptions,
    sel.projectKey,
  );
  const modPresetKey = getSelectionValueCorrected(presetOptions, sel.presetKey);

  const selectProject = (projectKey: string) => {
    sel.projectKey = projectKey;
    sel.presetKey = '';
  };

  const loadedProfileData = useProfileDataLoaded(modProjectKey, modPresetKey);

  const editSelectedProjectPreset = () => {
    editSelectedProjectPresetOriginal(modProjectKey, modPresetKey);
  };

  return {
    projectSelectorSource: {
      options: projectOptions,
      value: modProjectKey,
      setValue: selectProject,
    },
    presetSelectorSource: {
      options: presetOptions,
      value: modPresetKey,
      setValue: fieldSetter(sel, 'presetKey'),
    },
    currentProjectKey: modProjectKey,
    currentPresetKey: modPresetKey,
    selectProject,
    loadedProfileData,
    editSelectedProjectPreset,
  };
}
