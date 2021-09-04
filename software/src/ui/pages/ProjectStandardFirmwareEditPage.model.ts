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
import { modalAlert, modalTextEdit } from '~/ui/components';
import { StandardFirmwareEditor_OutputPropsSupplier } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';

export interface IProjectStandardFirmwareEditPageModel {
  variationName: string;
  standardFirmwareConfig: IKermiteStandardKeyboardSpec;
  canSave: boolean;
  saveHandler(): void;
}

const checkValidFirmwareVariationName = async (
  newFirmwareName: string,
): Promise<boolean> => {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-misleading-character-class
  if (!newFirmwareName.match(/^[^/./\\:*?"<>| \u3000\u0e49]+$/)) {
    await modalAlert(
      `${newFirmwareName} is not a valid firmware name. operation cancelled.`,
    );
    return false;
  }
  const projectInfo = uiReaders.editTargetProject;
  const isExist = projectInfo?.firmwares.some(
    (it) => it.variationName === newFirmwareName,
  );
  if (isExist) {
    await modalAlert(
      `${newFirmwareName} is already exists. operation cancelled.`,
    );
    return false;
  }
  return true;
};

async function inputSavingFirmwareName(): Promise<string | undefined> {
  const firmwareName = await modalTextEdit({
    message: 'firmware variation name',
    caption: 'save project firmware',
  });
  if (firmwareName !== undefined) {
    if (await checkValidFirmwareVariationName(firmwareName)) {
      return firmwareName;
    }
  }
  return undefined;
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
  loadSourceFirmwareEntry(variationId: string) {
    if (variationId) {
      store.sourceEntry = projectPackagesReader.getEditTargetFirmwareEntry(
        'standard',
        variationId,
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
  variationId: string,
): IProjectStandardFirmwareEditPageModel {
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(variationId),
    [variationId],
  );
  const {
    sourceEntry: { variationName, standardFirmwareConfig },
    canSave,
  } = readers;
  const { saveHandler } = actions;
  return { variationName, standardFirmwareConfig, canSave, saveHandler };
}
