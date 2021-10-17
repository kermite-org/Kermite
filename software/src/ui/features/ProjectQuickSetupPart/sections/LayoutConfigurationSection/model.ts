import {
  DisplayKeyboardDesignLoader,
  IDisplayKeyboardDesign,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { useHoldKeyIndices } from '~/ui/commonModels';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/base/LayoutGenerator';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useMemoEx } from '~/ui/utils';

function createLayoutFromFirmwareSpecForDisplayDesign(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): IDisplayKeyboardDesign {
  const design = createLayoutFromFirmwareSpec(spec, layoutOptions);
  return DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);
}

export function useLayoutConfigurationSectionModel() {
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  const design = useMemoEx(createLayoutFromFirmwareSpecForDisplayDesign, [
    firmwareConfig,
    layoutOptions,
  ]);
  const holdKeyIndices = useHoldKeyIndices();

  return { design, holdKeyIndices };
}
