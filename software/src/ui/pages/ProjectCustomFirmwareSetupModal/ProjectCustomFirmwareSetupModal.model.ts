import { useInlineEffect } from 'qx';
import {
  encodeProjectResourceItemKey,
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
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/core';

const helpers = {
  getExistingVariationIds(): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return projectInfo?.firmwares.map((it) => it.variationId) || [];
  },
  getSourceFirmwareEntryOrCreate(firmwareName: string): ICustomFirmwareEntry {
    if (firmwareName) {
      return projectPackagesReader.getEditTargetFirmwareEntryByFirmwareName(
        'custom',
        firmwareName,
      )!;
    } else {
      const newVariationId = getNextFirmwareId(
        helpers.getExistingVariationIds(),
      );
      return {
        type: 'custom',
        variationId: newVariationId,
        firmwareName: '',
        customFirmwareId: '',
      };
    }
  },
  makeEditValuesFromFirmwareEntry(
    sourceEntry: ICustomFirmwareEntry,
  ): ICustomFirmwareEditValues {
    return {
      firmwareName: sourceEntry.firmwareName,
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
  loadEditValues(firmwareName: string) {
    state.sourceEntry = helpers.getSourceFirmwareEntryOrCreate(firmwareName);
    state.sourceEditValues = helpers.makeEditValuesFromFirmwareEntry(
      state.sourceEntry,
    );
  },
  saveHandler() {
    const { firmwareName, customFirmwareId } =
      CustomFirmwareEditor_OutputPropsSupplier.emitSavingEditValues();
    const { sourceEntry } = readers;
    const originalName = sourceEntry.firmwareName;
    const newFirmwareEntry = {
      ...sourceEntry,
      firmwareName,
      customFirmwareId,
    };
    const nameChanged = !!originalName && firmwareName !== originalName;
    if (nameChanged) {
      projectPackagesWriter.saveLocalProjectFirmwareWithRename(
        newFirmwareEntry,
        originalName,
      );
    } else {
      projectPackagesWriter.saveLocalProjectFirmware(newFirmwareEntry);
    }
    projectResourceActions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', firmwareName),
    );
  },
};

export function useProjectCustomFirmwareSetupModalModel(
  firmwareName: string,
  close: () => void,
) {
  useInlineEffect(() => actions.loadEditValues(firmwareName), [firmwareName]);
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
