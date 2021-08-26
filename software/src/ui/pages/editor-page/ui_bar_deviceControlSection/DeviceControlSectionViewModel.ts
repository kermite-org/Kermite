import { projectPackagesReader, uiStateReader } from '~/ui/commonStore';

export function makeDeviceControlSectionViewModel() {
  const { deviceStatus } = uiStateReader;
  if (deviceStatus.isConnected) {
    const firmwareInfo = projectPackagesReader.findFirmwareInfo(
      deviceStatus.deviceAttrs.firmwareId,
    );
    const displayName = firmwareInfo?.firmwareProjectPath || '';
    return {
      currentDeviceKeyboardName: displayName,
      isDeviceConnected: deviceStatus.isConnected,
    };
  }
  return {
    currentDeviceKeyboardName: '',
    isDeviceConnected: false,
  };
}
