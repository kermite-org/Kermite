import { rerender } from 'alumina';
import { editMutations, editReader } from '../models';

export function keyboardOperationHandler(e: KeyboardEvent) {
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
        editMutations.undo();
      } else {
        editMutations.redo();
      }
      rerender();
      e.preventDefault();
    }
  } else {
    if (e.key === 'z' && e.ctrlKey) {
      editMutations.undo();
      rerender();
      e.preventDefault();
    }
    if (e.key === 'y' && e.ctrlKey) {
      editMutations.redo();
      rerender();
      e.preventDefault();
    }
  }
}
