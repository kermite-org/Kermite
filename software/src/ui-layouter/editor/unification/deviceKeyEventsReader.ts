import { appUi, ipcAgent } from '~/ui-common';
import { editMutations } from '~/ui-layouter/editor/store';

export function setupDeviceKeyEventsListener(): () => void {
  if (appUi.isExecutedInApp) {
    return ipcAgent.subscribe('device_keyEvents', (event) => {
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
