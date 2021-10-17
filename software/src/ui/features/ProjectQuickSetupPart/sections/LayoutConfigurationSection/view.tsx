import { css, FC, jsx } from 'qx';
import { LayoutPreviewShapeView } from '~/ui/features/ProjectQuickSetupPart/parts/LayoutPreviewShapeView';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';
import { useLayoutConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/model';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';

export const LayoutConfigurationSection: FC = () => {
  const { design, holdKeyIndices } = useLayoutConfigurationSectionModel();
  return (
    <SectionFrame title="Layout Preview" contentClassName={style}>
      <LayoutPreviewShapeView
        keyboardDesign={design}
        holdKeyIndices={holdKeyIndices}
        class="shape-view"
      />
      <LayoutGeneratorOptionsPart class="options-part" />
    </SectionFrame>
  );
};

const style = css`
  padding: 0 5px;
  > .shape-view {
    margin-top: 10px;
    height: 200px;
  }

  > .options-part {
    margin-top: 10px;
  }
`;
