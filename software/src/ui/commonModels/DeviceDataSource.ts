import {
  IDeviceSelectionStatus,
  IKeyboardDeviceAttributes,
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useProjectInfo } from '~/ui/commonModels/ProjectDataSource';
import { useEventSource } from '~/ui/helpers';

export function useDeviceSelectionStatus(): IDeviceSelectionStatus {
  return useEventSource(ipcAgent.events.device_deviceSelectionEvents, {
    allDeviceInfos: [],
    currentDevicePath: 'none',
  });
}

export function useKeyboardDeviceStatus(): IKeyboardDeviceStatus {
  return useEventSource(ipcAgent.events.device_keyboardDeviceStatusEvents, {
    isConnected: false,
    deviceAttrs: undefined,
  });
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
