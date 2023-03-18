import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { IExtProjectSetupStep } from '~/ui/commonModels';
import { WizardFooterBar, WizardTopBar } from '~/ui/elements/frames';
import { ExfProjectSetupPart_StepFirmwareConnection } from '~/ui/features/externalFirmwareProjectSetupWizard/steps/ExfProjectSetupPart_StepFirmwareConnection';
import { ExfProjectSetupPart_StepLayoutConfig } from '~/ui/features/externalFirmwareProjectSetupWizard/steps/ExfProjectSetupPart_StepLayoutConfig';
import { exfProjectSetupWizardStore } from '~/ui/features/externalFirmwareProjectSetupWizard/store/exfProjectSetupWizardStore';

const stepInstructionMap: Record<IExtProjectSetupStep, string> = {
  step1: texts.exfProjectWizardFrame.headerStep1deviceSetup,
  step2: texts.exfProjectWizardFrame.headerStep2layoutSettings,
};

export const ExternalFirmwareProjectSetupWizard: FC = () => {
  const { currentStep, canGoToStep, canGoNext } =
    exfProjectSetupWizardStore.readers;
  const { shiftStep, shiftStepTo } = exfProjectSetupWizardStore.actions;

  return (
    <div class={style}>
      <WizardTopBar
        steps={['step1', 'step2']}
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        shiftStepTo={shiftStepTo}
        stepInstructionTextMap={stepInstructionMap}
      />
      {currentStep === 'step1' && (
        <ExfProjectSetupPart_StepFirmwareConnection />
      )}
      {currentStep === 'step2' && <ExfProjectSetupPart_StepLayoutConfig />}
      <WizardFooterBar
        currentStep={currentStep}
        canGoNext={canGoNext}
        firstStep="step1"
        finalStep="step2"
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
