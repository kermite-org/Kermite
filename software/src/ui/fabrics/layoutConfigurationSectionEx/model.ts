import { DisplayKeyboardDesignLoader, IDisplayKeyboardDesign } from '~/shared';
import { ILayoutGeneratorOptions, ILayoutTemplateAttributes } from '~/ui/base';
import { useHoldKeyIndices } from '~/ui/commonModels';
import { createLayoutFromTemplateAttributes } from '~/ui/commonModels/draftLayoutGenerator';
import { useMemoEx } from '~/ui/utils';

function createLayoutFromFirmwareSpecForDisplayDesign(
  templateAttrs: ILayoutTemplateAttributes,
  layoutOptions: ILayoutGeneratorOptions,
): IDisplayKeyboardDesign {
  const design = createLayoutFromTemplateAttributes(
    templateAttrs,
    layoutOptions,
  );

  const displayDesign =
    DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design);

  const { displayArea } = displayDesign;
  displayArea.width += 40;
  displayArea.centerY -= 4;
  displayArea.height += 16;

  return displayDesign;
}

export function useLayoutConfigurationSectionModelEx(
  templateAttrs: ILayoutTemplateAttributes,
  layoutOptions: ILayoutGeneratorOptions,
) {
  const design = useMemoEx(createLayoutFromFirmwareSpecForDisplayDesign, [
    templateAttrs,
    layoutOptions,
  ]);
  const holdKeyIndices = useHoldKeyIndices();

  return { design, holdKeyIndices };
}
