import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/commonStore';

export type ICustomFirmwareSetupModalEditValues = {
  variationName: string;
  customFirmwareId: string;
};

const store = new (class {
  editValues: ICustomFirmwareSetupModalEditValues = {
    variationName: '',
    customFirmwareId: '',
  };
})();

const readers = {
  get editValues(): ICustomFirmwareSetupModalEditValues {
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
  loadEditValues(editValues: ICustomFirmwareSetupModalEditValues) {
    store.editValues = editValues;
  },
  setVariationName(variationName: string) {
    store.editValues.variationName = variationName;
  },
  setCustomFirmwareId(customFirmwareId: string) {
    store.editValues.customFirmwareId = customFirmwareId;
  },
};

export const CustomFirmwareEditorModel = {
  readers,
  actions,
};
