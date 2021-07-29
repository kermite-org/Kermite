import { useEffect, useLocal } from 'qx';
import {
  fallbackProfileData,
  getProjectOriginAndIdFromSig,
  IProfileData,
  IProjectResourceInfo,
  IServerPorfileInfo,
} from '~/shared';
import {
  ISelectorOption,
  ipcAgent,
  getSelectionValueCorrected,
  router,
} from '~/ui/base';
import { useProjectResourceInfos } from '~/ui/commonModels';
import { usePersistState, useFetcher, fieldSetter } from '~/ui/helpers';
import { IPresetSelectionModel } from '~/ui/pages/preset-browser-page/models';

function makeProjectOptions(
  infos: IProjectResourceInfo[],
  projectIds: string[],
): ISelectorOption[] {
  return infos
    .filter((it) => projectIds.includes(it.projectId) && it.origin === 'online')
    .map((it) => ({
      value: it.sig,
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
    projectKey: '', // ${origin}#${projectId}
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

  const loadedProfileData = local.projectProfiles.find(
    (it) => it.id === modPresetKey,
  )?.profileData;

  const editSelectedProjectPreset = async () => {
    if (loadedProfileData) {
      await sendCreateProfileCommand(loadedProfileData);
      router.navigateTo('/editor');
    }
  };

  useEffect(() => {
    if (modProjectKey) {
      const { projectId } = getProjectOriginAndIdFromSig(modProjectKey);
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
