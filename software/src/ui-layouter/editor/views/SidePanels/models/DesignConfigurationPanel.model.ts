import { IKeyPlacementAnchor, IKeySizeUnit } from '~/shared';
import { useClosureModel } from '~/ui-layouter/base';
import { ICommonSelectorViewModel } from '~/ui-layouter/controls';
import { editReader, editMutations } from '~/ui-layouter/editor/store';
import {
  createConfigTextEditModel,
  IConfigTextEditModel,
} from '~/ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { makeSelectorModel } from '~/ui-layouter/editor/views/SidePanels/models/slots/SelectorModel';

function getPlacementUnitInputTextFromModel(): string | undefined {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.placementUnit.replace('KP ', '');
  }
  return undefined;
}

function createModels() {
  const vmPlacementUnitMode = makeSelectorModel<'mm' | 'KP'>({
    sources: [
      ['mm', 'mm'],
      ['KP', 'KP'],
    ],
    reader: () => editReader.coordUnitSuffix,
    writer: (newChoiceId: 'mm' | 'KP') => {
      const unitSpec = newChoiceId === 'mm' ? 'mm' : 'KP 19';
      editMutations.setPlacementUnit(unitSpec);
    },
  });

  const vmPlacementUnitText = createConfigTextEditModel(
    [/^[0-9][0-9.]*$/, /^[0-9][0-9.]* [0-9][0-9.]*$/],
    (text) => {
      editMutations.setPlacementUnit(`KP ${text}`);
    },
  );

  const vmSizeUnitMode = makeSelectorModel<IKeySizeUnit>({
    sources: [
      ['KP', 'U'],
      ['mm', 'mm'],
    ],
    reader: () => editReader.keySizeUnit,
    writer: (sizeUnit) => editMutations.setSizeUnit(sizeUnit),
  });

  const vmPlacementAnchorMode = makeSelectorModel<IKeyPlacementAnchor>({
    sources: [
      ['topLeft', 'top-left'],
      ['center', 'center'],
    ],
    reader: () => editReader.placementAnchor,
    writer: (anchor) => editMutations.setPlacementAnchor(anchor),
  });

  return () => {
    const unitInputText = getPlacementUnitInputTextFromModel();
    vmPlacementUnitText.update(unitInputText);

    return {
      vmPlacementUnitMode,
      vmPlacementUnitText,
      vmSizeUnitMode,
      vmPlacementAnchorMode,
    };
  };
}

export function useDesignConfigurationPanelModel(): {
  vmPlacementUnitMode: ICommonSelectorViewModel;
  vmPlacementUnitText: IConfigTextEditModel;
  vmSizeUnitMode: ICommonSelectorViewModel;
  vmPlacementAnchorMode: ICommonSelectorViewModel;
} {
  return useClosureModel(createModels);
}
