import { uiReaders } from '~/ui/store';

export function makeDeviceControlSectionViewModel() {
  const { deviceStatus } = uiReaders;
  if (deviceStatus.isConnected) {
    return {
      isDeviceConnected: true,
      currentDeviceKeyboardName: deviceStatus.deviceAttrs.keyboardName,
    };
  } else {
    return {
      isDeviceConnected: false,
      currentDeviceKeyboardName: '',
    };
  }
}
