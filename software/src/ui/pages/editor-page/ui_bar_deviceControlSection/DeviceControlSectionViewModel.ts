import { projectPackagesReader, uiStateReader } from '~/ui/commonStore';

export function makeDeviceControlSectionViewModel() {
  const { isConnected, deviceAttrs } = uiStateReader.deviceStatus;

  const firmwareInfo = projectPackagesReader.findFirmwareInfo(
    deviceAttrs?.firmwareId,
  );
  const displayName = firmwareInfo?.firmwareProjectPath || '';
  return {
    currentDeviceKeyboardName: displayName,
    isDeviceConnected: isConnected,
  };
}
