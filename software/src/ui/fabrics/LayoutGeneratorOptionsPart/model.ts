import { IStandardFirmwareConfig } from '~/shared';
import { ILayoutGeneratorOptions, makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';

export type IWriteLayoutOptionFunc = <K extends keyof ILayoutGeneratorOptions>(
  key: K,
  value: ILayoutGeneratorOptions[K],
) => void;

export function useLayoutGeneratorOptionsPartModel(
  firmwareConfig: IStandardFirmwareConfig,
  writeLayoutOption: IWriteLayoutOptionFunc,
) {
  const isOddSplit = standardFirmwareEditModelHelpers.getIsOddSplit(
    firmwareConfig.baseFirmwareType,
  );
  const placementModeOptions = ['topLeft', 'center'].map(
    makePlainSelectorOption,
  );

  const valueChangeHandler =
    <K extends keyof ILayoutGeneratorOptions>(key: K) =>
    (value: ILayoutGeneratorOptions[K]) =>
      writeLayoutOption(key, value);

  return {
    isOddSplit,
    placementModeOptions,
    valueChangeHandler,
  };
}
