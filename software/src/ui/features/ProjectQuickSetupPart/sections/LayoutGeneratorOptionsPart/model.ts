import { makePlainSelectorOption } from '~/ui/base';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';

export function useLayoutGeneratorOptionsPartModel() {
  const { firmwareConfig } = projectQuickSetupStore.state;
  const isOddSplit = standardFirmwareEditModelHelpers.getIsOddSplit(
    firmwareConfig.baseFirmwareType,
  );

  const placementModeOptions = ['topLeft', 'center'].map(
    makePlainSelectorOption,
  );
  const { layoutOptions } = projectQuickSetupStore.state;

  return {
    isOddSplit,
    layoutOptions,
    placementModeOptions,
  };
}
