import { ICommonSelectorViewModel } from '~/controls';
import { editMutations, editReader, IKeySizeUnit } from '~/editor/store';
import {
  createConfigTextEditModel,
  IConfigTextEditModel,
} from '~/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { Hook } from '~/qx';

const makePlacementUnitTextModel = (): IConfigTextEditModel =>
  createConfigTextEditModel(
    [/^[0-9][0-9.]*$/, /^[0-9][0-9.]* [0-9][0-9.]*$/],
    (text) => {
      editMutations.setPlacementUnit(`KP ${text}`);
    }
  );

function getPlacementUnitInputTextFromModel(): string | undefined {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.placementUnit.replace('KP ', '');
  }
  return undefined;
}

function makePlacementUnitModeModel(): ICommonSelectorViewModel {
  const options = ['mm', 'KP'].map((v) => ({
    id: v,
    text: v,
  }));

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

function makeSizeUnitModeModel(): ICommonSelectorViewModel {
  const options = ['KP', 'mm'].map((v) => ({
    id: v,
    text: v === 'KP' ? 'U' : v,
  }));

  const choiceId = editReader.keySizeUnit;
  const setChoiceId = (newChoiceId: IKeySizeUnit) => {
    editMutations.setSizeUnit(newChoiceId);
  };
  return {
    options,
    choiceId,
    setChoiceId,
  };
}

export function useDesignConfigurationPanelModel() {
  const vmPlacementUnitText = Hook.useMemo(makePlacementUnitTextModel, []);
  const unitInputText = getPlacementUnitInputTextFromModel();
  vmPlacementUnitText.update(unitInputText);

  const vmPlacementUnitMode = makePlacementUnitModeModel();
  const vmSizeUnitMode = makeSizeUnitModeModel();

  return {
    vmPlacementUnitMode,
    vmPlacementUnitText,
    vmSizeUnitMode,
  };
}
