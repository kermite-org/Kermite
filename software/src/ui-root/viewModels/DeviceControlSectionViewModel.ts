import { models } from '@ui-root/models';

export function makeDeviceControlSectionViewModel() {
  return {
    currentDeviceKeyboardName:
      models.deviceStatusModel.deviceAttrs?.keyboardName || '',
    isDeviceConnected: models.deviceStatusModel.isConnected,
  };
}
