import { compareObjectByJsonStringify } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/commonStore';
import { resourceManagementUtils } from '~/ui/helpers';

export type ICustomFirmwareEditValues = {
  variationName: string;
  customFirmwareId: string;
};

export const fallbackCustomFirmwareEditValues: ICustomFirmwareEditValues = {
  variationName: '',
  customFirmwareId: '',
};

const store = new (class {
  originalValues: ICustomFirmwareEditValues = fallbackCustomFirmwareEditValues;
  editValues: ICustomFirmwareEditValues = fallbackCustomFirmwareEditValues;
})();

const helpers = {
  getExistingFirmwareNames(excludeName?: string): string[] {
    const projectInfo = uiReaders.editTargetProject;
    return (
      projectInfo?.firmwares
        .map((it) => it.variationName)
        .filter((it) => it !== excludeName) || []
    );
  },
};
const readers = {
  get originalValues(): ICustomFirmwareEditValues {
    return store.originalValues;
  },
  get editValues(): ICustomFirmwareEditValues {
    return store.editValues;
  },
  get allFirmwareOptions(): ISelectorOption[] {
    return uiReaders.allCustomFirmwareInfos
      .filter((info) => info.firmwareProjectPath !== 'standard')
      .map((info) => ({
        value: info.firmwareId,
        label: `${info.firmwareProjectPath}/${info.variationName}`,
      }));
  },
  get canSave(): boolean {
    const { editValues, originalValues } = customFirmwareEditorModel.readers;
    const { variationName, customFirmwareId } = editValues;
    const existingFirmwareNames = helpers.getExistingFirmwareNames(
      originalValues.variationName,
    );
    const modified = !compareObjectByJsonStringify(editValues, originalValues);
    const valid =
      resourceManagementUtils.checkValidResourceName(
        variationName,
        existingFirmwareNames,
        'firmware',
      ) === 'ok';
    return modified && !!variationName && !!customFirmwareId && valid;
  },
};

const actions = {
  loadEditValues(editValues: ICustomFirmwareEditValues) {
    store.originalValues = editValues;
    store.editValues = editValues;
  },
  setVariationName(variationName: string) {
    store.editValues = { ...store.editValues, variationName };
  },
  setCustomFirmwareId(customFirmwareId: string) {
    store.editValues = { ...store.editValues, customFirmwareId };
  },
};

export const customFirmwareEditorModel = {
  readers,
  actions,
};
