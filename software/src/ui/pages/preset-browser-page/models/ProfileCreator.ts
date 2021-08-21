import { IPresetSpec, IResourceOrigin } from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getProjectOriginAndIdFromSig,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, router } from '~/ui/base';

/*
function getNewProfileNameBase(
  keyboardName: string,
  profileSourceName: string,
  allProfileNames: string[],
): string {
  const isProfileSourceIncludesKeyboardName = profileSourceName
    .toLowerCase()
    .includes(keyboardName.toLowerCase());

  let newProfileNameBase = isProfileSourceIncludesKeyboardName
    ? profileSourceName
    : `${keyboardName}_${profileSourceName}`.toLowerCase();

  if (allProfileNames.includes(newProfileNameBase)) {
    newProfileNameBase += '1';
    // todo: すでにファイルがある場合連番にする
  }
  return newProfileNameBase;
}
*/
function createProfile(
  targetProjectOrigin: IResourceOrigin,
  targetProjectId: string,
  presetSpec: IPresetSpec,
) {
  const createCommand = {
    creatProfile: {
      targetProjectOrigin,
      targetProjectId,
      presetSpec,
    },
  };
  ipcAgent.async.profile_executeProfileManagerCommands([createCommand]);
}

export function editSelectedProjectPreset(
  projectKey: string,
  presetKey: string,
) {
  if (!(projectKey && presetKey)) {
    return;
  }
  const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
  const presetSpec = getPresetSpecFromPresetKey(presetKey);
  createProfile(origin, projectId, presetSpec);
  router.navigateTo('/editor');

  /*
  const allProfileNames = await ipcAgent.async.profile_getAllProfileNames();

  const resourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
  const info = resourceInfos.find((info) => info.sig === projectKey);
  if (!info) {
    return;
  }

  const newProfileNameBase = getNewProfileNameBase(
    info.keyboardName,
    presetSpec.type === 'preset'
      ? presetSpec.presetName
      : presetSpec.layoutName,
    allProfileNames,
  );

  const newProfileName = await modalTextEdit({
    message: 'new profile name',
    defaultText: newProfileNameBase,
    caption: 'create profile',
  });
  if (!newProfileName) {
    return;
  }
  const checkRes = checkValidNewProfileName(newProfileName, allProfileNames);
  if (checkRes !== 'ok') {
    await modalAlert(`${checkRes} operation cancelled.`);
    return;
  }
  */
}
