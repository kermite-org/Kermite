import { useEffect, useLocal } from 'qx';
import { removeArrayItems } from '~/shared';
import { ipcAgent } from '~/ui/base';

export function useHoldKeyIndices() {
  const holdKeyIndices = useLocal<number[]>([]);

  useEffect(() => {
    return ipcAgent.events.device_keyEvents.subscribe((e) => {
      if (e.type === 'keyStateChanged') {
        if (e.isDown) {
          holdKeyIndices.push(e.keyIndex);
        } else {
          removeArrayItems(holdKeyIndices, e.keyIndex);
        }
      }
    });
  }, []);

  return holdKeyIndices;
}
