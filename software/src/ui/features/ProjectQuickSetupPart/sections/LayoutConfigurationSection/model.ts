import {
  DisplayKeyboardDesignLoader,
  IDisplayKeyboardDesign,
  IStandardFirmwareConfig,
} from '~/shared';
import { useHoldKeyIndices } from '~/ui/commonModels';
import { IDraftLayoutLabelEntity } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeViewTypes';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/store/LayoutGenerator';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';
import { useMemoEx } from '~/ui/utils';

function createLayoutFromFirmwareSpecForDisplayDesign(
  spec: IStandardFirmwareConfig,
  layoutOptions: ILayoutGeneratorOptions,
): [IDisplayKeyboardDesign, IDraftLayoutLabelEntity[]] {
  const [design, labelEntities] = createLayoutFromFirmwareSpec(
    spec,
    layoutOptions,
  );

  const displayDesign =
    DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);

  const { displayArea } = displayDesign;
  displayArea.width += 40;
  displayArea.centerY -= 4;
  displayArea.height += 16;

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
