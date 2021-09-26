import { useInlineEffect } from 'qx';
import {
  encodeProjectResourceItemKey,
  fallbackCustomFirmwareEntry,
  getNextFirmwareId,
  ICustomFirmwareEntry,
} from '~/shared';
import { uiConfiguration } from '~/ui/base';
import {
  CustomFirmwareEditor_OutputPropsSupplier,
  fallbackCustomFirmwareEditValues,
  ICustomFirmwareEditValues,
} from '~/ui/editors';
import { inputSavingFirmwareName } from '~/ui/pages/ProjectStandardFirmwareEditPage/ProjectStandardFirmwareEditPage.model';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiActions,
  uiReaders,
  projectResourceStore,
} from '~/ui/store';

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
    projectResourceStore.actions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', state.sourceEntry.firmwareName),
    );
    if (!uiConfiguration.closeProjectResourceEditPageOnSave) {
      state.sourceEntry = newFirmwareEntry;
      state.sourceEditValues = helpers.makeEditValuesFromFirmwareEntry(
        state.sourceEntry,
      );
    } else {
      uiActions.closeSubPage();
    }
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
