import { models } from '~ui/models';

export function makeDeviceControlSectionViewModel() {
  return {
    currentDeviceProjectName:
      models.deviceStatusModel.deviceAttrs?.projectName || '',
    isDeviceConnected: models.deviceStatusModel.isConnected
  };
}
