import { FC, jsx } from 'alumina';
import { ILayoutGeneratorOptions, ILayoutTemplateAttributes } from '~/ui/base';
import { useLayoutConfigurationSectionModelEx } from '~/ui/fabrics/layoutConfigurationSectionEx/model';
import { LayoutPreviewShapeView } from '~/ui/fabrics/layoutPreviewShapeView/LayoutPreviewShapeView';

export const LayoutConfigurationSectionContentEx: FC<{
  templateAttrs: ILayoutTemplateAttributes;
  layoutOptions: ILayoutGeneratorOptions;
  showLabels: boolean;
}> = ({ templateAttrs, layoutOptions, showLabels }) => {
  const { design, holdKeyIndices } = useLayoutConfigurationSectionModelEx(
    templateAttrs,
    layoutOptions,
  );
  return (
    <LayoutPreviewShapeView
      keyboardDesign={design}
      labelEntities={[]}
      holdKeyIndices={holdKeyIndices}
      showLabels={showLabels}
    />
  );
};
