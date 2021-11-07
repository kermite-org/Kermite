import { css, FC, jsx } from 'qx';
import { WizardFooterBar } from '~/ui/featureComponents/WizardFooterBar';
import { WizardTopBar } from '~/ui/featureComponents/WizardTopBar';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupWizardStore';

export const ProjectQuickSetupWizard: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();

  const { currentStep, canGoToStep, canGoNext } =
    projectQuickSetupWizardStore.readers;
  const { shiftStepTo } = projectQuickSetupWizardStore.actions;
  return (
    <div className={style}>
      <WizardTopBar
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        shiftStepTo={shiftStepTo}
      />
      {currentStep === 'step1' && <ProjectQuickSetupPart_StepFirmwareConfig />}
      {currentStep === 'step2' && <ProjectQuickSetupPart_StepFirmwareFlash />}
      {currentStep === 'step3' && <ProjectQuickSetupPart_StepLayoutConfig />}
      <WizardFooterBar currentStep={currentStep} canGoNext={canGoNext} />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
