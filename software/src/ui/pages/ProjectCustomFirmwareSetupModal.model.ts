import { useInlineEffect, useMemo } from 'qx';
import { fallbackCustomFirmwareEntry, ICustomFirmwareEntry } from '~/shared';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiReaders,
} from '~/ui/commonStore';
import { CustomFirmwareEditor_OutputPropsSupplier } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor';
import { getNextFirmwareId } from '~/ui/features/LayoutEditor/models/DomainRelatedHelpers';

const store = new (class {
  sourceEntry: ICustomFirmwareEntry = fallbackCustomFirmwareEntry;
})();

const readers = {
  get sourceEntry(): ICustomFirmwareEntry {
    return store.sourceEntry;
  },
  get canSave() {
    return CustomFirmwareEditor_OutputPropsSupplier.canSave;
  },
  get existingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
};

const actions = {
  loadSourceFirmwareEntry(variationId: string) {
    if (variationId) {
      store.sourceEntry = projectPackagesReader.getEditTargetFirmwareEntry(
        'custom',
        variationId,
      )!;
    } else {
      const newVariationId = getNextFirmwareId(readers.existingVariationIds);
      store.sourceEntry = {
        type: 'custom',
        variationId: newVariationId,
        variationName: '',
        customFirmwareId: '',
      };
    }
  },
  saveHandler() {
    const { emitSavingEditValues } = CustomFirmwareEditor_OutputPropsSupplier;
    const { variationName, customFirmwareId } = emitSavingEditValues();
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
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(variationId),
    [variationId],
  );
  const { canSave, sourceEntry } = readers;

  const sourceEditValues = useMemo(
    () => ({
      variationName: sourceEntry.variationName,
      customFirmwareId: sourceEntry.customFirmwareId,
    }),
    [sourceEntry],
  );

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
