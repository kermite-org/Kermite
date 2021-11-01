import { css, FC, jsx, useMemo } from 'qx';
import {
  WizardSectionPanel,
  WizardSectionPanelWithCenterContent,
} from '~/ui/components/layouts';
import { DeviceAutoConnectionPart } from '~/ui/fabrics/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/fabrics/StandardFirmwareFlashPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [projectQuickSetupStore.state.firmwareConfig],
  );
  const { variationId } = projectQuickSetupStore.state;
  const contentWidth = 500;

  return (
    <div class={style}>
      <div class="row first-row">
        <WizardSectionPanelWithCenterContent
          title="Device Connection Status"
          class="device-connection-panel"
          contentWidth={contentWidth}
        >
          <DeviceAutoConnectionPart
            projectInfo={projectInfo}
            variationId={variationId}
          />
        </WizardSectionPanelWithCenterContent>
      </div>
      <div class="row second-row">
        <WizardSectionPanelWithCenterContent
          title="Flash Firmware"
          class="firmware-flash-panel"
          contentWidth={contentWidth}
        >
          <StandardFirmwareFlashPart
            projectInfo={projectInfo}
            variationId={variationId}
          />
        </WizardSectionPanelWithCenterContent>
        <WizardSectionPanel
          title="Parameters"
          class="panel parameters-panel"
          qxIf={false}
        ></WizardSectionPanel>
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
