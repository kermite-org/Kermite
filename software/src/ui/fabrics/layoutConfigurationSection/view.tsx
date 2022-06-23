import { FC, jsx } from 'alumina';
import { IStandardFirmwareConfig } from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/base';
import { useLayoutConfigurationSectionModel } from '~/ui/fabrics/layoutConfigurationSection/model';
import { LayoutPreviewShapeView } from '~/ui/fabrics/layoutPreviewShapeView/LayoutPreviewShapeView';

export const LayoutConfigurationSectionContent: FC<{
  firmwareConfig: IStandardFirmwareConfig;
  layoutOptions: ILayoutGeneratorOptions;
  showLabels: boolean;
}> = ({ firmwareConfig, layoutOptions, showLabels }) => {
  const { design, labelEntities, holdKeyIndices } =
    useLayoutConfigurationSectionModel(firmwareConfig, layoutOptions);
  return (
    <LayoutPreviewShapeView
      keyboardDesign={design}
      labelEntities={labelEntities}
      holdKeyIndices={holdKeyIndices}
      showLabels={showLabels}
    />
  );
};
