import { appUi, ipcAgent } from '~/ui/common';
import { editMutations } from '~/ui/pages/layouter/models';

export function setupDeviceKeyEventsListener(): () => void {
  if (appUi.isExecutedInApp) {
    return ipcAgent.events.device_keyEvents.subscribe((event) => {
      if (event.type === 'keyStateChanged') {
        const { keyIndex, isDown } = event;
        if (isDown) {
          editMutations.addPressedKey(keyIndex);
        } else {
          editMutations.removePressedKey(keyIndex);
        }
      }
    });
  }
  return () => {};
}
