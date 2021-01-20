import { rerender } from 'qx';
import {
  editManager,
  editMutations,
  editReader,
} from '~/ui-layouter/editor/store';

export function keyboardOperationHander(e: KeyboardEvent) {
  if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) {
    const { currentKeyEntity, currentOutlinePoint } = editReader;
    if (currentKeyEntity) {
      editMutations.deleteCurrentKeyEntity();
      rerender();
    } else if (currentOutlinePoint) {
      editMutations.deleteCurrentOutlinePoint();
      rerender();
    }
  }

  const isMacOS = navigator.userAgent.toLowerCase().includes('mac os x');
  if (isMacOS) {
    if (e.key === 'z' && e.metaKey) {
      if (!e.shiftKey) {
        editManager.undo();
      } else {
        editManager.redo();
      }
      rerender();
      e.preventDefault();
    }
  } else {
    if (e.key === 'z' && e.ctrlKey) {
      editManager.undo();
      rerender();
      e.preventDefault();
    }
    if (e.key === 'y' && e.ctrlKey) {
      editManager.redo();
      rerender();
      e.preventDefault();
    }
  }
}
