import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { IProjectQuickSetupStep } from '~/ui/commonModels';
import { WizardFooterBar, WizardTopBar } from '~/ui/elements/frames';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupWizard/steps/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupStore';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupWizard/store/ProjectQuickSetupWizardStore';

const stepInstructionMap: Record<IProjectQuickSetupStep, string> = {
  step1: texts.projectWizardFrame.headerStep1FirmwareConfiguration,
  step2: texts.projectWizardFrame.headerStep2DeviceSetup,
  step3: texts.projectWizardFrame.headerStep3layoutSettings,
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
