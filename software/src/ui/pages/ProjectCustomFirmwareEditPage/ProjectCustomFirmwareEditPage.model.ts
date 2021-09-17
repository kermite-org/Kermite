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
import { inputSavingFirmwareName } from '~/ui/pages/ProjectStandardFirmwareEditPage/ProjectStandardFirmwareEditPage.model';

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
  async saveHandler() {
    if (!state.sourceEntry.firmwareName) {
      const newVariationName = await inputSavingFirmwareName();
      if (!newVariationName) {
        return;
      }
      state.sourceEntry.firmwareName = newVariationName;
    }
    const { customFirmwareId } =
      CustomFirmwareEditor_OutputPropsSupplier.emitSavingEditValues();
    const { sourceEntry } = readers;
    const newFirmwareEntry = {
      ...sourceEntry,
      customFirmwareId,
    };
    projectPackagesWriter.saveLocalProjectFirmware(newFirmwareEntry);
    projectResourceActions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', state.sourceEntry.firmwareName),
    );
    // uiActions.closeSubPage();
    state.sourceEntry = newFirmwareEntry;
    state.sourceEditValues = helpers.makeEditValuesFromFirmwareEntry(
      state.sourceEntry,
    );
  },
};

export function useProjectCustomFirmwareEditPageModel(
  sourceFirmwareName: string,
) {
  useInlineEffect(
    () => actions.loadEditValues(sourceFirmwareName),
    [sourceFirmwareName],
  );
  const { sourceEditValues, canSave } = readers;
  const { saveHandler } = actions;
  return {
    editFirmwareName: state.sourceEntry.firmwareName,
    sourceEditValues,
    canSave,
    saveHandler,
  };
}
