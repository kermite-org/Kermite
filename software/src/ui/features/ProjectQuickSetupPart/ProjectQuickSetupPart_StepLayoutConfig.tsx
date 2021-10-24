import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { LayoutConfigurationSectionRawContent } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view2';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';

export const ProjectQuickSetupPart_StepLayoutConfig: FC = () => {
  return (
    <div class={style}>
      <h1>Layout Configuration</h1>
      <LayoutConfigurationSectionRawContent class="layout-view" />
      <LayoutGeneratorOptionsPart class="options-part" />
    </div>
  );
};

const style = css`
  height: 100%;
  background: ${uiTheme.colors.clPanelBox};
  padding: 20px;

  > .layout-view {
    margin-top: 10px;
  }

  > .options-part {
    margin-top: 20px;
  }
`;
