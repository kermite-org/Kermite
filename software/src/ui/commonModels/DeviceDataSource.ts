import {
  IDeviceSelectionStatus,
  IKeyboardDeviceAttributes,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { uiStateReader } from '~/ui/commonStore';
import { projectPackagesReader } from '~/ui/commonStore/modules/ProjectPackages';
import { useEventSource } from '~/ui/helpers';

export function useDeviceSelectionStatus(): IDeviceSelectionStatus {
  return useEventSource(ipcAgent.events.device_deviceSelectionEvents, {
    allDeviceInfos: [],
    currentDevicePath: 'none',
  });
}

export function useConnectedDeviceAttributes(): {
  deviceAttrs: IKeyboardDeviceAttributes | undefined;
  projectInfo: IProjectPackageInfo | undefined;
} {
  const deviceStatus = uiStateReader.deviceStatus;
  const deviceAttrs = deviceStatus.deviceAttrs;
  const projectInfo = projectPackagesReader.findProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return { deviceAttrs, projectInfo };
}
