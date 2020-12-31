import { useClosureModel } from '~/base/hooks';
import { ICommonSelectorViewModel } from '~/controls';
import {
  editMutations,
  editReader,
  IKeyPlacementAnchor,
  IKeySizeUnit,
} from '~/editor/store';
import {
  createConfigTextEditModel,
  IConfigTextEditModel,
} from '~/editor/views/SidePanels/models/slots/ConfigTextEditModel';

function getPlacementUnitInputTextFromModel(): string | undefined {
  const mode = editReader.coordUnitSuffix;
  if (mode === 'KP') {
    return editReader.design.placementUnit.replace('KP ', '');
  }
  return undefined;
}

function makeSelectorModel<T extends string>(props: {
  sources: { [key in T]: string };
  reader: () => T;
  writer: (choiceId: T) => void;
}): ICommonSelectorViewModel {
  const { sources, reader, writer } = props;
  const options = (Object.keys(sources) as T[]).map((key) => ({
    id: key,
    text: sources[key],
  }));
  return {
    options,
    get choiceId() {
      return reader();
    },
    setChoiceId: writer,
  };
}

function createModels() {
  const vmPlacementUnitMode = makeSelectorModel<'mm' | 'KP'>({
    sources: { mm: 'mm', KP: 'KP' },
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
    }
  );

  const vmSizeUnitMode = makeSelectorModel<IKeySizeUnit>({
    sources: { KP: 'U', mm: 'mm' },
    reader: () => editReader.keySizeUnit,
    writer: (sizeUnit) => editMutations.setSizeUnit(sizeUnit),
  });

  const vmPlacementAnchorMode = makeSelectorModel<IKeyPlacementAnchor>({
    sources: { topLeft: 'top-left', center: 'center' },
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
