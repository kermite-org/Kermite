import { FC, jsx } from 'qx';
import { IStandardFirmwareConfig } from '~/shared';
import { useLayoutConfigurationSectionModel } from '~/ui/fabrics/LayoutConfigurationSection/model';
import { LayoutPreviewShapeView } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeView';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';

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
