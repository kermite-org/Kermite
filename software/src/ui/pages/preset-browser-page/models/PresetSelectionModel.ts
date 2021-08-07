import { useEffect, useLocal, useMemo } from 'qx';
import {
  IGlobalSettings,
  IPresetSpec,
  IProfileData,
  IProjectResourceInfo,
} from '~/shared';
import { createPresetKey } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getSelectionValueCorrected,
  ISelectorOption,
  ISelectorSource,
} from '~/ui/base';
import {
  useAllProjectResourceInfos,
  readGlobalProjectKey,
  globalSettingsModel,
  readSettingsResouceOrigin,
} from '~/ui/commonModels';
import { fieldSetter } from '~/ui/helpers';
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

function getProjectSelectionLabel(info: IProjectResourceInfo): string {
  const isDeveloperMode = globalSettingsModel.getValue('useLocalResouces');
  if (isDeveloperMode) {
    const prefix = info.origin === 'local' ? '(local) ' : '';
    return `${prefix}${info.keyboardName} (${info.projectPath})`;
  } else {
    return info.keyboardName;
  }
}

function makeProjectOptions(infos: IProjectResourceInfo[]): ISelectorOption[] {
  return infos
    .filter(
      (info) => info.presetNames.length > 0 || info.layoutNames.length > 0,
    )
    .map((info) => ({
      value: info.sig,
      label: getProjectSelectionLabel(info),
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

function useFileterdResourceInfos(
  allProjectInfos: IProjectResourceInfo[],
  globalSettings: IGlobalSettings,
) {
  return useMemo(() => {
    const { globalProjectId } = globalSettings;
    const targetOrigin = readSettingsResouceOrigin(globalSettings);
    return allProjectInfos
      .filter((info) => info.origin === targetOrigin)
      .filter(
        (info) => globalProjectId === '' || info.projectId === globalProjectId,
      );
  }, [allProjectInfos, globalSettings]);
}

export function usePresetSelectionModel(): IPresetSelectionModel {
  // const sel = usePersistState(`presetSelecionModel__sel`, {
  //   projectKey: '', // ${origin}#${projectId}
  //   presetKey: '', // blank:${layoutName} or preset:${presetName}
  // });

  const sel = useLocal({
    projectKey: '',
    presetKey: '',
  });

  const { globalSettings } = globalSettingsModel;
  const allProjectInfos = useAllProjectResourceInfos();

  const resourceInfos = useFileterdResourceInfos(
    allProjectInfos,
    globalSettings,
  );

  const projectOptions = makeProjectOptions(resourceInfos);

  const modProjectKey = getSelectionValueCorrected(
    projectOptions,
    sel.projectKey,
  );

  const presetOptions = makePresetOptions(resourceInfos, modProjectKey);

  const modPresetKey = getSelectionValueCorrected(presetOptions, sel.presetKey);

  // console.log({ projectOptions, presetOptions, modProjectKey, modPresetKey });

  useEffect(() => {
    sel.projectKey =
      readGlobalProjectKey(globalSettings) || projectOptions[0]?.value || '';
  }, [globalSettings]);

  const loadedProfileData = useProfileDataLoaded(modProjectKey, modPresetKey);

  const editSelectedProjectPreset = () => {
    editSelectedProjectPresetOriginal(modProjectKey, modPresetKey);
  };

  const selectProject = (projectKey: string) => {
    sel.projectKey = projectKey;
    sel.presetKey = '';
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
