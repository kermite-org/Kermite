import { useInlineEffect } from 'qx';
import { fallbackCustomFirmwareEntry, ICustomFirmwareEntry } from '~/shared';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiReaders,
} from '~/ui/commonStore';
import { CustomFirmwareEditor } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';
import { ICustomFirmwareEditValues } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';
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
})();

const readers = {
  get sourceEntry(): ICustomFirmwareEntry {
    return state.sourceEntry;
  },
  get editTargetVariationName(): string {
    return state.sourceEntry.variationName || '(new)';
  },
  get canSave(): boolean {
    return CustomFirmwareEditor.canSave;
  },
};

const actions = {
  loadEditValues(variationId: string) {
    const sourceEntry = helpers.getSourceFirmwareEntryOrCreate(variationId);
    const sourceEditValues =
      helpers.makeEditValuesFromFirmwareEntry(sourceEntry);
    state.sourceEntry = sourceEntry;
    CustomFirmwareEditor.load(sourceEditValues);
  },
  saveHandler() {
    const { variationName, customFirmwareId } = CustomFirmwareEditor.save();
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
  const { canSave, editTargetVariationName } = readers;
  const saveHandler = () => {
    actions.saveHandler();
    close();
  };
  return {
    editTargetVariationName,
    canSave,
    saveHandler,
  };
}
