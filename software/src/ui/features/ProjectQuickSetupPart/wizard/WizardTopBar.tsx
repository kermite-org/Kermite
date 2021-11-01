import { css, FC, jsx } from 'qx';
import { colors, Link } from '~/ui/base';
import { SetupNavigationStepButton } from '~/ui/components/atoms/SetupNavigationStepButton';
import { IProjectQuickSetupStep } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupWizardStore } from '~/ui/features/ProjectQuickSetupPart/wizard/ProjectQuickSetupWizardStore';

const stepInstructionMap: { [step in IProjectQuickSetupStep]: string } = {
  step1: 'Firmware Configuration',
  step2: 'Device Setup',
  step3: 'Layout Template Settings',
  step4: 'Profile Setup',
};

export const WizardTopBar: FC = () => {
  const { currentStep, canGoToStep } = projectQuickSetupWizardStore.readers;
  const { shiftStepTo } = projectQuickSetupWizardStore.actions;
  const instructionText = stepInstructionMap[currentStep];
  return (
    <div css={style}>
      <div>
        {currentStep}: {instructionText}
      </div>
      {[1, 2, 3, 4].map((i) => {
        const step = `step${i}` as IProjectQuickSetupStep;
        const isCurrentStep = step === currentStep;
        return (
          <SetupNavigationStepButton
            key={i}
            text={`step${i}`}
            active={isCurrentStep}
            handler={() => shiftStepTo(step)}
            disabled={!isCurrentStep && !canGoToStep(step)}
          />
        );
      })}
      <Link to="/home">x</Link>
    </div>
  );
};

const style = css`
  height: 34px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px 0 5px;
  background: ${colors.wizardHorizontalBar};

  > div {
    cursor: pointer;
  }

  > :first-child {
    margin-right: auto;
  }

  > :last-child {
    margin-left: 10px;
  }
`;
