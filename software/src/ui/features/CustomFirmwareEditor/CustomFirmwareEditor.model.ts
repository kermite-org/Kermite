import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/commonStore';

export type ICustomFirmwareEditValues = {
  variationName: string;
  customFirmwareId: string;
};

export const fallbackCustomFirmwareEditValues: ICustomFirmwareEditValues = {
  variationName: '',
  customFirmwareId: '',
};

const store = new (class {
  editValues: ICustomFirmwareEditValues = fallbackCustomFirmwareEditValues;
})();

const readers = {
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
};

const actions = {
  loadEditValues(editValues: ICustomFirmwareEditValues) {
    store.editValues = editValues;
  },
  setVariationName(variationName: string) {
    store.editValues.variationName = variationName;
  },
  setCustomFirmwareId(customFirmwareId: string) {
    store.editValues.customFirmwareId = customFirmwareId;
  },
};

export const customFirmwareEditorModel = {
  readers,
  actions,
};
