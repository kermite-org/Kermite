import { appUi, ipcAgent } from '~/ui/base';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';

export function setupDeviceKeyEventsListener(): () => void {
  if (appUi.isExecutedInApp) {
    return ipcAgent.events.device_keyEvents.subscribe((event) => {
      if (event.type === 'keyStateChanged') {
        const { keyIndex, isDown } = event;

        if (isDown && editReader.enableKeyIndexReflection) {
          editMutations.replaceKeyIndexByDevicePhysicalKey(keyIndex);
        }

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
