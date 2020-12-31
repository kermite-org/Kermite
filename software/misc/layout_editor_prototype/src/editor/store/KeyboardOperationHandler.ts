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
  });
}
