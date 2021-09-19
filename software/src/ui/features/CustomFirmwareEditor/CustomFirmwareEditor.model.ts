import { compareObjectByJsonStringify } from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/store';

export type ICustomFirmwareEditValues = {
  customFirmwareId: string;
};

export const fallbackCustomFirmwareEditValues: ICustomFirmwareEditValues = {
  customFirmwareId: '',
};

const store = new (class {
  originalValues: ICustomFirmwareEditValues = fallbackCustomFirmwareEditValues;
  editValues: ICustomFirmwareEditValues = fallbackCustomFirmwareEditValues;
})();

const readers = {
  get originalValues(): ICustomFirmwareEditValues {
    return store.originalValues;
  },
  get editValues(): ICustomFirmwareEditValues {
    return store.editValues;
  },
  get allFirmwareOptions(): ISelectorOption[] {
    return [
      {
        value: '',
        label: 'select firmware',
      },
      ...uiReaders.allCustomFirmwareInfos
        .filter((info) => info.firmwareProjectPath !== 'standard')
        .map((info) => ({
          value: info.firmwareId,
          label: `${info.firmwareProjectPath}/${info.variationName}`,
        })),
    ];
  },
  get canSave(): boolean {
    const { editValues, originalValues } = customFirmwareEditorModel.readers;
    const { customFirmwareId } = editValues;
    const modified = !compareObjectByJsonStringify(editValues, originalValues);
    return modified && !!customFirmwareId;
  },
};

const actions = {
  loadEditValues(editValues: ICustomFirmwareEditValues) {
    store.originalValues = editValues;
    store.editValues = editValues;
  },
  setCustomFirmwareId(customFirmwareId: string) {
    store.editValues = { ...store.editValues, customFirmwareId };
  },
};

export const customFirmwareEditorModel = {
  readers,
  actions,
};
