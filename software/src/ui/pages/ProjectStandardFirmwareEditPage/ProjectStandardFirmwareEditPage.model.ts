import { useInlineEffect } from 'qx';
import {
  encodeProjectResourceItemKey,
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
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core';

export interface IProjectStandardFirmwareEditPageModel {
  standardFirmwareConfig: IKermiteStandardKeyboardSpec;
  canSave: boolean;
  saveHandler(): void;
}

export async function inputSavingFirmwareName(): Promise<string | undefined> {
  const allVariationNames =
    uiReaders.editTargetProject?.firmwares.map((it) => it.firmwareName) || [];
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
  loadSourceFirmwareEntry(firmwareName: string) {
    if (firmwareName) {
      store.sourceEntry =
        projectPackagesReader.getEditTargetFirmwareEntryByFirmwareName(
          'standard',
          firmwareName,
        )!;
    } else {
      const newVariationId = getNextFirmwareId(readers.existingVariationIds);
      store.sourceEntry = {
        type: 'standard',
        variationId: newVariationId,
        firmwareName: '',
        standardFirmwareConfig: fallbackStandardKeyboardSpec,
      };
    }
  },
  async saveHandler() {
    if (!store.sourceEntry.firmwareName) {
      const newVariationName = await inputSavingFirmwareName();
      if (!newVariationName) {
        return;
      }
      store.sourceEntry.firmwareName = newVariationName;
    }
    const { emitSavingEditValues } = StandardFirmwareEditor_OutputPropsSupplier;
    const newFirmwareEntry = {
      ...store.sourceEntry,
      standardFirmwareConfig: emitSavingEditValues(),
    };
    projectPackagesWriter.saveLocalProjectFirmware(newFirmwareEntry);

    projectResourceActions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', store.sourceEntry.firmwareName),
    );
    uiActions.closeSubPage();
  },
};

export function useProjectStandardFirmwareEditPageModel(
  firmwareName: string,
): IProjectStandardFirmwareEditPageModel {
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(firmwareName),
    [firmwareName],
  );
  const {
    sourceEntry: { standardFirmwareConfig },
    canSave,
  } = readers;
  const { saveHandler } = actions;
  return { standardFirmwareConfig, canSave, saveHandler };
}
