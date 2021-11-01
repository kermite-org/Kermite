import { css, FC, jsx } from 'qx';
import { colors } from '~/ui/base';
import { StandardFirmwareEditor } from '~/ui/editors';
import { ControllerPinAssignsSection } from '~/ui/fabrics/ControllerPinAssignsSection/view';
import { SectionPanel } from '~/ui/features/ProjectQuickSetupPart/components/SectionLayoutComponents';
import { LayoutConfigurationSectionContent } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view';
import { ProjectConfigurationSection } from '~/ui/features/ProjectQuickSetupPart/sections/ProjectConfigurationSection/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareConfig: FC = () => {
  projectQuickSetupStore.effects.useReflectEditFirmwareConfigToStore();
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  return (
    <div class={style}>
      <div class="top-row">
        <ProjectConfigurationSection />
      </div>
      <div class="main-row">
        <SectionPanel
          title="Firmware Configuration"
          class="firmware-config-section"
        >
          <StandardFirmwareEditor />
        </SectionPanel>
        <div class="right-column">
          <SectionPanel
            title="Layout Preview"
            class="layout-config-section"
            qxIf={false}
          >
            <LayoutConfigurationSectionContent
              firmwareConfig={firmwareConfig}
              layoutOptions={layoutOptions}
            />
          </SectionPanel>
          <SectionPanel
            title="Board Pin Assigns View"
            class="board-pin-assigns-section"
          >
            <ControllerPinAssignsSection firmwareConfig={firmwareConfig} />
          </SectionPanel>
        </div>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.clPanelBox};

  > .top-row {
    flex-shrink: 0;
  }

  > .main-row {
    height: 0;
    flex-grow: 1;
    display: flex;

    > .firmware-config-section {
      flex-grow: 1;
      overflow-y: scroll;
    }
    > .right-column {
      width: 40%;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;

      > .board-pin-assigns-section {
        flex-grow: 1;
      }
    }
  }

  > .bottom-row {
    flex-shrink: 0;
    height: 80px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: solid 1px ${colors.clPrimary};
  }
`;
