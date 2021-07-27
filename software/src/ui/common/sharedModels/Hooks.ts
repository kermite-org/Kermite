import { useMemo } from 'qx';
import {
  globalSettingsFallbackValue,
  IResourceOrigin,
  sortOrderBy,
} from '~/shared';
import { ipcAgent, appUi } from '~/ui/common/base';
import { useFetcher } from '~/ui/common/helpers';

export function useProjectResourcePresenceChecker(
  origin: IResourceOrigin,
): boolean {
  if (!appUi.isExecutedInApp) {
    return false;
  }

  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  return resourceInfos.some((info) => info.origin === origin);
}

export function useProjectResourceInfos(
  sortMethod: 'projectsSortedByKeyboardName' | 'projectsSortedByProjectPath',
) {
  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  const sorted = useMemo(
    () =>
      resourceInfos.sort(
        sortOrderBy((it) =>
          sortMethod === 'projectsSortedByKeyboardName'
            ? `${it.origin}${it.keyboardName}${it.projectPath}`
            : `${it.origin}${it.projectPath}`,
        ),
      ),
    [resourceInfos],
  );
  return sorted;
}

export function useGlobalSettingsFetch() {
  return useFetcher(
    ipcAgent.async.config_getGlobalSettings,
    globalSettingsFallbackValue,
  );
}
