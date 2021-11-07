import { FC, jsx } from 'qx';
import { IProjectQuickSetupStep } from '~/ui/commonModels';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepLayoutConfig';

type Props = {
  currentStep: IProjectQuickSetupStep;
};

export const WizardMainContent: FC<Props> = ({ currentStep }) => {
  if (currentStep === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (currentStep === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (currentStep === 'step3') {
    return <ProjectQuickSetupPart_StepLayoutConfig />;
  }
  return null;
};
