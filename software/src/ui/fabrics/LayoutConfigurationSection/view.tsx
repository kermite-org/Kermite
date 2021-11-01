import { FC, jsx } from 'qx';
import { IStandardFirmwareConfig } from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/base';
import { useLayoutConfigurationSectionModel } from '~/ui/fabrics/LayoutConfigurationSection/model';
import { LayoutPreviewShapeView } from '~/ui/fabrics/LayoutPreviewShapeView/LayoutPreviewShapeView';

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
