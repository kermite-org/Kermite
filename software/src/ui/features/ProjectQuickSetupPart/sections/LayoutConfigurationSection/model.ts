import {
  DisplayKeyboardDesignLoader,
  IDisplayKeyboardDesign,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import { useHoldKeyIndices } from '~/ui/commonModels';
import {
  IDraftLayoutLabelEntity,
  ILayoutGeneratorOptions,
} from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/base/LayoutGenerator';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useMemoEx } from '~/ui/utils';

function createLayoutFromFirmwareSpecForDisplayDesign(
  spec: IKermiteStandardKeyboardSpec,
  layoutOptions: ILayoutGeneratorOptions,
): [IDisplayKeyboardDesign, IDraftLayoutLabelEntity[]] {
  const [design, labelEntities] = createLayoutFromFirmwareSpec(
    spec,
    layoutOptions,
  );

  const displayDesign =
    DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);

  displayDesign.displayArea.width += 40;
  displayDesign.displayArea.height += 10;

  return [displayDesign, labelEntities];
}

export function useLayoutConfigurationSectionModel() {
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  const [design, labelEntities] = useMemoEx(
    createLayoutFromFirmwareSpecForDisplayDesign,
    [firmwareConfig, layoutOptions],
  );
  const holdKeyIndices = useHoldKeyIndices();

  return { design, labelEntities, holdKeyIndices };
}
