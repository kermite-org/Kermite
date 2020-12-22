import { css } from 'goober';
import { ExclusiveButtonGroup } from '~/controls/ExclusiveButtonGroup';
import {
  appState,
  editManager,
  editMutations,
  IEditState,
} from '~/editor/store';
import { h } from '~/qx';

const cssEditMenuBar = css`
  width: 800px;
  display: flex;
  > * + * {
    margin-left: 40px;
  }

  > .buttonsBox {
    > * + * {
      margin-left: 5px;
    }
  }

  button {
    width: 50px;
    padding: 5px;
    cursor: pointer;
  }
`;

function createModeSelectionViewModel<K extends 'editorTarget' | 'editMode'>(
  targetKey: K,
  sources: { [key in IEditState[K]]?: string }
) {
  const options = Object.keys(sources).map((key) => ({
    id: key,
    text: sources[key as IEditState[K]] as string,
  }));
  const choiceId = appState.editor[targetKey];
  const setChoiceId = (value: string) => {
    editMutations.setMode(targetKey, value as any);
  };
  return {
    options,
    choiceId,
    setChoiceId,
  };
}

export const EditMenuBar = () => {
  const { canUndo, canRedo, undo, redo } = editManager;

  const editorTargetVm = createModeSelectionViewModel('editorTarget', {
    key: 'key',
    outline: 'outline',
    viewbox: 'sight',
  });

  const editModeVm = createModeSelectionViewModel('editMode', {
    add: 'add',
    move: 'move',
  });

  return (
    <div class={cssEditMenuBar}>
      <ExclusiveButtonGroup
        options={editorTargetVm.options}
        choiceId={editorTargetVm.choiceId}
        setChoiceId={editorTargetVm.setChoiceId}
        buttonWidth={55}
      />

      <ExclusiveButtonGroup
        options={editModeVm.options}
        choiceId={editModeVm.choiceId}
        setChoiceId={editModeVm.setChoiceId}
        buttonWidth={55}
      />

      <div class="buttonsBox">
        <button disabled={!canUndo} onClick={undo}>
          undo
        </button>
        <button disabled={!canRedo} onClick={redo}>
          redo
        </button>
      </div>
    </div>
  );
};
