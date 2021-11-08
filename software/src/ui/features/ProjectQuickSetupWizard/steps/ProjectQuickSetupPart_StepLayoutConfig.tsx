import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import {
  LayoutConfigurationSectionContent,
  LayoutGeneratorOptionsPart,
} from '~/ui/fabrics';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';

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
        showLabels={true}
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
