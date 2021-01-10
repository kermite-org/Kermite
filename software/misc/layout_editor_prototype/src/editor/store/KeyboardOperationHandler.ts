import { editManager } from '~/editor/store/EditManager';
import { editMutations } from '~/editor/store/EditMutations';
import { editReader } from '~/editor/store/EditReader';
import { rerender } from '~/qx';

export function setupKeyboardOperationHander() {
  window.addEventListener('keydown', (e) => {
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
  });
}
