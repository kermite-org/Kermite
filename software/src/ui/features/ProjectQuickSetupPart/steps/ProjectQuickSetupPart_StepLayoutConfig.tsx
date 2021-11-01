import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { LayoutConfigurationSectionContent } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepLayoutConfig: FC = () => {
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  const { writeLayoutOption } = projectQuickSetupStore.actions;
  return (
    <div class={style}>
      <h1>Layout Configuration</h1>
      <LayoutConfigurationSectionContent
        class="layout-view"
        firmwareConfig={firmwareConfig}
        layoutOptions={layoutOptions}
      />
      <LayoutGeneratorOptionsPart
        class="options-part"
        firmwareConfig={firmwareConfig}
        layoutOptions={layoutOptions}
        writeLayoutOption={writeLayoutOption}
      />
    </div>
  );
};

const style = css`
  height: 100%;
  background: ${colors.clPanelBox};
  padding: 20px;

  > .layout-view {
    margin-top: 10px;
    height: 300px;
  }

  > .options-part {
    margin-top: 20px;
  }
`;
