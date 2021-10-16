import { css, FC, jsx } from 'qx';
import { LayoutPreviewShapeView } from '~/ui/features/ProjectQuickSetupPart/parts/LayoutPreviewShapeView';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';
import { useLayoutConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/model';

export const LayoutConfigurationSection: FC = () => {
  const { design } = useLayoutConfigurationSectionModel();
  return (
    <SectionFrame title="Layout Preview">
      <div class={style}>
        <LayoutPreviewShapeView keyboardDesign={design} />
      </div>
    </SectionFrame>
  );
};

const style = css`
  height: 200px;
  border: solid 1px #ccc;
  padding: 5px;
`;
