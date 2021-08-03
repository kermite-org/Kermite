import { IGlobalSettings, createProjectSig, IResourceOrigin } from '~/shared';

export function readSettingsResouceOrigin(
  globalSettings: IGlobalSettings,
): IResourceOrigin {
  const {
    developerMode,
    useLocalResouces,
    localProjectRootFolderPath,
  } = globalSettings;
  return developerMode && useLocalResouces && !!localProjectRootFolderPath
    ? 'local'
    : 'online';
}

export function readGlobalProjectKey(globalSettings: IGlobalSettings): string {
  const { globalProjectId } = globalSettings;
  const origin = readSettingsResouceOrigin(globalSettings);
  return (globalProjectId && createProjectSig(origin, globalProjectId)) || '';
}
