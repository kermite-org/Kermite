import { css } from 'goober';
import { editManager } from '~/editor/store';
import { h } from '~/qx';

const cssEditMenuBar = css`
  display: flex;
  > * + * {
    margin-left: 5px;
  }
  button {
    width: 50px;
    padding: 5px;
    cursor: pointer;
  }
`;

export const EditMenuBar = () => {
  const { canUndo, canRedo, undo, redo } = editManager;

  return (
    <div class={cssEditMenuBar}>
      <button disabled={!canUndo} onClick={undo}>
        undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        redo
      </button>
    </div>
  );
};
