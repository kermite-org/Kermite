import { IKeyIdMode, IKeyPlacementAnchor, IKeySizeUnit } from '~/shared';
import { ICommonSelectorViewModel } from '~/ui-common';
import { useClosureModel } from '~/ui-layouter/base';
import { editReader, editMutations } from '~/ui-layouter/editor/store';
import {
  createConfigTextEditModel,
  IConfigTextEditModel,
} from '~/ui-layouter/editor/views/SidePanels/models/slots/ConfigTextEditModel';
import { makeSelectorModel } from '~/ui-layouter/editor/views/SidePanels/models/slots/SelectorModel';

function getPlacementUnitInputTextFromModel(): string | undefined {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.setup.placementUnit.replace('KP ', '');
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
    writer: (newValue: 'mm' | 'KP') => {
      const unitSpec = newValue === 'mm' ? 'mm' : 'KP 19';
      editMutations.setPlacementUnit(unitSpec);
    },
  });

  const vmPlacementUnitText = createConfigTextEditModel(
    (text) => {
      const textValid = [/^\d+\.?\d*$/, /^\d+\.?\d* \d+\.?\d*$/].some((p) =>
        text.match(p),
      );
      if (textValid) {
        const values = text.split(' ').map((str) => parseFloat(str));
        return values.every((val) => val >= 5);
      }
      return false;
    },
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

  const vmKeyIdMode = makeSelectorModel<IKeyIdMode>({
    sources: [
      ['auto', 'auto'],
      ['manual', 'manual'],
    ],
    reader: () => editReader.keyIdMode,
    writer: (mode) => editMutations.setKeyIdMode(mode),
  });

  return () => {
    const unitInputText = getPlacementUnitInputTextFromModel();
    vmPlacementUnitText.update(unitInputText);

    return {
      vmPlacementUnitMode,
      vmPlacementUnitText,
      vmSizeUnitMode,
      vmPlacementAnchorMode,
      vmKeyIdMode,
    };
  };
}

export function useDesignConfigurationPanelModel(): {
  vmPlacementUnitMode: ICommonSelectorViewModel;
  vmPlacementUnitText: IConfigTextEditModel;
  vmSizeUnitMode: ICommonSelectorViewModel;
  vmPlacementAnchorMode: ICommonSelectorViewModel;
  vmKeyIdMode: ICommonSelectorViewModel;
} {
  return useClosureModel(createModels);
}
