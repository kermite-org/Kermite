import { useMemo } from 'qx';
import {
  globalSettingsFallbackValue,
  IDeviceSelectionStatus,
  IKeyboardDeviceAttributes,
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
  IResourceOrigin,
  sortOrderBy,
} from '~/shared';
import { appUi, ipcAgent } from '~/ui/base';
import { useEventSource, useFetcher } from '~/ui/helpers';

export function useKeyboardDeviceStatus(): IKeyboardDeviceStatus {
  return useEventSource(ipcAgent.events.device_keyboardDeviceStatusEvents, {
    isConnected: false,
    deviceAttrs: undefined,
  });
}

export function useDeviceSelectionStatus(): IDeviceSelectionStatus {
  return useEventSource(ipcAgent.events.device_deviceSelectionEvents, {
    allDeviceInfos: [],
    currentDevicePath: 'none',
  });
}

export function useAllProjectResourceInfos(): IProjectResourceInfo[] {
  return useFetcher(ipcAgent.async.projects_getAllProjectResourceInfos, []);
}

export function useGlobalSettingsFetch() {
  return useFetcher(
    ipcAgent.async.config_getGlobalSettings,
    globalSettingsFallbackValue,
  );
}

export function useProjectResourcePresenceChecker(
  origin: IResourceOrigin,
): boolean {
  if (!appUi.isExecutedInApp) {
    return false;
  }
  const resourceInfos = useAllProjectResourceInfos();
  return resourceInfos.some((info) => info.origin === origin);
}

export function useProjectResourceInfos() {
  const resourceInfos = useAllProjectResourceInfos();
  const sorted = useMemo(
    () =>
      resourceInfos.sort(
        sortOrderBy((it) => `${it.origin}${it.keyboardName}${it.projectPath}`),
      ),
    [resourceInfos],
  );
  return sorted;
}

export async function getProjectResourceInfosWithFilter(
  filterConditionFunc: (info: IProjectResourceInfo) => boolean = () => true,
): Promise<IProjectResourceInfo[]> {
  const resourceInfos = await ipcAgent.async.projects_getAllProjectResourceInfos();
  return resourceInfos
    .filter(filterConditionFunc)
    .sort(
      sortOrderBy((it) => `${it.origin}${it.keyboardName}${it.projectPath}`),
    );
}

export function useLocalProjectResourceInfos(): IProjectResourceInfo[] {
  const allResourceInfos = useAllProjectResourceInfos();
  return useMemo(
    () => allResourceInfos.filter((info) => info.origin === 'local'),
    [allResourceInfos],
  );
}

export function useProjectInfo(
  origin?: IResourceOrigin,
  projectId?: string,
): IProjectResourceInfo | undefined {
  const resourceInfos = useAllProjectResourceInfos();
  return resourceInfos.find(
    (info) => info.origin === origin && info.projectId === projectId,
  );
}

export function useConnectedDeviceAttributes(): {
  deviceAttrs: IKeyboardDeviceAttributes | undefined;
  projectInfo: IProjectResourceInfo | undefined;
} {
  const deviceStatus = useKeyboardDeviceStatus();
  const deviceAttrs = deviceStatus.deviceAttrs;
  const projectInfo = useProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return { deviceAttrs, projectInfo };
}
