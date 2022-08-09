import { getObjectKeys } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import {
  editMutations,
  editReader,
  IEditMode,
  IEnvBoolPropKey,
} from '~/ui/featureEditors/layoutEditor/models';
import {
  gridPitchSelectorOptions,
  IGridSpecKey,
} from '~/ui/featureEditors/layoutEditor/models/gridDefinitions';

function createModeSelectionViewModel(sources: {
  [key in IEditMode]?: string;
}) {
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
  let options = gridPitchSelectorOptions;
  if (!editReader.isPlacementUnitKpBased) {
    options = options.filter((option) => option.value.startsWith('mm'));
  }
  return {
    options,
    value: editReader.gridSpecKey,
    setValue: (value: string) =>
      editMutations.setGridSpecKey(value as IGridSpecKey),
  };
}

export function makeEditMenuBarViewModel() {
  const editModeVm = createModeSelectionViewModel({
    select: 'select',
    move: 'move',
    key: 'key',
    shape: 'shape',
    delete: 'delete',
    shape_ex: 'shape_ex',
  });

  const vmShowAxis = createToggleOptionViewModel('showAxis');
  const vmShowGrid = createToggleOptionViewModel('showGrid');
  const vmSnapToGrid = createToggleOptionViewModel('snapToGrid');

  const vmSnapDivision = makeSnapDivisionViewModel();

  const resetKeyboardDesign = () => editMutations.resetKeyboardDesign();

  const vmShowKeyId = createToggleOptionViewModel('showKeyId');
  const vmShowKeyIndex = createToggleOptionViewModel('showKeyIndex');

  return {
    canUndo: editMutations.canUndo,
    canRedo: editMutations.canRedo,
    undo: () => editMutations.undo(),
    redo: () => editMutations.redo(),
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
