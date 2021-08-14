import { IKeyboardDeviceAttributes, IProjectPackageInfo } from '~/shared';
import { uiStateReader } from '~/ui/commonStore';
import { projectPackagesReader } from '~/ui/commonStore/modules/ProjectPackages';

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
