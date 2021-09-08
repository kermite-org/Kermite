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
  uiActions,
  uiReaders,
} from '~/ui/commonStore';
import { StandardFirmwareEditor_OutputPropsSupplier } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';
import { resourceManagementUtils } from '~/ui/helpers';

export interface IProjectStandardFirmwareEditPageModel {
  standardFirmwareConfig: IKermiteStandardKeyboardSpec;
  canSave: boolean;
  saveHandler(): void;
}

async function inputSavingFirmwareName(): Promise<string | undefined> {
  const allVariationNames =
    uiReaders.editTargetProject?.firmwares.map((it) => it.variationName) || [];
  return await resourceManagementUtils.inputSavingResourceName({
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
  loadSourceFirmwareEntry(variationName: string) {
    if (variationName) {
      store.sourceEntry =
        projectPackagesReader.getEditTargetFirmwareEntryByVariationName(
          'standard',
          variationName,
        )!;
    } else {
      const newVariationId = getNextFirmwareId(readers.existingVariationIds);
      store.sourceEntry = {
        type: 'standard',
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
    uiActions.closeSubPage();
  },
};

export function useProjectStandardFirmwareEditPageModel(
  variationName: string,
): IProjectStandardFirmwareEditPageModel {
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(variationName),
    [variationName],
  );
  const {
    sourceEntry: { standardFirmwareConfig },
    canSave,
  } = readers;
  const { saveHandler } = actions;
  return { standardFirmwareConfig, canSave, saveHandler };
}
