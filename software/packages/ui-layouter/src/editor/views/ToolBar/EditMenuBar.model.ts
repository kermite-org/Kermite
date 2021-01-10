import { ISelectOption } from '~/controls';
import {
  editManager,
  editMutations,
  editReader,
  IEnvBoolPropKey,
  IModeState,
} from '~/editor/store';

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

function createToggleOptionViewModel<K extends IEnvBoolPropKey>(targetKey: K) {
  const active = editReader.getBoolOption(targetKey);
  const setActive = (value: boolean) =>
    editMutations.setBoolOption(targetKey, value);
  return { active, setActive };
}

function makeSnapDivisionViewModel() {
  const divs = [1, 2, 3, 4, 5, 6, 8, 10, 20];
  const options = divs.map((d) => ({
    id: d.toString(),
    text: d === 1 ? '1' : `1/${d}`,
  }));
  const choiceId = editReader.snapDivision.toString();
  const setChoiceId = (id: string) => {
    editMutations.setSnapDivision(parseInt(id));
  };
  return {
    options,
    choiceId,
    setChoiceId,
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

  const vmShowConfig = createToggleOptionViewModel('showConfig');

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
    vmShowConfig,
    canSelectEditMode,
    resetKeyboardDesign,
    vmShowKeyId,
    vmShowKeyIndex,
  };
}
