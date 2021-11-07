import { css, FC, jsx } from 'qx';
import { colors, Link } from '~/ui/base';
import { SetupNavigationStepButton } from '~/ui/components';

type Props = {
  steps: string[];
  currentStep: string;
  canGoToStep(step: string): boolean;
  shiftStepTo(step: string): void;
  stepInstructionTextMap: Record<string, string>;
};

export const WizardTopBar: FC<Props> = ({
  steps,
  currentStep,
  canGoToStep,
  shiftStepTo,
  stepInstructionTextMap,
}) => (
  <div css={style}>
    <div>
      {currentStep}: {stepInstructionTextMap[currentStep]}
    </div>
    {steps.map((step) => {
      const isCurrentStep = step === currentStep;
      return (
        <SetupNavigationStepButton
          key={step}
          text={step}
          active={isCurrentStep}
          handler={() => shiftStepTo(step)}
          disabled={!isCurrentStep && !canGoToStep(step)}
        />
      );
    })}
    <Link to="/home">x</Link>
  </div>
);

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
