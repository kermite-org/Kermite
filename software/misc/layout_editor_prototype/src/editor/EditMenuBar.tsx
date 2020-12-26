import { css } from 'goober';
import { ExclusiveButtonGroup } from '~/controls/ExclusiveButtonGroup';
import { ToggleButton } from '~/controls/ToggleButton';
import { ISelectOption } from '~/controls/interfaces';
import {
  appState,
  editManager,
  editMutations,
  editReader,
  IModeState,
} from '~/editor/store';
import { h } from '~/qx';

const cssEditMenuBar = css`
  width: 800px;
  display: flex;
  > * + * {
    margin-left: 40px;
  }

  > .buttonsBox {
    display: flex;
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
  sources: { [key in IModeState[K]]?: string }
) {
  const options: ISelectOption[] = (Object.keys(
    sources
  ) as IModeState[K][]).map((key) => ({
    id: key,
    text: sources[key]!,
  }));
  const choiceId = editReader.getMode(targetKey);
  const setChoiceId = (value: Extract<IModeState[K], string>) => {
    editMutations.setMode(targetKey, value);
  };
  return {
    options,
    choiceId,
    setChoiceId,
  };
}

function createToggleOptionViewModel<
  K extends 'showAxis' | 'showGrid' | 'snapToGrid'
>(targetKey: K) {
  const active = appState.env[targetKey];
  const setActive = (state: boolean) => (appState.env[targetKey] = state);
  return { active, setActive };
}

export const EditMenuBar = () => {
  const { canUndo, canRedo, undo, redo } = editManager;

  const editorTargetVm = createModeSelectionViewModel('editorTarget', {
    key: 'key',
    outline: 'outline',
    viewbox: 'sight',
  });

  const editModeVm = createModeSelectionViewModel('editMode', {
    select: 'select',
    add: 'add',
    move: 'move',
  });

  const vmShowAxis = createToggleOptionViewModel('showAxis');
  const vmShowGrid = createToggleOptionViewModel('showGrid');
  const vmSnapToGrid = createToggleOptionViewModel('snapToGrid');

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

      <div class="buttonsBox">
        <ToggleButton
          text="axis"
          width={45}
          active={vmShowAxis.active}
          setActive={vmShowAxis.setActive}
        />
        <ToggleButton
          text="grid"
          width={45}
          active={vmShowGrid.active}
          setActive={vmShowGrid.setActive}
        />
        <ToggleButton
          text="snap"
          width={45}
          active={vmSnapToGrid.active}
          setActive={vmSnapToGrid.setActive}
        />
      </div>
    </div>
  );
};
