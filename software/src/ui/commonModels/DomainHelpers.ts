import { IGlobalSettings, createProjectSig } from '~/shared';

export function readGlobalProjectKey(globalSettings: IGlobalSettings): string {
  const { useLocalResouces, globalProjectId } = globalSettings;
  const origin = useLocalResouces ? 'local' : 'online';
  return (globalProjectId && createProjectSig(origin, globalProjectId)) || '';
}
