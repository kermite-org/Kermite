import {
  compareObjectByJsonStringify,
  ICustomFirmwareInfo,
  IFirmwareOrigin,
  uniqueArrayItems,
} from '~/shared';
import { ISelectorOption } from '~/ui/base';
import { uiReaders } from '~/ui/store';
import { createSimpleSelector } from '~/ui/utils';

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

type ITempFirmwareItem = {
  firmwareOrigin: IFirmwareOrigin;
  firmwareId: string;
  variationPath: string;
  signature: string; // ${firmwareId}:${variationPath}
};

function makeFirmwareOptions(
  allCustomFirmwareInfos: ICustomFirmwareInfo[],
): ISelectorOption[] {
  const dedicatedFirmwareInfos = allCustomFirmwareInfos.filter(
    (info) => info.firmwareProjectPath !== 'standard',
  );

  const tempFirmwareItems: ITempFirmwareItem[] = dedicatedFirmwareInfos.map(
    (info) => {
      const { firmwareOrigin, firmwareId, firmwareProjectPath, variationName } =
        info;
      const variationPath = `${firmwareProjectPath}/${variationName}`;
      const signature = `${firmwareId}:${variationPath}`;
      return {
        firmwareOrigin,
        firmwareId,
        variationPath,
        signature,
      };
    },
  );
  const allSignatures = uniqueArrayItems(
    tempFirmwareItems.map((it) => it.signature),
  );

  return allSignatures.map((signature) => {
    const hasOnline = tempFirmwareItems.some(
      (it) => it.signature === signature && it.firmwareOrigin === 'online',
    );
    const hasLocalBuild = tempFirmwareItems.some(
      (it) => it.signature === signature && it.firmwareOrigin === 'localRepo',
    );
    const originText = [hasOnline && 'online', hasLocalBuild && 'local-build']
      .filter((it) => !!it)
      .join(', ');

    const [firmwareId, variationPath] = signature.split(':');
    return {
      label: `[${firmwareId}] (${originText}) ${variationPath}`,
      value: firmwareId,
    };
  });
}

const firmwareOptionsSelector = createSimpleSelector(
  () => uiReaders.allCustomFirmwareInfos,
  makeFirmwareOptions,
);

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
      ...firmwareOptionsSelector(),
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
