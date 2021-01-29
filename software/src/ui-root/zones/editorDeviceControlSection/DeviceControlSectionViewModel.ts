import { deviceStatusModel } from '~/ui-root/zones/common/commonModels/DeviceStatusModel';

export function makeDeviceControlSectionViewModel() {
  return {
    currentDeviceKeyboardName:
      deviceStatusModel.deviceAttrs?.keyboardName || '',
    isDeviceConnected: deviceStatusModel.isConnected,
  };
}
