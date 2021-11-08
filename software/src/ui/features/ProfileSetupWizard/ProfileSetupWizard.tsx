import { css, FC, jsx } from 'qx';
import { IProfileSetupStep } from '~/ui/commonModels';
import { WizardFooterBar, WizardTopBar } from '~/ui/elements/frames';
import { ProfileSetupWizard_StepBaseProfileSelection } from '~/ui/features/ProfileSetupWizard/steps/ProfileSetupWizard_StepBaseProjectSelection';
import { ProfileSetupWizard_StepFirmwareFlash } from '~/ui/features/ProfileSetupWizard/steps/ProfileSetupWizard_StepFirmwareFlash';
import { ProfileSetupWizard_StepPresetSelection } from '~/ui/features/ProfileSetupWizard/steps/ProfileSetupWizard_StepPresetSelection';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';
import { profileSetupWizardStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupWizardStore';

const stepInstructionMap: Record<IProfileSetupStep, string> = {
  step1: 'Keyboard Product Selection',
  step2: 'Device Setup',
  step3: 'Preset Selection',
};

export const ProfileSetupWizard: FC = () => {
  profileSetupStore.effects.useEditDataPersistence();
  const { currentStep, canGoToStep, canGoNext } =
    profileSetupWizardStore.readers;
  const { shiftStep, shiftStepTo } = profileSetupWizardStore.actions;
  return (
    <div className={style}>
      <WizardTopBar
        steps={['step1', 'step2', 'step3']}
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        shiftStepTo={shiftStepTo}
        stepInstructionTextMap={stepInstructionMap}
      />
      {currentStep === 'step1' && (
        <ProfileSetupWizard_StepBaseProfileSelection />
      )}
      {currentStep === 'step2' && <ProfileSetupWizard_StepFirmwareFlash />}
      {currentStep === 'step3' && <ProfileSetupWizard_StepPresetSelection />}
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
