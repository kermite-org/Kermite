import { getObjectKeys } from '~/shared';
import { ISelectorOption } from '~/ui/common';
import {
  editManager,
  editMutations,
  editReader,
  IEditMode,
  IEnvBoolPropKey,
} from '~/ui/layouter/models';

function createModeSelectionViewModel(
  sources: { [key in IEditMode]?: string },
) {
  const options: ISelectorOption[] = getObjectKeys(sources).map((key) => ({
    value: key,
    label: sources[key]!,
  }));
  const value = editReader.editMode;
  const setValue = (value: IEditMode) => {
    editMutations.setMode(value);
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
  const editModeVm = createModeSelectionViewModel({
    select: 'select',
    move: 'move',
    key: 'key',
    shape: 'shape',
    delete: 'delete',
  });

  const vmShowAxis = createToggleOptionViewModel('showAxis');
  const vmShowGrid = createToggleOptionViewModel('showGrid');
  const vmSnapToGrid = createToggleOptionViewModel('snapToGrid');

  const vmSnapDivision = makeSnapDivisionViewModel();

  const resetKeyboardDesign = () => editMutations.resetKeyboardDesign();

  const vmShowKeyId = createToggleOptionViewModel('showKeyId');
  const vmShowKeyIndex = createToggleOptionViewModel('showKeyIndex');

  return {
    canUndo: editManager.canUndo,
    canRedo: editManager.canRedo,
    undo: () => editManager.undo(),
    redo: () => editManager.redo(),
    editModeVm,
    vmShowAxis,
    vmShowGrid,
    vmSnapToGrid,
    vmSnapDivision,
    resetKeyboardDesign,
    vmShowKeyId,
    vmShowKeyIndex,
  };
}
