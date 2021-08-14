import {
  IDeviceSelectionStatus,
  IKeyboardDeviceAttributes,
  IKeyboardDeviceStatus,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { projectPackagesReader } from '~/ui/commonModels/ProjectDataSource';
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
  projectInfo: IProjectPackageInfo | undefined;
} {
  const deviceStatus = useKeyboardDeviceStatus();
  const deviceAttrs = deviceStatus.deviceAttrs;
  const projectInfo = projectPackagesReader.findProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return { deviceAttrs, projectInfo };
}
