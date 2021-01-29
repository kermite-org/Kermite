import { models } from '~/ui-root/zones/common/commonModels';

export function makeDeviceControlSectionViewModel() {
  return {
    currentDeviceKeyboardName:
      models.deviceStatusModel.deviceAttrs?.keyboardName || '',
    isDeviceConnected: models.deviceStatusModel.isConnected,
  };
}
