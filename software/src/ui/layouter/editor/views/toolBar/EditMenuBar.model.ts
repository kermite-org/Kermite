import { getObjectKeys } from '~/shared';
import { ISelectorOption } from '~/ui/common';
import {
  IModeState,
  editReader,
  editMutations,
  IEnvBoolPropKey,
  editManager,
} from '~/ui/layouter/editor/store';

function createModeSelectionViewModel<K extends 'editorTarget' | 'editMode'>(
  targetKey: K,
  sources: { [key in IModeState[K]]?: string },
) {
  const options: ISelectorOption[] = getObjectKeys(sources).map((key) => ({
    value: key,
    label: sources[key]!,
  }));
  const value = editReader.getMode(targetKey);
  const setValue = (value: Extract<IModeState[K], string>) => {
    editMutations.setMode(targetKey, value);
  };
  return {
    options,
    value,
    setValue,
  };
}

function createToggleOptionViewModel<K extends IEnvBoolPropKey>(targetKey: K) {
  const active = editReader.getBoolOption(targetKey);
  const setActive = (value: boolean) =>
    editMutations.setBoolOption(targetKey, value);
  return { active, setActive };
}

function makeSnapDivisionViewModel() {
  const divs = [1, 2, 3, 4, 5, 6, 8, 10, 20];
  const options = divs.map((d) => ({
    value: d.toString(),
    label: d === 1 ? '1' : `1/${d}`,
  }));
  const value = editReader.snapDivision.toString();
  const setValue = (id: string) => {
    editMutations.setSnapDivision(parseInt(id));
  };
  return {
    options,
    value,
    setValue,
  };
}

export function makeEditMenuBarViewModel() {
  const editorTargetVm = createModeSelectionViewModel('editorTarget', {
    key: 'key',
    outline: 'outline',
  });

  const editModeVm = createModeSelectionViewModel('editMode', {
    select: 'select',
    move: 'move',
    add: 'add',
    delete: 'delete',
  });

  const vmShowAxis = createToggleOptionViewModel('showAxis');
  const vmShowGrid = createToggleOptionViewModel('showGrid');
  const vmSnapToGrid = createToggleOptionViewModel('snapToGrid');

  const vmSnapDivision = makeSnapDivisionViewModel();

  const { editorTarget } = editReader;
  const canSelectEditMode =
    editorTarget === 'key' || editorTarget === 'outline';

  const resetKeyboardDesign = () => editMutations.resetKeyboardDesign();

  const vmShowKeyId = createToggleOptionViewModel('showKeyId');
  const vmShowKeyIndex = createToggleOptionViewModel('showKeyIndex');

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
    vmSnapDivision,
    canSelectEditMode,
    resetKeyboardDesign,
    vmShowKeyId,
    vmShowKeyIndex,
  };
}
