import { ISelectOption } from '~/controls';
import {
  editManager,
  editMutations,
  editReader,
  IModeState,
} from '~/editor/models';

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
  const active = editReader.getBoolOption(targetKey);
  const setActive = (value: boolean) =>
    editMutations.setBoolOption(targetKey, value);
  return { active, setActive };
}

export function makeEditMenuBarViewModel() {
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

  return {
    canUndo: editManager.canUndo,
    canRedo: editManager.canRedo,
    undo: () => editManager.undo(),
    redo: () => editManager.redo(),
    editorTargetVm,
    editModeVm,
    vmShowAxis,
    vmShowGrid,
    vmSnapToGrid,
  };
}
