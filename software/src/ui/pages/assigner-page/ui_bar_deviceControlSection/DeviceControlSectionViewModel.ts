import { uiReaders } from '~/ui/store';

export function makeDeviceControlSectionViewModel() {
  const { deviceStatus } = uiReaders;
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
