import {
  DisplayKeyboardDesignLoader,
  IDisplayKeyboardDesign,
  IStandardFirmwareConfig,
} from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/base';
import { useHoldKeyIndices } from '~/ui/commonModels';
import { createLayoutFromFirmwareSpec } from '~/ui/commonModels/DraftLayoutGenerator';
import { IDraftLayoutLabelEntity } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeViewTypes';
import { useMemoEx } from '~/ui/utils';

function createLayoutFromFirmwareSpecForDisplayDesign(
  firmwareConfig: IStandardFirmwareConfig,
  layoutOptions: ILayoutGeneratorOptions,
): [IDisplayKeyboardDesign, IDraftLayoutLabelEntity[]] {
  const [design, labelEntities] = createLayoutFromFirmwareSpec(
    firmwareConfig,
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

export function useLayoutConfigurationSectionModel(
  firmwareConfig: IStandardFirmwareConfig,
  layoutOptions: ILayoutGeneratorOptions,
) {
  const [design, labelEntities] = useMemoEx(
    createLayoutFromFirmwareSpecForDisplayDesign,
    [firmwareConfig, layoutOptions],
  );
  const holdKeyIndices = useHoldKeyIndices();

  return { design, labelEntities, holdKeyIndices };
}
