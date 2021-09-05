import { useEffect, useLocal, useMemo } from 'qx';
import { IPresetSpec, IProfileData, IProjectPackageInfo } from '~/shared';
import { createPresetKey } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getSelectionValueCorrected,
  ISelectorOption,
  ISelectorSource,
} from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import {
  globalSettingsReader,
  projectPackagesReader,
  uiStateReader,
} from '~/ui/commonStore';
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

function getProjectSelectionLabel(info: IProjectPackageInfo): string {
  const { isDeveloperMode } = globalSettingsReader;
  if (isDeveloperMode) {
    const prefix = info.origin === 'local' ? '(local) ' : '';
    return `${prefix}${info.keyboardName}`;
  } else {
    return info.keyboardName;
  }
}

function makeProjectOptions(infos: IProjectPackageInfo[]): ISelectorOption[] {
  return infos.map((info) => ({
    value: info.sig,
    label: getProjectSelectionLabel(info),
  }));
}

type IPresetSelectorOption = ISelectorOption & {
  spec: IPresetSpec;
};

function makePresetOptions(
  resourceInfos: IProjectPackageInfo[],
  projectSig: string,
): IPresetSelectorOption[] {
  const projectInfo = resourceInfos.find((info) => info.sig === projectSig);
  if (!projectInfo) {
    return [];
  }
  return [
    ...projectInfo.layouts.map(({ layoutName }) => ({
      value: createPresetKey('blank', layoutName),
      label: `[blank]${layoutName}`,
      spec: {
        type: 'blank' as const,
        layoutName,
      },
    })),
    ...projectInfo.presets.map(({ presetName }) => ({
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
  // const sel = usePersistState(`presetSelectionModel__sel`, {
  //   projectKey: '', // ${origin}#${projectId}
  //   presetKey: '', // blank:${layoutName} or preset:${presetName}
  // });

  const sel = useLocal({
    projectKey: '',
    presetKey: '',
  });

  const { globalSettings } = uiStateReader;

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
  }, [globalSettings]);

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
