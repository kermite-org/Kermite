import { appUi, ipcAgent } from '~/ui/base';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';

function handleKeyIndexReflectionInput(keyIndex: number) {
  if (editReader.enableKeyIndexReflection) {
    const { allKeyEntities, currentKeyEntity, isCurrentKeyMirror } = editReader;
    const ke1 = currentKeyEntity;
    if (ke1) {
      const ke0a = allKeyEntities.find((ke) => ke.keyIndex === keyIndex);
      if (ke0a) {
        editMutations.changeKeyProperty('keyIndex', -1, ke0a.id);
      }
      const ke0b = allKeyEntities.find((ke) => ke.mirrorKeyIndex === keyIndex);
      if (ke0b) {
        editMutations.changeKeyProperty('mirrorKeyIndex', -1, ke0b.id);
      }

      if (isCurrentKeyMirror) {
        editMutations.changeKeyProperty('mirrorKeyIndex', keyIndex, ke1.id);
      } else {
        editMutations.changeKeyProperty('keyIndex', keyIndex, ke1.id);
      }
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
