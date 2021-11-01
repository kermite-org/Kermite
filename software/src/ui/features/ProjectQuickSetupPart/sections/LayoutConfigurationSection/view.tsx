import { FC, jsx } from 'qx';
import { IStandardFirmwareConfig } from '~/shared';
import { LayoutPreviewShapeView } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeView';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { useLayoutConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/model';

export const LayoutConfigurationSectionContent: FC<{
  firmwareConfig: IStandardFirmwareConfig;
  layoutOptions: ILayoutGeneratorOptions;
}> = ({ firmwareConfig, layoutOptions }) => {
  const { design, labelEntities, holdKeyIndices } =
    useLayoutConfigurationSectionModel(firmwareConfig, layoutOptions);
  return (
    <LayoutPreviewShapeView
      keyboardDesign={design}
      labelEntities={labelEntities}
      holdKeyIndices={holdKeyIndices}
      showLabels={true}
    />
  );
};
