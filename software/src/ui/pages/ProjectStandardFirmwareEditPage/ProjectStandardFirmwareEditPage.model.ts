import { useInlineEffect } from 'alumina';
import {
  encodeProjectResourceItemKey,
  fallbackStandardFirmwareEntry,
  fallbackStandardFirmwareConfig,
  getNextFirmwareVariationId,
  IStandardFirmwareConfig,
  IStandardFirmwareEntry,
} from '~/shared';
import { modalConfirm } from '~/ui/components';
import { StandardFirmwareEditor_ExposedModel } from '~/ui/featureEditors';
import { projectResourceStore } from '~/ui/features/ProjectResourcesPart/store';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiActions,
  uiReaders,
} from '~/ui/store';
import { resourceManagementUtils } from '~/ui/utils';

export interface IProjectStandardFirmwareEditPageModel {
  editFirmwareName: string;
  standardFirmwareConfig: IStandardFirmwareConfig;
  canSave: boolean;
  saveHandler(): void;
  backHandler(): void;
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
  get isEdit() {
    return !!store.sourceEntry.firmwareName;
  },
  get canSave() {
    return StandardFirmwareEditor_ExposedModel.canSave;
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
  loadSourceFirmwareEntry(projectKey: string, firmwareName: string) {
    if (firmwareName) {
      const projectInfo =
        projectPackagesReader.findProjectInfoByProjectKey(projectKey);
      const entry = projectInfo?.firmwares.find(
        (it) => it.firmwareName === firmwareName,
      );
      if (!(entry?.type === 'standard')) {
        throw new Error('invalid firmware edit target');
      }
      store.sourceEntry = entry;
    } else {
      const newVariationId = getNextFirmwareVariationId(
        readers.existingVariationIds,
      );
      store.sourceEntry = {
        type: 'standard',
        variationId: newVariationId,
        firmwareName: '',
        standardFirmwareConfig: fallbackStandardFirmwareConfig,
      };
    }
  },
  async saveHandler() {
    const { isEdit } = readers;
    if (!store.sourceEntry.firmwareName) {
      const newVariationName = await inputSavingFirmwareName();
      if (!newVariationName) {
        return;
      }
      store.sourceEntry.firmwareName = newVariationName;
    }
    const { editValues: savingEditValues } =
      StandardFirmwareEditor_ExposedModel;
    const newFirmwareEntry = {
      ...store.sourceEntry,
      standardFirmwareConfig: savingEditValues,
    };
    await projectPackagesWriter.saveLocalProjectResourceItem(
      'firmware',
      newFirmwareEntry,
    );

    projectResourceStore.actions.setSelectedItemKey(
      encodeProjectResourceItemKey('firmware', store.sourceEntry.firmwareName),
    );
    if (!isEdit) {
      uiActions.closeSubPage();
    } else {
      store.sourceEntry = newFirmwareEntry;
    }
  },
  async backHandler() {
    const { isModified } = StandardFirmwareEditor_ExposedModel;
    if (isModified) {
      const ok = await modalConfirm({
        message: 'Unsaved changes will be lost. Are you ok?',
        caption: 'Back',
      });
      if (!ok) {
        return;
      }
    }
    uiActions.closeSubPage();
  },
};

export function useProjectStandardFirmwareEditPageModel(
  projectKey: string,
  sourceFirmwareName: string,
): IProjectStandardFirmwareEditPageModel {
  useInlineEffect(
    () => actions.loadSourceFirmwareEntry(projectKey, sourceFirmwareName),
    [projectKey, sourceFirmwareName],
  );

  const {
    sourceEntry: { standardFirmwareConfig, firmwareName: editFirmwareName },
    canSave,
  } = readers;
  const isNewConfig = !sourceFirmwareName;

  useInlineEffect(
    () =>
      StandardFirmwareEditor_ExposedModel.loadFirmwareConfig(
        standardFirmwareConfig,
        isNewConfig,
      ),
    [standardFirmwareConfig, isNewConfig],
  );

  const { saveHandler, backHandler } = actions;
  return {
    editFirmwareName,
    standardFirmwareConfig,
    canSave,
    saveHandler,
    backHandler,
  };
}
