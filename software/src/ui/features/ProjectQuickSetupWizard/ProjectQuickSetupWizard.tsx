import { css, FC, jsx } from 'qx';
import { IProjectQuickSetupStep } from '~/ui/commonModels';
import { WizardFooterBar } from '~/ui/featureComponents/WizardFooterBar';
import { WizardTopBar } from '~/ui/featureComponents/WizardTopBar';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupWizardStore';

const stepInstructionMap: Record<IProjectQuickSetupStep, string> = {
  step1: 'Firmware Configuration',
  step2: 'Device Setup',
  step3: 'Layout Template Settings',
};

export const ProjectQuickSetupWizard: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();

  const { currentStep, canGoToStep, canGoNext } =
    projectQuickSetupWizardStore.readers;
  const { shiftStep, shiftStepTo } = projectQuickSetupWizardStore.actions;
  return (
    <div className={style}>
      <WizardTopBar
        steps={['step1', 'step2', 'step3']}
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        shiftStepTo={shiftStepTo}
        stepInstructionTextMap={stepInstructionMap}
      />
      {currentStep === 'step1' && <ProjectQuickSetupPart_StepFirmwareConfig />}
      {currentStep === 'step2' && <ProjectQuickSetupPart_StepFirmwareFlash />}
      {currentStep === 'step3' && <ProjectQuickSetupPart_StepLayoutConfig />}
      <WizardFooterBar
        currentStep={currentStep}
        canGoNext={canGoNext}
        firstStep="step1"
        finalStep="step3"
        shiftStep={shiftStep}
      />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
