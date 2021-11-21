import { appUi } from '~/ui/base';

export const uiConfiguration = {
  closeProjectResourceEditPageOnSave: false,
  checkDeviceConnectionOnWizard: true,
};
if (appUi.isDevelopment) {
  uiConfiguration.checkDeviceConnectionOnWizard = false;
}
