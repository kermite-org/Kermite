import { useEffect, useLocal, useMemo } from 'qx';
import { IPresetSpec, IProfileData, IProjectPackageInfo } from '~/shared';
import { createPresetKey } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getSelectionValueCorrected,
  ISelectorOption,
  ISelectorSource,
} from '~/ui/base';
import { editSelectedProjectPreset as editSelectedProjectPresetOriginal } from '~/ui/features/PresetBrowser/models/ProfileCreator';
import { useProfileDataLoaded } from '~/ui/features/PresetBrowser/models/ProfileDataLoader';
import { projectPackagesReader, uiReaders } from '~/ui/store';
import { fieldSetter } from '~/ui/utils';

export interface IPresetSelectionModel {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  currentProjectKey: string;
  currentPresetKey: string;
  selectProject(projectKey: string): void;
  loadedProfileData: IProfileData;
  editSelectedProjectPreset(): void;
}

function getProjectSelectionLabel(info: IProjectPackageInfo): string {
  if (uiReaders.isDeveloperMode) {
    const prefix = info.origin === 'local' ? '(local) ' : '';
    return `${prefix}${info.keyboardName}`;
  } else {
    return info.keyboardName;
  }
}

function makeProjectOptions(infos: IProjectPackageInfo[]): ISelectorOption[] {
  return infos.map((info) => ({
    value: info.projectKey,
    label: getProjectSelectionLabel(info),
  }));
}

type IPresetSelectorOption = ISelectorOption & {
  spec: IPresetSpec;
};

function makePresetOptions(
  resourceInfos: IProjectPackageInfo[],
  projectKey: string,
): IPresetSelectorOption[] {
  const projectInfo = resourceInfos.find(
    (info) => info.projectKey === projectKey,
  );
  if (!projectInfo) {
    return [];
  }
  return [
    ...projectInfo.layouts.map(({ layoutName }) => ({
      value: createPresetKey('blank', layoutName),
      label: `(layout)${layoutName}`,
      spec: {
        type: 'blank' as const,
        layoutName,
      },
    })),
    ...projectInfo.presets.map(({ presetName }) => ({
      value: createPresetKey('preset', presetName),
      label: `(profile)${presetName}`,
      spec: {
        type: 'preset' as const,
        presetName,
      },
    })),
  ];
}

export function usePresetSelectionModel(): IPresetSelectionModel {
  // const sel = usePersistState(`presetSelectionModel__sel`, {
  //   projectKey: '', // ${origin}#${projectId}
  //   presetKey: '', // blank:${layoutName} or preset:${presetName}
  // });

  const sel = useLocal({
    projectKey: '',
    presetKey: '',
  });

  const resourceInfos = useMemo(
    projectPackagesReader.getProjectInfosGlobalProjectSelectionAffected,
    [],
  );

  const projectOptions = makeProjectOptions(resourceInfos);

  const modProjectKey = getSelectionValueCorrected(
    projectOptions,
    sel.projectKey,
  );

  const presetOptions = makePresetOptions(resourceInfos, modProjectKey);

  const modPresetKey = getSelectionValueCorrected(presetOptions, sel.presetKey);

  useEffect(() => {
    sel.projectKey =
      uiReaders.globalProjectKey || projectOptions[0]?.value || '';
  }, [uiReaders.globalSettings]);

  const loadedProfileData = useProfileDataLoaded(
    modProjectKey,
    modPresetKey,
    resourceInfos,
  );

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
