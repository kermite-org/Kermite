import { uiStateReader } from '~/ui/commonStore';

export function makeDeviceControlSectionViewModel() {
  const { deviceStatus } = uiStateReader;
  if (deviceStatus.isConnected) {
    return {
      isDeviceConnected: true,
      currentDeviceKeyboardName: deviceStatus.deviceAttrs.productName,
    };
  } else {
    return {
      isDeviceConnected: false,
      currentDeviceKeyboardName: '',
    };
  }
}
