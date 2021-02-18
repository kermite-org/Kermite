import { IPresetSpec, IResourceOrigin } from '~/shared';
import {
  getPresetSpecFromPresetKey,
  getProjectOriginAndIdFromSig,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, router } from '~/ui-common';
import {
  modalAlert,
  modalTextEdit,
} from '~/ui-common/fundamental/dialog/BasicModals';

function getNewProfileNameBase(
  keyboardName: string,
  profileSourceName: string,
  allProfileNames: string[],
): string {
  const isProfileSourceIncluesKeyboardName = profileSourceName
    .toLowerCase()
    .includes(keyboardName.toLowerCase());

  let newProfileNameBase = isProfileSourceIncluesKeyboardName
    ? profileSourceName
    : `${keyboardName}_${profileSourceName}`.toLowerCase();

  if (allProfileNames.includes(newProfileNameBase)) {
    newProfileNameBase += '1';
    // todo: すでにファイルがある場合連番にする
  }
  return newProfileNameBase;
}

function checkValidNewProfileName(
  newProfileName: string,
  allProfileNames: string[],
): 'ok' | string {
  if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
    return `${newProfileName} is not for valid filename.`;
  }
  if (allProfileNames.includes(newProfileName)) {
    return `${newProfileName} is already exists.`;
  }
  return 'ok';
}

function createProfile(
  newProfileName: string,
  targetProjectOrigin: IResourceOrigin,
  targetProjectId: string,
  presetSpec: IPresetSpec,
) {
  const createCommand = {
    creatProfile: {
      name: newProfileName,
      targetProjectOrigin,
      targetProjectId,
      presetSpec,
    },
  };
  ipcAgent.async.profile_executeProfileManagerCommands([createCommand]);
}

export async function editSelectedProjectPreset(
  projectKey: string,
  presetKey: string,
) {
  if (!(projectKey && presetKey)) {
    return;
  }
  const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
  const presetSpec = getPresetSpecFromPresetKey(presetKey);

  const allProfileNames = await ipcAgent.async.profile_getAllProfileNames();

  const resourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
  const info = resourceInfos.find((info) => info.sig === projectKey);
  if (!info) {
    return;
  }

  // todo: ここでProfileの名前を設定せず、新規作成未保存のProfileとして編集できるようにする

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

  createProfile(newProfileName, origin, projectId, presetSpec);
  router.navigateTo('/editor');
}
