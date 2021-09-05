import { useInlineEffect } from 'qx';
import { fallbackCustomFirmwareEntry, ICustomFirmwareEntry } from '~/shared';
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
import { getNextFirmwareId } from '~/ui/features/LayoutEditor/models/DomainRelatedHelpers';

const helpers = {
  getExistingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
  getSourceFirmwareEntryOrCreate(variationId: string): ICustomFirmwareEntry {
    if (variationId) {
      return projectPackagesReader.getEditTargetFirmwareEntry(
        'custom',
        variationId,
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
  get editTargetVariationName(): string {
    return state.sourceEntry.variationName || '(new)';
  },
  get canSave(): boolean {
    return CustomFirmwareEditor_OutputPropsSupplier.canSave;
  },
};

const actions = {
  loadEditValues(variationId: string) {
    state.sourceEntry = helpers.getSourceFirmwareEntryOrCreate(variationId);
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
  variationId: string,
  close: () => void,
) {
  useInlineEffect(() => actions.loadEditValues(variationId), [variationId]);
  const { sourceEditValues, canSave, editTargetVariationName } = readers;
  const saveHandler = () => {
    actions.saveHandler();
    close();
  };
  return {
    editTargetVariationName,
    sourceEditValues,
    canSave,
    saveHandler,
  };
}
