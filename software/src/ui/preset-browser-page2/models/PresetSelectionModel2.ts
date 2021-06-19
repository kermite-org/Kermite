import { Hook } from 'qx';
import {
  fallbackProfileData,
  IProfileData,
  IProjectResourceInfo,
  IServerPorfileInfo,
} from '~/shared';
import {
  fieldSetter,
  getSelectionValueCorrected,
  ipcAgent,
  ISelectorOption,
  router,
  useFetcher,
  useLocal,
  usePersistState,
  useProjectResourceInfos,
} from '~/ui/common';
import { IPresetSelectionModel } from '~/ui/preset-browser-page/models';

function makeProjectOptions(
  infos: IProjectResourceInfo[],
  projectIds: string[],
): ISelectorOption[] {
  return infos
    .filter((it) => projectIds.includes(it.projectId) && it.origin === 'online')
    .map((it) => ({
      value: it.projectId,
      label: it.keyboardName,
    }));
}

function makePresetOptions(
  projectPresets: IServerPorfileInfo[],
): ISelectorOption[] {
  return projectPresets.map((it) => ({
    value: it.id,
    label: `${it.profileName} (by ${it.userName})`,
  }));
}

function sendCreateProfileCommand(profileData: IProfileData) {
  return ipcAgent.async.profile_executeProfileManagerCommands([
    {
      createProfileExternal: { profileData },
    },
  ]);
}

export function usePresetSelectionModel2(): IPresetSelectionModel {
  const sel = usePersistState(`presetSelecionModel2__sel`, {
    projectKey: '', // projectId
    presetKey: '', // id of user profile
  });

  const local = useLocal<{ projectProfiles: IServerPorfileInfo[] }>({
    projectProfiles: [],
  });

  const resourceInfos = useProjectResourceInfos('projectsSortedByKeyboardName');
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

  const selectProjectByProjectId = (projectId: string) => {
    const info = resourceInfos.find((info) => info.projectId === projectId);
    if (info) {
      selectProject(info.sig);
    }
  };

  const loadedProfileData = local.projectProfiles.find(
    (it) => it.id === modPresetKey,
  )?.profileData;

  const editSelectedProjectPreset = async () => {
    if (loadedProfileData) {
      await sendCreateProfileCommand(loadedProfileData);
      router.navigateTo('/editor');
    }
  };

  Hook.useEffect(() => {
    if (modProjectKey) {
      ipcAgent.async
        .presetHub_getServerProfiles(modProjectKey)
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
    selectProjectByProjectId,
    loadedProfileData: loadedProfileData || fallbackProfileData,
    editSelectedProjectPreset,
  };
}
