import { uiReaders } from '~/ui/commonStore';

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
