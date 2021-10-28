import { css, FC, jsx, useMemo } from 'qx';
import { DeviceAutoConnectionPart } from '~/ui/fabrics/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/fabrics/StandardFirmwareFlashPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import {
  SectionPanel,
  SectionPanelWithCenterContent,
} from '~/ui/features/ProjectQuickSetupPart/parts/SectionLayoutComponents';
import { LayoutConfigurationSectionRawContent } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/view';
import { LayoutGeneratorOptionsPart } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/view';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [],
  );
  const firmwareVariationId = '01';
  const contentWidth = 500;
  return (
    <div class={style}>
      <div class="row first-row">
        <SectionPanelWithCenterContent
          title="Device Connection Status"
          class="device-connection-panel"
          contentWidth={contentWidth}
        >
          <DeviceAutoConnectionPart
            projectInfo={projectInfo}
            firmwareVariationId={firmwareVariationId}
          />
        </SectionPanelWithCenterContent>
        <SectionPanel
          title="Layout Preview"
          class="layout-config-panel"
          qxIf={false}
        >
          <LayoutConfigurationSectionRawContent class="layout-view" />
          <LayoutGeneratorOptionsPart class="options-part" />
        </SectionPanel>
      </div>
      <div class="row second-row">
        <SectionPanelWithCenterContent
          title="Flash Firmware"
          class="firmware-flash-panel"
          contentWidth={contentWidth}
        >
          <StandardFirmwareFlashPart
            projectInfo={projectInfo}
            firmwareVariationId={firmwareVariationId}
          />
        </SectionPanelWithCenterContent>
        <SectionPanel
          title="Parameters"
          class="panel parameters-panel"
          qxIf={false}
        ></SectionPanel>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .row {
    display: flex;

    &.first-row {
      min-height: 40%;
    }

    &.second-row {
      flex-grow: 1;
    }

    > .device-connection-panel {
      width: 100%;
    }

    > .layout-config-panel {
      width: 50%;

      > .layout-view {
        margin-top: 5px;
        height: 200px;
      }

      > .options-part {
        margin-top: 15px;
      }
    }

    > .firmware-flash-panel {
      width: 100%;
    }

    > .parameters-panel {
      width: 45%;
    }
  }
`;
