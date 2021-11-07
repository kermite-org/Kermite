import { css, FC, jsx, useMemo } from 'qx';
import { WizardSectionPanelWithCenterContent } from '~/ui/components/layouts';
import { DeviceAutoConnectionPart } from '~/ui/fabrics/DeviceAutoConnectionPart/view';
import { StandardFirmwareFlashPart } from '~/ui/fabrics/StandardFirmwareFlashPart/view';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [projectQuickSetupStore.state.firmwareConfig],
  );
  const { variationId } = projectQuickSetupStore.state;

  return (
    <div class={style}>
      <WizardSectionPanelWithCenterContent
        title="Device Connection Status"
        class="connection-panel"
        contentWidth={450}
        contentHeight={400}
      >
        <DeviceAutoConnectionPart
          projectInfo={projectInfo}
          variationId={variationId}
        />
      </WizardSectionPanelWithCenterContent>
      <WizardSectionPanelWithCenterContent
        title="Flash Firmware"
        class="flash-panel"
        contentWidth={400}
        contentHeight={400}
      >
        <StandardFirmwareFlashPart
          projectInfo={projectInfo}
          variationId={variationId}
        />
      </WizardSectionPanelWithCenterContent>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;

  > div {
    flex-grow: 1;
  }
`;
