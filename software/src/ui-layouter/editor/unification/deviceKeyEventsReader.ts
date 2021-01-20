import { appUi, ipcAgent } from '~/ui-common';

export function setupDeviceKeyEventsListener(): () => void {
  if (appUi.isExecutedInApp) {
    return ipcAgent.subscribe('device_keyEvents', (event) => {
      console.log({ event });
    });
  }
  return () => {};
}
