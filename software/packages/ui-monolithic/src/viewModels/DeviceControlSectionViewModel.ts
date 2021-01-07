import { models } from '~ui/models';

export function makeDeviceControlSectionViewModel() {
  return {
    currentDeviceKeyboardName:
      models.deviceStatusModel.deviceAttrs?.keyboardName || '',
    isDeviceConnected: models.deviceStatusModel.isConnected,
  };
}
