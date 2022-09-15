import { appUi, ipcAgent } from '~/ui/base';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';

function handleKeyIndexReflectionInput(keyIndex: number) {
  if (editReader.enableKeyIndexReflection) {
    const ke1 = editReader.currentKeyEntity;
    if (ke1) {
      const ke0 = editReader.allKeyEntities.find(
        (ke) => ke.keyIndex === keyIndex,
      );
      if (ke0) {
        editMutations.changeKeyProperty('keyIndex', -1, ke0.id);
      }
      editMutations.changeKeyProperty('keyIndex', keyIndex, ke1.id);
    }
  }
}

export function setupDeviceKeyEventsListener(): () => void {
  if (appUi.isExecutedInApp) {
    return ipcAgent.events.device_keyEvents.subscribe((event) => {
      if (event.type === 'keyStateChanged') {
        const { keyIndex, isDown } = event;

        if (isDown) {
          handleKeyIndexReflectionInput(keyIndex);
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
