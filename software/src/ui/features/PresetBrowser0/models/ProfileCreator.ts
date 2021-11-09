import { IPresetSpec, IResourceOrigin } from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getOriginAndProjectIdFromProjectKey,
} from '~/shared/funcs/DomainRelatedHelpers';
import { dispatchCoreAction, uiActions } from '~/ui/store';

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
  dispatchCoreAction({
    profile_createProfileUnnamed: {
      targetProjectOrigin,
      targetProjectId,
      presetSpec,
    },
  });
}

export function editSelectedProjectPreset(
  projectKey: string,
  presetKey: string,
) {
  if (!(projectKey && presetKey)) {
    return;
  }
  const { origin, projectId } = getOriginAndProjectIdFromProjectKey(projectKey);
  const presetSpec = getPresetSpecFromPresetKey(presetKey);
  createProfile(origin, projectId, presetSpec);
  uiActions.navigateTo('/assigner');

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
