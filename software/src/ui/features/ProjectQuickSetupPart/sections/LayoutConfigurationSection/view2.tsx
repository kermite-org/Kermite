import { css, FC, jsx } from 'qx';
import { LayoutPreviewShapeView } from '~/ui/features/ProjectQuickSetupPart/parts/LayoutPreviewShapeView';
import { useLayoutConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/model';

export const LayoutConfigurationSectionRawContent: FC = () => {
  const { design, labelEntities, holdKeyIndices } =
    useLayoutConfigurationSectionModel();
  return (
    <LayoutPreviewShapeView
      keyboardDesign={design}
      labelEntities={labelEntities}
      holdKeyIndices={holdKeyIndices}
      class={style}
    />
  );
};

const style = css`
  height: 200px;
`;
