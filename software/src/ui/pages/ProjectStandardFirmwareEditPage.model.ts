import { useInlineEffect } from 'qx';
import {
  fallbackStandardFirmwareEntry,
  fallbackStandardKeyboardSpec,
  getNextFirmwareId,
  IKermiteStandardKeyboardSpec,
  IStandardFirmwareEntry,
} from '~/shared';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiReaders,
} from '~/ui/commonStore';
import { StandardFirmwareEditor_OutputPropsSupplier } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';
import { inputSavingResourceName } from '~/ui/helpers';

export interface IProjectStandardFirmwareEditPageModel {
  variationName: string;
  standardFirmwareConfig: IKermiteStandardKeyboardSpec;
  canSave: boolean;
  saveHandler(): void;
}

async function inputSavingFirmwareName(): Promise<string | undefined> {
  const allVariationNames =
    uiReaders.editTargetProject?.firmwares.map((it) => it.variationName) || [];
  return await inputSavingResourceName({
    modalTitle: 'save project firmware',
    modalMessage: 'firmware variation name',
    resourceTypeNameText: 'firmware variation name',
    existingResourceNames: allVariationNames,
  });
}

const store = new (class {
  sourceEntry: IStandardFirmwareEntry = fallbackStandardFirmwareEntry;
})();

const readers = {
  get canSave() {
    return StandardFirmwareEditor_OutputPropsSupplier.canSave;
  },
  get sourceEntry(): IStandardFirmwareEntry {
    return store.sourceEntry;
  },
  get existingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
};

const actions = {
  loadSourceFirmwareEntry(resourceId: string) {
    if (resourceId) {
      store.sourceEntry = projectPackagesReader.getEditTargetFirmwareEntry(
        'standard',
        resourceId,
      )!;
    } else {
      const newVariationId = getNextFirmwareId(readers.existingVariationIds);
      const newResourceId = `fw${newVariationId}`;
      store.sourceEntry = {
        type: 'standard',
        resourceId: newResourceId,
        variationId: newVariationId,
        variationName: '',
        standardFirmwareConfig: fallbackStandardKeyboardSpec,
      };
    }
  },
  async saveHandler() {
    if (!store.sourceEntry.variationName) {
      const newVariationName = await inputSavingFirmwareName();
      if (!newVariationName) {
        return;
      }
      store.sourceEntry.variationName = newVariationName;
    }
    const { emitSavingEditValues } = StandardFirmwareEditor_OutputPropsSupplier;
    const newFirmwareEntry = {
      ...store.sourceEntry,
      standardFirmwareConfig: emitSavingEditValues(),
    };
    projectPackagesWriter.saveLocalProjectFirmware(newFirmwareEntry);
  },
};

export function useProjectStandardFirmwareEditPageModel(
  resourceId: string,
): IProjectStandardFirmwareEditPageModel {
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(resourceId),
    [resourceId],
  );
  const {
    sourceEntry: { variationName, standardFirmwareConfig },
    canSave,
  } = readers;
  const { saveHandler } = actions;
  return { variationName, standardFirmwareConfig, canSave, saveHandler };
}
