import { useInlineEffect } from 'qx';
import {
  fallbackCustomFirmwareEntry,
  getNextFirmwareId,
  ICustomFirmwareEntry,
} from '~/shared';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiReaders,
} from '~/ui/commonStore';
import { CustomFirmwareEditor_OutputPropsSupplier } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';
import {
  fallbackCustomFirmwareEditValues,
  ICustomFirmwareEditValues,
} from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';

const helpers = {
  getExistingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
  getSourceFirmwareEntryOrCreate(variationName: string): ICustomFirmwareEntry {
    if (variationName) {
      return projectPackagesReader.getEditTargetFirmwareEntryByVariationName(
        'custom',
        variationName,
      )!;
    } else {
      const newVariationId = getNextFirmwareId(
        helpers.getExistingVariationIds(),
      );
      return {
        type: 'custom',
        variationId: newVariationId,
        variationName: '',
        customFirmwareId: '',
      };
    }
  },
  makeEditValuesFromFirmwareEntry(
    sourceEntry: ICustomFirmwareEntry,
  ): ICustomFirmwareEditValues {
    return {
      variationName: sourceEntry.variationName,
      customFirmwareId: sourceEntry.customFirmwareId,
    };
  },
};

const state = new (class {
  sourceEntry: ICustomFirmwareEntry = fallbackCustomFirmwareEntry;
  sourceEditValues: ICustomFirmwareEditValues =
    fallbackCustomFirmwareEditValues;
})();

const readers = {
  get sourceEntry(): ICustomFirmwareEntry {
    return state.sourceEntry;
  },
  get sourceEditValues(): ICustomFirmwareEditValues {
    return state.sourceEditValues;
  },
  get canSave(): boolean {
    return CustomFirmwareEditor_OutputPropsSupplier.canSave;
  },
};

const actions = {
  loadEditValues(variationName: string) {
    state.sourceEntry = helpers.getSourceFirmwareEntryOrCreate(variationName);
    state.sourceEditValues = helpers.makeEditValuesFromFirmwareEntry(
      state.sourceEntry,
    );
  },
  saveHandler() {
    const { variationName, customFirmwareId } =
      CustomFirmwareEditor_OutputPropsSupplier.emitSavingEditValues();
    const newFirmwareEntry = {
      ...readers.sourceEntry,
      variationName,
      customFirmwareId,
    };
    projectPackagesWriter.saveLocalProjectFirmware(newFirmwareEntry);
  },
};

export function useProjectCustomFirmwareSetupModalModel(
  variationName: string,
  close: () => void,
) {
  useInlineEffect(() => actions.loadEditValues(variationName), [variationName]);
  const { sourceEditValues, canSave } = readers;
  const saveHandler = () => {
    actions.saveHandler();
    close();
  };
  return {
    sourceEditValues,
    canSave,
    saveHandler,
  };
}
