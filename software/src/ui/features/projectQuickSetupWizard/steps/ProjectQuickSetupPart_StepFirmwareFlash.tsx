import { css, FC, jsx, useMemo } from 'alumina';
import { texts } from '~/ui/base';
import { WizardSectionPanelWithCenterContent } from '~/ui/components/layouts';
import {
  DeviceAutoConnectionPart,
  StandardFirmwareFlashPart,
} from '~/ui/fabrics';
import { projectQuickSetupStore } from '~/ui/features/projectQuickSetupWizard/store/projectQuickSetupStore';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [projectQuickSetupStore.state.firmwareConfig],
  );
  const { variationId } = projectQuickSetupStore.state;

  return (
    <div class={style}>
      <WizardSectionPanelWithCenterContent
        title={texts.deviceAutoConnectionSection.sectionHeader}
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
        title={texts.firmwareFlashSection.sectionHeader}
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
