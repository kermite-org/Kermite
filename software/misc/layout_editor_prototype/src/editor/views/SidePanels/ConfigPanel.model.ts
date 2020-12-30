import { ICommonSelectorViewModel } from '~/controls';
import { editMutations, editReader } from '~/editor/models';
import { ConfigTextEditModel } from '~/editor/viewModels/ConfigTextEditModel';

function getUnitInputTextFromModel() {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.placementUnit.replace('KP ', '');
  }
  return undefined;
}

function makeUnitModeSelectorViewModel(): ICommonSelectorViewModel {
  const options = ['mm', 'KP'].map((v) => ({ id: v, text: v }));

  const choiceId = editReader.coordUnitSuffix;
  const setChoiceId = (newChoiceId: 'mm' | 'KP') => {
    const unitSpec = newChoiceId === 'mm' ? 'mm' : 'KP 19';
    editMutations.setPlacementUnit(unitSpec);
  };
  return {
    options,
    choiceId,
    setChoiceId,
  };
}

const vmUnitInput = new ConfigTextEditModel(
  [/^[0-9][0-9.]*$/, /^[0-9][0-9.]* [0-9][0-9.]*$/],
  (text) => {
    editMutations.setPlacementUnit(`KP ${text}`);
  }
);

export function makePlacementUnitEditRowViewModel() {
  const vmUnitMode = makeUnitModeSelectorViewModel();

  const unitInputText = getUnitInputTextFromModel();
  vmUnitInput.update(unitInputText);

  return {
    vmUnitMode,
    vmUnitInput,
  };
}
