import { FC, jsx } from 'qx';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/steps/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/steps/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupPart/steps/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupPart/wizard/ProjectQuickSetupWizardStore';
import { AssignerPage } from '~/ui/pages/assigner-page';

export const WizardMainContent: FC = () => {
  const { currentStep: step } = projectQuickSetupWizardStore.readers;
  if (step === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (step === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (step === 'step3') {
    return <ProjectQuickSetupPart_StepLayoutConfig />;
  } else if (step === 'step4') {
    return <AssignerPage />;
  }
  return null;
};
