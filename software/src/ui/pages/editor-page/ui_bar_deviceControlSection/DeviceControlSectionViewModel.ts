import { projectPackagesReader, uiStateReader } from '~/ui/commonStore';

export function makeDeviceControlSectionViewModel() {
  const { isConnected, deviceAttrs } = uiStateReader.deviceStatus;
  const projectInfo = projectPackagesReader.findProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return {
    currentDeviceKeyboardName: projectInfo?.keyboardName || '',
    isDeviceConnected: isConnected,
  };
}
