import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';

export function makeDeviceControlSectionViewModel() {
  const deviceStatusModel = useDeviceStatusModel();

  return {
    currentDeviceKeyboardName:
      deviceStatusModel.deviceAttrs?.keyboardName || '',
    isDeviceConnected: deviceStatusModel.isConnected,
  };
}
