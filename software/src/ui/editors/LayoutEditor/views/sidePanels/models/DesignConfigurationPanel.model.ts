import {
  defaultKeyboardDesignSetup,
  IKeyIdMode,
  IKeyPlacementAnchor,
} from '~/shared';
import { ICommonSelectorViewModel } from '~/ui/base';
import { useClosureModel } from '~/ui/editors/LayoutEditor/common';
import { editReader, editMutations } from '~/ui/editors/LayoutEditor/models';
import {
  createConfigTextEditModel,
  IConfigTextEditModel,
} from '~/ui/editors/LayoutEditor/views/sidePanels/models/slots/ConfigTextEditModel';
import { makeSelectorModel } from '~/ui/editors/LayoutEditor/views/sidePanels/models/slots/SelectorModel';

interface IDesignConfigurationPanelModel {
  vmPlacementUnitMode: ICommonSelectorViewModel;
  vmPlacementUnitText: IConfigTextEditModel;
  vmPlacementAnchorMode: ICommonSelectorViewModel;
  vmKeySizeUnitMode: ICommonSelectorViewModel;
  vmKeySizeUnitText: IConfigTextEditModel;
  vmKeyIdMode: ICommonSelectorViewModel;
}

function getPlacementUnitInputTextFromModel(): string | undefined {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.setup.placementUnit.replace('KP ', '');
  }
  return undefined;
}

function getKeySizeUnitInputTextFromModel(): string | undefined {
  const mode = editReader.sizeUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.setup.keySizeUnit.replace('KP ', '');
  }
  return undefined;
}

function createModels(): () => IDesignConfigurationPanelModel {
  const defaultKeyUnitSpec = defaultKeyboardDesignSetup.placementUnit;
  const defaultKeySizeSpec = defaultKeyboardDesignSetup.keySizeUnit;

  const vmPlacementUnitMode = makeSelectorModel<'mm' | 'KP'>({
    sources: [
      ['mm', 'mm'],
      ['KP', 'KP'],
    ],
    reader: () => editReader.coordUnitSuffix,
    writer: (newValue: 'mm' | 'KP') => {
      const unitSpec = newValue === 'mm' ? 'mm' : defaultKeyUnitSpec;
      editMutations.setPlacementUnit(unitSpec);
    },
  });

  const vmPlacementUnitText = createConfigTextEditModel(
    (text) => {
      const textValid = [/^\d+\.?\d*$/, /^\d+\.?\d* \d+\.?\d*$/].some((p) =>
        text.match(p),
      );
      if (textValid) {
        const texts = text.split(' ');
        if (texts.some((t) => t.length > 8)) {
          return false;
        }
        const values = texts.map((str) => parseFloat(str));
        return values.every((val) => val >= 5);
      }
      return false;
    },
    (text) => {
      editMutations.setPlacementUnit(`KP ${text}`);
    },
  );

  const vmKeySizeUnitMode = makeSelectorModel<'mm' | 'KP'>({
    sources: [
      ['mm', 'mm'],
      ['KP', 'U'],
    ],
    reader: () => editReader.sizeUnitSuffix,
    writer: (newValue: 'mm' | 'KP') => {
      const unitSpec = newValue === 'mm' ? 'mm' : defaultKeySizeSpec;
      editMutations.setKeySizeUnit(unitSpec);
    },
  });

  const vmKeySizeUnitText = createConfigTextEditModel(
    (text) => {
      const textValid = [/^\d+\.?\d*$/, /^\d+\.?\d* \d+\.?\d*$/].some((p) =>
        text.match(p),
      );
      if (textValid) {
        const texts = text.split(' ');
        if (texts.some((t) => t.length > 8)) {
          return false;
        }
        const values = texts.map((str) => parseFloat(str));
        return values.every((val) => val >= 1);
      }
      return false;
    },
    (text) => {
      editMutations.setKeySizeUnit(`KP ${text}`);
    },
  );

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
    const placementUnitInputText = getPlacementUnitInputTextFromModel();
    vmPlacementUnitText.update(placementUnitInputText);
    const keySizeUnitInputText = getKeySizeUnitInputTextFromModel();
    vmKeySizeUnitText.update(keySizeUnitInputText);
    return {
      vmPlacementUnitMode,
      vmPlacementUnitText,
      vmKeySizeUnitMode,
      vmKeySizeUnitText,
      vmPlacementAnchorMode,
      vmKeyIdMode,
    };
  };
}

export function useDesignConfigurationPanelModel(): IDesignConfigurationPanelModel {
  return useClosureModel(createModels);
}
