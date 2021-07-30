import { useMemo } from 'qx';
import {
  globalSettingsFallbackValue,
  IDeviceSelectionStatus,
  IKeyboardDeviceAttributes,
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
  IResourceOrigin,
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

export async function fetchAllProjectResourceInfos(): Promise<
  IProjectResourceInfo[]
> {
  return await ipcAgent.async.projects_getAllProjectResourceInfos();
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
  return useAllProjectResourceInfos();
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
