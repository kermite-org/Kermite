import { useEffect, useLocal, useMemo } from 'qx';
import {
  fallbackProfileData,
  getOriginAndProjectIdFromProjectKey,
  IProfileData,
  IProjectPackageInfo,
  IServerProfileInfo,
} from '~/shared';
import {
  getSelectionValueCorrected,
  ipcAgent,
  ISelectorOption,
} from '~/ui/base';
import { IPresetSelectionModel } from '~/ui/features/PresetBrowser/models';
import {
  dispatchCoreAction,
  projectPackagesReader,
  uiActions,
} from '~/ui/store';
import { fieldSetter, useFetcher, usePersistState } from '~/ui/utils';

function makeProjectOptions(
  infos: IProjectPackageInfo[],
  projectIds: string[],
): ISelectorOption[] {
  return infos
    .filter((it) => projectIds.includes(it.projectId) && it.origin === 'online')
    .map((it) => ({
      value: it.projectKey,
      label: it.keyboardName,
    }));
}

function makePresetOptions(
  projectPresets: IServerProfileInfo[],
): ISelectorOption[] {
  return projectPresets.map((it) => ({
    value: it.id,
    label: `${it.profileName} (by ${it.userName})`,
  }));
}

async function sendCreateProfileCommand(profileData: IProfileData) {
  await dispatchCoreAction({ profile_createProfileExternal: { profileData } });
}

export function usePresetSelectionModel2(): IPresetSelectionModel {
  const sel = usePersistState(`presetSelectionModel2__sel`, {
    projectKey: '', // ${origin}#${projectId}
    presetKey: '', // id of user profile
  });

  const local = useLocal<{ projectProfiles: IServerProfileInfo[] }>({
    projectProfiles: [],
  });

  const resourceInfos = useMemo(
    projectPackagesReader.getProjectInfosGlobalProjectSelectionAffected,
    [],
  );
  const projectIds = useFetcher(
    ipcAgent.async.presetHub_getServerProjectIds,
    [],
  );

  const projectOptions = makeProjectOptions(resourceInfos, projectIds);
  const modProjectKey = getSelectionValueCorrected(
    projectOptions,
    sel.projectKey,
  );

  const presetOptions = makePresetOptions(local.projectProfiles);
  const modPresetKey = getSelectionValueCorrected(presetOptions, sel.presetKey);

  const selectProject = (projectKey: string) => {
    sel.projectKey = projectKey;
    sel.presetKey = '';
  };

  const loadedProfileData = local.projectProfiles.find(
    (it) => it.id === modPresetKey,
  )?.profileData;

  const editSelectedProjectPreset = async () => {
    if (loadedProfileData) {
      await sendCreateProfileCommand(loadedProfileData);
      uiActions.navigateTo('/assigner');
    }
  };

  useEffect(() => {
    if (modProjectKey) {
      const { projectId } = getOriginAndProjectIdFromProjectKey(modProjectKey);
      ipcAgent.async
        .presetHub_getServerProfiles(projectId)
        .then((res) => (local.projectProfiles = res || []));
    }
  }, [modProjectKey]);

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
    loadedProfileData: loadedProfileData || fallbackProfileData,
    editSelectedProjectPreset,
  };
}
